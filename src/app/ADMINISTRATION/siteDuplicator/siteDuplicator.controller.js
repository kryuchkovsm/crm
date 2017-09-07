'use strict';

angular.module('crm')
  .controller('SiteDuplicatorCtrl', function ($scope, ModalService, GlobalVars, DataProcessing, DataStorage, $state, $rootScope) {
    $scope.portletHeaderOptions = {title: 'administration.siteduplicator.siteduplicator.controller.site-duplicator'};
    $scope.clientsModel = [];
    $scope.clientsToModel = [];
    $scope.sitesModel = [];
    $scope.showAddData = false;
    $scope.sitesData = [{'SiteID':0,'Name':$rootScope.translate('administration.siteduplicator.siteduplicator.controller.no-clients-selected'), disabled: true}];

    //  1st select
    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: $rootScope.translate('administration.siteduplicator.siteduplicator.controller.clients-from')
    };

    //  2nd select
    $scope.sitesSettings = {
      idProp: 'SiteID',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '277px',
      scrollable: true,
      searchPlaceholder: $rootScope.translate('administration.siteduplicator.siteduplicator.controller.type-site-name-here-or-select-from-list.'),
      selectName: $rootScope.translate('administration.siteduplicator.siteduplicator.controller.site-to-duplicate'),
      showCheckAll: false,
      showUncheckAll: false,
      selectionLimit: 1,
      valRequired: true
    };

    $scope.$watchCollection('clientsModel',function(clients) {
      $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData) || $scope.sitesData;
      $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
    });

    $scope.duplicate = function() {
       $scope.$broadcast('show-errors-check-validity', 'siteDuplicateForm');
       if (!($scope.sitesModel && $scope.sitesModel[0])) return false;
       $scope.processing = true;
       GlobalVars.setLoadingRequestStatus(true)
       DataStorage.anyApiMethod('/sites/duplicate/'+$scope.sitesModel[0].id).post({},function (data) {
         $scope.processing = false;
         GlobalVars.setLoadingRequestStatus(false)
         if (data && data.SiteID)
           ModalService.showModal({
             templateUrl: "components/modals/COMMON/sure.html",
             controller: "DataModalCtrl",
             inputs: {
               data: {
                 modalTitle: 'Duplicated',
                 modalTxt: 'Site duplicated, new Site ID: ' + data.SiteID
               }
             }
           }).then(function (modal) {
             modal.element.modal();
             modal.close.then(function (result) {
               if (result === 'false') return;
               var clientID;
               _.each($scope.clientsData, function(client){
                 _.each(client.Sites, function(site){
                   if (site.SiteID == $scope.sitesModel[0].id)
                     clientID = client.ClientID
                 })
               });
               $state.go('main.siteoptions', {SiteID: data.SiteID, ClientID: clientID})

             });
           });
       });
     }
  });
