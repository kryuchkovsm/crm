'use strict';

angular.module('crm')
  .controller('addEditEvent', function ($scope, ModalService, DataStorage, data, close, $timeout, Notification) {
    $scope.event = {
      IsActive: true,
      NumOfDaysBeforeCharge: 0
    };
    $scope.totalDisplayed = 50;

    if (data.smtpServers && data.smtpServers.length==1)
      $scope.event.SmtpID = data.smtpServers[0].id

    if (data.eventSelects && data.eventSelects.Templates){
      var totalLength = data.eventSelects.Templates.length;
      var increaseTotal = function(){
        $timeout(function(){
          $scope.totalDisplayed += 50
          if ($scope.totalDisplayed<totalLength) increaseTotal()
        },100);
      };
      increaseTotal()
    }

    $scope.data = data;
    if ($scope.data.event && $scope.data.event.id){
      DataStorage.emailAutorespondersApi.getEventById($scope.data.event.id).query(function(resp){
        if (resp && resp.Event){
          $scope.event = resp.Event;
          $scope.event.ID = data.event.id
        }
      });
    }

    $scope.changedType = function(){
      $scope.event.TemplateID = undefined;
    };

    var fetchTemplates = function(templateTypeID){
      $scope.templates = [];
      if (!templateTypeID) return
      $scope.templateLoaded = false;
      $scope.loadingTemplate = true;
      DataStorage.anyApiMethod('/emailautoresponders/templates/bytype/'+data.clientID+'/' + templateTypeID).query(function(resp){
        $scope.templateLoaded = true;
        $scope.loadingTemplate = false;
        if (resp && !resp.Status)
          $scope.templates = resp.Templates || [];
      })
    };

    $scope.$watch('event.TypeID', fetchTemplates);

    $scope.createOrEdit = function(eventForm){
      if (eventForm.$invalid) return;
      $scope.event.ClientID = data.clientID
      var method = 'addEvent';
      if ($scope.event.ID) method = 'editEvent';
      if (!$scope.event.NumOfDaysBeforeCharge) $scope.event.NumOfDaysBeforeCharge = 0;
      $scope.adding = true;
      DataStorage.emailAutorespondersApi[method]().post($scope.event, function(resp){
        $scope.adding = false;
        if (resp && resp.Status && resp.ErrorMessage && resp.ErrorMessage.length>0)
          Notification.error({message: resp.ErrorMessage[0], delay: 5000})
        close(resp && !resp.Status, 500);
      })
    }
  });
