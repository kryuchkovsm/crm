'use strict';

angular.module('crm')
  .controller('LoginCtrl', function ($scope, $state, $timeout, GlobalVars, 
  $http, AuthService, $stateParams, $location, DataStorage, $window) {
  
  	if ($stateParams.withReload){
  		$window.location.reload();
  	}
  
    $scope.currentTab = 'login';
    $scope.userInfo = {
      staySigned: true
    };
    $scope.restoreObj = {
      CRMGuid: GlobalVars.whiteLabel.CRMGuid
    };
    $scope.talePosition = 'login-tab-tale'
    $scope.$watch('currentTab', function(){
      $scope.submitted = false;
    });

    if ($stateParams.passwordChanged){
      $scope.passwordChanged = true;
      $location.search('passwordChanged', null)
    }

    DataStorage.anyApiMethod('/common/logininfo/'+GlobalVars.whiteLabel.CRMGuid).query(function(resp){
      if (resp && !resp.Status)
        GlobalVars.setLoginInfo(resp.LoginInfo)
    });

    $scope.login = function(validForm) {
      $scope.errorMessage = '';
      $scope.errorLogin = false;
      if (!validForm) return
      AuthService.login($scope.userInfo).then(function(){
        $state.go('main.dashboard')
      }, function(resp){

        if (resp && resp.ErrorMessage){
          console.log(resp.ErrorMessage)
          switch (resp.ErrorMessage){
            case 'user_locked':
              $scope.errorMessage = 'Your account has been suspended'
              break
            case 'wrong_password':
              $scope.errorMessage = 'Wrong username or password'
              break
          }

        }
        $scope.errorLogin = true;
      });
    };

    $scope.restore = function(formValid, restoreObj) {
      if (!formValid) return
      AuthService.restorePassword().post(restoreObj, function(resp){
        if (resp && !resp.Status)
          $scope.showSuccessRestore = true;
      }, function(resp){

      });
    };
  });
