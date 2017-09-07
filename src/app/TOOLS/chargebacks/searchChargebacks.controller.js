'use strict';

angular.module('crm')
  .controller('searchChargebacksCtrl', function ($scope, $state, ChargebackSetup, DataStorage, DataProcessing, GlobalVars, $rootScope) {
    $scope.portletHeaderOptions = {title: 'tools.chargebacks.searchchargebacks.controller.existing-chargebacks'};
    $scope.fields = {};
    $scope.trIdSearchActive = true;
    $scope.bankAccSearchActive = false;
    $scope.CCSearchActive = false;
    $scope.additionalSearchActive = false;
    $scope.newChargeback = false;
    $scope.chargebacks = [];
    $scope.additionalObj = {
      DateFrom: DataProcessing.toDateFormat(moment().subtract('month',1)),
      DateTo: DataProcessing.toDateFormat(moment())
    };
    $scope.searchObj = {};

    $scope.newChargeback = $state.current.name == "main.addchargeback"

    var fieldOptions = ChargebackSetup.existingChargebacksOptions();

    if ($scope.newChargeback){
      fieldOptions.searchByRLOptions.data.splice(1,2);
      $scope.portletHeaderOptions = {title: 'tools.chargebacks.searchchargebacks.controller.search-transaction'};
    }
    $scope.fieldOptions = fieldOptions;
    $scope.editChargeback = function (cguid) {
      $state.go('main.editchargeback', {c: cguid});
    };

    $scope.addChargeback = function (id) {
      $state.go('main.addnewchargeback', {transactionId : id});
    };

    $scope.$watch('fields.searchByRLValue', function(val){
      $scope.clear();
    });

    $scope.clear = function(){
      $scope.submitted = false;
      $scope.noData = false;
      $scope.additionalObj = {
        DateFrom: DataProcessing.toDateFormat(moment().subtract('month',1)),
        DateTo: DataProcessing.toDateFormat(moment())
      };
      $scope.searchObj = {};
      $scope.chargebacks = [];
      angular.element('[type="email"]').val('')
      $scope.$broadcast('show-errors-reset', 'newChargebackForm');
    };

    $scope.search = function(id, newChargebackForm){
      $scope.submitted = true;
      $scope.noData = false;
      $scope.$broadcast('show-errors-check-validity', 'newChargebackForm');
      if (newChargebackForm.$invalid) return false;

      var sObj = {
        SearchBy: id,
        Value: angular.copy($scope.searchObj.value)
      };
      var mainMethod = '/chargeback/search/chargeback';
      if ($scope.newChargeback)
        mainMethod = '/chargeback/search/transaction';

      if (id == 'additional'){
        sObj = angular.copy($scope.additionalObj);
        mainMethod += '/additional';
      }
      if (sObj.DateFrom)
        sObj.DateFrom = DataProcessing.dateToServer(DataProcessing.stringToDate(sObj.DateFrom))
      if (sObj.DateTo)
        sObj.DateTo = DataProcessing.dateToServer(DataProcessing.stringToDate(sObj.DateTo))
      if (sObj.NoticeDate)
        sObj.NoticeDate = DataProcessing.dateToServer(DataProcessing.stringToDate(sObj.NoticeDate))
      $scope.searching = true;
      GlobalVars.setLoadingRequestStatus(true)
      DataStorage.anyApiMethod(mainMethod).post(sObj, function(resp){
        GlobalVars.setLoadingRequestStatus(false)
        $scope.searching = false;
        if (resp && id == 'transactionid'){
          if ((resp.Transaction && resp.Transaction.length) || (resp.Transactions && resp.Transactions.length)){
            var t = resp.Transactions || resp.Transaction
            //$state.go('main.addnewchargeback', { transactionId : t[0].TransactionId});
            //return
          }else if (resp.Chargebacks && resp.Chargebacks.length){
            $state.go('main.editchargeback', { c: resp.Chargebacks[0].ChargebackGuid});
            return
          }
        }
        $scope.data = resp.Transaction || resp.Transactions || resp.Chargebacks || [];
        $scope.noData = !angular.copy($scope.data).length;
      })
    };

    $scope.getKeys = function(obj){
      var resArr = Object.keys(obj)
      resArr.splice(resArr.indexOf('$$hashKey'),1)
      resArr.splice(resArr.indexOf('TransactionResponseID'),1)
      return resArr;
    }

    $scope.splitUppercase = function(input){
      input = input || '';
      return input.match(/[A-Z]*[^A-Z]+/g).join(' ').toUpperCase()
    }

  })
