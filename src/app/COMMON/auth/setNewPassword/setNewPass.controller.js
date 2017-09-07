'use strict';

angular.module('crm')
  .controller('SetNewPasswordCtrl', function ($scope, $state, AuthService, GlobalVars) {

    $scope.userInfo = {};
    $scope.successRestoreReq = false;
    $scope.errorRestoreReq = false;

    // When user enters new password
    $scope.saveNewPasswordToServerAndLogin = function(invalid) {
      $scope.submitted = true;
      if (invalid) return
      var input = $scope.password;
      var json = {
        "NewPassword": input,
        "Key": $state.params.key
      }
      json = angular.toJson(json);
      AuthService.newPassword().post(json, function(resp){
        if (resp && !resp.Status) {
          $scope.successRestoreReq = true;
          $state.go('main.login', {passwordChanged: true});
        }
      });
    };
  });
