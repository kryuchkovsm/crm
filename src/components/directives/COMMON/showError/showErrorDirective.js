/**
 * Created by user on 12.03.15.
 */
'use strict';
angular.module('show-error-directive', [])
  .directive('crmShowError', function () {
  return {
    scope: {
      txtId: '='
    },
    templateUrl: 'components/directives/COMMON/showError/showErrorTpl.html',
    link: function ($scope, $element, $attrs) {
      var txt = $scope.txtId;

      switch (true) {
        case txt === 1:
          txt = 'Server error';
          break;
        case txt === 2:
          txt = 'Password saved. Please login using your new password';
          break;
        case txt === 3:
          txt = 'Your name is required';
          break;
        case txt === 4:
          txt = 'Your password is required';
          break;
        case txt === 5:
          txt = 'Wrong login or password';
          break;
        case txt === 6:
          txt = 'Invalid email';
          break;
        case txt === 7:
          txt = 'Please enter either your email or username';
          break;
        case txt === 8:
          txt = 'Instruction to obtain a new password was sent to your email';
          break;
        case txt === 9:
          txt = 'Something wrong. Please check if you entered a correct data';
          break;
        default:
          txt = 'Unknown error';
          break;
      }
      $scope.errorTxt = '! ' + txt;
    }
  };
});
