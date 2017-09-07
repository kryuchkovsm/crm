'use strict';
angular.module('crm')
  .controller('RunTransactionCtrl',function($scope, $filter, data, close, $rootScope) {

    $scope.modalTitle = data.modalTitle;

    var unbind = $scope.$watchCollection(
      function () {
        return data.data;
      },
      function () {
        unbind();
        if (data.data.length) {
          for (var i = 0; i < data.data.length; i++) {
            var obj = data.data[i];
            obj.total = $filter('currency')(obj.total, '$');
            data.data[i] = obj;
          }
        }
        angular.copy(data.data, $scope.transactionsData);
        console.log(' $scope.transactionsData ', $scope.transactionsData);
    });

    $scope.affiliateIdComboOptions = {
      label: 'AFFILIATE ID:',
      checkbox: {"id":4, "name": $rootScope.translate('modals.crm.runtransaction.runtransactionctrl.select-checkbox-to-edit'), value: false, "class": "font-sans-serif size-13 text-right"},
      number: true
    };

    $scope.subAffiliateIdComboOptions = {
      label: 'SUB AFFILIATE ID:',
      checkbox: {"id":4, "name": $rootScope.translate('modals.crm.runtransaction.runtransactionctrl.select-checkbox-to-edit'), value: false, "class": "font-sans-serif size-13 text-right"},
      number: true
    };

    $scope.active = true;

    $scope.add = function () {
      console.log(' add ');
    };

    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
});
