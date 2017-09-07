angular.module('crm')
  .controller('WhitelabelsCtrl', function ($scope, $state, DataStorage, $filter, ModalService, firstLetterFilterFilter, Notification, resolvedAvailableIp, DataProcessing, $rootScope) {
    $scope.alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    $scope.alphabet.unshift('All')
    $scope.fieldLetter = {
      Name: 'All'
    };

    $scope.crmsSafe = [];
    var crmDataForFilters = [];

    var fetch = function(){
      DataStorage.anyApiMethod('/crm/index').query(function(resp){
        if (resp && resp.CRMs){
          crmDataForFilters = angular.copy(resp.CRMs) || [];
          DataProcessing.updateSafeArr(angular.copy(resp.CRMs) || [], $scope.crmsSafe, 'id');
        }
      })
    };

    fetch()
    DataStorage.anyApiMethod('/crm/add').query(function(resp){
      if (resp && !resp.status){
        $scope.countryCodes = _.map(resp.CountryCodes, function(v,k){
          return {
            id: k,
            name: v
          }
        })
      }
    });

    $scope.activeLetter = 'All';
    var isIPAvailable = resolvedAvailableIp.IsIPAvailable
    var checkAvailableIP = function(cb){
      cb = cb || function(){}
      DataStorage.anyApiMethod('/crm/ip/available').query(function(resp){
        if (resp && !resp.Status)
          isIPAvailable = resp.IsIPAvailable
        cb()
      })
    }

    $scope.enableDomain = function(row){
      ModalService.showModal({
        templateUrl: "components/modals/TOOLS/enableDomain.html",
        controller: "enableDomain",
        inputs: {
          data: {
            crmGuid: row.id
          }
        }
      }).then(function (modal) {
        modal.element.modal();
      });
    }

    $scope.addEditWhitelabel = function(row){
      if (!row && !isIPAvailable)
        ModalService.showModal({
          templateUrl: "components/modals/COMMON/sure.html",
          controller: "DataModalCtrl",
          inputs: {
            data: {
              hideProceedButton: true,
              cancelButtonText: 'EXIT',
              modalTitle: $rootScope.translate('tools.whitelabels.whitelabels.server-response'),
              modalTxt: $rootScope.translate('tools.whitelabels.whitelabels.no-free-ip-available')
            }
          }
        }).then(function (modal) {
          modal.element.modal();
        });
      else
        ModalService.showModal({
          templateUrl: "components/modals/TOOLS/addEditCrm.html",
          controller: "addEditCrm",
          windowClass: 'big-modal',
          inputs: {
            data: {
              crm: row
            }
          }
        }).then(function (modal) {
          modal.element.modal({
            backdrop: 'static',
            keyboard: false
          });
          modal.close.then(function (result) {
            if (!result) return;
            var t = angular.copy(result)
            t.id = t.CrmGuid
            delete t.CrmGuid
            Notification.success({message: 'Whitelabel partner ' + result.CompanyName + ' has been ' + (row ? 'modified' : 'added'), delay: 5000});
            fetch();
            checkAvailableIP();
          });
        });
    };

    $scope.deleteCRM = function(row){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('tools.whitelabels.whitelabels.delete-whitelabel'),
            modalTxt: $rootScope.translate('tools.whitelabels.whitelabels.sure-delete', {value: row.Domain})
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          $scope.processing = true
          DataStorage.anyApiMethod('/crm/delete/'+row.id).post({}, function(resp){
            if (resp && !resp.Status){
              checkAvailableIP(function(){
                $scope.processing = false
                Notification.success({message: $rootScope.translate('tools.whitelabels.whitelabels.partner-deleted', {value: row.CompanyName}), delay: 5000});
                var index = $scope.crmsSafe.indexOf(row)
                if (index != -1){
                  $scope.crmsSafe.splice(index, 1)
                  crmDataForFilters = crmDataForFilters.filter(function(crm){
                    return crm.id != row.id
                  });
                }
              })
            }else
              $scope.processing = false
          });
          return true;
        });
      });
    };

    $scope.getKeys = function(obj){
      obj = obj || {};
      return Object.keys(JSON.parse(angular.toJson(obj)));
    };

    $scope.setActiveLetter = function (letter) {
      if ($scope.activeLetter === letter) {
        $scope.fieldLetter = false;
        $scope.activeLetter = false;
      } else {
        $scope.fieldLetter = {};
        $scope.fieldLetter.CompanyName = letter;
        $scope.activeLetter = letter;
      }
      if (letter == 'All'){
        $scope.crmsSafe = angular.copy(crmDataForFilters);
      }else{
        var res = firstLetterFilterFilter(angular.copy(crmDataForFilters), $scope.fieldLetter);
        $scope.crmsSafe = angular.copy(res) || [];
      }
    };

    $scope.openCSR = function (row){
      ModalService.showModal({
        templateUrl: "components/modals/TOOLS/csr.html",
        controller: "CsrModalCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            countryCodes: $scope.countryCodes,
            crmGuid: row.id
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          return;
        });
      });
    };

  });
