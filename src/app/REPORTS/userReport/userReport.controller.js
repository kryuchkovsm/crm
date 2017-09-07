'use strict';

angular.module('crm')
  .controller('userReportCtrl', function ($scope, ReportsSetup, ModalService, DataStorage,
    GlobalVars, DataProcessing, $rootScope, Notification, $q) {
    
    $scope.clientDatesOptions = {
      title: 'services.reports.reportssetup.choose-clients-and-sites'
    };

    $scope.portletHeaderOptions2 = {
      title: 'reports.userreport.userreport.controller.user-details'
    };

    DataStorage.anyApiMethod('/users/add').query(function(resp){
      if (resp && !resp.Status) {
        $scope.sections = resp.Sections;
        $scope.userTypes = resp.UserTypes;
      }
    });
    
    $scope.editUser = function (userId) {
      DataStorage.userApi.get().query({userId: userId}, function(resp){
        if (resp.Status != 0) {
          return;
        }

        ModalService.showModal({
          templateUrl: "components/modals/ADMINISTRATION/user/addUser.html",
          controller: "AddUserModalCtrl",
          inputs: {
            data: {
              modalTitle: $rootScope.t('reports.userreport.userreport.controller.user-info'),
              User: resp.User,
              Sections: $scope.sections,
              UserTypes: $scope.userTypes
            }
          }
        }).then(function (modal) {
          modal.element.modal();
          
          modal.close.then(function (result) {
            if (!result)
              return;
          
            Notification.success({
              message: $rootScope.translate('reports.userreport.userreport.user-updated'), 
              delay: 5000
            })
          })

        });
      });
    };

    $scope.userActivity = function(row, dateFrom, dateTo){
      dateTo = dateTo || Date.now();
      dateFrom = dateFrom || Date.now();
      
      ModalService.showModal({
        templateUrl: "components/modals/REPORTS/userActivity.html",
        controller: "userActivityCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            modalTitle: $rootScope.translate('reports.userreport.userreport.user-activity', {value1: row.UserName, value2: DataProcessing.toDateFormat(dateFrom), value3: DataProcessing.toDateFormat(dateTo)}),
            query: {
              Username: row.UserName,
              DateFrom: DataProcessing.dateToServer(dateFrom, $scope.selectedTimezone),
              DateTo: DataProcessing.dateToServer(dateTo, $scope.selectedTimezone)
            }
          }
        }
      }).then(function (modal) {
        modal.element.modal();
      });
    };


    
    var defaultFrom = moment().subtract(7, 'd');
    var defaultTo = moment();

    $scope.clientDatesValue = {
      fromDateValue: DataProcessing.toDateFormat(defaultFrom),
      toDateValue: DataProcessing.toDateFormat(defaultTo)
    };
    
    

    $scope.search = function () {
      var deferred = $q.defer();
      GlobalVars.setLoadingRequestStatus(true)

      $scope.keysHeader = {}
      //$scope.tableFilterOptions = {};
      
      var cd = $scope.clientDatesValue;
      
      var dateFrom = cd && cd.fromDateValue 
        ? DataProcessing.stringToDate(cd.fromDateValue) 
        : defaultFrom;
      
      var dateTo = (cd && cd.toDateValue) 
        ? DataProcessing.stringToDate(cd.toDateValue) 
        : defaultTo;
      
      var searchObj = {
        "SiteIDs": cd && cd.sitesModel ? cd.sitesModel.map(function (item) {
          return item.id;
        }) : [],
        "DateFrom": DataProcessing.dateToServer(dateFrom),
        "DateTo": DataProcessing.dateToServer(dateTo)
      };

      var actionPromise = DataStorage.reportsAnyApi('user').post(searchObj).$promise;
      actionPromise.then(function (data) {
          deferred.resolve();
          GlobalVars.setLoadingRequestStatus(false)
          if (data.Status) {
            $scope.keysHeader = {}
            $scope.tableObj = [];
            $scope.tableObjSafe = [];
            $scope.dataReady = 'No';
          } else {
            var sData = data.UserReport;
            if (sData.length) {
              $scope.tableObj = sData;
              $scope.tableObjSafe = sData;
              if (sData && sData.length){
                _.each(Object.keys(sData[0]), function(key){
                  $scope.keysHeader[key] = unCamelCase(key)
                })
              }

              $scope.dataReady = true;
            } else {
              $scope.keysHeader = {}
              $scope.tableObj = [];
              $scope.tableObjSafe = [];
              $scope.dataReady = 'No';
            }
          }
        }
      );
      return deferred.promise;
    };
    
    function unCamelCase (str){
      return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
        .replace(/^./, function(str){ return str.toUpperCase(); })
    }

  });
