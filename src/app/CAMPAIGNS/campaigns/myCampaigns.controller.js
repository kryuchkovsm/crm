'use strict';

angular.module('crm')
  .controller('MyCampaignsCtrl', function ($scope, $state, resolveCampaigns, ModalService, DataStorage, Notification, GlobalVars, $rootScope, $stateParams) {
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()

    $scope.mdfsSafe = resolveCampaigns.Campaigns || [];
    $scope.$state = $state;
    $scope.mdfHeaderOptions = {title: $rootScope.translate('campaigns.campaigns.mycampaigns.controller.existing-campaigns'), searchField: {cb: void(0)}};

    $scope.addNewCampaign = function () {
      $state.go('main.campaignsetup');
    };

    $scope.edit = function (curName, curUrl) {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/mdf/editMdf.html",
        controller: "EditMdfCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('campaigns.campaigns.mycampaigns.controller.edit-campaign'),
            nameValue: curName,
            urlValue: curUrl
          }
        }
      }).then(function (modal) {
        //it's a bootstrap element, use 'modal' to show it
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          return false;
        });
      });
    };

    $scope.delete = function (row) {
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('campaigns.campaigns.mycampaigns.controller.delete-campaign'),
            modalTxt: $rootScope.translate('campaigns.campaigns.mycampaigns.controller.are-you-sure-you-want-to-delete-this-campaign?')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          DataStorage.anyApiMethod('/campaigns/delete/' + row.CampaignGuid).post({},function(resp){
            var index = $scope.mdfsSafe.indexOf(row)
            if (index > -1)
              $scope.mdfsSafe.splice(index,1);
            Notification.success({message: $rootScope.translate('campaigns.campaigns.mycampaigns.controller.campaign')+' ' + row.Name + ' ' + $rootScope.translate('campaigns.campaigns.mycampaigns.controller.has-been-successfully-removed'), delay: 5000})
          });
        });
      });
    };

    $scope.go = $state.go;
    $scope.goToEdit = function(campaignGuid){
      GlobalVars.setLoadingRequestStatus(true)
      $state.go('main.campaignsetup', { 'campaignGuid': campaignGuid})
    };

    $scope.downloadKit = function(apiGuid){
      DataStorage.anyApiMethod('/campaigns/download/'+apiGuid).query(function(resp){
        if (resp && resp.Content){
          //var blob = $.b64toBlob(resp.Content, 'application/zip');
          //$.downloadBlob(blob, resp.Filename || 'kit.zip')
          download('data:application/zip;base64,' + resp.Content, resp.Filename || 'kit.zip', "application/zip");
          //$.downloadUrl('data:application/zip;base64,' + resp.Content, resp.Filename || 'kit.zip')
        }
      })
    }

  });
