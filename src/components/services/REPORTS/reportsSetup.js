/**
 * Created by user on 03.04.15.
 * Contains common methods or methods which require same libs, not to instantiate them several times
 * while browsing reports
 */

'use strict';

angular.module('ReportsSetupService', [])
  .factory('ReportsSetup', function($filter, ScrollService, ChartInit, GlobalVars, ModalService, 
  	DataStorage, DataProcessing, $timeout, $document, $q, $rootScope) {

    // Private common methods
    var defaultFrom = moment().subtract(7, 'd');
    var defaultTo = moment();
    var compareDates = function (a, b) {
      return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
    };
    function unCamelCase (str){
      return str
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\b([A-Z]+)([A-Z])([a-z])/, '$1 $2$3')
        .replace(/^./, function(str){ return str.toUpperCase(); })
    }
    var daySelectOptions = [
      {"id":0,"name": $rootScope.translate('services.reports.reportssetup.today')},
      {"id":1,"name": $rootScope.translate('services.reports.reportssetup.yesterday')},
      {"id":2,"name": $rootScope.translate('services.reports.reportssetup.this-week')},
      {"id":3,"name": $rootScope.translate('services.reports.reportssetup.last-week')},
      {"id":4,"name": $rootScope.translate('services.reports.reportssetup.this-month')},
      {"id":5,"name": $rootScope.translate('services.reports.reportssetup.last-month')},
      {"id":6,"name": $rootScope.translate('services.reports.reportssetup.this-year')},
      {"id":7,"name": $rootScope.translate('services.reports.reportssetup.last-year')}
    ];
    var getKeysCount = function(obj){
      obj = obj || {}
      return Object.keys(obj).length
    }
    var fillTable = function (tableFiltersValue) {
        var cd = $scope.clientDatesValue || {};
        var searchObj = angular.copy(tableFiltersValue) || {};
        if ($scope.daySelectValue){
          searchObj.DateFrom = DataProcessing.dateToServer($.getPeriods($scope.daySelectValue).firstDate, $scope.selectedTimezone)
          searchObj.DateTo = DataProcessing.dateToServer($.getPeriods($scope.daySelectValue).lastDate, $scope.selectedTimezone)
        }else if (searchObj.DateFrom || searchObj.DateTo) {
          searchObj.DateFrom = searchObj.DateFrom ? DataProcessing.dateToServer(DataProcessing.stringToDate(searchObj.DateFrom), $scope.selectedTimezone) : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone)
          searchObj.DateTo = searchObj.DateTo ? DataProcessing.dateToServer(DataProcessing.stringToDate(searchObj.DateTo), $scope.selectedTimezone) : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone)
        }else{
          searchObj.DateFrom = cd.fromDateValue ? DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone) : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone)
          searchObj.DateTo = cd.toDateValue ? DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone) : DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone)
        }
        if (cd.sitesModel)
          angular.extend(searchObj, {
            SiteIDs: cd.sitesModel.map(function (item) {
              return item.id;
            })
          });

        if ($scope.searchSitesValue)
          searchObj.SiteIDFilter = $scope.searchSitesValue.SiteID
        if ($scope.searchClientsValue)
          searchObj.ClientNameFilter = $scope.searchClientsValue.ClientID
        else if ($scope.searchCompanyValue)
          searchObj.CompanyFilter = $scope.searchCompanyValue.ClientID

        DataStorage.reportsAnyApi(action).post(searchObj, function(data){
          var sData = data[apiReport];
          if (sData){
            if (searchObj.ViewBy)
              $scope.keyID = searchObj.ViewBy;

            $scope.tableObj = sData.Grid || sData;
            $scope.tableObjSafe = sData.Grid || sData;
            $scope.dataReady = true;
          }
        });
      };

    var tableFiltersGetDataPromise = function ($scope, action) {
      var cd = $scope.clientDatesValue,
          tf = $scope.tableFiltersValue,
          to = $scope.tableFilterOptions,
          dateFrom = cd && cd.fromDateValue ? DataProcessing.stringToDate(cd.fromDateValue) :
                      tf && tf.fromDateValue ? DataProcessing.stringToDate(tf.fromDateValue) : defaultFrom,
          dateTo = cd && cd.toDateValue ? DataProcessing.stringToDate(cd.toDateValue) :
                    tf && tf.toDateValue ? DataProcessing.stringToDate(tf.toDateValue) : defaultTo;
          var searchObj = {
            "SiteIDs": cd && cd.sitesModel ? cd.sitesModel.map(function (item) {
              return item.id;
            }) : [],
            "DateFrom": DataProcessing.dateToServer(dateFrom),
            "DateTo": DataProcessing.dateToServer(dateTo)
          };

      if (action == 'conversion'){
        searchObj.ViewBy = tf && tf.groupBySelectValue && tf.groupBySelectValue.name ? tf.groupBySelectValue.name : "Offer";
      }else if (action == 'income'){
        searchObj.GroupBy = cd && cd.groupBySelectValue ? cd.groupBySelectValue : "campaign";
      }else{
        searchObj.ReportBy = tf && tf.offerSelectValue && tf.offerSelectValue.apiname ? tf.offerSelectValue.apiname : "offer";
        searchObj.ViewBy = tf && tf.groupBySelectValue && tf.groupBySelectValue.name ? tf.groupBySelectValue.name : "processor";
      }

      var actionPromise = DataStorage.reportsAnyApi(action).post(searchObj).$promise;

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

    var transactionGetDataPromise = function ($scope) {
      var cd = $scope.clientDatesValue,
          dateFrom = cd.fromDateValue ? DataProcessing.stringToDate(cd.fromDateValue) : defaultFrom,
          dateTo = cd.toDateValue ? DataProcessing.stringToDate(cd.toDateValue) : defaultTo,
          action = 'transaction',
          searchObj = {
            "SiteIDs": cd.sitesModel.map(function (item) {
              return item.id;
            }),
            "DateFrom": DataProcessing.dateToServer(dateFrom),
            "DateTo": DataProcessing.dateToServer(dateTo),
            "Status": cd.statusCheckBoxValue || [],
            "TransactionTypes": cd.transactionTypeCheckBoxValue || [],
            "TransactionID": cd.transactionIdTxtValue || null,
            "CustomerID": cd.customerIdTxtValue || null,
            "LastName": cd.lastNameTxtValue || null,
            "Email": cd.emailTxtValue || null,
            "CCLast4Digits": cd.last4digitsTxtValue || null,
            "ProcessorID": cd.processorIdTxtValue || null,
            "AffiliateID": cd.affiliateIdTxtValue || null,
            "AmountFrom": cd.amountTxtRangeValue && cd.amountTxtRangeValue[0] ? cd.amountTxtRangeValue[0] : "0",
            "AmountTo": cd.amountTxtRangeValue && cd.amountTxtRangeValue[1] ? cd.amountTxtRangeValue[1] : "0"
          };
      return DataStorage.reportsAnyApi(action).post(searchObj).$promise;
    };

    var commonOptions2 = function ($scope, action, apiReport) {
      $scope.timezones = moment.tz.names();
      $scope.selectedTimezone = "";
      $scope.clientDatesOptions = {
        title: 'services.reports.reportssetup.choose-clients-and-sites',
      };
      $scope.daySelectOptions = daySelectOptions;
      $scope.getKeysCount = getKeysCount;
    }

    // *************************** Public Common Methods ***************************
    var commonOptions = function ($scope, action, apiReport) {
      $scope.timezones = moment.tz.names();
      $scope.selectedTimezone = "";

      $scope.getKeysCount = getKeysCount;
      $scope.dataReady = false;
      $scope.fields = {};
      $scope.tableObj = [];
      $scope.tableObjSafe = [];
      $scope.tableFilterOptions = {};
      $scope.clientDatesOptions = {
        title: 'services.reports.reportssetup.choose-clients-and-sites',
      };

      var clients = _.map(GlobalVars.commonObject().Clients, function(client){
        return {id: client.ClientID}
      });
      $scope.autocompleteSitesData = DataProcessing.newMakeSites(clients, GlobalVars.commonObject().Clients)
      $scope.autocompleteClientsData = GlobalVars.commonObject().Clients

      var normCurrVal = function(currency){
        currency = angular.copy(currency) || 0;
        if (typeof currency == 'string' && currency.indexOf('$')>-1) return currency

        return '$' + parseFloat(currency).toFixed(2)
      };
      var normPercentVal = function(percent){
        percent = angular.copy(percent) || 0;
        if (typeof percent == 'string' && percent.indexOf('%')>-1) return percent

        return (parseFloat(percent)*100).toFixed(2) + '%'
      };

      $scope.normCurrency = function(KeyID, keyName){
        angular.forEach($scope.tableObjSafe, function(row){
          if (row.KeyID == KeyID) row[keyName] = normCurrVal(row[keyName]);
        });
      };

      $scope.normPercents = function(KeyID, keyName){
        angular.forEach($scope.tableObjSafe, function(row){
          if (row.KeyID == KeyID) 
            row[keyName] = normPercentVal(row[keyName]);
        });
      };

      $scope.exportToExcel = function (keysHeader, isHeader) {
        var headerKeys = Object.keys(keysHeader);
        if ($scope.tableFiltersValue)
          var idName = $scope.tableFiltersValue.ViewBy || $scope.tableFiltersValue.ReportBy || 'Offer'
        var res = [];
        $scope.tableFiltersValue = $scope.tableFiltersValue || {};
        if (!$scope.tableObjSafe) return false;
        var table = _.map(angular.copy($scope.tableObjSafe), function(row){
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
                if (k=='KeyID') tK = idName+' ID'
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
        else res = table;
        return res;
      };

      $scope.offerSelectOptions = [
        {"id":0,"name": $rootScope.translate('services.reports.reportssetup.offer')},
        {"id":1,"name": $rootScope.translate('services.reports.reportssetup.affiliate')}
      ];

      $scope.daySelectOptions = daySelectOptions;

      $scope.fillTable = fillTable;

      $scope.showSummaryDetails = function (query, tableFiltersValue, method) {
        tableFiltersValue = tableFiltersValue || {};
        var cd = angular.copy($scope.clientDatesValue)
        _.extend(query, {
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

        var title = query.Column ? query.Column.split(/(?=[A-Z])/).join(' ').toUpperCase() : method.split(/(?=[A-Z])/).join(' ').toUpperCase() + ' Summary Details for SiteID = ' + query.KeyID
        if (method=='projection'){
          title = 'Projection Summary Details for date ' + DataProcessing.toDateFormat(moment(query.Date * 1000));
        }
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

      //show modal
      $scope.showModalDetails = function (title, query) {
        ModalService.showModal({
          templateUrl: "components/modals/REPORTS/summaryDetails.html",
          controller: "summaryDetailsCtrl",
          windowClass: 'big-modal',
          inputs: {
            data: {
              modalTitle: title,
              query: query,
              method: 'recurring/count'
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
      }

    };
    
    // *************************** Transaction ***************************
    var transactionOptions = function ($scope) {
      $scope.clientDatesOptions.advancedSearch = true;
      $scope.keysHeader = {}
      $scope.search = function () {
        var deferred = $q.defer();
        GlobalVars.setLoadingRequestStatus(true)
        var actionPromise = transactionGetDataPromise($scope);
        actionPromise.then(function (data) {
            deferred.resolve();
            GlobalVars.setLoadingRequestStatus(false)
            if (data.Status) {
              $scope.keysHeader = {}
              $scope.tableObj = [];
              $scope.tableObjSafe = [];
              $scope.dataReady = 'No';
            } else {
              var sData = data.TransactionsReport.Grid;
              if (sData.length) {
                sData = _.map(sData, function(row){
                  if (row.FirstName) row.FirstName = row.FirstName.trim();
                  return row
                })
                $scope.tableObj = sData;
                $scope.tableObjSafe = sData;
                if (sData && sData.length){
                  _.each(Object.keys(sData[0]), function(key){
                    $scope.keysHeader[key] = unCamelCase(key).replace('Dollars', '$')
                  })
                }

                $scope.dataReady = true;
                $scope.AmountTotal = data.TransactionsReport.AmountTotal;
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
      $scope.hideSearchFields = function() {
        $scope.clientDatesValue.showAdvanced = false;
        $timeout(function(){
          var someElement = angular.element('#search-container');
          if (someElement && someElement.length)
            $document.scrollToElementAnimated(someElement, 300);
        },100);

      };
      // ToDo: chargeback api
      $scope.cbTransaction = function(TransactionResponseID) {
      };
    };

    // *************************** Processing ***************************
    var processingOptions = function ($scope) {
      $scope.$watchCollection('[tableFiltersValue.DateFrom, tableFiltersValue.DateTo, selectedTimezone]', function(arr){
        if (arr[0] || arr[1] || arr[2]){
          if (($scope.tableFiltersValue.DateFrom || $scope.tableFiltersValue.DateTo) && $scope.daySelectValue){
            if (DataProcessing.toDateFormat($.getPeriods($scope.daySelectValue).firstDate) != $scope.tableFiltersValue.DateFrom ||
              DataProcessing.toDateFormat($.getPeriods($scope.daySelectValue).lastDate) != $scope.tableFiltersValue.DateTo)
              $scope.daySelectValue = '';
          }

          $scope.fillTable($scope.tableFiltersValue)
        }
      }, true);

      $scope.$watch('daySelectValue', function(daySelectValue){
        if (daySelectValue){
          $scope.tableFiltersValue = $scope.tableFiltersValue || {};
          $scope.tableFiltersValue.DateFrom = DataProcessing.toDateFormat($.getPeriods(daySelectValue).firstDate);
          $scope.tableFiltersValue.DateTo = DataProcessing.toDateFormat($.getPeriods(daySelectValue).lastDate);
        }
      }, true);

      $scope.search = function () {
        var deferred = $q.defer();
        GlobalVars.setLoadingRequestStatus(true)
        $scope.keysHeader = {}
        $scope.tableFilterOptions = {
          type: "processing"
        };
        var actionPromise = tableFiltersGetDataPromise($scope, "processing");
        actionPromise.then(function (data) {
            deferred.resolve();
            GlobalVars.setLoadingRequestStatus(false)
            if (data.Status) {
              $scope.tableObj = [];
              $scope.tableObjSafe = [];
              $scope.keysHeader = {}
              $scope.dataReady = 'No';
            } else {
              var sData = data.ProcessingReport;
              if (sData.Grid.length) {
                if (
                  !sData.DeclinesPercent &&
                  !sData.SalesPercent &&
                  !sData.RefundsPercent &&
                  !sData.VoidsPercent
                ) {
                  $scope.haveTransData = false;
                } else {
                  $scope.piechartOptions.chartData = [
                    { label: $rootScope.translate('services.reports.reportssetup.sales'), data: sData.SalesPercent, color: "#44A2E0", txtColor:  "#44A2E0" },
                    { label: $rootScope.translate('services.reports.reportssetup.refunds'), data: sData.RefundsPercent, color: "#383D42", txtColor:  "#383D42" },
                    { label: $rootScope.translate('services.reports.reportssetup.voids'), data: sData.VoidsPercent, color: "#fff", txtColor:  "#fff" },
                    { label: $rootScope.translate('services.reports.reportssetup.declines'), data: sData.DeclinesPercent, color: "#7CB242", txtColor:  "#7CB242" }
                  ];
                  $scope.haveTransData = true;
                }
                if (
                  !sData.ProcessorsGraph ||
                  !sData.ProcessorsGraph.length
                ) {
                  $scope.haveProcData = false;
                } else {
                  $scope.barchartOptions.chartData = [];
                  for (var i = 0; i < sData.ProcessorsGraph.length; i++) {
                    var obj = sData.ProcessorsGraph[i];
                    $scope.barchartOptions.chartData.push({val: [i, obj.SalesCaptureRatio * 100], processorId: obj.ProcessorID});
                  }
                  $scope.haveProcData = true;
                }
                $scope.tableObj = sData.Grid;
                $scope.tableObjSafe = sData.Grid;
                if (sData.Grid && sData.Grid.length){
                  _.each(Object.keys(sData.Grid[0]), function(key){
                    $scope.keysHeader[key] = unCamelCase(key).replace('Dollars', '$')

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
            ScrollService.scrollTo('bottom');
          }
        );
        return deferred.promise;
      };
    };

    // *************************** Income ***************************
    var incomeOptions = function($scope){
      $scope.keysHeader = {
        "GroupBy":"GroupBy",
        "BuyerCount":"#Buyers",
        "BilledVolume":"$Billed",
        "RefundVolume":"$Ref",
        "RefundCount":"#Ref",
        "RefundRatio":"%Ref",
        "CancelledCount":"#Cancel",
        "CancelledRatio":"%Cancel",
        "IncomePerCustomer":"$Inc./Cust.",
        //"ActiveCount":"#Active",
        "NetIncome":"Net Inc."
      };
      $scope.fromDateOptions = {
        label: $rootScope.translate('services.reports.reportssetup.from')+':',
        id: 304,
        small: true,
        placeholder: 'From'
      };
      $scope.toDateOptions = {
        label: $rootScope.translate('services.reports.reportssetup.to')+':',
        id: 305,
        small: true,
        placeholder: 'To'
      };

      $scope.$watchCollection('[tableFiltersValue.DateFrom, tableFiltersValue.DateTo, selectedTimezone]', function(tableFiltersValue){
        if ((tableFiltersValue[0] || tableFiltersValue[1] || tableFiltersValue[2]) && !$scope.showTimeframeError)
          $scope.fillTable($scope.tableFiltersValue)
      }, true);

      $scope.search = function () {
        var deferred = $q.defer();
        GlobalVars.setLoadingRequestStatus(true)
        $scope.tableFilterOptions = {
          type: "income"
        };
        $scope.tableObj = [];
        $scope.tableObjSafe = [];

        var actionPromise = tableFiltersGetDataPromise($scope, "income");
        actionPromise.then(function (data) {
            deferred.resolve();
            GlobalVars.setLoadingRequestStatus(false)
            if (data.Status) {
              $scope.tableObj = [];
              $scope.tableObjSafe = [];
              $scope.dataReady = 'No';
            } else {
              var sData = data.IncomeReport;
              $scope.piechartOptions1.chartData = []
              $scope.piechartOptions2.chartData = []
              //var availableColors = ['#44A2E0', '#7CB242', '#F69956', '#FFFFFF']
              if (sData.CustomerRetentionChart){
                $scope.piechartOptions1.chartData = [
                  {
                    label: $rootScope.translate('services.reports.reportssetup.cancelled/refund'),
                    amountToShow: sData.CustomerRetentionChart['CancelledRefundRatio'],
                    data: sData.CustomerRetentionChart['CancelledRefundRatio'],
                    color: '#44A2E0',
                    txtColor: '#44A2E0'
                  },
                  {
                    label: $rootScope.translate('services.reports.reportssetup.active'),
                    amountToShow: sData.CustomerRetentionChart['ActiveRatio'],
                    data: sData.CustomerRetentionChart['ActiveRatio'],
                    color: '#FFFFFF',
                    txtColor: '#FFFFFF'
                  }
                ];
              }
              if (sData.NetIncomeBreakdownChart){
                $scope.piechartOptions2.chartData = [
                  {
                    label: $rootScope.translate('services.reports.reportssetup.net-income')+' ($'+$filter('number')(sData.NetIncomeBreakdownChart['NetIncomeValue'])+')',
                    amountToShow: sData.NetIncomeBreakdownChart['NetIncome'],
                    data: sData.NetIncomeBreakdownChart['NetIncome'],
                    color: '#44A2E0',
                    txtColor: '#44A2E0'
                  },
                  {
                    label: $rootScope.translate('services.reports.reportssetup.refunds')+' ($'+$filter('number')(sData.NetIncomeBreakdownChart['RefundsValue'])+')',
                    amountToShow: sData.NetIncomeBreakdownChart['Refunds'],
                    data: sData.NetIncomeBreakdownChart['Refunds'],
                    color: '#FFFFFF',
                    txtColor: '#FFFFFF'
                  }
                ];
              }

              if (sData.Grid.length) {
                $scope.gridTotal = {};
                $scope.tableObjSafe = sData.Grid || []
                if (sData.GridTotal){
                  $scope.gridTotal = sData.GridTotal
                  $scope.tableObjSafe.push(sData.GridTotal)
                }

                $scope.dataReady = true;
                _.each(Object.keys(sData.Grid[0]), function(key){
                  $scope.keysHeader[key] = unCamelCase(key)
                })
              } else {
                $scope.keysHeader = {};
                $scope.tableObjSafe = [];
                $scope.dataReady = 'No';
              }
            }
            ScrollService.scrollTo('bottom');
          }
        );

        return deferred.promise;
      };
    };

    return {
      defaultFrom: defaultFrom,
      defaultTo: defaultTo,
      compareDates: compareDates,
      unCamelCase: unCamelCase,
      commonOptions2: commonOptions2,

      commonOptions: commonOptions,
      transactionOptions: transactionOptions,
      processingOptions: processingOptions,
      incomeOptions: incomeOptions
    };
  });
