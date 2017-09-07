'use strict';

angular.module('crm')
  .controller('declinerunnerCtrl', function ($scope, GlobalVars, DeclineSetup, ModalService, DataProcessing, DataStorage,
                                             $filter, Notification, $timeout, $document, $rootScope) {
    $scope.tableDataRaw = []
    $scope.backgrJobsPageSize = 10;
    $scope.backgrJobPageSize = 10;
    $scope.tablePageSize = 10

    $scope.portletHeaderOptions = {title: 'Decline Runner'};
    $scope.fieldOptions = DeclineSetup.fieldOptions();
    $scope.fieldOptions.transactionTypeSettings.valRequired = true;
    $scope.fieldOptions.chargeTypeSettings.valRequired = true;
    $scope.fieldOptions.transactionResultSettings.scrollableHeight = '163px';

    $scope.dateFrom = DataProcessing.toDateFormat(moment().subtract(7, 'd'))
    $scope.dateTo = DataProcessing.toDateFormat(moment())

    var requiredFields = {
      SiteIDs: 'array',
      ChargeTypes: 'array',
      TransactionTypes: 'array'
    };

    DataStorage.declineRunnersGet().query(function(resp){
      resp.Index.DeclineResponses = _.map(resp.Index.DeclineResponses, function(v,n){ return {id: n, name: v};});
      _.extend($scope.fieldOptions, resp.Index);
    });

    $scope.fields = {};
    $scope.clientsModel = [];
    $scope.sitesModel = [];
    $scope.reportOptionsModel = [];
    $scope.chargeTypeModel = [];
    $scope.transactionTypeModel = [];
    $scope.transactionResultModel = [];
    $scope.sitesData = [{"SiteID":0,"Name":$rootScope.translate('tools.declinerunner.declinerunner.controller.no-clients-selected'), disabled: true}];

    //  1st select
    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.$watchCollection('clientsModel', function(clients){
      $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData);
      $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
    });

    $scope.tableData = {
      Declines: []
    };
    $scope.submit = function (form) {
      $scope.$broadcast('show-errors-check-validity', 'declineRunnerForm');
      if ($scope.dateFrom && $scope.dateTo){
        var resObj = angular.copy($scope.fields);
        _.extend(resObj, {
          DateFrom: DataProcessing.dateToServer(DataProcessing.stringToDate($scope.dateFrom)),
          DateTo: DataProcessing.dateToServer(DataProcessing.stringToDate($scope.dateTo)),
          SiteIDs: _.map($scope.sitesModel, function(siteModel){ return siteModel.id;}),
          TransactionTypes: _.map($scope.transactionTypeModel, function(typeModel){ return typeModel.id;}),
          TransactionResponses: _.map($scope.transactionResultModel, function(transactionResultModel){ return transactionResultModel.id;}),
          ChargeTypes: _.map($scope.chargeTypeModel, function(chargeModel){ return chargeModel.id;}),
          UseCurrentDate: $scope.useCurrentDate && $scope.useCurrentDate.id == 'Yes'
        });

        var invalidForm = false;
        _.each(requiredFields, function(v,field){
          switch (v) {
            case 'array':
              if (!resObj[field] || (resObj[field] && resObj[field].length == 0)) invalidForm = true;
            case 'value':
              if (!resObj[field]) invalidForm = true;
          }
        })
        if (invalidForm) return false

        $scope.submitting = true;

        delete resObj.formSubmitted;
        DataStorage.declineRunnersSearch().post(resObj, function(resp){
          $scope.submitting = false;
          $scope.fields.formSubmitted = false;
          $scope.showTrDetails = true
          $scope.tableData.Declines = resp.Declines || [];
          $timeout(function(){
            var someElement = angular.element('.decline-transactions').eq(0);
            if (someElement && someElement.length)
              $document.scrollToElementAnimated(someElement, 300);
          },100);

        });
      }
    };

    $scope.selectUnselectAll = function (selectToggle) {
      angular.forEach($scope.tableData.Declines, function(decline){
        decline.selected = selectToggle
      })
    };

    $scope.selectUnselectAllVisible = function (selectToggle) {
      angular.forEach($scope.tableDataRaw, function(decline){
        decline.selected = selectToggle
      })
    };

    $scope.clearAll = function(){
      $scope.clearing = true;
      DataStorage.declineRunnersClear().post({}, function(resp){
        if (resp && !resp.Status) Notification.success({message: $rootScope.translate('tools.declinerunner.declinerunner.controller.completed-jobs-successfully-cleared'), delay: 5000})
        $scope.loadJobs()
        $scope.clearing = false;
      });
    };

    $scope.save = function(){
      var selected = $filter('filter')($scope.tableData.Declines, {selected: true})
      if (selected && selected.length>0){
        var respObj = {
          OrderIDs: _.map(selected, function(sel){ return sel.OrderID}),
          UseCurrentDate: $scope.UseCurrentDate.id == 1
        };
        $scope.saving = true;
        DataStorage.declineRunnersSave().post(respObj, function(resp){
          $scope.tableData.Declines = [];
          $scope.showTrDetails = false;
          $scope.saving = false;
          if (resp && !resp.Status)
            Notification.success({message: $rootScope.translate('tools.declinerunner.declinerunner.controller.declines-were-successfully-saved'), delay: 5000})
          $scope.loadJobs()
        });
      }
    };

    $scope.loadJobs = function(){
        DataStorage.declineRunnersScheduledJobs().query(function(resp){
          $scope.tableData.ScheduledJobs = resp.Scheduled || []
        })
    };

    $scope.normalizeDate = function(inputFormat){
        inputFormat = inputFormat*1000
        function pad(s) { return (s < 10) ? '0' + s : s; }
        var d = new Date(inputFormat);
        var hours = d.getHours();
        var ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        return [pad(d.getDate()), pad(d.getMonth()+1), d.getFullYear()].join('/') + ' ' + pad(hours)+':'+pad(d.getMinutes()) + ':' + pad(d.getSeconds()) + ' ' + ampm;
    }

    $scope.loadTransactionsByJobId = function(jobId){
      $scope.tableData.jobTransactions = [];
      $scope.loadingBJ = true;
      DataStorage.declineRunnersLoadTransactionsByJobID().query({jobId: jobId}, function(resp){
        $scope.loadingBJ = false;
        if (resp && !resp.Status)
          $scope.tableData.jobTransactions = resp.Details
      })
    }

  });
