/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('select-clients-dates', [])
  .directive('crmSelectClientsDates', function (GlobalVars, DataProcessing, $filter) {
    return {
      scope: {
        typeOfReport: '=',
        options: '=',
        value: '=',
        // Dont use uppercase
        searchf: '&'
      },
      templateUrl: 'components/directives/REPORTS/selectClientsDates/selectClientsDatesTpl.html',
      link: function ($scope, $element, $attrs) {

        $scope.options.groupBy = $scope.options.groupBy || ($scope.typeOfReport == 'income' || $scope.typeOfReport == 'recurring') 

        var defaultFrom = DataProcessing.toDateFormat(moment().subtract(7, 'd'));
        var defaultTo = DataProcessing.toDateFormat(moment());

        $scope.value = {
          fromDateValue: $scope.options.defaultFrom || defaultFrom,
          toDateValue: $scope.options.defaultTo || defaultTo
        };
        $scope.portletHeader = {title: $scope.options.title};
        $scope.fields = {};
        $scope.clientsModel = [];
        $scope.sitesModel = [];
        $scope.sitesData = [{
          "SiteID": 0,
          "Name": $filter('translate')('common.no-clients-selected'), 
          disabled: true
        }];

        //  1st select
        $scope.clientsData = GlobalVars.commonObject().Clients;
        $scope.clientsSettings = {
          enableSearch: true,
          scrollableHeight: '195px',
          scrollable: true,
          idProp: 'ClientID',
          displayProp: 'CompanyName',
          selectName: $filter('translate')('common.clients')
        };

        $scope.$watchCollection( "clientsModel",
          function(clients) {
            $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData) || $scope.sitesData;
            $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
          }
        );

        $scope.$watch('value.showAdvanced', function(val){
          if (!val){
            $scope.statusCheckBoxValue = undefined;
            $scope.transactionTypeCheckBoxValue = undefined;
            delete $scope.value.transactionTypeCheckBoxValue
            delete $scope.value.statusCheckBoxValue
            delete $scope.value.last4digitsTxtValue;
            delete $scope.value.processorIdTxtValue;
            delete $scope.value.affiliateIdTxtValue;
            delete $scope.value.transactionIdTxtValue;
            delete $scope.value.customerIdTxtValue;
            delete $scope.value.lastNameTxtValue;
            delete $scope.value.emailTxtValue;
            delete $scope.value.last4digitsTxtValue;
            delete $scope.value.last4digitsTxtValue;
            $scope.value.amountTxtRangeValue = [];
          }
        }, true)

        //  2nd select
        $scope.sitesSettings = {
          idProp: 'SiteID',
          displayProp: 'Name',
          enableSearch: true,
          scrollableHeight: '195px',
          scrollable: true,
          searchPlaceholder: 'Type site name here or select from list.',
          selectName: $filter('translate')('common.sites')
        };
        $scope.$watchCollection( "sitesModel",
          function( newValue, oldValue ) {
            if ($scope.sitesModel.length && $scope.sitesModel[0].SiteID === 0) {
              $scope.sitesModel.shift();
            }
            $scope.value.sitesModel = $scope.sitesModel;
          }
        );

        $scope.options.fromDateOptions = {
          label: $filter('translate')('common.from'),
          id: 304,
          inline: true
        };
        $scope.options.toDateOptions = {
          label: $filter('translate')('common.to'),
          id: 305,
          inline: true
        };

        function daydiff(first, second) {
          return Math.round((second-first)/(1000*60*60*24));
        }


        if ($scope.typeOfReport == 'projection'){
          $scope.$watchCollection('[value.fromDateValue, value.toDateValue]', function(arr){
            $scope.showTimeframeError = false
            if (arr && arr[0] && arr[1]){
              if (daydiff(DataProcessing.stringToDate(arr[0]), DataProcessing.stringToDate(arr[1])) > 90){
                $scope.showTimeframeError = true
              }
            }
          });

          $scope.options.fromDateOptions.beforeShowDay = function(dt){
            var nextYearDate = new Date();
            nextYearDate.setMonth(nextYearDate.getMonth() + 12);
            return new Date(dt) > new Date() && nextYearDate > new Date(dt);
          };

          $scope.options.toDateOptions.beforeShowDay = function(dt){
            var nextYearDate = new Date();
            nextYearDate.setMonth(nextYearDate.getMonth() + 12);
            return new Date(dt) > new Date() && nextYearDate > new Date(dt);
          };
        }


        $scope.search = function () {
          $scope.searching = true
          $scope.searchf().then(function(){
            $scope.searching = false
          });
        };


        // For transaction report
        $scope.searchAdvanced = function() {
          $scope.$broadcast('show-errors-check-validity');
          if ( $scope.transactionReportForm.$invalid ) {
            $scope.value.advancedFormValid = false;
            return;
          }
          $scope.value.advancedFormValid = true;
          $scope.searchf();
        };
        $scope.showAdvancedOptions = function() {
          if ( $scope.value.showAdvanced === true ) {
            $scope.value.showAdvanced = false;
            return;
          }
          $scope.value.showAdvanced = true;
        };
        $scope.statusCheckBoxOptions = {
          label: 'STATUS:',
          class: 'narrow',
          data: [
            {"id":1,"name":"Approved"},
            {"id":2,"name":"Declined"},
            {"id":3,"name":"Failed/Unknown"}
          ]
        };

        $scope.transactionTypeCheckBoxOptions = {
          label: 'TRANSACTION TYPE:',
          class: 'narrow',
          data: [
            {"id":1,"name":"Sale"},
            {"id":2,"name":"Refund"},
            {"id":3,"name":"Void"},
            {"id":4,"name":"Auth"}
          ]
        };

        $scope.toggle = function(arrName, id){
          $scope.value[arrName] = $scope.value[arrName] || [];
          var n = $scope.value[arrName].indexOf(id)
          if (n>-1) {
            if ($scope[arrName]) $scope[arrName] = false;
            $scope.value[arrName].splice(n,1)
          }
          else $scope.value[arrName].push(id)
        };

        $scope.toggleAll = function(arrName, arr, fieldName, all){
          $scope.value[arrName] = $scope.value[arrName] || [];
          if (all) $scope.value[arrName] = _.map(arr, function(a){
              return a[fieldName]
            });
          else $scope.value[arrName] = []
        };

        $scope.last4digitsTxtOptions = {
          label: 'LAST 4 DIGITS OF CARD NUMBER:',
          type: 'number',
          maxlength: 4,
          id: 1,
          valNumber: true,
          disAllowNegative: true
        };
        $scope.processorIdTxtOptions = {
          label: 'PROCESSOR:',
          id: 1
        };
        $scope.affiliateIdTxtOptions = {
          label: 'AFFILIATE ID:',
          id: 1
        };
        $scope.transactionIdTxtOptions = {
          label: 'TRANSACTION ID:',
          id: 1,
          type: 'number',
          valNumber: true,
          disAllowNegative: true
        };
        $scope.customerIdTxtOptions = {
          label: 'CUSTOMER ID:',
          id: 1,
          type: 'number',
          valNumber: true,
          disAllowNegative: true
        };
        $scope.lastNameTxtOptions = {
          label: 'LAST NAME:',
          id: 1
        };
        $scope.emailTxtOptions = {
          label: 'EMAIL:',
          id: 1,
          type: 'email',
          valEmail: true
        };
        $scope.amountTxtRangeOptions = {
          label: 'AMOUNT RANGE:',
          type: 'number',
          pred1: '$',
          pred2: '$',
          id: 1
        };
      }
    };
  });
