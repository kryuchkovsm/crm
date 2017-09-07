'use strict';
angular.module('crm')
  .controller('enableDomain',function($scope, data, close, DataStorage, Notification, $rootScope) {
    $scope.fields = {}

    $scope.saving = 'Loading';
    var fetch = function(cb){
      cb = cb || function(){};
      DataStorage.anyApiMethod('/crm/domain/'+data.crmGuid).query(function(resp){
        $scope.saving = false;
        if (resp && !resp.Status){
          $scope.fields = resp.Domain;
          $scope.useDomain = resp.Domain.UseDomain
        }
        cb();
      })
    };

    fetch();

    $scope.close = close;

    $scope.save = function(){
      $scope.saving = 'Processing';
      DataStorage.anyApiMethod('/crm/domain/enable/'+data.crmGuid+'/'+!!($scope.useDomain)).post({}, function(resp){
        if (resp && !resp.Status){
          fetch(function(){
            $scope.saving = false;
            Notification.success({message: $rootScope.translate('modals.tools.enabledomain.domain-successfully', {value1: $scope.fields.Domain, value2: $scope.useDomain ? 'enabled' : 'disabled'})})
          });
        }else
          $scope.saving = false;

      })
    }

  });
