'use strict';

angular.module('crm')
  .controller('ImportTrackingCtrl',
    function ($scope, $state, DataStorage, $rootScope, FileDownloaderService) {

    $scope.portletHeaderOptions1 = {title: $rootScope.t('top.crm.importtracking')};
    
    $scope.csvImportOptions = {
      uploadCaption: $rootScope.t('directives.common.csv-import.upload-button-caption'),
      header: false,
      separator: ','
    }

    $scope.dataForImport = [];
    $scope.importing = 0;
    $scope.nothingToImport = true;
    
    $scope.deleteFile = function(file) {
      _.each($scope.dataForImport, function(p, n){
        if (p == file) 
          $scope.dataForImport.splice(n, 1);
      })
    
    };
    
    $scope.$watch('csv.result', function(data){
      if (data) 
        $scope.dataForImport.push(data)
    });
    
    $scope.$watchCollection('dataForImport', function(data){
      $scope.nothingToImport = true;
      
      _.each($scope.dataForImport, function(file, n){
        if (!file.imported && !file.error) 
          $scope.nothingToImport = false;
      })
    });

    $scope.exit = function () {
      $state.go('main.dashboard');
    };

    $scope.importData = function(){
      _.each($scope.dataForImport, function(file, n){
        if (file.imported || file.error)
          return;

        _.each(file.data, function(row, n){
          if (!row.TransactionID){
            row.TransactionID = row[0];
            delete row[0];
          }

          if (!row.TrackingNo){
            row.TrackingNo = row[1];
            delete row[1];
          }

          return row;
        });
        
        $scope.importing += 1;
        $scope.nothingToImport = true;
        
        DataStorage.anyApiMethod('/customer/tracking/import').post({
          Rows: file.data
        }, function(resp) {
          $scope.importing -= 1;
          
          if (resp.Status == 0){
            $scope.dataForImport[n].imported = true;
          } else {
            $scope.dataForImport[n].error = true;
          }
        })
      });
    };

    $scope.downloadNotes = function () {
      DataStorage.anyApiMethod('/customer/tracking/notes').query(function(resp){
        if (resp.Status != 0)
          return;

        var filename = "import_example.csv";
        FileDownloaderService.downloadFile(filename, resp.Notes);
        
      });
    };
  });
