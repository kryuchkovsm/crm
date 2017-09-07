'use strict';

angular.module('crm')
  .controller('addEditSmtpServer', function ($scope, ModalService, DataStorage, data, close, $rootScope) {
    $scope.smtpServer = {};
    $scope.data = data;
    var defaultSmtp
    if ($scope.data.smtpServer && $scope.data.smtpServer.id)
      DataStorage.emailAutorespondersApi.getSmtpById().query({smtpId: $scope.data.smtpServer.id}, function(resp){
        if (resp && resp.SmtpServer){
          resp.SmtpServer.ID = data.smtpServer.id
          defaultSmtp = angular.copy(resp.SmtpServer);
          $scope.smtpServer = angular.copy(resp.SmtpServer);
        }
      });

    $scope.$watch('smtpServer', function(newObj){
      $scope.changedSmtp = !angular.equals(newObj, defaultSmtp)
    }, true);

    $scope.confirmSmtp = function(){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('modals.campaigns.email.smtp.addeditsmtpserver.confirm-smtp'),
            modalTxt: $rootScope.translate('modals.campaigns.email.smtp.addeditsmtpserver.all-unsaved-changes-will-be-saved.-continue?')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result == 'false') return;
          $scope.data.confirmSmtp($scope.data.smtpServer.id)
        })
      });
    };

    $scope.authenticateSmtp = function(){
      $scope.errorMessage = false;
      $scope.authenticatedSmtp = {
        submitted: false
      };
      $scope.processing = true;
      DataStorage.emailAutorespondersApi.authSmtp().post($scope.smtpServer, function(resp){
        $scope.processing = false;
        $scope.authenticatedSmtp = {
          success: resp && resp.Status == 0,
          submitted: true,
          errors: resp.ErrorMessage
        }
      })
    };

    $scope.createOrEdit = function(smtpModForm){
      if (smtpModForm.$invalid) return false
      $scope.smtpServer.ClientID = data.clientID
      var method = 'addSmtp';
      if ($scope.smtpServer.ID) method = 'editSmtp';
      DataStorage.emailAutorespondersApi[method]().post($scope.smtpServer, function(resp){
        close(resp,500);
      })
    }
  });
