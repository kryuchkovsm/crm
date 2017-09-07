'use strict';

angular.module('crm')
  .controller('EmailSmtpCtrl', function ($scope, ModalService, DataStorage, resolvedSmtpTemplates, $stateParams, Notification, DataProcessing, GlobalVars, $rootScope) {
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()

    $scope.copySmtpServers = resolvedSmtpTemplates.SmtpServers;
    $scope.deleteSmtp = function(row){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('campaigns.email.smtp.smtp.controller.delete-smtp'),
            modalTxt: $rootScope.translate('campaigns.email.smtp.smtp.controller.are-you-sure-you-want-to-delete-this-smtp?')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result == 'false') return;
          DataStorage.emailAutorespondersApi.deleteSmtp(row.id).post(function(resp){
            if (resp && !resp.Status){
              var n = $scope.copySmtpServers.indexOf(row)
              if (n && n>-1)
                $scope.copySmtpServers.splice(n,1)
              Notification.success({message: $rootScope.translate('campaigns.email.smtp.smtp.controller.smtp-server')+' ' + row.name + ' '+$rootScope.translate('campaigns.email.smtp.smtp.controller.deactivated'), delay: 5000 })
            }
          });
        })
      });
    };
    var fetch = function(cb){
      DataStorage.emailAutorespondersApi.listSmtp().query({clientID: $stateParams.clientID}, function(resp){
        if (resp && !resp.Status)
          DataProcessing.updateSafeArr(resp.SmtpServers, $scope.copySmtpServers, 'id')
        cb()
      })
    };

    $scope.confirmSmtp = function(smtpId){
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/email/smtp/confirmSmtp.html",
        controller: "confirmSmtpServer",
        inputs: {
          data: {
            DefaultUserEmail: angular.copy(GlobalVars.commonObject().DefaultUserEmail),
            smtpId: smtpId
          }
        }
      }).then(
        function (modal) {
          modal.element.modal();
        }
      );

    };

    $scope.addEditSmtp = function(smtpServer){
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/email/smtp/addEditSmtpServer.html",
        controller: "addEditSmtpServer",
        inputs: {
          data: {
            title: (smtpServer ? $rootScope.translate('campaigns.email.smtp.smtp.controller.edit') : $rootScope.translate('campaigns.email.smtp.smtp.controller.add')) + ' '+$rootScope.translate('campaigns.email.smtp.smtp.controller.smtp-mail-server'),
            smtpServer: smtpServer,
            clientID: $stateParams.clientID,
            confirmSmtp: $scope.confirmSmtp
          }
        }
      }).then(
        function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result && !result.Status) {
              var resId = result.ID || smtpServer.id;
              fetch(function(){
                _.each($scope.copySmtpServers, function(server){
                  if (server.id == resId)
                    Notification.success({message: $rootScope.translate('campaigns.email.smtp.smtp.controller.smtp-server')+' ' + server.name + ' '+$rootScope.translate('campaigns.email.smtp.smtp.controller.has-been')+' ' +
                    (result.ID ? $rootScope.translate('campaigns.email.smtp.smtp.controller.created') : $rootScope.translate('campaigns.email.smtp.smtp.controller.updated')), delay: 5000})
                })
              });
            }
            return true
          });
        }
      );
    }
});
