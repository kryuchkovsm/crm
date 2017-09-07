'use strict';

angular.module('crm')
  .controller('billingReportCtrl', function ($scope, $window, ReportsSetup, ChartInit, $rootScope,
    DataStorage, GlobalVars, DataProcessing, $q, ScrollService, ModalService, $filter) {

    var defaultFrom = DataProcessing.toDateFormat(moment().subtract(7, 'd'));
    var defaultTo = DataProcessing.toDateFormat(moment());
    
    $scope.options = {}
    $scope.options.fromDateOptions = {
      label: $filter('translate')('common.from'),
      id: 304,
      inline: true
    };
    $scope.options.toDateOptions = {
      label: $filter('translate')('common.to'),
      id: 305,
      inline: true
    };
    $scope.options.groupBySelectOptions = [
      {"id":1,"name":$rootScope.translate('services.reports.reportssetup.offer'), "sName":"offer"},
      {"id":2,"name":$rootScope.translate('services.reports.reportssetup.affiliate'), "sName":"affiliate"},
      {"id":3,"name":$rootScope.translate('services.reports.reportssetup.sub-affiliate'), "sName":"subaffiliate"},
      {"id":4,"name":$rootScope.translate('services.reports.reportssetup.product'), "sName":"product"},
      //{"id":5,"name":$rootScope.translate('services.reports.reportssetup.day'), "sName":"day"},
    ]
  
    $scope.value = {
      fromDateValue: $scope.options.defaultFrom || defaultFrom,
      toDateValue: $scope.options.defaultTo || defaultTo,
      signupFlag: false
    };

    $scope.clientsModel = [];
    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '165px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: $filter('translate')('common.clients')
    };
    $scope.$watchCollection( "clientsModel",
      function(clients) {
        $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData) || $scope.sitesData;
        $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
      }
    );

    
    $scope.sitesModel = [];
    $scope.$watchCollection( "sitesModel",
      function( newValue, oldValue ) {
        if ($scope.sitesModel.length && $scope.sitesModel[0].SiteID === 0) {
          $scope.sitesModel.shift();
        }
        $scope.value.sitesModel = $scope.sitesModel;
      }
    );
    $scope.sitesData = [{
      "SiteID": 0,
      "Name": $filter('translate')('common.no-clients-selected'), 
      disabled: true
    }];
    $scope.sitesSettings = {
      idProp: 'SiteID',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '165px',
      scrollable: true,
      searchPlaceholder: 'Type site name here or select from list.',
      selectName: $filter('translate')('common.sites')
    };

    $scope.portletHeaderOptions2 = {
      title: $rootScope.translate('reports.billingreport.billingreport.controller.billing-charts')
    };
    $scope.portletHeaderOptions3 = {
      title: $rootScope.translate('reports.billingreport.billingreport.controller.billing-details')
    };

    ReportsSetup.commonOptions2($scope);
    
    $scope.dataReady = false;
    $scope.keysHeader = {}

    var tableFiltersGetDataPromise = function () {
      var cd = angular.copy($scope.value)
      
      var dateFrom = cd && cd.fromDateValue 
        ? DataProcessing.stringToDate(cd.fromDateValue) 
        : defaultFrom;
                        
      var dateTo = cd && cd.toDateValue 
        ? DataProcessing.stringToDate(cd.toDateValue) 
        : defaultTo;
        
      var searchObj = {
        SiteIDs: cd && cd.sitesModel ? cd.sitesModel.map(function (item) {
          return item.id;
        }) : [],
        DateFrom: DataProcessing.dateToServer(dateFrom),
        DateTo: DataProcessing.dateToServer(dateTo),
        ReportBy: $scope.value.groupBySelectValue,
        OnlySignupsInRange: cd.signupFlag
      };

      var actionPromise = DataStorage.reportsAnyApi('billing').post(searchObj).$promise;

      return actionPromise;
    };

    $scope.search = function () {
      $scope.searching = true;
      $scope.dataReady = false;
      
      var deferred = $q.defer();
      GlobalVars.setLoadingRequestStatus(true)

      var actionPromise = tableFiltersGetDataPromise();
      actionPromise.then(function (data) {
          $scope.searching = false;
          deferred.resolve();
          GlobalVars.setLoadingRequestStatus(false)
          if (data.Status) {
            $scope.tableObj = [];
            $scope.tableObjSafe = [];
            $scope.keysHeader = {}
            $scope.dataReady = 'No';
          } else {
            var sData = data.BillingReport;

            if (sData.Grid.length) {
              var percent = sData.ActiveSignupsPercentage;
              $scope.donutchartOptions.chartData = [
                // First obj is a black line
                { label: '', data: percent, color: "#383D42" },
                { label: '', data: 100 - percent, color: "rgba(255, 255, 255, 0)" }
              ];
              $scope.donutchartOptions.percents = percent;
              
              
              if (!sData.SignupTrends || !sData.SignupTrends.length) {
                $scope.haveSignupData = false;
              } else {
                $scope.dottedLinechartOptions1.chartData = sData.SignupTrends.map(function (item) {
                  return [item.DateEntered * 1000, item.ID];
                }).sort(ReportsSetup.compareDates);
                $scope.haveSignupData = true;
              }
              
              if (!sData.ApprovalTrends || !sData.ApprovalTrends.length) {
                $scope.haveApprovalData = false;
              } else {
                $scope.dottedLinechartOptions2.chartData = sData.ApprovalTrends.map(function (item) {
                  return [item.DateEntered * 1000, item.ID];
                }).sort(ReportsSetup.compareDates);
                $scope.haveApprovalData = true;
              }
              
              $scope.tableObj = sData.Grid;
              $scope.tableObjSafe = sData.Grid;
              if (sData.Grid && sData.Grid.length){
                _.each(Object.keys(sData.Grid[0]), function(key){
                  $scope.keysHeader[key] = ReportsSetup.unCamelCase(key).replace('Dollars', '$')
                })
              }

              if (sData.GridTotal){
                  $scope.gridTotal = sData.GridTotal
              }

              $scope.dataReady = true;
            } else {
              $scope.keysHeader = {}
              $scope.tableObj = [];
              $scope.tableObjSafe = [];
              $scope.dataReady = 'No';
            }
          }
          ScrollService.scrollTo('bottom');
        }
      );
      return deferred.promise;
    };

    $scope.showSummaryDetails = function (query) {
      var cd = angular.copy($scope.value)
      
      query.SiteIDs = cd.sitesModel.map(function (item) { return item.id; });
      query.GridType = cd.groupBySelectValue;
      query.SignupFlag = cd.signupFlag;
      query.DateFrom = cd.fromDateValue 
        ? DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone) 
        : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone)
      
      query.DateTo = cd.toDateValue 
        ? DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone) 
        : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone)
      
      var title = query.Column.split(/(?=[A-Z])/).join(' ').toUpperCase();
        
      ModalService.showModal({
        templateUrl: "components/modals/REPORTS/summaryDetails.html",
        controller: "summaryDetailsCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            modalTitle: title.toLowerCase()=='recurringattempts' ? 'RECURRING ATTEMPTS' : title,
            query: query,
            method: 'billing'
          }
        }
      }).then(function (modal) {
        //it's a bootstrap element, use 'modal' to show it
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          return false;
        });
      });
    };


    var percent = 70;
    $scope.donutchartOptions = {
      tooltipLabel: $rootScope.translate('reports.billingreport.billingreport.controller.active-signups'),
      percents: percent,
      squareDonut: true,
      color: 'black',
      amountLabelStyles: {
        top: '110px',
      },
      tooltipLabelStyles:{
        top: '177px',
      },
      //chartData: [],
      chartData: [
        // First obj is a black line
        { label: '', data: percent, color: "#383D42" },
        { label: '', data: 100 - percent, color: "rgba(255, 255, 255, 0)" }
      ],
      chartID: 15
    };
    $scope.dottedLinechartOptions1 = {
      height: 290,
      tooltipLabel: 'SIGNUPS',
      chartID: 2,
      chartData: [],
      bottomBlock: false,
      leftBlockDisabled: true
    };
    $scope.dottedLinechartOptions2 = {
      height: 290,
      tooltipLabel: 'APPROVALS',
      chartID: 3,
      chartData: [],
      blackGrey: true,
      bottomBlock: false,
      leftBlockDisabled: true
    };

  });
