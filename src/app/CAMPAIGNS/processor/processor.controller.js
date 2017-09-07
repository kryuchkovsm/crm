'use strict';

angular.module('crm')
  .controller('ProcessorCtrl', function ($scope, $stateParams, resolvedProcessors, ModalService, DataStorage, DataProcessing, $rootScope) {
    if (!$stateParams.clientID)
      return $rootScope.showSelectClientModal()

    $scope.processorsHeaderOptions = {title: 'Processors', searchField: {cb: void(0)}};
    $scope.closeNotices = true;
    $scope.noticeText = '';

    $scope.switchStatus = { IsActive: true };
    $scope.$watchCollection('switchStatus', function () {
      if (!$scope.switchStatus.IsActive) {
        $scope.switchStatus = '';
      }
    });

    $scope.processorsSafe = resolvedProcessors.Processors

    var fetch = function(){
      return DataStorage.processorAnyApi('/' + $stateParams.clientID + '?active=all').query(function(resp){
        DataProcessing.updateSafeArr(resp.Processors, $scope.processorsSafe, 'ProcessorID')
      });
    };

    $scope.closeNotice = function () {
      $scope.closeNotices = true;
    };

    $scope.addNewProcessor = function () {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/processor/addNewProcessor.html",
        controller: "AddNewProcessorCtrl",
        inputs: {
          data: {
            modalTitle: 'Add New Processor',
            ClientID: $stateParams.clientID
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          fetch();
        });
      });
    };

    $scope.advancedProcessorSettings = function (pid, procID) {
      var serverAction = 'advancedrule/' + pid;
      var server = DataStorage.processorAnyApi(serverAction).query().$promise;
      server.then(
        function (result) {
          if (result.Status) {
            $scope.closeNotices = false;
            $scope.noticeText = 'advancedrule Server error: ' + result.ErrorMessage;
            return false;
          }
          ModalService.showModal({
            templateUrl: "components/modals/CAMPAIGNS/processor/advancedProcessor.html",
            controller: "AdvancedProcessorCtrl",
            windowClass: 'big-modal',
            inputs: {
              data: {
                modalTitle: 'Advanced Processor Settings',
                ruleData: result.AdvancedRule,
                productsLevelAdvancedRuleID: pid
              }
            }
          }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result) {
              if (result == 'false') return false;
              $scope.noticeText = 'Advanced rule for processor: "' + procID + '" successfully saved!';
              $scope.closeNotices = false;
              return false;
            });
          });
        },
        function (error) {
          $scope.closeNotices = false;
          $scope.noticeText = 'Get advanced rule error: ' + error;
          return false;
        }
      );
    };

    $scope.editProcessorRow = function (rowData) {
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/processor/editProcessor.html",
        controller: "EditProcessorCtrl",
        inputs: {
          data: {
            modalTitle: 'Edit Processor',
            rowData: rowData
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (!result) {
            $scope.noticeText = 'Server error!';
            $scope.closeNotices = false;
          };
          if (result) {
            fetch();
            $scope.closeNotices = false;
          };
          return false;
        });
      });
    };

    $scope.deactivateProcessorRow = function (curID) {
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: 'Deactivate Processor',
            modalTxt: 'Are you sure you want to deactivate this processor?'
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          var serverAction = 'deactivateprocessor/' + curID;
          var server = DataStorage.processorAnyApi(serverAction).post().$promise;
          server.then(
            function (result) {
              if (result.Status) {
                $scope.closeNotices = false;
                $scope.noticeText = 'Server error: ' + result.ErrorMessage;
                return false;
              }
              fetch();
              $scope.noticeText = 'Processor: "' + curID + '" successfully deactivated!';
              $scope.closeNotices = false;
            },
            function (error) {
              $scope.closeNotices = false;
              $scope.noticeText = 'Deactivate processor error: ' + error;
              return false;
            }
          );
          return false;
        });
      });
    };

  });
