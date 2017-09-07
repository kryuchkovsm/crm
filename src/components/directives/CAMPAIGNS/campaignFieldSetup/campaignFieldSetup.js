/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('campaignfield-setup', [])
  .directive('crmCampaignFieldSetup', function ($rootScope) {
    return {
      restrict: 'AE',
      scope: {
        options: '=',
        value: '=',
        countries: '=',
        hideme: '&',
        pageType: '='
      },
      templateUrl: 'components/directives/CAMPAIGNS/campaignFieldSetup/campaignFieldSetupTpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.requiredFields = ['FirstName', 'LastName', 'Address1', 'City', 'State', 'Zip', 'Country', 'NameOnCard',
          'CardType', 'CardNumber', 'ExpirationDate', 'CVV']

        if ($scope.requiredFields.indexOf($scope.options.Name)>-1 && $scope.value.Properties && !angular.isDefined($scope.value.Properties.Required))
          $scope.value.Properties.Required = true;

        $scope.value.Properties = $scope.value.Properties || {
            options: [],
            Properties: {
              Required: $scope.requiredFields.indexOf($scope.options.Name)>-1
            }
          }

        if (!$scope.value.Properties.ElementType)
          angular.extend($scope.value.Properties, {
            ElementType: $scope.options.ElementType,
            FieldType: $scope.options.FieldType
          });

        if ($scope.options.isMDF){
          $scope.options.mdfType = angular.copy($scope.value.Properties.ElementType) || 'input';
        }

        if ($scope.options.needAutoSelect)
          $scope.$watch('value.Properties.autoSelect', function(val){
            $rootScope.$broadcast('changedAutoselect', !!val);
          });

        if ($scope.options.Name == 'CardType'){
          $rootScope.$on('changedAutoselect', function (event, data) {
            $scope.enableRequired = data
            if (data){
              $scope.value.Properties.Required = false;
              $scope.hideRecommend = true
            }else{
              $scope.value.Properties.Required = true;
              $scope.hideRecommend = false
            }
          });
        }

        $scope.checkIfDefined = function(value){
          return angular.isDefined(value)
        }
        $scope.submitted=false;
        // MDF field settings depending on type
        $scope.setMdfTypeFields = function (type) {
          $scope.options.mdfType = type;
          $scope.value.Properties.ElementType = type;
          switch (true) {
            case (type === 'input'):
              $scope.value.Properties.ElementType = 'input';
              $scope.value.Properties.FieldType = 'text';
              angular.extend($scope.options,{
                needRequired: true,
                needRange: true,
                needAlphanumeric: true,
                needNameLabel: true,
                needMultiOptionsValue: false,
                needSingleValue: false
              });
              break;
            case (type === 'select' || type === 'radio'):
              if (!$scope.value.Properties.options)
                $scope.value.Properties.options = [];
              angular.extend($scope.options,{
                needRequired: true,
                needRange: false,
                needAlphanumeric: false,
                needNameLabel: true,
                needMultiOptionsValue: true,
                needSingleValue: false
              });
              break;
            case (type === 'checkbox'):
              if (!$scope.value.Properties.options)
                $scope.value.Properties.options = [];
              angular.extend($scope.options,{
                needRequired: true,
                needRange: false,
                needAlphanumeric: false,
                needNameLabel: true,
                needMultiOptionsValue: false,
                needSingleValue: true
              });
              break;
          }
        };

        if ($scope.options.mdfType)
          $scope.setMdfTypeFields($scope.options.mdfType);

        $scope.newMultiOptions = {value: ''};
        $scope.addMultiOptionsValue = function (form) {
          $scope.submitted=true;
          if (form.$invalid) return;
          $scope.value.Properties.options.push(angular.copy($scope.newMultiOptions.value));
          $scope.newMultiOptions.value = '';
          $scope.submitted=false;
        };
      }
    };
  })
  .directive('crmCampaignMultiselectBoxes', ['$filter', function ($filter) {
    return {
      require: '^ngModel',
      scope: {
        countries: '=',
        selectedArr: '=ngModel'
      },
      replace: true,
      templateUrl: 'components/directives/CAMPAIGNS/campaignFieldSetup/crmCampaignMultiselectBoxes.html',
      link: function ($scope, $element, $attrs, $ngModelCtrl) {
        $scope.countries = angular.copy($scope.countries) || [];
        $scope.defaultSelectedArr = angular.copy($scope.countries) || [];
        $scope.selectedArr = angular.copy($scope.selectedArr) || [];

        if ($scope.selectedArr.length>0)
          $scope.defaultSelectedArr = angular.copy($scope.defaultSelectedArr).filter(function(dCountry){
            var f = true;
            angular.forEach($scope.selectedArr, function(country){
              if (dCountry.name == country.name) f= false;
            });
            return f
          });
        $scope.leftSelect = [];
        $scope.rightSelected = [];

        $scope.addSelected = function(leftSelected){
          if (leftSelected && leftSelected.length>0){
            angular.forEach(leftSelected, function(el){
              $scope.selectedArr.push(el);
              angular.forEach($scope.defaultSelectedArr, function(a,n){
                if (a.id == el.id)
                  $scope.defaultSelectedArr.splice(n,1)
              })
            });
            $scope.leftSelected = [];
          }
        };
        $scope.removeSelected = function(rightSelected){
          if (rightSelected && rightSelected.length>0){
            angular.forEach(rightSelected, function(el){
              $scope.defaultSelectedArr.push(el);
              angular.forEach($scope.selectedArr, function(a,n){
                if (a.id == el.id)
                  $scope.selectedArr.splice(n,1)
              })
            });
            $scope.rightSelected = [];
          }
        };
      }
    }
  }]).filter('crmCampaignFilterByField', function() {
    return function(arr, obj) {
      var keys = Object.keys(obj), resArr = [];
      angular.forEach(arr, function(a){
        var f;
        angular.forEach(keys, function(key){
          if (!a[key] || (a[key] && a[key]!=obj[key])) f = true
        })
        if (!f) resArr.push(a)
      });
      return  resArr;
    };
  });
