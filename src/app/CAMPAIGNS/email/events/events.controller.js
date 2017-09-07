'use strict';

angular.module('crm')
  .controller('EmailEventsCtrl', function ($scope, ModalService, DataStorage, $stateParams, Notification, $rootScope) {
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()

    $scope.switchStatus = {
      IsActive: 'true'
    };
    $scope.$watch('switchStatus', function(val){
      if (val){
        angular.element("#is-active-events").val(val.IsActive)
        angular.element("#is-active-events").triggerHandler('input');
      }
    },true)

    $scope.templateTypes = [];
    $scope.eventsSafe = [];
    DataStorage.anyApiMethod('/emailautoresponders/types').query(function(resp){
      if (resp && !resp.Status)
        $scope.templateTypes = resp.TemplateTypes;
    });

    $scope.removeEvent = function(row){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle:  $rootScope.translate('campaigns.email.events.events.controller.delete-event'),
            modalTxt: $rootScope.translate('campaigns.email.events.events.controller.are-you-sure-you-want-to-delete-event?')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          DataStorage.emailAutorespondersApi.deleteEvent(row.id).post(function(resp){
            if (resp && !resp.Status){
              var index = $scope.eventsSafe.indexOf(row)
              if (index != -1)
                $scope.eventsSafe.splice(index,1)
              Notification.success({message: $rootScope.translate('campaigns.email.events.events.controller.event-was-successfully-deleted'), delay: 5000})
            }
          });
        });
      });

    };
    var resolvedEvents = {};
    var fetch = function(cb){
      cb = cb || function(){}
      DataStorage.emailAutorespondersApi.listEvents().query({clientID: $stateParams.clientID}, function(resp){
        if (resp && !resp.Status){
          resolvedEvents = resp
          _.each(resp.Events, function(ev){
            var f;
            angular.forEach($scope.eventsSafe, function(evS){
              if (ev.id == evS.id){
                angular.extend(evS,ev)
                f = true;
              }
            })
            if (!f) $scope.eventsSafe.push(ev)
          });
        }
        cb()
      })
    };
    fetch()
    $scope.addEditEvent = function(event){
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/email/event/addEditEvent.html",
        controller: "addEditEvent",
        inputs: {
          data: {
            title: (event ? $rootScope.translate('campaigns.email.events.events.controller.edit') : $rootScope.translate('campaigns.email.events.events.controller.add')) + ' '+$rootScope.translate('campaigns.email.events.events.controller.event'),
            event: event,
            templateTypes: $scope.templateTypes,
            smtpServers: resolvedEvents.AddEvent ? resolvedEvents.AddEvent.SmtpServers || [] : [],
            clientID: $stateParams.clientID
          }
        }
      }).then(
        function (modal) {
          modal.element.modal();
          modal.close.then(function (result) {
            if (result) fetch(function(){
              Notification.success({message: $rootScope.translate('campaigns.email.events.events.controller.event-was-successfully')+' ' + (event ? $rootScope.translate('campaigns.email.events.events.controller.modified') : $rootScope.translate('campaigns.email.events.events.controller.added')), delay: 5000})
            });
          });
        }
      );
    }
});
