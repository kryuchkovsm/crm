'use strict';

var app = angular.module('crm');

app
  .controller('ConfigCenterCtrl', function ($scope, DataStorage, Notification, $rootScope) {
    $scope.portlet1HeaderOptions = {title: 'Select Services'};
    $scope.portlet2HeaderOptions = {title: 'Options'};

    $scope.fields = {};

    $scope.serviceType = {
      FullFilment: 1,
      LOMA: 2,
      MobileClick: 3,
      Mongoose: 4,
      Grapi: 5,
      InsureShip: 10,
      CPADetective: 11,
      USTFulFillment: 12
    };

    $scope.optionType = {
      Numeric: 0,
      String: 1,
      Boolean: 2,
      Delay: 3,
      Frequency: 4
    };

    $scope.fullConfig = {};
    DataStorage.configCenterApi().query(function(data){
      $scope.fullConfig = data.Index;
    });

    $scope.$watch('selectedClient', function(selectedClient){
      $scope.selectedService = undefined;
      $scope.selectedProvider = undefined;
      $scope.availableProviders = []

      if (!selectedClient)
        return;

      $scope.availableProviders = angular.copy($scope.fullConfig.Providers);

      angular.forEach(selectedClient.Providers || [], function(clientProvider){
        angular.forEach($scope.availableProviders || [], function(provider){

          if (clientProvider.ProviderId != provider.ProviderId)
            return;

          angular.forEach(clientProvider.Options || [], function(clientOption){
            angular.forEach(provider.Options || [], function(providerOption){

              if (providerOption.ProviderOptionId == clientOption.ProviderOptionId){
                providerOption.OptionValue = clientOption.OptionValue;
              }

            })
          })

        })
      });

    });

    $scope.selectCheckedSite = function(row){
      if (row.Checked){
        //add selected provider to site providers collection
        row.Providers.push($scope.selectedProvider)
      } else {
        //remove selected provider from site providers collection
        row.Providers = row.Providers.filter(function(siteProvider) {
            return siteProvider.ProviderId != $scope.selectedProvider.ProviderId;
        });
      }
    };

    $scope.selectCheckedProvider = function(selectedProvider){

      if ($scope.isActiveProvider){
        //remove selected provider from site providers collection
        $scope.selectedClient.Providers = $scope.selectedClient.Providers.filter(function(clientProvider) {
            return clientProvider.ProviderId != selectedProvider.ProviderId;
        });
      } else {
        //add selected provider to site providers collection
        $scope.selectedClient.Providers.push(selectedProvider)
      }

      $scope.isActiveProvider = !$scope.isActiveProvider;
    };

    $scope.$watch('selectedService', function(val){
      $scope.selectedProvider = undefined;
    });

    $scope.isActiveProvider = false;

    $scope.$watch('selectedProvider', function(selectedProvider){
      if (!$scope.selectedClient || !selectedProvider)
        return;

      //Set Sites checkboxes
      angular.forEach($scope.selectedClient.Sites, function(site){
        angular.forEach(site.Providers, function(provider){
          site.Checked = selectedProvider.ProviderId == provider.ProviderId;
        });
      })
      
      //Set Is Active Provider checkbox
      angular.forEach($scope.selectedClient.Providers, function(clientProvider){
        if (clientProvider.ProviderId == selectedProvider.ProviderId)
          $scope.isActiveProvider = clientProvider.IsActive;
      });

      //Handle Delay option type
      angular.forEach(selectedProvider.Options, function(option){
        if (option.OptionValue && option.OptionType === $scope.optionType.Delay){
          if (option.OptionValue.indexOf('@') == -1){
            option.OptionValue = +option.OptionValue
          } else {
            var values = option.OptionValue.split('@');
            option.OptionValue = +values[0]
            option.SelectedDelay = values[1]
          }
        }
      });
    });

    $scope.save = function (selectedClient, selectedProvider) {
      var sites = []
      angular.forEach(selectedClient.Sites, function(clientSite){
        angular.forEach(clientSite.Providers, function( provider ) {
          if (provider.ProviderId != selectedProvider.ProviderId)
            return;

          var site = {
            SiteID: clientSite.SiteID,
            ShippingCode: provider.ShippingCode,
            ListIdC: provider.ListIdC,
            ListIdI: provider.ListIdI,
          }
          sites.push(site);
        });
      })

      var options = []
      angular.forEach(selectedProvider.Options, function( providerOption ) {
        var option = {
          ProviderOptionId: providerOption.ProviderOptionId,
          OptionValue: providerOption.OptionValue,
          SelectedDelay: providerOption.SelectedDelay
        }
        options.push(option);
      });

      $scope.saving = true;

      DataStorage.configCenterUpdateClientApi().post({
        ClientID: selectedClient.ClientId,
        ProviderID: selectedProvider.ProviderId,
        IsActive: $scope.isActiveProvider,
        Options: options,
        Sites: sites
      }, function(resp){
        if (resp && !resp.Status)
          Notification.success({message: $rootScope.translate('administration.configcenter.configcenter.controller.client-has-been-updated'), delay: 5000})
        $scope.saving = false;
      })
    };

  });

app
  .filter('filterByItem', function () {
  return function (items, search) {
    if (!search) return [];
    var result = [];
    angular.forEach(items, function(item){
      var f = true;
      angular.forEach(Object.keys(search), function(key){
        if (search[key] != item[key]) f = false
      });
      if (f) result.push(item)
    });
    return result;
  }
});
app
  .filter('normalizeOptionName', function () {
    return function (name) {
      if (!name) return;
      return name.toString().toLowerCase().trim().replace(/ /g,'');
    }
  });
