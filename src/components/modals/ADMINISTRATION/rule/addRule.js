'use strict';
angular.module('crm')
  .controller('AddRuleModalCtrl',function($scope, data, close, DataStorage, 
    $timeout, $filter, Notification, $rootScope) {
    
    $scope.data = data;
    $scope.selectedProcessors = data.selectedProcessors || [];
    $scope.isEdit = data.isEdit || false;
    
    if (data.rules){
      $scope.rules = data.rules
      $scope.selectedProcessors = data.processors.filter(function(processor) {
        var rule = data.rules.filter(function (rule) {
          return rule.ProcessorID == processor.ProcessorID;
        })
        if (rule.length == 1){
          processor.percentage = rule[0].LoadPercentage;
          processor.ruleid = rule[0].ProcessorsAdvancedRuleID;
          return true;
        }
        return false;
      });
    }

    var dataWasChanged=false;

    $scope.toggleProcessor = function(processor){
      if (!processor.IsActive) 
        return
        
      var n;
      angular.forEach($scope.selectedProcessors, function(el, nt){
        if (el.ProcessorID == processor.ProcessorID) n = nt
      });
      
      if (n || n == 0) 
        $scope.selectedProcessors.splice(n, 1)
      else 
        $scope.selectedProcessors.push(processor)
        
      $scope.selectedProcessorsSafe = angular.copy($scope.selectedProcessors)
    };

    $scope.$watch('selectedProcessors', function(){
      $scope.commonPerc = 0;
      angular.forEach($scope.selectedProcessors, function(processor){
        if (processor.percentage) 
          $scope.commonPerc += parseInt(processor.percentage)
      })
    }, true);

    // Probably not used
    $scope.save = function(){
      if ($scope.commonPerc != 100) 
        return;
        
      var reqObj = {
        Charges: _.map(data.charges, function(charge){return charge.ChargeId}),
        ProcessorsLoads: {}
      };
      
      angular.forEach($scope.selectedProcessors, function(processor){
        if (processor.percentage)
          reqObj.ProcessorsLoads[processor.ProcessorID] = processor.percentage;
      })
      
      $scope.saving = true;
      DataStorage.anyApiMethod('/processors/addproductrules').post(reqObj, function(resp){
        $scope.saving = false;
        dataWasChanged = true
        if (resp && resp.RulesIDs){
          $scope.showSuccess = true;
          $timeout(function(){
            $scope.showSuccess = false
          }, 5000);
          $scope.rules = resp.RulesIDs
        }
      })

    };

    $scope.editRule = function() {
      if ($scope.commonPerc != 100 || $scope.saving) 
        return;
        
      var saveObj = {
        Charges: _.map(data.charges, function(charge){return charge.ChargeID}),
        NewRuleLoads: [],
        ExistingRuleLoads: []
      };
      
      angular.forEach($scope.selectedProcessors, function(processor){
        if (processor.ruleid)
          saveObj.ExistingRuleLoads.push({ LoadPercentage: processor.percentage, AdvancedRuleID: processor.ruleid });
        else
          saveObj.NewRuleLoads.push({ LoadPercentage: processor.percentage, ProcessorID: processor.ProcessorID });
      })
      
      $scope.saving = true;

      DataStorage.merchantsAnyApi("lb/edit").post(saveObj, function(result){
        dataWasChanged = true;
        //$scope.saving = false;
        
        if (result.Status) {
          //Notification.error({message: result.ErrorMessage[0], delay: 5000})
        } else {
          Notification.success({message: $rootScope.translate('administration.merchants.merchants.controller.advanced-rules-have-been-modified'), delay: 5000});

          if (result && result.RulesIDs){
            $scope.rules = $scope.rules.concat(result.RulesIDs)
          }
          
          $scope.close();
        }
      });
    }

    $scope.close = function() {
      angular.forEach(data.processors, function(p){
        delete p.percentage;
        delete p.ruleid;
      });

      close(dataWasChanged);
    };
  });
