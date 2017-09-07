'use strict';

angular.module('crm')
  .controller('ExportCtrl', function ($scope, ExportSetup, GlobalVars, 
  DataProcessing, DataStorage, $timeout, $document, $location, ModalService, $state, $rootScope) {

    var dP = new Date()
    dP.setDate(dP.getDate()-7);
    $scope.dates = {}
    $scope.dates.fromDateValue = dP;
    $scope.dates.toDateValue = new Date();
    $scope.show = {sentEmail: false, emptyContent: false, emailError: false}
    $scope.obj = {activeRLValue: {}}
    
    function downloadExportedData(content) {
      if (!content) {
        $scope.show.emptyContent = true;
        return;
      }
      var filename = 'exported_data.csv';
      var blob = new Blob([content], {
        type: "text/csv;charset='utf-8';"
      });

      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, filename);
      } else {
        var downloadLink = angular.element('<a></a>');
        downloadLink.attr('href', window.URL.createObjectURL(blob));
        downloadLink.attr('download', filename);
        downloadLink.attr('target', '_blank');
        $document.find('body').append(downloadLink);
        $timeout(function () {
          downloadLink[0].click();
          downloadLink.remove();
        }, null);
      }
    }
		
    if ($location.search().guid){
      $scope.hideContent = true;
      GlobalVars.setLoadingRequestStatus(true)
      DataStorage.exportDataByGuid().query({guid: $location.search().guid}, function(resp){
        GlobalVars.setLoadingRequestStatus(false)
        var modalData = {
          hideProceedButton: true,
          modalTitle: $rootScope.translate('crm.export.export.controller.server-response'),
          modalTxt: $rootScope.translate('crm.export.export.controller.no-data')
        };

        if (resp.Content){
          modalData.panelInfoClass = true;
          modalData.modalTxt = $rootScope.translate('crm.export.export.controller.data-has-been-exported');
          downloadExportedData(resp.Content)
        }
        $timeout(function(){
          ModalService.showModal({
            templateUrl: "components/modals/COMMON/sure.html",
            controller: "DataModalCtrl",
            inputs: {
              data: modalData
            }
          }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
              $state.go('main.dashboard')
            })
          });
        },100)
      });
    }

    $scope.portletHeaderOptions = {title: 'crm.export.export.controller.export-options'};
    $scope.fields = {
      Columns: []
    };
    $scope.clientsModel = [];
    $scope.sitesModel = [];
    $scope.reportOptionsModel = [];
    $scope.chargeTypeModel = [];
    $scope.transactionTypeModel = [];
    $scope.transactionResultModel = [];
    $scope.stepTypeModel = [];
    $scope.fieldOptions = ExportSetup.fieldOptions();

    $scope.addObj = {emailReportValue: angular.copy(GlobalVars.commonObject().DefaultUserEmail)};

    DataStorage.anyApiMethod('/export/index').query(function(resp){
      angular.extend($scope.fieldOptions, resp.Index);
    });

    $scope.sitesData = [{
      "SiteID":0,
      "Name":$rootScope.t('crm.export.export.controller.no-clients-selected'), 
      disabled: true
    }];

    $scope.commonCheckAllCheckbox = false
    $scope.transactionCheckAllCheckbox = false
    $scope.fieldOptions.firstColumnCBs = []
    $scope.fieldOptions.secondColumnCBs = []

    //_.map($scope.fieldOptions.firstColumnCBs, function(ch){return ch.id})
    $scope.setAllCommon = function(val){
      if (val)
        $scope.firstColumnSelectedCBs = _.map($scope.fieldOptions.firstColumnCBs, function(c){return c.id});
      else if (val == false)
        $scope.firstColumnSelectedCBs = []
    };
    $scope.setAllTrans = function(val){
      if (val)
        $scope.secondColumnSelectedCBs = _.map($scope.fieldOptions.secondColumnCBs, function(c){return c.id});
      else if (val == false)
        $scope.secondColumnSelectedCBs = []
    }

    ////  1st select
    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.$watchCollection( "clientsModel", function(clients) {
      $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData);
      $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
    });

    var requiredArrays = ['sitesModel', 'reportOptionsModel']
    var validRequiredArr = function(arr){
      var f = true;
      _.each(arr, function(v){
        if (!($scope[v] && $scope[v].length>0)) {
          f = false
        };
      });
      return f
    }


    var cachedExportFields = {};
    var getCBs = function(reportOptionsModelId, stepTypeModelId, cb){
      cb = cb || function(){};
      $scope.firstColumnSelectedCBs = [];
      $scope.secondColumnSelectedCBs = [];
      $scope.fieldOptions.firstColumnCBs = []
      $scope.fieldOptions.secondColumnCBs = []
      
      if (!reportOptionsModelId)
        return;
      
      var mapColumn = function(column){
        return { id: column.ExcelColumnID, name: column.ColumnName, displayName: column.DisplayName }
      }
      
      if (!cachedExportFields[reportOptionsModelId+'-'+stepTypeModelId]){
        var methodUrl = '/export/columns/'+reportOptionsModelId;
        if (stepTypeModelId){
          methodUrl += '/'+stepTypeModelId
        }
        DataStorage.anyApiMethod(methodUrl).query(function(resp){
          if (resp && !resp.Status){
            cachedExportFields[reportOptionsModelId+'-'+stepTypeModelId] = resp;
            
            $scope.fieldOptions.firstColumnCBs = _.map(resp.FirstColumn, mapColumn);
            $scope.fieldOptions.secondColumnCBs = _.map(resp.SecondColumn, mapColumn);
          }
          cb()
        })
      }else{
        $scope.fieldOptions.firstColumnCBs = 
          _.map(cachedExportFields[reportOptionsModelId+'-'+stepTypeModelId].FirstColumn, mapColumn);
        $scope.fieldOptions.secondColumnCBs = 
          _.map(cachedExportFields[reportOptionsModelId+'-'+stepTypeModelId].SecondColumn, mapColumn);
          
        cb()
      }
    }

    $scope.setSelectedItem = function(id, type){
      $scope[type] = $scope[type] || [];
      if ($scope[type].indexOf(id)>-1)
        $scope[type].splice($scope[type].indexOf(id), 1)
      else
        $scope[type].push(id)
    }

    $scope.$watch('stepTypeModel[0].id', function(val){
      if ($scope.reportOptionsModel && $scope.reportOptionsModel.length)
        getCBs($scope.reportOptionsModel[0].id, val, function(){
          switch ($scope.reportOptionsModel[0].id){
            case 'fulfill':
              $scope.setAllCommon(true);
              $scope.setAllTrans(true);
              break;
            case 'abandoned':
              $scope.setAllCommon(true);
              $scope.setAllTrans(false);
              break;
            case 'failed':
              $scope.setAllCommon(true);
              break;
            case 'approved':
              $scope.setAllCommon(true);
              break;
            case 'custom':
              $scope.setAllCommon(true);
              $scope.setAllTrans(false);
              break;
          }
        })
    });

    $scope.$watchCollection('[dates.fromDateValue, dates.toDateValue]', function(arr){
      $scope.showDatesError = !!(arr.length==2 && DataProcessing.dateToServer(arr[0])>DataProcessing.dateToServer(arr[1]))
    }, true);

    $scope.$watchCollection('reportOptionsModel', function(arr){
      $scope.setAllCommon(true);
      $scope.setAllTrans(true);
      $scope.fieldOptions.chargeTypeSettings.deselectAll = true;
      $scope.fieldOptions.transactionTypeSettings.deselectAll = true;
      $scope.fieldOptions.transactionResultSettings.deselectAll = true;
      $scope.fieldOptions.stepTypeSettings.deselectAll = true;
      $scope.hideAdditional = false;
      $scope.hideChargeTypes = false;
      $scope.obj.activeRLValue.id = -1;
      
      if (!arr || !arr.length)
        return;
        
      switch (arr[0].id){
        case 'fulfill':
          //$scope.obj.activeRLValue.id = 1;
          $scope.fieldOptions.chargeTypeSettings.selectedByDefault = angular.copy($scope.fieldOptions.ChargeTypes);
          $scope.fieldOptions.transactionTypeSettings.selectedByDefault = $scope.fieldOptions.TransactionTypes.filter(function(val){
            return val.name == 'auth' || val.name == 'sale'
          });
          $scope.fieldOptions.transactionResultSettings.selectedByDefault = $scope.fieldOptions.TransactionResults.filter(function(val){
            return val.id == 1 // approved
          });
          getCBs(arr[0].id, undefined, function(){
            $scope.setAllCommon(true);
            $scope.setAllTrans(true);
          })
          break
        case 'abandoned':
          $scope.hideAdditional = true;
          $scope.hideChargeTypes = true;
          getCBs(arr[0].id, undefined, function(){
            $scope.setAllCommon(true);
            $scope.setAllTrans(true);
          })
          break
        case 'failed':
          $scope.fieldOptions.chargeTypeSettings.selectedByDefault = angular.copy($scope.fieldOptions.ChargeTypes);
          $scope.fieldOptions.transactionTypeSettings.selectedByDefault = angular.copy($scope.fieldOptions.TransactionTypes);
          $scope.fieldOptions.transactionResultSettings.selectedByDefault = $scope.fieldOptions.TransactionResults.filter(function(val){
            return val.id == 3 || val.id == 2 //unknown, declined
          });
          getCBs(arr[0].id, undefined, function() {
            $scope.setAllCommon(true);
            $scope.setAllTrans(true);
          })
          break
        case 'approved':
          $scope.fieldOptions.chargeTypeSettings.selectedByDefault = angular.copy($scope.fieldOptions.ChargeTypes);
          $scope.fieldOptions.transactionTypeSettings.selectedByDefault = angular.copy($scope.fieldOptions.TransactionTypes);
          $scope.fieldOptions.transactionResultSettings.selectedByDefault = $scope.fieldOptions.TransactionResults.filter(function(val){
            return val.id == 1 // approved
          });
          getCBs(arr[0].id, undefined, function() {
            $scope.setAllCommon(true);
            $scope.setAllTrans(true);
          })
          break;
        case 'custom':
          getCBs(arr[0].id, undefined, function(){
            $scope.setAllCommon(true);
            $scope.setAllTrans(true);
          })
          break;
      }
    });

    var EMAIL_REGEXP = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i

    $scope.csvdata = [];
    $scope.csvheader = [];
    
    function buildData(content) {
      if (!content)
        return;
        
      var allColumns = $scope.fieldOptions.firstColumnCBs.concat($scope.fieldOptions.secondColumnCBs);
      var selectedColumnIDs = $scope.firstColumnSelectedCBs.concat($scope.secondColumnSelectedCBs);
      var row1 = content[0];
      var resultContent = angular.copy(content);
      
      for (name in row1) {
        var column = allColumns.filter(function(c){
          return c.name == name;
        });

        if (!column || column.length != 1){
          for (var i = 0; i < resultContent.length; i++) { 
              delete resultContent[i][name];
          }
          continue;
        }
        
        column = column[0]
        
        var selectedColumn = selectedColumnIDs.filter(function(id){
          return id == column.id;
        });
        
        if (!selectedColumn.length){
          for (var i = 0; i < resultContent.length; i++) { 
              delete resultContent[i][name];
          }
        }
      }
      
      return resultContent;
    }
    
    function buildHeader(content) {
      if (!content)
        return;
       
      var allColumns = $scope.fieldOptions.firstColumnCBs.concat($scope.fieldOptions.secondColumnCBs);
      var selectedColumnIDs = $scope.firstColumnSelectedCBs.concat($scope.secondColumnSelectedCBs);
      var row1 = content[0];
      var csvheaderColumns = [];
      
      for (name in row1) {
        var column = allColumns.filter(function(c){
          return c.name == name;
        });

        if (!column || column.length != 1){
          continue;
        }
        
        column = column[0]

        if (selectedColumnIDs.indexOf(column.id) != -1){
          csvheaderColumns.push(column.displayName);
        }
      }
      
      return csvheaderColumns;
    }
  
    $scope.download = function (email) {
      $scope.formSubmitted = true;
      $scope.show.sentEmail = false;
      $scope.show.emailError = false;
      $scope.show.emptyContent = false;
      $scope.fields.Columns = $scope.firstColumnSelectedCBs.concat($scope.secondColumnSelectedCBs);

      $scope.$broadcast('show-errors-check-validity', 'exportForm');
      
      $timeout(function(){
        var someElement = angular.element('.error-message:visible').eq(0);
        if (someElement && someElement.length>0)
          $document.scrollToElementAnimated(someElement,300);
      });

      if (email && !EMAIL_REGEXP.test($scope.addObj.emailReportValue)) {
        $scope.show.emailError = true;
        return
      }

      if ($scope.dates.fromDateValue && $scope.dates.toDateValue 
        && validRequiredArr(requiredArrays) && ((email && $scope.addObj.emailReportValue) || !email) ) {

        angular.extend($scope.fields, {
          SiteIDs: _.map($scope.sitesModel, function(site){ return site.id;}),
          DateFrom: DataProcessing.dateToServer($scope.dates.fromDateValue),
          DateTo: DataProcessing.dateToServer($scope.dates.toDateValue),
          ReportOption: _.map($scope.reportOptionsModel, function(v){ return v.id})[0],
          TransactionResponses: null,
        });

        if (!$scope.hideAdditional){
          $scope.fields.RecurringStatus = $scope.obj.activeRLValue.id
          $scope.fields.TransactionResults = _.map($scope.transactionResultModel, function(v){ return v.id})
          $scope.fields.TransactionTypes = _.map($scope.transactionTypeModel && $scope.transactionTypeModel.length ? $scope.transactionTypeModel : $scope.fieldOptions.TransactionTypes, function(v){ return v.id});
        }
        if (!$scope.hideChargeTypes)
          $scope.fields.ChargeTypes = _.map($scope.chargeTypeModel && $scope.chargeTypeModel.length ? $scope.chargeTypeModel : $scope.fieldOptions.ChargeTypes, function(v){ return v.id});

        if ($scope.reportOptionsModel && $scope.reportOptionsModel.length) {
          if ($scope.reportOptionsModel[0].id=='fulfill')
            $scope.fields.StepType = 3; //buyers

          if ($scope.reportOptionsModel[0].id=='abandoned')
            $scope.fields.StepType = 1; //inquries

          if ($scope.reportOptionsModel[0].id=='failed')
            $scope.fields.StepType = 2; //declines

          if ($scope.reportOptionsModel[0].id=='approved')
            $scope.fields.StepType = 3; //buyers

          if ($scope.reportOptionsModel[0].id=='custom')
            $scope.fields.StepType = $scope.stepTypeModel && $scope.stepTypeModel.length 
              ? _.map($scope.stepTypeModel, function(v){ return v.id})[0] 
              : null;
        }

        var method = DataStorage.exportDataFetchContent;
        if (email){
          method = DataStorage.exportDataToEmail
          $scope.fields = {
            ExportData: angular.copy($scope.fields),
            Email: angular.copy($scope.addObj.emailReportValue)
          };
        }

        $scope.loadingReport = !!email;
        $scope.loadingExport = !email;
        
        var json = angular.toJson($scope.fields);
        var data = JSON.parse(json);
        var promise = method().post(data).$promise;
        promise.then(function(resp){
          $scope.loadingReport = false;
          $scope.loadingExport = false;
          
          if (resp && !email && !resp.Status && !resp.Content){
            $scope.show.emptyContent = true;
            return;
          }
          
          if (!email && resp && resp.Status == 0) {
            $scope.csvdata = resp.Content;
            $scope.csvheader = resp.Header;
            
            var el = angular.element('#downloadcsv');
            $timeout(function () {
              el.triggerHandler('click');
            });
          }
          else if (email && resp && resp.Status == 0)
            $scope.show.sentEmail = true;
        });
      }
    };

    $scope.validColumns = function(){
      var tArr = $scope.firstColumnSelectedCBs.concat($scope.secondColumnSelectedCBs);
      return tArr.length;
    };
});
