'use strict';

angular.module('crm')
  .controller('addEditImageTerms', function ($scope, ModalService, DataStorage, data, close, fileReader) {
    $scope.data = data;
    $scope.fields = {};

    if (data.id){
      $scope.loading = true;
      DataStorage.anyApiMethod('/offerimageterms/edit/'+data.id).query(function(resp){
        $scope.loading = false;
        if (resp && resp.OfferForm){
          $scope.fields = resp.OfferForm
          if ($scope.fields.OfferImage)
            $scope.fields.FileContentBase64 = 'data:image/png;base64,' + $scope.fields.OfferImage;
          $scope.fields.OfferFormID = data.id
        }
      });
    }else $scope.fields.ClientID = data.clientID;

    $scope.setFile = function(type, file){
      $scope.fields.FileContentBase64 = '';
      if (file && file.length>0){
        if(file[0].type.indexOf('image') == -1){
          angular.element('input[name="'+type+'"]').innerHTML=angular.element('input[type="file"]').innerHTML;
          $scope.fileError = 'Wrong image type';
          $scope.imageFile = undefined;
          $scope.fields.FileContentBase64 = undefined;
        }else{
          fileReader.readAsDataUrl(file[0], $scope)
            .then(function(result) {
              $scope.fileError = '';
              $scope.imageFile = file[0];
              $scope.fields.FileContentBase64 = result;
            });
        }
        $scope.$apply();
      }
    };

    $scope.save = function(form){
      if (form.$invalid || !$scope.fields.FileContentBase64) return
      var method = '/offerimageterms/add';
      if ($scope.fields.OfferFormID)
        method = '/offerimageterms/edit';

      $scope.saving = true;
      DataStorage.anyApiMethod(method).post(angular.copy($scope.fields), function(resp){
        $scope.saving = false;
        close(resp, 500);
      })
    }
  });
