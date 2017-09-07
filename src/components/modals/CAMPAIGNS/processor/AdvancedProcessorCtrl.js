/**
 * Created by user on 24.03.15.
 */
'use strict';
angular.module('crm')
  .controller('AdvancedProcessorCtrl',function($scope, data, close, ProcessorSetup, DataStorage, Notification, $rootScope) {
    $scope.modalTitle = data.modalTitle;
    $scope.readyContent = false
    $scope.gotToRule = function(advancedRuleID){
      $scope.readyContent = false
      DataStorage.processorAnyApi('advancedrule/' + advancedRuleID).query(function(resp){
        if (resp && resp.AdvancedRule){
          setData({
            ruleData: resp.AdvancedRule,
            productsLevelAdvancedRuleID: advancedRuleID
          })
        }else{
          $scope.noData = true
        }
      });

    };

    var setData = function(data) {
      $scope.addMdfForm = {}
      $scope.readyContent = true
      $scope.fieldOptions = ProcessorSetup.advancedRuleEditFormFields();
      $scope.fields = {};
      $scope.activeCardTypes = {};
      $scope.saved = false;
      $scope.fields.cardTypeCheckboxValues = [];
      var cTypes = $scope.fieldOptions.cardTypeCheckboxOptions.data,
        serverData = data.ruleData;
      if (cTypes && cTypes.length) {
        for (var i = 0; i < cTypes.length; i++) {
          var obj = cTypes[i];
          $scope.fields.cardTypeCheckboxValues[i] = obj;
        }
      }

      $scope.ProcessorLevelRuleID = serverData.ProcessorLevelRuleID
      $scope.parseInt = function(val){
        return parseInt(val)
      };

      if (serverData.IsProcessorLevelRule) {
        $scope.level = $rootScope.translate('modals.campaigns.processor.advancedprocessorctrl.processor-level')+':';
        $scope.IsProcessorLevelRule = true;
      } else {
        // This will be used in Products only
        $scope.level = $rootScope.translate('modals.campaigns.processor.advancedprocessorctrl.product-level')+':';
        if (serverData.RecurringProducts) {
          //  Recurring Rules select
          $scope.fieldOptions.RecurringProductsData = angular.copy(serverData.RecurringProducts);
          $scope.fieldOptions.StickyProductsData = angular.copy(serverData.RecurringProducts);


          $scope.stickyTable = [];
          if (serverData.StickyRules && serverData.StickyRules.length)
            _.each(serverData.RecurringProducts, function(recurringProduct){
              _.each(serverData.StickyRules, function(stickyRule){
                if (stickyRule.ChargeID == recurringProduct.ChargeID){
                  var t = angular.copy(recurringProduct)
                  _.extend(t, angular.copy(stickyRule))
                  $scope.stickyTable.push(t)
                }

              });
            });

          $scope.fieldOptions.RecurringRulesSettings = {
            enableSearch: true,
            scrollableHeight: '243px',
            scrollable: true,
            idProp: 'ChargeID',
            displayProp: 'Name',
            selectName: $rootScope.translate('modals.campaigns.processor.advancedprocessorctrl.recurring-rules'),
            searchPlaceholder: $rootScope.translate('modals.campaigns.processor.advancedprocessorctrl.type-rule-here-or-select-from-list')
          };
          $scope.fieldOptions.StickyRulesSettings = angular.copy($scope.fieldOptions.RecurringRulesSettings)
          $scope.fieldOptions.StickyRulesSettings.selectName = $rootScope.translate('modals.campaigns.processor.advancedprocessorctrl.sticky-rules');
        }
        if (serverData.RegularProducts)
          $scope.fieldOptions.RegularProducts = serverData.RegularProducts;
      }

      if (serverData.RecurringRules && serverData.RecurringRules.length) {
        $scope.fields.RecurringRulesModel = _.map(serverData.RecurringRules, function (rule) {
          return {id: rule.ChargeID}
        })
      }
      if (serverData.StickyRules && serverData.StickyRules.length) {
        $scope.fields.StickyRulesModel = _.map(serverData.StickyRules, function (rule) {
          return {id: rule.ChargeID}
        })
      }

      $scope.ruleName = serverData.ProcessorName || '';

      if (serverData.AcceptedCards) {
        $scope.fields.cardTypeCheckboxValues[0].value = serverData.AcceptedCards.cbvisa;
        $scope.fields.cardTypeCheckboxValues[1].value = serverData.AcceptedCards.cbmastercard;
        $scope.fields.cardTypeCheckboxValues[2].value = serverData.AcceptedCards.cbamericanexpress;
        $scope.fields.cardTypeCheckboxValues[3].value = serverData.AcceptedCards.cbdiscover;
        $scope.fields.cardTypeCheckboxValues[4].value = serverData.AcceptedCards.cbmaestro;
      }

      if (serverData.CardsVolume) {
        $scope.fields.visaVolumeTxtValue = serverData.CardsVolume.VisaLimit;
        $scope.fields.msVolumeTxtValue = serverData.CardsVolume.MasterCardLimit;
        $scope.fields.aeVolumeTxtValue = serverData.CardsVolume.AmericanExpressLimit;
        $scope.fields.discVolumeTxtValue = serverData.CardsVolume.DiscoverLimit;
        $scope.fields.maeVolumeTxtValue = serverData.CardsVolume.MaestroLimit;
      }

      if (serverData.CardsAmount) {
        $scope.fields.visaAmountComboValue = {};
        $scope.fields.msAmountComboValue = {};
        $scope.fields.aeAmountComboValue = {};
        $scope.fields.discAmountComboValue = {};
        $scope.fields.maeAmountComboValue = {};

        $scope.fields.visaAmountComboValue.value1 = serverData.CardsAmount.VisaMin;
        $scope.fields.msAmountComboValue.value1 = serverData.CardsAmount.MasterCardMin;
        $scope.fields.aeAmountComboValue.value1 = serverData.CardsAmount.AmericanExpressMin;
        $scope.fields.discAmountComboValue.value1 = serverData.CardsAmount.DiscoverMin;
        $scope.fields.maeAmountComboValue.value1 = serverData.CardsAmount.MaestroMin;

        $scope.fields.visaAmountComboValue.value2 = serverData.CardsAmount.VisaMax;
        $scope.fields.msAmountComboValue.value2 = serverData.CardsAmount.MasterCardMax;
        $scope.fields.aeAmountComboValue.value2 = serverData.CardsAmount.AmericanExpressMax;
        $scope.fields.discAmountComboValue.value2 = serverData.CardsAmount.DiscoverMax;
        $scope.fields.maeAmountComboValue.value2 = serverData.CardsAmount.MaestroMax;
      }

      if (serverData.CardsCount) {
        $scope.fields.visaCountTxtValue = serverData.CardsCount.VisaMaxCount;
        $scope.fields.msCountTxtValue = serverData.CardsCount.MasterCardMaxCount;
        $scope.fields.aeCountTxtValue = serverData.CardsCount.AmericanExpressMaxCount;
        $scope.fields.discCountTxtValue = serverData.CardsCount.DiscoverMaxCount;
        $scope.fields.maeCountTxtValue = serverData.CardsCount.MaestroMaxCount;
      }

      $scope.$watch("fields",
        function (newValue, oldValue) {
          //console.log( 'fields: ', $scope.fields );
          if (newValue.cardTypeCheckboxValues && newValue.cardTypeCheckboxValues.length) {
            for (var i = 0; i < newValue.cardTypeCheckboxValues.length; i++) {
              var obj = newValue.cardTypeCheckboxValues[i];
              $scope.activeCardTypes[obj.id] = obj.value;
            }
          }
        },
        true
      );

      $scope.save = function (addMdfForm) {
        $scope.$broadcast('show-errors-check-validity');
        if ($scope.addMdfForm.$invalid || addMdfForm.$invalid) {
          $scope.saved = false;
          return false;
        }

        var saveObj = {
          "AdvancedRuleID": data.productsLevelAdvancedRuleID,
          "AcceptedCards": {
            "cbvisa": $scope.fields.cardTypeCheckboxValues[0].value || false,
            "cbmastercard": $scope.fields.cardTypeCheckboxValues[1].value || false,
            "cbamericanexpress": $scope.fields.cardTypeCheckboxValues[2].value || false,
            "cbdiscover": $scope.fields.cardTypeCheckboxValues[3].value || false,
            "cbmaestro": $scope.fields.cardTypeCheckboxValues[4].value || false
          },
          "VisaLimit": $scope.fields.visaVolumeTxtValue || 0,
          "MasterCardLimit": $scope.fields.msVolumeTxtValue || 0,
          "AmericanExpressLimit": $scope.fields.aeVolumeTxtValue || 0,
          "DiscoverLimit": $scope.fields.discVolumeTxtValue || 0,
          "MaestroLimit": $scope.fields.maeVolumeTxtValue || 0,

          "VisaMin": $scope.fields.visaAmountComboValue.value1 || 0,
          "VisaMax": $scope.fields.visaAmountComboValue.value2 || 0,
          "MasterCardMin": $scope.fields.msAmountComboValue.value1 || 0,
          "MasterCardMax": $scope.fields.msAmountComboValue.value2 || 0,
          "AmericanExpressMin": $scope.fields.aeAmountComboValue.value1 || 0,
          "AmericanExpressMax": $scope.fields.aeAmountComboValue.value2 || 0,
          "DiscoverMin": $scope.fields.discAmountComboValue.value1 || 0,
          "DiscoverMax": $scope.fields.discAmountComboValue.value2 || 0,
          "MaestroMin": $scope.fields.maeAmountComboValue.value1 || 0,
          "MaestroMax": $scope.fields.maeAmountComboValue.value2 || 0,

          "VisaMaxCount": $scope.fields.visaCountTxtValue,
          "MasterCardMaxCount": $scope.fields.msCountTxtValue,
          "AmericanExpressMaxCount": $scope.fields.aeCountTxtValue,
          "DiscoverMaxCount": $scope.fields.discCountTxtValue,
          "MaestroMaxCount": $scope.fields.maeCountTxtValue,
          "RecurringCharges": _.map($scope.fields.RecurringRulesModel, function (rRule) {
            return rRule.id
          }) || []
        };

        saveObj.StickyRules = {};
        _.each($scope.stickyTable, function(st){
            saveObj.StickyRules[st.ChargeID] = st.RegularChargeID || null;
        })

        $scope.saving = true;
        var serverAction = 'advancedrule/';
        var server = DataStorage.processorAnyApi(serverAction).post(saveObj).$promise;
        server.then(
          function (result) {
            $scope.saving = false;
            if (result && !result.Status)
              Notification.success({message: $rootScope.translate('modals.campaigns.processor.advancedprocessorctrl.rule-has-been-successfully-modified'), delay: 5000})
            close(result, 500);
            return false;
          },
          function (error) {
            $scope.saving = false;
            console.log('save advanced rule error', error);
            close(false, 500);
            return false;
          }
        );
      };

      // when you need to close the modal, call close
      $scope.close = function (result) {
        close(result, 500); // close, but give 500ms for bootstrap to animate
      };
    }
    setData(data)
  });
