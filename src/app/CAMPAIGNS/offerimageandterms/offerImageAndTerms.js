'use strict';

angular.module('crm')
  .controller('OfferImageAndTermsCtrl', function ($scope, $stateParams, ModalService, DataStorage, Notification, $rootScope) {
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()

    var fetch = function(cb){
      cb = cb || function(){};
      DataStorage.anyApiMethod('/offerimageterms/index/'+$stateParams.clientID).query(function(resp){
        if (resp.OfferImageAndTerms){
          $scope.offerITs = resp.OfferImageAndTerms
          $scope.offerITsSafe = resp.OfferImageAndTerms
          cb()
        }
      });
    };
    fetch();
    $scope.removeEvent = function(id){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle:  'Delete Item',
            modalTxt: 'Are you sure you want to delete this terms?'
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result == 'false') return;
          DataStorage.anyApiMethod('/offerimageterms/delete/'+id).post({},function(resp){
            if (!resp.Status){
              $scope.offerITs = $scope.offerITs.filter(function(of){
                return of.id != id
              });
              $scope.offerITsSafe = $scope.offerITs.filter(function(of){
                return of.id != id
              });
              Notification.success({message: 'Item was successfully deleted', delay: 5000})
            }
          })
        });
      });
    };

    $scope.addEditItem = function(id){
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/offerimageandterms/addEditImageTerms.html",
        controller: "addEditImageTerms",
        windowClass: 'big-modal',
        inputs: {
          data: {
            title: (id ? 'Edit' : 'Add') + ' Offer Image and Terms',
            id: id,
            clientID: $stateParams.clientID
          }
        }
      }).then(
        function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (!result) return
            if (result && !result.Status)
              fetch(function(){
                Notification.success({message: 'Item was successfully ' + (id ? 'updated' : 'added'), delay: 5000})
              });
          });
        }
      );
    };

    $scope.joinNames = function(items){
      items = items || []
      var arr = _.map(items, function(item){
        return item.name
      });

      return arr.join(', ')
    }

  });
