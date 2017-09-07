'use strict';

angular.module('crm')
  .controller('projectionReportCtrl', function ($scope, ReportsSetup, ModalService,
    $rootScope, DataProcessing, $q, DataStorage, GlobalVars, ScrollService) {

    ReportsSetup.commonOptions2($scope);

    angular.extend($scope.clientDatesOptions, {
      defaultFrom: DataProcessing.toDateFormat(moment()),
      defaultTo: DataProcessing.toDateFormat(moment().add(7,'days'))
    })
    
    $scope.keysHeader = {
      'Date': 'Date',
      'ProjectedRecurrings': 'Projected Recurrings #',
      'ProjectedRecurringsDollars': 'Projected Recurrings $',
      'ProjectedApproved': 'Projected Approved #',
      'ProjectedApprovedDollars': 'Projected Approved $',
      'ProjectedRefunds': 'Projected Refunds #',
      'ProjectedRefundsDollars': 'Projected Refunds $',
      'ProjectedSettledDollars': 'Projected Settled'
    };
    
    $scope.fromDateOptions = {
      label: $rootScope.translate('services.reports.reportssetup.from')+':',
      id: 304,
      small: true,
      placeholder: 'From',
      beforeShowDay: function(dt){
        var nextYearDate = new Date();
        nextYearDate.setMonth(nextYearDate.getMonth() + 12);
        return new Date(dt) > new Date() && nextYearDate > new Date(dt);
      }
    };
    
    $scope.toDateOptions = {
      label: $rootScope.translate('services.reports.reportssetup.to')+':',
      id: 305,
      small: true,
      placeholder: 'To',
      beforeShowDay: function(dt){
        var nextYearDate = new Date();
        nextYearDate.setMonth(nextYearDate.getMonth() + 12);
        return new Date(dt) > new Date() && nextYearDate > new Date(dt);
      }
    };

    var tableFiltersGetDataPromise = function () {
      var cd = $scope.clientDatesValue;
      var tf = $scope.tableFiltersValue;
      var to = $scope.tableFilterOptions;
      var dateFrom = cd && cd.fromDateValue
        ? DataProcessing.stringToDate(cd.fromDateValue)
        : tf && tf.fromDateValue ? DataProcessing.stringToDate(tf.fromDateValue) : defaultFrom;
        
      var dateTo = cd && cd.toDateValue
        ? DataProcessing.stringToDate(cd.toDateValue)
        : tf && tf.toDateValue ? DataProcessing.stringToDate(tf.toDateValue) : defaultTo;
        
      var searchObj = {
        "SiteIDs": cd && cd.sitesModel ? cd.sitesModel.map(function (item) {
          return item.id;
        }) : [],
        "DateFrom": DataProcessing.dateToServer(dateFrom),
        "DateTo": DataProcessing.dateToServer(dateTo)
      };

      var actionPromise = DataStorage.reportsAnyApi('projection').post(searchObj).$promise;

      $scope.clientDatesOptions && $scope.clientDatesOptions.fromDateOptions 
        ? $scope.clientDatesOptions.fromDateOptions.placeholder = DataProcessing.toDateFormat(dateFrom) 
        : false;

      $scope.clientDatesOptions && $scope.clientDatesOptions.toDateOptions 
        ? $scope.clientDatesOptions.toDateOptions.placeholder = DataProcessing.toDateFormat(dateTo) 
        : false;

      to && to.fromDateOptionsSmall && (!cd || !cd.fromDateValue) 
        ? to.fromDateOptionsSmall.placeholder = DataProcessing.toDateFormat(dateFrom) 
        : false;

      to && to.toDateOptionsSmall && (!cd || !cd.toDateValue) 
        ? to.toDateOptionsSmall.placeholder = DataProcessing.toDateFormat(dateTo) 
        : false;

      return actionPromise;
    };

    $scope.showSummaryDetails = function (query, tableFiltersValue, method) {
      tableFiltersValue = tableFiltersValue || {};
      var cd = angular.copy($scope.clientDatesValue);
      _.extend(query, {
        "SiteIDs": cd && cd.sitesModel ? cd.sitesModel.map(function (item) {
          return item.id;
        }) : [],
        "DateFrom": DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone),
        "DateTo": DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone),
      })

      if ($scope.daySelectValue){
        query.DateFrom = DataProcessing.dateToServer($.getPeriods($scope.daySelectValue).firstDate, $scope.selectedTimezone)
        query.DateTo = DataProcessing.dateToServer($.getPeriods($scope.daySelectValue).lastDate, $scope.selectedTimezone)
      }else if (tableFiltersValue.DateFrom || tableFiltersValue.DateTo) {
        query.DateFrom = tableFiltersValue.DateFrom ? DataProcessing.dateToServer(DataProcessing.stringToDate(tableFiltersValue.DateFrom), $scope.selectedTimezone) : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone)
        query.DateTo = tableFiltersValue.DateTo ? DataProcessing.dateToServer(DataProcessing.stringToDate(tableFiltersValue.DateTo), $scope.selectedTimezone) : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone)
      }else{
        query.DateFrom = cd.fromDateValue ? DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone) : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone)
        query.DateTo = cd.toDateValue ? DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone) : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone)
      }

      var title = query.Column
        ? query.Column.split(/(?=[A-Z])/).join(' ').toUpperCase()
        : method.split(/(?=[A-Z])/).join(' ').toUpperCase() + ' Summary Details for SiteID = ' + query.KeyID

      title = 'Projection Summary Details for date ' + DataProcessing.toDateFormat(moment(query.Date * 1000));
      
      ModalService.showModal({
        templateUrl: "components/modals/REPORTS/summaryDetails.html",
        controller: "summaryDetailsCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            modalTitle: title.toLowerCase()=='recurringattempts' ? 'RECURRING ATTEMPTS' : title,
            query: query,
            method: method
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

    $scope.search = function () {
      var deferred = $q.defer();
      GlobalVars.setLoadingRequestStatus(true)
      $scope.tableFilterOptions = {
        type: "projection"
      };
      var actionPromise = tableFiltersGetDataPromise();
      actionPromise.then(function (data) {
          deferred.resolve();
          GlobalVars.setLoadingRequestStatus(false)
          if (data.Status) {
            $scope.tableObj = [];
            $scope.tableObjSafe = [];
            $scope.dataReady = 'No';
          } else {
            var sData = data.ProjectionReport;
            $scope.haveProjData = sData.ProjectedApprovedPercent && sData.ProjectedRefundsPercent;
            if ($scope.haveProjData)
              $scope.piechartOptions1.chartData = [
                {
                  label: $rootScope.translate('services.reports.reportssetup.approved'),
                  amountToShow: sData.ProjectedApprovedPercent,
                  data: sData.ProjectedApprovedPercent,
                  color: "#44A2E0",
                  txtColor: "#44A2E0"
                },
                {
                  label: $rootScope.translate('services.reports.reportssetup.refunds'),
                  amountToShow: sData.ProjectedRefundsPercent,
                  data: sData.ProjectedRefundsPercent,
                  color: "#7DB341",
                  txtColor: "#7DB341",
                  stripes: true
                },
                {data: 100 - (sData.ProjectedApprovedPercent + sData.ProjectedRefundsPercent), color: "#FFFFFF"}
              ];

            $scope.haveActData = sData.ActualApprovedPercent && sData.ActualRefundsPercent;
            if ($scope.haveActData)
              $scope.piechartOptions2.chartData = [
                {
                  label: $rootScope.translate('services.reports.reportssetup.approved'),
                  amountToShow: sData.ActualApprovedPercent,
                  data: sData.ActualApprovedPercent,
                  color: "#44A2E0",
                  txtColor: "#44A2E0"
                },
                {
                  label: $rootScope.translate('services.reports.reportssetup.refunds'),
                  amountToShow: sData.ActualRefundsPercent,
                  data: sData.ActualRefundsPercent,
                  color: "#7DB341",
                  txtColor: "#7DB341",
                  stripes: true
                },
                {data: 100 - (sData.ActualApprovedPercent + sData.ActualRefundsPercent), color: "#FFFFFF"}
              ];

            if (sData.Grid.length) {
              $scope.tableObj = sData.Grid;
              $scope.tableObjSafe = sData.Grid
              $scope.dataReady = true;
            } else {
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

    $scope.portletHeaderOptions2 = { 
      title: $rootScope.translate('reports.projectionreport.projectionreport.controller.projection-charts')
    };
    
    $scope.portletHeaderOptions3 = {
      title: $rootScope.translate('reports.projectionreport.projectionreport.controller.projection-details')
    };

    $scope.exportToExcel = function (keysHeader, table, isHeader) {
      var headerKeys = Object.keys(keysHeader);

      var res = [];

      if (!table)
        return false;
        
      var t = _.map(angular.copy(table), function(row){
        var resRow = {};
        _.each(row, function(v, k){
          if (headerKeys.indexOf(k)>-1) {
            if (k && (k.toLowerCase().indexOf('date')>-1 || k.toLowerCase().indexOf('time')>-1))
              resRow[keysHeader[k]] = v ? DataProcessing.dateFromServer(v) : v;
            else if (k && k.toLowerCase().indexOf('lastlogin')>-1){
              resRow[keysHeader[k]] = v ? DataProcessing.dateFromServer(v, true) : v;
            }
            else{
              var tK = keysHeader[k];
              if (k=='KeyID') tK = 'ID'
              if (k=='KeyName') tK = 'Name'
              resRow[tK] = v+'';
            }
          }
        });
        return resRow
      });
      
      if (isHeader){
        _.each(headerKeys, function(k){
          var tK = keysHeader[k];
          if (k=='KeyID') tK = idName+' ID'
          if (k=='KeyName') tK = 'Name'
          res.push(tK)
        })
      }
      else
        res = t;
        
      return res;
    };

    // Pie chart
    $scope.piechartOptions1 = {
      percents: true,
      bg: '#bbb',
      color: 'grey',
      chartData: [],
      chartID: 1
    };

    $scope.piechartOptions2 = {
      percents: true,
      bg: '#bbb',
      color: 'grey',
      chartData: [],
      chartID: 2
    };

  });
