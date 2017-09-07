'use strict';

angular.module('crm')
  .controller('chargebackReportCtrl', function (
    $scope, ChartInit, DataProcessing, $rootScope, DataStorage, GlobalVars, $filter) {

    var defaultFrom = moment().subtract(7, 'd');
    var defaultTo = moment();

    $scope.chartsReady = false;
    $scope.dataReady = false;

    $scope.portletHeaderOptions = {title: $rootScope.t('reports.chargebackreport.chargeback-report')};
    $scope.fields = {
      startDateValue: DataProcessing.toDateFormat(moment().subtract(7, 'd')),
      endDateValue: DataProcessing.toDateFormat(moment())
    };
    $scope.clientsModel = [];
    $scope.displayReportActive = false;

    //processor, reason, bin, affiliate, campaign, amount
    $scope.filterReportBySelectOptions = {
      label: $rootScope.t('reports.chargebackreport.chargebackreport.controller.filter-report-by')+':',
      data: [
        {"id":0,"name":$rootScope.t('reports.chargebackreport.filterby.processor'), "sName":"processor"},
        {"id":1,"name":$rootScope.t('reports.chargebackreport.filterby.reason'), "sName":"reason"},
        {"id":2,"name":$rootScope.t('reports.chargebackreport.filterby.bin'), "sName":"bin"},
        {"id":3,"name":$rootScope.t('reports.chargebackreport.filterby.affiliate'), "sName":"affiliate"},
        {"id":4,"name":$rootScope.t('reports.chargebackreport.filterby.campaign'), "sName":"campaign"},
        {"id":5,"name":$rootScope.t('reports.chargebackreport.filterby.amount'), "sName":"amount"}
      ],
      id: 214
    };

    $scope.retryOptions = {
      label: $rootScope.t('reports.chargebackreport.chargebackreport.retryoptions.retry-options'),
      data: [
      {
        "id":"all",
        "name": $rootScope.t('reports.chargebackreport.chargebackreport.retryoptions.all'), 
        checked: 'checked'
      },
      {
        "id":"retry",
        "name": $rootScope.t('reports.chargebackreport.chargebackreport.retryoptions.retry')
      },
      {
        "id":"nonretry",
        "name": $rootScope.t('reports.chargebackreport.chargebackreport.retryoptions.nonretry')
      }]
    };

    var commonChart = {
      icon: 'caret-up',
      color: 'black',
      paddingTop: 110,
      paddingBottom: 5,
      height: 130
    };

    $scope.chargebacksChart = angular.copy(commonChart);
    $scope.transactionsChart = angular.copy(commonChart);
    $scope.ratioChart = angular.copy(commonChart);

    $scope.typeViewData = 'charts';

    $scope.reduction = {
      "AffiliateSubID": "AffSubID",
      "ChargebackCount": "Chargeback Count %",
      "ChargebackRatio": "Chargeback Ratio",
      "ChargebackSubTotalAmount": "Chargeback SubTotal Amount",
      "ChargebackVolumeRatio": "Chargeback Vol",
      "FilterBy": "FilterBy",
      "TransactionCount": "Transaction Count",
      "TransactionSubTotalAmount": "Transaction SubTotal Amount",
      "TransactionAmount": "Transaction Amount"
    };

    $scope.resultObj = [];

    $scope.clientsData = GlobalVars.commonObject().Clients;

    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '220px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectreason: 'Selected',
      showCheckAll: false,
      showUncheckAll: false,
      selectionLimit: 1
    };

    $scope.displayReport = function () {
      GlobalVars.setLoadingRequestStatus(true)
      $scope.processing = true;
      $scope.sData = {}

      var f = $scope.fields;
      var dateFrom = f.startDateValue
        ? DataProcessing.dateToServer(DataProcessing.stringToDate(f.startDateValue))
        : DataProcessing.dateToServer(defaultFrom);
      var dateTo = f.endDateValue
        ? DataProcessing.dateToServer(DataProcessing.stringToDate(f.endDateValue))
        : DataProcessing.dateToServer(defaultTo);

      var searchObj = {
        "ClientID": $scope.clientsModel[0].id,
        "DateFrom": dateFrom,
        "DateTo": dateTo,
        "FilterBy": f.filterReportBySelectValue.sName,
        "RetryFlag": $scope.retryOptionValue.id
      };

      var gridPromise = DataStorage.reportsAnyApi('chargeback').post(searchObj).$promise;
      var chartsPromise = DataStorage.reportsAnyApi('chargeback/charts').post(searchObj).$promise;

      $scope.chartsReady = false;
      $scope.dataReady = false;

      gridPromise.then(function (data) {
        $scope.processing = false;
        GlobalVars.setLoadingRequestStatus(false)

        if (data.Status) {
          $scope.tableObj = [];
          $scope.tableObjSafe = [];
          $scope.dataReady = false;
          return;
        }

        if (data.Chargeback && $scope.fields.filterReportBySelectValue && $scope.fields.filterReportBySelectValue.name != 'Affiliate')
          _.each(data.Chargeback.Grid, function(gr, n){
            delete data.Chargeback.Grid[n].AffiliateSubID
          });

        var sData = data.Chargeback;
        if (!sData) {
          $scope.tableObj = [];
          $scope.tableObjSafe = [];
          $scope.tableObjCopy = []
          $scope.dataReady = false;
          return;
        }

        angular.extend($scope.sData, sData)
        $scope.tableObj = sData.Grid;
        $scope.tableObjSafe = sData.Grid;
        $scope.tableObjCopy = sData.Grid

        $scope.dataReady = true;
      });

      chartsPromise.then(function (data) {
        $scope.processing = false;
        GlobalVars.setLoadingRequestStatus(false)
        
        if (data.Status) {
          $scope.chartsReady = false;
          return;
        }

        var sData = data.Chargeback;
        if (!sData) {
          $scope.chartsReady = false;
          return;
        }

        sData.Chargebacks = $filter('orderBy')(sData.Chargebacks, 'Date') || [];
        sData.Transactions = $filter('orderBy')(sData.Transactions, 'Date') || [];
        sData.ChargebackRatioBreakdown = $filter('orderBy')(sData.ChargebackRatioBreakdown, 'Date') || [];
        
        angular.extend($scope.chargebacksChart, {
          total: sData.ChargebackTotal,
          tooltipLabel: $rootScope.translate('services.reports.reportssetup.chargebacks'),
          chartData: _.map(sData.Chargebacks, function(data){
            return [data.Date*1000, data.Count]
          }),
          chartID: 6
        });

        angular.extend($scope.transactionsChart, {
          tooltipLabel: $rootScope.translate('services.reports.reportssetup.transactions'),
          total: sData.TransactionsTotal,
          chartData: _.map(sData.Transactions, function(data){
            return [data.Date*1000, data.Count]
          }),
          chartID: 5
        });

        angular.extend($scope.ratioChart, {
          total: sData.ChargebackRatio,
          tooltipLabel: $rootScope.translate('services.reports.reportssetup.count-ratio'),
          chartData: _.map(sData.ChargebackRatioBreakdown, function(data){
            return [data.Date*1000, data.Ratio]
          }),
          chartID: 4,
          showPercents: true
        });

        angular.extend($scope.sData, sData)
        
        $scope.chartsReady = true;
      });
    };

    var cbCheckRequired = function ($scope) {
      if ($scope.haveClient &&
        ($scope.fields.filterReportBySelectValue && $scope.fields.filterReportBySelectValue.name)) {
        $scope.selectFilterNotice = false;
        $scope.haveQuery = true;
      } else {
        $scope.haveQuery = false;
        $scope.selectFilterNotice = $scope.haveClient 
          ? $rootScope.t('reports.chargebackreport.chargebackreport.please-choose-filter')
          : $rootScope.t('reports.chargebackreport.chargebackreport.please-choose-client');
      }
    };

    $scope.$watchCollection( 'clientsModel',
      function ( newValue, oldValue ) {
        $scope.haveClient = newValue && newValue.length;
        cbCheckRequired($scope);
      }
    );
    $scope.$watchCollection( 'fields.filterReportBySelectValue',
      function ( newValue, oldValue ) {
        cbCheckRequired($scope);
      }
    );
    $scope.startDateOptions = {
      label: $rootScope.t('common.from')+':',
      placeholder: DataProcessing.toDateFormat(defaultFrom),
      id: 304
    };
    $scope.endDateOptions = {
      label: $rootScope.t('common.to')+':',
      placeholder: DataProcessing.toDateFormat(defaultTo),
      id: 304
    };

    $scope.objectLength = function(obj){
      obj = obj || {};
      obj = JSON.parse(angular.toJson(obj))
      var length = Object.keys(obj).length;
      return {
        commonLength: Math.round(100/length),
        filterLength: 100 - Math.round(100/length)*(length-1)
      }
    }
  });
