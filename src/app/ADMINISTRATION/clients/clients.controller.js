'use strict';

angular.module('crm')
  .controller('ClientsCtrl', function ($scope, $state, filterFilter, firstLetterFilterFilter, 
    ClientSetup, DataStorage, $filter, GlobalVars, DataProcessing, AuthService, $rootScope) {
  
    $scope.authSections = GlobalVars.commonObject().AuthorizedSections;
    var clientsDataForFilters = [];
    $scope.portletHeaderOptions = {title: 'administration.clients.clients.controller.manage-clients'};
    $scope.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    $scope.alphabet.unshift('All')
    $scope.fieldLetter = {
      CompanyName: 'All'
    };
    $scope.activeLetter = 'All';
    $scope.successMessage = {show: false, text: ''};
    $scope.errorMessage = {show: false, text: ''};
    
    DataStorage.clientsApi().query(function(resp){
      // Use controller filters only for Smart Tables
      clientsDataForFilters = resp.Clients.map(function (item) {
        var resItem = {};
        angular.forEach(item, function(v,k){
          resItem[k] = $filter('trimText')(v);
        });
        return resItem;
      });
      $scope.clientsData = angular.copy(clientsDataForFilters)
    });

    $scope.switchStatus = {
      IsActive: true
    };

    var fetch = function(){
      DataStorage.clientsApi().query(function(resp){

        clientsDataForFilters = resp.Clients.map(function (item) {
          var resItem = {};
          angular.forEach(item, function(v,k){
            resItem[k] = $filter('trimText')(v);
          });
          return resItem;
        });

        if ($scope.activeLetter == 'All' || !$scope.activeLetter){
          DataProcessing.updateSafeArr(angular.copy(clientsDataForFilters), $scope.clientsData, 'ClientID')
        }else{
          var res = firstLetterFilterFilter(angular.copy(clientsDataForFilters), $scope.fieldLetter);
          _.each(angular.copy(res), function(r){
            if ($filter('filterByField')($scope.clientsData, {ClientID: r.ClientID}).length){
              angular.extend($filter('filterByField')($scope.clientsData, {ClientID: r.ClientID})[0], r)
            }else
              $scope.clientsData.push(r)
          })
        }
      });
    };

    $scope.$watchCollection('switchStatus', function (newVal) {
      $scope.clientsData = $scope.clientsData || [];
      if (newVal.IsActive)
        $scope.clientsData = $scope.clientsData.filter(function(t){
          return t.IsActive
        });
      else if ($scope.fieldLetter && $scope.fieldLetter.CompanyName && $scope.fieldLetter.CompanyName!='All'){
        var res = firstLetterFilterFilter(angular.copy(clientsDataForFilters), $scope.fieldLetter);
        $scope.clientsData = angular.copy(res);
      }else{
        $scope.clientsData = angular.copy(clientsDataForFilters);
      }
    });

    $scope.setActiveLetter = function (letter, update) {
      // Drop this filter if same letter is pressed
      if ($scope.activeLetter === letter && !update) {
        $scope.fieldLetter = false;
        $scope.activeLetter = false;
        // Activate letter filter
      } else {
        $scope.fieldLetter = {};
        $scope.fieldLetter.CompanyName = letter;
        $scope.activeLetter = letter;
      }
      if (letter == 'All'){
        $scope.clientsData = angular.copy(clientsDataForFilters);
      }else{
        var res = firstLetterFilterFilter(angular.copy(clientsDataForFilters), $scope.fieldLetter);
        $scope.clientsData = angular.copy(res);
      }
    };

    $scope.addNewClient = function () {
      ClientSetup.addClient(function(){
        fetch()
        //AuthService.updateCommonIndex()
      });
    };

    $scope.goToSites = function (id) {
      $state.go('main.sites', {clientID: id});
    };

    var editClientCb = function (result, clientObj) {
      if(!result) return false;
      if (result) {
        $scope.successMessage = {
          show: true,
          text: $rootScope.translate('administration.clients.clients.controller.client-saved!') +' ID: ' + clientObj.ClientID + ' '+ $rootScope.translate('administration.clients.clients.controller.company-name')+': ' + clientObj.CompanyName
        };
        $scope.errorMessage.show = false;
        var updatedClients = DataStorage.clientsApi().query().$promise;
        updatedClients.then(
          function (data) {
            //AuthService.updateCommonIndex();
            clientsDataForFilters = data.Clients.map(function (item) {
              //if (item.IsDeleted) return false;
              var resItem = {};
              angular.forEach(item, function(v,k){
                resItem[k] = $filter('trimText')(v);
              });
              return resItem;
            });

            if ($scope.activeLetter == 'All' || !$scope.activeLetter){
              DataProcessing.updateSafeArr($scope.clientsData, clientsDataForFilters, 'ClientID')
            }else{
              var res = firstLetterFilterFilter(angular.copy(clientsDataForFilters), $scope.fieldLetter);
              _.each(angular.copy(res), function(r){
                if ($filter('filterByField')($scope.clientsData, {ClientID: r.ClientID}).length){
                  angular.extend($filter('filterByField')($scope.clientsData, {ClientID: r.ClientID})[0], r)
                }else
                  $scope.clientsData.push(r)
              })
            }
            //$scope.switchStatus.IsActive = false;
          },
          function (error) {
            console.log('updatedClients error', error);
          }
        );
      } else {
        $scope.successMessage.show = false;
        $scope.errorMessage = {
          show: true,
          text: $rootScope.translate('administration.clients.clients.controller.client-id')+': ' + clientObj.ClientID + ' ( '+$rootScope.translate('administration.clients.clients.controller.company-name') + ': ' + clientObj.CompanyName + ' ) save error!'
        };
      }
    };

    $scope.editClient = function (row) {
      $scope.successMessage.show = false;
      $scope.errorMessage.show = false;
      var getDetails = DataStorage.getClientDetails(row.ClientID).query().$promise;
      getDetails.then(
        function (data) {
          var details = {};
          details.ClientID = data.Client.ClientID;

          details = angular.extend(details, 
            data.Client.Information, 
            data.Client.ApiCredentials, 
            data.Client.Details
          );

          ClientSetup.editClient(details, editClientCb);
        },
        function (error) {
          console.log('client details error', error);
        }
      );
    };

    $scope.closeNotice = function () {
      $scope.successMessage.show = false;
      $scope.errorMessage.show = false;
    };

    var deletedClientCb = function (ClientID, result) {
      var companyName = '';
      if (result) {
        for (var i = 0; i < $scope.clientsData.length; i++) {
          var obj = $scope.clientsData[i];
          if (obj.ClientID === ClientID) {
            companyName = obj.CompanyName;
            $scope.clientsData.splice(i, 1);
            break;
          }
        }
        $scope.successMessage = { show: true, text: $rootScope.translate('administration.clients.clients.controller.client-deleted')+': ID: ' + ClientID + ' '+$rootScope.translate('administration.clients.clients.controller.company-name')+': ' + companyName };
        $scope.errorMessage.show = false;
        //AuthService.updateCommonIndex()
      } else {
        $scope.successMessage.show = false;
        $scope.errorMessage = { show: true, text: $rootScope.translate('administration.clients.clients.controller.client')+' ' + ClientID + ' '+$rootScope.translate('administration.clients.clients.controller.delete-error!') };
      }
    };

    $scope.deleteClient = function (ClientID) {
      $scope.successMessage.show = false;
      $scope.errorMessage.show = false;
      ClientSetup.deleteClient(ClientID, deletedClientCb);
    };

  });
