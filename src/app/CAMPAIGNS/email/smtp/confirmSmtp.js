'use strict';

angular.module('crm')
  .controller('ConfirmSMTP', function ($scope, $state, resolvedConfirm, ModalService, $rootScope) {
    if (resolvedConfirm && !resolvedConfirm.Status)
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            panelSuccessClass: true,
            modalTitle: $rootScope.translate('campaigns.email.smtp.confirmsmtp.response'),
            modalTxt: $rootScope.translate('campaigns.email.smtp.confirmsmtp.smtp-server-has-been-confirmed-successfully')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result == 'false') $state.go('main.dashboard');
          else $state.go('main.emailsmtp', {clientID: resolvedConfirm.ClientID});
        });
      });
    else $state.go('main.dashboard');

});
