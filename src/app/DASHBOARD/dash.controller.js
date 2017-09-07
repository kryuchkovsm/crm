'use strict';

angular.module('crm')
  .controller('DashCtrl', function ($scope, $state, $filter, ChartInit, 
  DataStorage, GlobalVars, DataProcessing, Notification) {

    $scope.authSections = GlobalVars.commonObject().AuthorizedSections;
    $scope.loadingSection  = {};
    $scope.dataReady = true;

    var defaultFrom = DataProcessing.toDateFormat(moment().subtract(7, 'd'));
    var defaultTo = DataProcessing.toDateFormat(moment());
    var defaultProjectionTo = DataProcessing.toDateFormat(moment().add(7,'days'));
  
    $scope.goToPage = function (page) {
      $state.go('main.' + page);
    };

    var compareDates = function (a, b) {
      return a[0] > b[0] ? 1 : a[0] < b[0] ? -1 : 0;
    };

    var styleJson = angular.copy(GlobalVars.styleColors.defaultColors)

    var detectColor = function(num){
      num = parseFloat(num) || 0
      if (num==0) return styleJson.NullGraphs
      else if (num>0) return styleJson.PositiveGraphs
      else if (num<0) return styleJson.NegativeGraphs
    }

    var initChartsData = function (sData, section) {

      //******************************* Conversions *********************************
      if (section === 'All' || section === 'Conversions') {
        var cv = sData.ConversionViewer;

        sData.conversionsData = cv.Conversions.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        sData.inquiriesData = cv.Inquiries.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        sData.approvedData = cv.Approved.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        sData.declinesData = cv.Declines.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        sData.upsellsData = cv.Upsells.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);

        $scope.dottedLinechartOptions1 = {
          total: cv.ConversionsTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.conversions.conversions'),
          chartData: sData.conversionsData,
          chartID: 1,
          blackGrey: true,
          bottomBlock: false
        };
        $scope.linechartOptions1 = {
          total: cv.ApprovedTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.conversions.approved'),
          percents: cv.ApprovedTrending,
          color: styleJson.PositiveGraphs,
          chartData: sData.approvedData,
          chartID: 5
        };
        if (cv.ApprovedTrending)
          angular.extend($scope.linechartOptions1, {icon: cv.ApprovedTrending>0 ? 'caret-up' : 'caret-down'});

        $scope.linechartOptions2 = {
          total: cv.InquiriesTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.conversions.inquiries'),
          percents: cv.InquiriesTrending,
          //color: detectColor(cv.InquiriesTrending),
          color: '#383D42',
          chartData: sData.inquiriesData,
          chartID: 6
        };

        if (cv.InquiriesTrending)
          angular.extend($scope.linechartOptions2, {icon: cv.InquiriesTrending>0 ? 'caret-up' : 'caret-down'});

        $scope.linechartOptions3 = {
          total: cv.DeclinesTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.conversions.declines'),
          percents: cv.DeclinesTrending,
          //color: detectColor(cv.DeclinesTrending),
          color: styleJson.NegativeGraphs,
          chartData: sData.declinesData,
          chartID: 7
        };
        if (cv.DeclinesTrending)
          angular.extend($scope.linechartOptions3, {icon: cv.DeclinesTrending>0 ? 'caret-up' : 'caret-down'});

        $scope.linechartOptions4 = {
          total: cv.UpsellsTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.conversions.upsells'),
          percents: cv.UpsellsTrending,
          //color: detectColor(cv.UpsellsTrending),
          color: '#383D42',
          chartData: sData.upsellsData,
          chartID: 8
        };
        if (cv.UpsellsTrending)
          angular.extend($scope.linechartOptions4, {icon: cv.UpsellsTrending>0 ? 'caret-up' : 'caret-down'});

        $scope.donutchartOptions1 = {
          tooltipLabel: $filter('translate')('dashboard.dash.conversions.upsell-ratio'),
          percents: cv.UpsellRatio,
          color: '#383D42',
          chartData: [
            { label: '', data: cv.UpsellRatio, color: "#383D42" },
            { label: '', data: cv.UpsellRatio ? 100 - cv.UpsellRatio : 0 , color: "rgba(255, 255, 255, 0)" }
          ],
          chartID: 15
        };
      }

      //******************************* Billing *********************************
      if (section === 'All' || section === 'Billing') {
        var bv = sData.BillingViewer;

        sData.activeSignupsData = bv.ActiveSignups.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        sData.recurringApprovesData = bv.RecurringApproves.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        sData.recurringDeclinesData = bv.RecurringDeclines.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        $scope.dottedLinechartOptions2 = {
          total: bv.ActiveSignupsTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.billing.active-signups'),
          chartData: sData.activeSignupsData,
          chartID: 2,
          blackGrey: true,
          bottomBlock: false
        };
        $scope.linechartOptions5 = {
          total: bv.RecurringDeclinesTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.billing.recurring-declines'),
          percents: bv.RecurringDeclinesTrending,
          //color: detectColor(bv.RecurringDeclinesTrending),
          color: '#383D42',
          chartData:  sData.recurringDeclinesData,
          chartID: 9
        };
        if (bv.RecurringDeclinesTrending)
          angular.extend($scope.linechartOptions5, {icon: bv.RecurringDeclinesTrending>0 ? 'caret-up' : 'caret-down'});

        $scope.linechartOptions6 = {
          total: bv.RecurringApprovesTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.billing.recurring-approved'),
          percents: bv.RecurringApprovesTrending,
          //color: detectColor(bv.RecurringApprovesTrending),
          color: styleJson.PositiveGraphs,
          chartData: sData.recurringApprovesData,
          chartID: 10
        };
        if (bv.RecurringApprovesTrending)
          angular.extend($scope.linechartOptions6, {icon: bv.RecurringApprovesTrending > 0 ? 'caret-up' : 'caret-down'});

      }

      //******************************* Processing *********************************
      if (section === 'All' || section === 'Processing') {
        var pv = sData.ProcessingViewer;

        sData.pendingAuthsData = pv.PendingAuths.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        sData.processingsData = pv.Processings.map(function (item) {
          return [item.Date * 1000, item.Count];
        }).sort(compareDates);
        sData.refundsData = pv.Refunds.map(function (item) {
            return [item.Date * 1000, item.Count];
        }).sort(compareDates);

        $scope.dottedLinechartOptions3 = {
          total: pv.ProcessingTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.processing.total'),
          chartData: sData.processingsData,
          chartID: 3,
          blackGrey: true,
          bottomBlock: false
        };
        $scope.linechartOptions7 = {
          total: pv.RefundsTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.processing.refunds'),
          percents: pv.RefundsTrending,
          //color: detectColor(pv.RefundsTrending),
          color: '#383D42',
          chartData: sData.refundsData,
          chartID: 11
        };
        if (pv.RefundsTrending)
          angular.extend($scope.linechartOptions7, {icon: pv.RefundsTrending>0 ? 'caret-up' : 'caret-down'});

        $scope.linechartOptions8 = {
          total: pv.PendingAuthsTotal || '0',
          tooltipLabel: $filter('translate')('dashboard.dash.processing.pending-auths'),
          percents: pv.PendingAuthsTrending,
          //color: detectColor(pv.PendingAuthsTrending),
          color: '#383D42',
          chartData: sData.pendingAuthsData,
          chartID: 12
        };
        if (pv.PendingAuthsTrending)
          angular.extend($scope.linechartOptions8, {icon: pv.PendingAuthsTrending>0 ? 'caret-up' : 'caret-down'});

      }

      //******************************* Projection *********************************
      if (section === 'All' || section === 'Projection') {
        var prv = sData.ProjectionViewer;
        $scope.linechartOptions9 = {
          total: prv && prv.ProjectedRecurringsTotal ? prv.ProjectedRecurringsTotal : '0',
          tooltipLabel: $filter('translate')('dashboard.dash.projection.projected-recurrings'),
          //color: detectColor(prv.ProjectedRecurringsTotal),
          color: '#383D42',
          chartData: prv && prv.ProjectedRecurrings ? _.map($filter('orderBy')(prv.ProjectedRecurrings, 'Date'), function(data){
            return [data.Date*1000, data.Count]
          }) : [],
          chartID: 13
        };
        if ($scope.linechartOptions9.percents)
          angular.extend($scope.linechartOptions9, {icon: $scope.linechartOptions9.percents>0 ? 'caret-up' : 'caret-down'});

        $scope.linechartOptions10 = {
          total:prv && prv.ProjectedRecurringsApprovedTotal ? prv.ProjectedRecurringsApprovedTotal : '0',
          tooltipLabel: $filter('translate')('dashboard.dash.projection.projected-approved'),
          //color: detectColor(prv.ProjectedRecurringsApprovedTotal),
          color: styleJson.PositiveGraphs,
          chartData: prv && prv.ProjectedRecurringsApproved ? _.map($filter('orderBy')(prv.ProjectedRecurringsApproved, 'Date'), function(data){
            return [data.Date*1000, data.Count]
          }) : [] ,
          chartID: 14
        };
        if ($scope.linechartOptions9.percents)
          angular.extend($scope.linechartOptions10, {icon: $scope.linechartOptions10.percents>0 ? 'caret-up' : 'caret-down'});

      }

      if (section == 'User' && sData.UserViewer && sData.UserViewer.Grid) {
          $scope.safeUserGrid = sData.UserViewer.Grid
      }
    };

    //initChartsData(resolvedDefaultWeekData, 'All');

    $scope.fields = {
      fromDateValue1: defaultFrom,
      toDateValue1: defaultTo,
      fromDateValue2: defaultFrom,
      toDateValue2: defaultTo,
      fromDateValue3: defaultFrom,
      toDateValue3: defaultTo,

      //Projection view
      fromDateValue4: defaultTo,
      toDateValue4: defaultProjectionTo,

      fromDateValue5: defaultFrom,
      toDateValue5: defaultTo
    };
    var updateSectionData = function (sectionName, from, to, cb) {
      cb = cb || function(){};
      var sectionDataPromise = DataStorage.anyApiMethod('/dashboard/index/'+sectionName+'/'+
        (from ? DataProcessing.dateToServer(DataProcessing.stringToDate(from)) : DataProcessing.dateToServer($.getPeriods('Last Week').firstDate))+'/'
        +(to ? DataProcessing.dateToServer(DataProcessing.stringToDate(to)) : DataProcessing.dateToServer($.getPeriods('Last Week').lastDate))).query().$promise;
      $scope.loadingSection[sectionName] = true;
      sectionDataPromise.then(function (data) {
          initChartsData(data, sectionName);
          $scope.loadingSection[sectionName] = false;
          cb()
      },
      function (error) {
        console.log('sectionDataPromise error', error);
      });
    };

    //GlobalVars.setLoadingRequestStatus(true)
    DataStorage.anyApiMethod('/common/styles/'+GlobalVars.whiteLabel.CRMGuid).query(function(resp){
      if (resp.StyleJson)
        _.extend(styleJson, JSON.parse(resp.StyleJson))
      async.parallel([
        function(cb){
          updateSectionData('Conversions', $scope.fields.fromDateValue1, $scope.fields.toDateValue1, cb);
        },
        function(cb){
          updateSectionData('Billing', $scope.fields.fromDateValue2, $scope.fields.toDateValue2, cb);
        },
        function(cb){
          updateSectionData('Processing', $scope.fields.fromDateValue3, $scope.fields.toDateValue3, cb);
        },
        function(cb){
          updateSectionData('Projection', $scope.fields.fromDateValue4, $scope.fields.toDateValue4, cb);
        },
        function(cb){
          updateSectionData('User', $scope.fields.fromDateValue5, $scope.fields.toDateValue5, cb);
        }
      ], function(){
          //GlobalVars.setLoadingRequestStatus(false)
      });
    })

    $scope.$watchCollection("fields",
      function ( newValue, oldValue ) {
        switch (true) {
          // Conversion Viewer date range changed
          case (newValue.fromDateValue1 !== oldValue.fromDateValue1 || newValue.toDateValue1 !== oldValue.toDateValue1):
            updateSectionData('Conversions', newValue.fromDateValue1, newValue.toDateValue1);
            break;
          // Billing Viewer date range changed
          case (newValue.fromDateValue2 !== oldValue.fromDateValue2 || newValue.toDateValue2 !== oldValue.toDateValue2):
            updateSectionData('Billing', newValue.fromDateValue2, newValue.toDateValue2);
            break;
          // Processing Viewer date range changed
          case (newValue.fromDateValue3 !== oldValue.fromDateValue3 || newValue.toDateValue3 !== oldValue.toDateValue3):
            updateSectionData('Processing', newValue.fromDateValue3, newValue.toDateValue3);
            break;
          // Projection Viewer date range changed
          case (newValue.fromDateValue4 !== oldValue.fromDateValue4 || newValue.toDateValue4 !== oldValue.toDateValue4):
            updateSectionData('Projection', newValue.fromDateValue4, newValue.toDateValue4);
            break;
          // User Viewer date range changed
          case (newValue.fromDateValue5 !== oldValue.fromDateValue5 || newValue.toDateValue5 !== oldValue.toDateValue5):
            updateSectionData('User', newValue.fromDateValue5, newValue.toDateValue5);
            break;
        }
      }
    );

    $scope.fromDateOptions = {
      label: $filter('translate')('common.from') + ':',
      id: 304,
      small: true,
      placeholder: defaultFrom
    };

    $scope.toDateOptions = {
      label: $filter('translate')('common.to') + ':',
      id: 305,
      small: true,
      placeholder: defaultTo
    };
});
