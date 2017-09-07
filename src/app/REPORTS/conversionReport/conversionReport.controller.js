'use strict';

angular.module('crm')
  .controller('conversionReportCtrl', function ($scope, ReportsSetup, $rootScope, $q, 
    DataStorage, DataProcessing, GlobalVars, ModalService, ScrollService) {
      
    $scope.portletHeaderOptions2 = {
      title: $rootScope.translate('reports.conversionreport.conversionreport.controller.conversion-charts')
    };
    $scope.portletHeaderOptions3 = {
      title: $rootScope.translate('reports.conversionreport.conversionreport.controller.conversion-details')
    };
    
    $scope.dataReady = false;
    $scope.havePieData = false;
    $scope.haveActData = false;
    $scope.piechartOptions = {
      percents: true,
      bg: '#bbb',
      color: 'grey',
      chartData: [],
      chartID: 1
    };
    $scope.dottedLinechartOptions1 = {
      height: 290,
      tooltipLabel: 'ACTIVITY',
      chartData: [],
      chartID: 2,
      bottomBlock: false,
      leftBlockDisabled: true
    };
    $scope.dottedLinechartOptions2 = {
      height: 290,
      tooltipLabel: 'BUYERS',
      chartData: [],
      chartID: 3,
      blackGrey: true,
      bottomBlock: false,
      leftBlockDisabled: true
    };
    
    ReportsSetup.commonOptions2($scope);
    
    angular.extend($scope.clientDatesOptions, {
      groupBy: true,
      groupBySelectOptions: [
        {"id":1,"name":"Offer", "sName":"Offer"},
        {"id":0,"name":"Affiliate", "sName":"Affiliate"}
      ]
    })
    
    $scope.keysHeader = {};

    $scope.search = function () {
      $scope.chartsReady = false;
      $scope.dataReady = false;
      
      GlobalVars.setLoadingRequestStatus(true)

      var cd = $scope.clientDatesValue;

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
        ViewBy: cd.groupBySelectValue
      };
      
      $scope.clientDatesOptions.fromDateOptions.placeholder = DataProcessing.toDateFormat(dateFrom);
      $scope.clientDatesOptions.toDateOptions.placeholder = DataProcessing.toDateFormat(dateTo);

      var promiseCharts = DataStorage.reportsAnyApi('conversion/charts').post(searchObj).$promise;
      var promiseGrid = DataStorage.reportsAnyApi('conversion').post(searchObj).$promise;
      
      promiseCharts.then(function (data) {
          //deferred.resolve();
          GlobalVars.setLoadingRequestStatus(false)
          var sData = data.ConversionReport;
          
          // Pass data to charts
          $scope.havePieData =
            sData.Chart.declinePercentage ||
            sData.Chart.buyerPercentage ||
            sData.Chart.inquiryPercentage;
          
          if ($scope.havePieData)
            $scope.piechartOptions.chartData = [
              { label: $rootScope.translate('services.reports.reportssetup.declines'), data: sData.Chart.declinePercentage, color: "#44A2E0", txtColor:  "#44A2E0" },
              { label: $rootScope.translate('services.reports.reportssetup.buyers'), data: sData.Chart.buyerPercentage, color: "#383D42", txtColor:  "#383D42" },
              { label: $rootScope.translate('services.reports.reportssetup.inquiries'), data: sData.Chart.inquiryPercentage, color: "#fff", txtColor:  "#fff" }
            ];

          if (sData.ActivityBySiteID && sData.ActivityBySiteID.Buyers.length){
            $scope.haveActData = true;
            var i = 0;
            var comparator = function (a,b){
              if (a.Count < b.Count) return -1;
              if (a.Count > b.Count) return 1;
              return 0;
            }
            sData.ActivityBySiteID.Buyers = sData.ActivityBySiteID.Buyers.sort(comparator)
            $scope.dottedLinechartOptions1.universal = true;
            $scope.dottedLinechartOptions1.chartData = sData.ActivityBySiteID.Buyers.map(function (item) {
              var r = [i, item.Count, item.SiteName];
              i++;
              return r;
            });
            
          }else
            $scope.haveActData = false;

          $scope.chartsReady = true;
          ScrollService.scrollTo('charts');
          
        }, function (error) {
          console.log(' get conversion error ', error);
        }
      );

      promiseGrid.then(function (data) {
        //deferred.resolve();
        GlobalVars.setLoadingRequestStatus(false)
        var sData = data.ConversionReport;
        
        $scope.tableObjSafe = sData.Grid;
        if (sData.Grid && sData.Grid.length){
          _.each(Object.keys(sData.Grid[0]), function(key){
            $scope.keysHeader[key] = ReportsSetup.unCamelCase(key)

          })
        }
        
        $scope.dataReady = true;
      },
      function (error) {
          console.log(' get conversion error ', error);
      });


      var deffered = $q.all([promiseCharts, promiseGrid]);
      return deffered;
    };

    $scope.showSummaryDetails = function (query) {
      var cd = angular.copy($scope.clientDatesValue)
      
      query.SiteIDs = cd.sitesModel.map(function (item) { return item.id; });
      query.GridType = cd.groupBySelectValue;
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
            method: 'conversions'
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

  });
