'use strict';

angular.module('crm')
  .controller('ImportProductsCtrl', function($scope, $state, data, close, DataStorage,
    $filter, Notification, $rootScope, $document, $timeout, FileDownloaderService) {

    $scope.csvImportOptions = {
      uploadCaption: $rootScope.t('directives.common.csv-import.upload-button-caption'),
      header: true,
      separator: ','
    }

    $scope.deleteFile = function(file) {
      _.each($scope.dataForImport, function(p, n) {
        if (p == file)
          $scope.dataForImport.splice(n, 1);
      })
    };

    $scope.modalTitle = data.modalTitle;
    $scope.dataForImport = [];
    $scope.filedDataForImport = [];
    $scope.modalData = data;
    $scope.importing = 0;
    $scope.nothingToImport = true;
    
    $scope.$watchCollection('dataForImport', function(data){
      $scope.nothingToImport = true;
      
      _.each($scope.dataForImport, function(file, n){
        if (!file.imported && !file.error) 
          $scope.nothingToImport = false;
      })
    });

    $scope.$watch('csv.result', function(data) {
      if (data)
        $scope.dataForImport.push(data)
    });

    $scope.getHeader = function(row) {
      return Object.keys(row.data[0])
    }

    $scope.importData = function() {
      _.each($scope.dataForImport, function(file, n) {
        if (file.imported || file.error)
          return;
      
        var obj = {
          ClientID: $scope.modalData.ClientID,
          Rows: file.data
        };
        
        $scope.importing += 1;
        $scope.nothingToImport = true;
        
        DataStorage.anyApiMethod('/products/import').post(obj, function(resp) {
          $scope.importing -= 1;
          
          if (resp.Failed && resp.Failed.length == 0){
            $scope.dataForImport[n].imported = true;
          } else {
            $scope.dataForImport[n].error = true;
          }
          
          if (resp.Failed && resp.Failed.length != 0) {
            $scope.dataForImport[n].failedLength = resp.Failed.length;
            
            _.each(resp.Failed, function(failedRow) {
              var arr = $filter('filter')($scope.dataForImport[n].data,  { 
                GroupName: failedRow.GroupName,
                ChargeName: failedRow.ChargeName 
              });
              arr[0]._fileName = file.name;
              arr[0]._errorMessage = failedRow.ErrorMessage;
              $scope.filedDataForImport.push(arr[0])
            });
          }
          
          if (resp.Succeeded)
            $scope.dataForImport[n].succeededLength = resp.Succeeded.length;
        })
      });
    };

    // when you need to close the modal, call close
    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };

    $scope.downloadNotes = function () {
      DataStorage.anyApiMethod('/products/import/notes').query(function(resp){
        if (resp.Status != 0)
          return;

        var filename = "import_example.csv";
        FileDownloaderService.downloadFile(filename, resp.Notes);
      });
    };

  });
