'use strict';
angular.module('crm')
  .controller('clientSelectCtrl',function($scope, data, GlobalVars, $filter, close) {
    $scope.data = data;
    $scope.selected = {
      Client: ''
    }
    $scope.searchClientFilter = '';
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      showTitle: false,
      showCheckAll: false,
      showUncheckAll: false,
      autoFocus: true,
      selectionLimit: 1
    };
    $scope.clientsData = GlobalVars.commonObject().Clients;

    $scope.filterClients = function(options, word){
      var resArr = $filter('filter')(options, {CompanyName: word});
      resArr = resArr.concat($filter('filter')(options, {ClientID: word}));
      resArr = _.uniq(resArr, function(p){
        return p.ClientID;
      });
      return resArr
    };

    $scope.close = function(result) {
      close(result, 500); // close, but give 500ms for bootstrap to animate
    };
  });
