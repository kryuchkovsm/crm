'use strict';

angular.module('crm')
  .controller('confirmSmtpServer', function ($scope, ModalService, DataStorage, data, close, $timeout, $rootScope) {
    $scope.smtp = {
      EmailTo: angular.copy(data.DefaultUserEmail),
      SmtpId: data.smtpId
    };
    $scope.data = data;
    $scope.close = close;
    $scope.sendEmail = function(form){
      $scope.submitted = true;
      if (form.$invalid) return
      $scope.processing = true;
      DataStorage.anyApiMethod('/emailautoresponders/smtpservers/confirmation/send').post($scope.smtp, function(resp){
        $scope.processing = false;
        $scope.submitted = false;
        if (resp && !resp.Status){
          close();
          $timeout(function(){
            ModalService.showModal({
              templateUrl: "components/modals/COMMON/sure.html",
              controller: "DataModalCtrl",
              inputs: {
                data: {
                  hideProceedButton: true,
                  modalTitle: $rootScope.translate('modals.campaigns.email.smtp.confirmsmtp.email-has-been-sent'),
                  modalTxt: $rootScope.translate('modals.campaigns.email.smtp.confirmsmtp.test-email-sent', {value: $scope.smtp.EmailTo})
                }
              }
            }).then(function (modal) {
              modal.element.modal();
            })
          },300)
        }
      })
    }
  });
