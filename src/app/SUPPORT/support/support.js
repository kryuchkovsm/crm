'use strict';

angular.module('crm')
  .controller('SupportCtrl',
  function ($scope, $state, ModalService, DataStorage, GlobalVars) {
    var init = function(){
      $scope.ticketObj = {}
      $scope.supportObj = {
        Name: angular.copy(GlobalVars.commonObject().Username),
        Email: angular.copy(GlobalVars.commonObject().DefaultUserEmail)
      };
      $scope.processing = false;
      $scope.submitted = false;
    };
    $scope.createType = 'support'
    init();
    $scope.zendeskIsAvailable = GlobalVars.commonObject().ZendeskAvailable

    $scope.changeType = function(type){
      init()
      $scope.sentMessage = false
      $scope.createType=type
    };

    $scope.submit = function(invalid, obj, type){
      $scope.sentMessage = false
      $scope.submitted = true;
      if (invalid) return;
      $scope.processing = true;
      var method = 'submit';
      if (type=='ticket') method = 'zendesk/request/new'
      DataStorage.anyApiMethod('/support/'+method).post(obj, function(resp){
        if (resp && !resp.Status) $scope.sentMessage = true;
        init();
      })
    }
});
