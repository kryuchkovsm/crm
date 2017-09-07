'use strict';
angular.module('crm')
  .controller('addEditCrm',function($scope, data, close, DataStorage, GlobalVars, ThemeColorChanger) {
    var crm = angular.copy(data.crm) || {}
    if (crm.Phone) crm.Phone = parseInt(crm.Phone)
    if (crm.Zip) crm.Zip = parseInt(crm.Zip)

    if (crm.id){
      crm.CrmGuid = crm.id;
      delete crm.id
    }

    $scope.fields = angular.copy(crm) || {};
    $scope.close = close;

    $scope.save = function(invalid){
      if (invalid) return;
      $scope.saving = true;
      var method = 'add';
      var postObj = angular.copy($scope.fields);
      if (postObj.CrmGuid)
        method = 'edit';
      else{
        var currentColors = angular.copy(GlobalVars.styleColors.defaultColors);
        postObj.Styles = angular.toJson(currentColors);
        delete currentColors.flowImage
        postObj.StylesCss = ThemeColorChanger.changeBgColor(currentColors);
      }
      DataStorage.anyApiMethod('/crm/'+method).post(postObj, function(resp){
        $scope.saving = false;
        if (resp && !resp.Status){
          if (resp.CrmGuid)
            $scope.fields.id = resp.CrmGuid;
          close($scope.fields)
        }
      })
    }

});
