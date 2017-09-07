'use strict';

angular.module('crm')
  .controller('CustomerCtrl',
  function ($scope, $state, resolvedCustomer, CustomerSetup, ModalService, DataStorage, GlobalVars, Notification,
            $stateParams, ScrollService, DataProcessing, $filter) {

    if (!resolvedCustomer.Customer){
      if (resolvedCustomer.Status>1)
        $state.go('main.search');
      return
    }
    $scope.dataReady = true;
    $scope.showAddTransactionSuccess = false;
    $scope.refundResponse = false;
    // $scope.refundPossible = false;
    $scope.customerDetails = resolvedCustomer.Customer || {};
    $scope.customerDetails.DateCreated = $scope.customerDetails.DateCreated * 1000;
    $scope.customerDetails.DateModified = $scope.customerDetails.DateModified * 1000;
    $scope.fields = {
      refundAmountTxtValue: "0.00"
    };
    $scope.customerDetailsShown = $stateParams.openForm;
    $scope.transactionsSafe = _.map(angular.copy($scope.customerDetails.Transactions) || [], function(tr) {
      tr.Balance = tr.Balance.toFixed(2);
      tr.Total = tr.Total.toFixed(2);
      tr.processor_id = tr.processor_id || "‒";
      return tr;
    });

    $scope.allCharges = [];
    _.map($scope.transactionsSafe, function(tr){
      $scope.allCharges = $scope.allCharges.concat(tr.Charges)
    });

    $scope.recurringTransactions = $scope.customerDetails.RecurringTransactions;
    $scope.mdfs = $scope.customerDetails.MDFs || [];
    $scope.fieldOptions = CustomerSetup.transactionFieldOptions();

    $scope.fields.chargeback = $scope.customerDetails.IsSubmittedChargeback;
    $scope.fields.fraudulent = $scope.customerDetails.IsFradulent;
    $scope.fields.test = $scope.customerDetails.IsTest;

    $scope.remarks = $scope.customerDetails.CustomerLog;
    $scope.remarksRaw = $scope.remarks;

    //if ($stateParams.openForm)
    ScrollService.scrollTo('top');

    var fetch = function(){
      DataStorage.customerApi($stateParams.cuid).query(function(res){
        if (res.Customer && res.Customer.Transactions){
          DataProcessing.updateSafeArr(res.Customer.Transactions, $scope.transactionsSafe, 'TransactionResponseID');

          $scope.transactionsSafe = _.map(angular.copy($scope.transactionsSafe) || [], function(tr) {
            tr.Balance = tr.Balance.toFixed(2);
            tr.Total = tr.Total.toFixed(2);
            return tr;
          });
        }
      })
    };

    $scope.$watchCollection( "fields",
      function( newValue, oldValue ) {
        if (
          newValue.chargeback !== oldValue.chargeback ||
          newValue.fraudulent !== oldValue.fraudulent ||
          newValue.test !== oldValue.test
        ) {
          var saveObj = {
            CustomerGuid: $scope.customerDetails.CustomerGuid,
            IsTest: newValue.test,
            IsFradulent: newValue.fraudulent,
            IsSubmitChargeback: newValue.chargeback
          };
          var saveCustomer = DataStorage.customerStatusApi().post(saveObj).$promise;
          saveCustomer.then(
            function (data) {
              $scope.showSuccess = true;
            },
            function (error) {
              $scope.showError = true;
            }
          );
        }
      }
    );

    $scope.customerInfoBlock = ['IpAddress', 'PurchaseUrl', 'ClientID', 'ClientName', 'SiteID', 'ProductName',
      'AffiliateID', 'SubAffiliateID', 'RebillsActive'];
    $scope.contactInfoBlock = ['FirstName','LastName', 'Email', 'Phone'];

    $scope.splitUppercase = function(input){
      if (!input) return '-';
      var i = input.match(/[A-Z]*[^A-Z]+/g).join(' ').toUpperCase();
      var mapObj = {
        'COUNTRY NAME':'COUNTRY',
        'BANK ACCOUNT NUMBER': ' BANK NUMBER',
        'BANK ACCOUNT TYPE': ' BANK TYPE',
        'BANK HOLDER TYPE': ' BANK HOLDER',
        'BANK NAME ON ACCOUNT': ' BANK NAME',
        'BANK ROUTING NUMBER': ' ROUTING NUMBER',
        'CCNUMBER': ' CC NUMBER',
        'ADDRESS1': ' ADDRESS 1',
        'ADDRESS2': ' ADDRESS 2',
        'PURCHASE URL': ' PURCHASE',
        'PRODUCT NAME': ' PRODUCT',
        'REBILLS ACTIVE': ' REBILLS',
        'CLIENT NAME': ' CLIENT'
      };

      var re = new RegExp(Object.keys(mapObj).join("|"),"gi");

      return i.replace(re, function(matched){
        return mapObj[matched];
      });
    };

    $scope.addRemark = function () {
      if (!$scope.fields || !$scope.fields.message) return;
      $scope.remarksRaw.push({
        rmid: $scope.remarksRaw.length+1,
        DateEntered: moment().unix(),
        User: GlobalVars.commonObject().Username,
        Log: $scope.fields.message
      });

      var saveObj = {
        CustomerGuid: $scope.customerDetails.CustomerGuid,
        Remark: $scope.fields.message
      };
      $scope.showAddTransactionSuccess = false;
      var save = DataStorage.customerAddRemark().post(saveObj).$promise;
      save.then(
        function (data) {
          if (data && !data.Status) $scope.fields.message = ''
        },
        function (error) {
        }
      );
    };

    $scope.editCustomer = function (cuid) {
      $state.go('main.editcustomer', {cuid: cuid});
    };

    $scope.expandRow = function (row, expand) {
      if (row.TransactionType !== 'sale' && row.TransactionType !== 'capture')
        return;

      row.expanded = expand;
    };

    $scope.addTransaction = function (trid) {
      $scope.showAddTransactionSuccess = false;
      ModalService.showModal({
        templateUrl: "components/modals/CRM/customer/addNewTransaction.html",
        controller: "AddNewTransactionCtrl",
        inputs: {
          data: {
            groupsWithCharges: resolvedCustomer.Customer.GroupsWithCharges,
            CustomerGuid: $scope.customerDetails.CustomerGuid,
            modalTitle: 'Add New Transaction'
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (resp) {
          if (!resp) return;
          if (resp.Status){
            return
          }
          if (resp.Response)
            $scope.newTransactionResponse = 'Gateway Response: ' + resp.Response;
          $scope.showAddTransactionSuccess = true;
          fetch()
        });
      });
    };

    $scope.closeNotice = function () {
      $scope.showAddTransactionSuccess = false;
      $scope.showRefundSuccess = false;
      $scope.showRefundError = false;
      $scope.refundResponse = false;
    };

    $scope.cbTransaction = function (trid) {
      $state.go('main.addnewchargeback', { transactionId : trid});
    };

    var allCharges = [];
    _.map(resolvedCustomer.Customer.GroupsWithCharges, function(gwCh){
      allCharges = allCharges.concat(gwCh.Charges)
    });

    $scope.submitRefund = function (refundForm) {
      $scope.submittedRefund = true;
      $scope.refundResponse = false;

      if (refundForm.$invalid) 
        return;

      var transactionResponseID = 0;
      $scope.transactionsSafe.map(function (tran) {
        if (tran.active)
          transactionResponseID = tran.TransactionResponseID;
      });

      var saveObj = {
        CustomerGuid: $scope.customerDetails.CustomerGuid,
        Amount: parseFloat($scope.fields.refundAmountTxtValue),
        Type: $scope.fields.refundTypeRLValue ? $scope.fields.refundTypeRLValue.id : 0,
        TransactionResponseID: transactionResponseID
      };

      $scope.showRefundSuccess = false;
      $scope.showRefundError = false;

      var save = DataStorage.customerRefundApi().post(saveObj).$promise;
      $scope.submittingRefund = true;
      save.then (
        function (data) {
          $scope.submittingRefund = false;
          $scope.submittedRefund = false;
          if (data.Status) {
            $scope.showRefundError = true;
            return false;
          }
          fetch();
          if (data.RefundResponse) {
            $scope.refundResponse = data.RefundResponse;

            if ($scope.refundResponse.ResponseCode === '1')
              $scope.refundResponse.ResponseText = 'Transaction has been successfully refunded';
          }
          $scope.showRefundSuccess = true;
        },
        function (error) {
          $scope.showRefundError = true;
        }
      );
      return false;
    };
    
    $scope.isTranCbDisabled = false;
    $scope.toggleActiveTransaction = function(row){
      if (row.IsChargeBack || row.transactionid === 0 || row.ProcessingStatus !== 'Success' || row.Balance === 0)
        return;
      
      if ($scope.isTranCbDisabled && !row.active)
        return;
        
      if (row.TransactionType !== 'sale' && row.TransactionType !== 'capture')
        return;

      if (!row.active){
        $scope.isTranCbDisabled = true;
        angular.forEach($scope.transactionsSafe, function(tr){
          tr.active = false;
        });
        row.active = true;
        $scope.fields.refundAmountTxtValue = row.Balance;
      } else {
        $scope.fields.refundAmountTxtValue = "0.00";
        row.active = false;
        $scope.isTranCbDisabled = false;
      }

      angular.forEach(row.Charges, function(c){
        c.active = row.active;
      });
    };
    
    $scope.toggleActiveCharge = function(row, charge){
      if (row.IsChargeBack || row.transactionid === 0 || row.ProcessingStatus !== 'Success' || row.Balance === 0)
        return;
      
      if ($scope.isTranCbDisabled && !row.active)
        return;
      
      if (!charge.active) {
        $scope.isTranCbDisabled = true;
        row.active = true;
        charge.active = true;
      } else {
        charge.active = false;
        
        var isAnyActiveCharges = false;
        angular.forEach(row.Charges, function(c){
          if (c.active) {
            isAnyActiveCharges = true;
          }
        });
        
        if (!isAnyActiveCharges)
          $scope.isTranCbDisabled = false;
          
        row.active = isAnyActiveCharges;
      }
      
      var refundAmount = 0;
      angular.forEach(row.Charges, function(c){
        if (c.active) {
          refundAmount += c.TotalAmount;
        }
        $scope.fields.refundAmountTxtValue = refundAmount.toFixed(2);
      });
    };

    $scope.addRecurringTransaction = function () {
      $state.go('main.addcustomerrecurring', { cuid: $scope.customerDetails.CustomerGuid });
    };

    $scope.editRecurringTransaction = function (trid) {
      $state.go('main.editcustomerrecurring', { cuid: $scope.customerDetails.CustomerGuid, intervalid: trid });
    };

    $scope.deleteRecurringTransaction = function (row) {
      var saveObj = {
        CustomerGuid: $scope.customerDetails.CustomerGuid,
        CustomerProductIntervalID: row.CustomerProductIntervalID
      };
      var save = DataStorage.customerDeactivateInterval().post(saveObj).$promise;
      save.then (
        function (data) {
          if (data.Status) {
            return false;
          }
          row.IsActive = false;
          Notification.warning({message: "Transaction "+row.Name+" deactivated", delay: 5000})
        },
        function (error) {
          $scope.showRefundError = true;
        }
      );

    };

    $scope.showInfo = function (topic) {
    };

    $scope.commonObject = GlobalVars.commonObject;

    $scope.showRmaError = function(transactionid){
      DataStorage.anyApiMethod('/customer/rma/add/'+transactionid).post({}, function(resp){
        if (resp && !resp.Status){
          ModalService.showModal({
            templateUrl: "components/modals/COMMON/sure.html",
            controller: "DataModalCtrl",
            inputs: {
              data: {
                panelSuccessClass: true,
                modalTitle: 'Server Response',
                modalHtml: '<h4>Response: ' + resp.Response + '</h4> <h4>RMA Number: ' + resp.RmaNumber + '</h4>'
              }
            }
          }).then(function (modal) {
            modal.element.modal();
            modal.close.then(function (result){});
          });
        }
      })
    }
  }).filter('getKeys', function() {
    return function(object) {
      var array = [];
      for (var item in object) {
        array.push(item);
      }
      return array;
    }
  });

