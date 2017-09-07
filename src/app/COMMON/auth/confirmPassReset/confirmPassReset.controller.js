'use strict';

angular.module('crm')
  .controller('ConfirmPassReset', function ($scope, $state, resolvedConfirm) {
    if (resolvedConfirm && resolvedConfirm.RedirectTo) {
      var key = resolvedConfirm.RedirectTo;
      key = key.split('=')[1];
      // API will do this redirect on success
      $state.go('main.newpassword', { key: key });
    }else if (!resolvedConfirm.Status)
      $state.go('main.login');

  });
