
'use strict';
angular.module('crm')
    .controller('CsrModalCtrl',function($scope, data, close, DataStorage, ModalService, $timeout, $http, $rootScope) {
    $scope.countryCodes = data.countryCodes;
    $scope.data = data
    $scope.csrs = [];
    $scope.csrsSafe = [];
    $scope.fields = {};
    $scope.cert = {};

    var fetch = function(cb){
      cb = cb || function(){};
      DataStorage.anyApiMethod('/crm/csr/index/' + data.crmGuid).query(function(resp){
        if (resp && !resp.Status) {
          $scope.commonName = resp.CommonName;
          _.each(resp.CSRs, function(csr){
            var f;
            angular.forEach($scope.csrsSafe, function(csrS, n){
              if (csr.id == csrS.id){
                f = true;
                angular.extend(csrS,csr)
              }
            });
            if (!f)
              $scope.csrsSafe.push(csr)
          });
          cb()
        }
      });
    };

    fetch();
    var successMessage = function(message){
      $scope.successMessage = message
      $timeout(function(){
        $scope.successMessage = ''
      },3000)
    };
    $scope.completeCSR = function(id){
      $scope.cancelCsr()
      $scope.cert = {
        CSRGuid: id
      };
      $scope.fields = {};
      $scope.showCompleteCSR = true;
      $scope.submitted = false;
      $scope.createNewCsr = false;
    };

    $scope.saveCERT = function(){
      $scope.saving = true;
      DataStorage.anyApiMethod('/crm/csr/complete').post($scope.cert, function(resp){
        if (resp && !resp.Status){
          fetch(function(){
            $scope.saving = false;
            $scope.showCompleteCSR = false;
            successMessage($rootScope.translate('modals.tools.csrmodalctrl.certificate-was-successfully-saved'))
          })
        }else
          $scope.saving = false;

      });
    };

    $scope.createNewCSR = function(){
      $scope.cancelCert();
      $scope.showCompleteCSR = false;
      $scope.submitted = false;
      $scope.createNewCsr = true;
      $scope.fields = {
        CrmGuid: data.crmGuid
      };
    };

    $scope.cancelCert = function(){
      $scope.showCompleteCSR=false;
      $scope.cert={};
    }

    $scope.cancelCsr = function(){
      $scope.submitted=false;
      $scope.createNewCsr=false;
      $scope.fields={};
    }

    $scope.editCSR = function(id){
      $scope.cancelCert();
      $scope.showCompleteCSR = false;
      $scope.submitted = false;
      $scope.createNewCsr = false;
      $scope.fields = {};
      DataStorage.anyApiMethod('/crm/csr/edit/' + id).query(function(resp){
        if (resp && !resp.Status) {
          $scope.fields = resp.CSR;
          $scope.fields.CsrGuid = id;
          $scope.createNewCsr = true;
        }
      })
    };

    $scope.downloadCSR = function(row){
      DataStorage.anyApiMethod('/crm/csr/download/'+row.id).query(function(resp){
        if (resp && !resp.Status){
          download(resp.CSR, (row.CommonName || 'cert') + '.txt', "text/plain");
          //var blob = new Blob([resp.CSR], { type : 'text/plain' });
          //$.downloadBlob(blob, (row.CommonName || 'cert') + '.txt')
        }
      });
    }

    $scope.saveCsr = function(invalid){
      if (invalid) return;
      $scope.submitted = false;
      var saveObj = angular.copy($scope.fields);
      delete saveObj.CommonName;
      var method = 'add';
      if ($scope.fields.CsrGuid)
        method = 'edit';
      $scope.saving = true;
      DataStorage.anyApiMethod('/crm/csr/'+method).post(saveObj, function(resp){
        if (resp && !resp.Status)
          fetch(function(){
            $scope.createNewCsr = false;
            $scope.fields = {};
            $scope.saving = false;
            successMessage(method=='add' ? $rootScope.translate('modals.tools.csrmodalctrl.new-csr-was-added') : $rootScope.translate('modals.tools.csrmodalctrl.csr-was-successfully-modified'))
          });
        else
          $scope.saving = false;
      });
    };

    $scope.deleteCSR = function(row){
      $scope.deletingID = row.id;
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('modals.tools.csrmodalctrl.delete-csr'),
            modalTxt: $rootScope.translate('modals.tools.csrmodalctrl.are-you-sure-you-want-to-delete-this-csr?')
          }
        }
      }).then(function (modal) {
        modal.element.modal({
          backdrop: 'static',
          keyboard: false
        });
        modal.close.then(function (result) {
          if (result === 'false') {
            $scope.deletingID = false;
            return;
          }
          DataStorage.anyApiMethod('/crm/csr/delete/' + row.id).post({}, function(resp){
            $scope.deletingID = false;
            if (resp && !resp.Status) {
              successMessage($rootScope.translate('modals.tools.csrmodalctrl.csr-was-successfully-deleted'))
              if ($scope.fields && row.id == $scope.fields.CsrGuid){
                $scope.fields = {};
                $scope.createNewCsr = false;
              }else if ($scope.cert && row.id == $scope.cert.CSRGuid){
                $scope.cert = {};
                $scope.showCompleteCSR = false;
              }
              var index = $scope.csrsSafe.indexOf(row)
              if (index != -1)
                $scope.csrsSafe.splice(index, 1)

            }
          })
        });
      });
    };
});
