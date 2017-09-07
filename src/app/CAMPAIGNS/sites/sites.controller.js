'use strict';

angular.module('crm')
  .controller('SitesCtrl', function ($scope, $q, $stateParams, $state, ModalService, DataStorage, resolvedSitesForOneClient, Notification, GlobalVars, $rootScope) {
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()

    $scope.sites = resolvedSitesForOneClient.Sites;
    $scope.sitesSafe = resolvedSitesForOneClient.Sites;
    $scope.authSections = GlobalVars.commonObject().AuthorizedSections;
    $scope.assignedTableHeaderOptions = {title: 'Sites', searchField: {cb: void(0)}};

    $scope.liveCB = function (siteID) {
      $state.go('main.merchants', {clientID: $stateParams.clientID, siteID: siteID});
    };

    $scope.options = function (siteId) {
      $state.go('main.siteoptions', {SiteID: siteId, ClientID: $stateParams.clientID});
    };

    $scope.addnew = function () {
      $state.go('main.newsite', { ClientID: $stateParams.clientID });
    };

    function capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
    $scope.unassignCB = function (action, row) {
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: capitalizeFirstLetter(action) +' Site',
            modalTxt: 'Are you sure you want to '+ action +' this site?'
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return
          DataStorage.anyApiMethod('/sites/'+action+'/'+row.SiteID).post({}, function(resp) {
            if (resp && !resp.Status){
              angular.forEach($scope.sitesSafe, function(site){
                if (site.SiteID == row.SiteID)
                  site.IsActive = action == 'activate';
              });
              Notification.success({message: 'Site ' + row.Name + ' successfully ' + action + 'd', delay: 5000})
            }
          },function (error) {
            console.log(' Site assign error ', error);
          });
        });
      });
    };


  });
