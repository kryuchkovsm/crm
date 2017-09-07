'use strict';
angular.module('crm')
  .controller('MerchantInfoModal',function($scope, data, close, DataStorage, Notification, $rootScope) {
    var fields = angular.copy(data.fields)
    fields.CompanyName = fields.MerchantName;
    delete fields.MerchantName;
    $scope.fields = angular.copy(fields)
    $scope.submitted=false

    $scope.save = function(invalidForm){
      $scope.submitted=true
      if (!invalidForm)
        DataStorage.anyApiMethod('/chargeback/client/edit').post($scope.fields, function(resp){
          if (resp && !resp.Status){
            Notification.success({message: $rootScope.translate('modals.tools.merchantinfo.merchant-account-has-been-successfully-updated'), delay: 5000})
            fields = angular.copy($scope.fields)
            fields.MerchantName = fields.CompanyName;
            delete fields.CompanyName;
            close(fields)
          }
        })
    };

    $scope.close = close
  });
