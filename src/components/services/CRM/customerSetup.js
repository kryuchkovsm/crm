/**
 * Created by user on 03.04.15.
 */

'use strict';

angular.module('CustomerSetupService', [])
  .factory('CustomerSetup',
  function($filter, ClientSetup, ModalService, $rootScope) {

    var expireComboOptions = {};

    var transactionFieldOptions = function () {
      var resultObj = {};
      resultObj.refundTypeRLOptions = {
        label: $rootScope.translate('services.crm.customersetup.refund-type'),
        wide: true,
        data: [
          {"id":0, "name":$rootScope.translate('services.crm.customersetup.auto'), "checked": "checked"},
          {"id":2, "name":$rootScope.translate('services.crm.customersetup.void')},
          {"id":1, "name":$rootScope.translate('services.crm.customersetup.refund')}
        ]
      };
      resultObj.refundAmountTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.refund-amount')+':',
        id: 1,
        type: 'number',
        valNumber: true,
        valRequired: true
      };
      return resultObj;
    };

    var customerFieldOptions = function (details) {
      var resultObj = ClientSetup.clientEditFormFields();
      angular.extend(resultObj, ClientSetup.clientEditDetailsFormFields());
      delete resultObj.phoneTxtOptions.valRequired
      delete resultObj.zipTxtOptions.valRequired
      resultObj.zipTxtOptions.disAllowNegative = true

      if (details) {

        resultObj.bankAccountTypeSelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.bank-account-type')+':',
          data: details.AccountType,
          valRequired: true
        };
        resultObj.bankHolderTypeSelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.bank-holder-type')+':',
          data: details.HolderType,
          valRequired: true
        };

        resultObj.paymentTypeSelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.payment-type')+':',
          data: details.PaymentTypes,
          id: 214
        };
        resultObj.cardTypeSelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.card-type')+':',
          data: details.CardTypes,
          id: 215
        };
        resultObj.countrySelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.country')+':',
          data: details.Countries,
          valRequired: true,
          id: 214
        };
        resultObj.countryBillingSelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.country')+':',
          data: details.Countries,
          id: 2144
        };
        expireComboOptions = resultObj.expireComboOptions = {
          label: $rootScope.translate('services.crm.customersetup.expiration-date')+':',
          doubleSelect: true,
          select1Options: (function () {
            var result = [];
            for (var i = 0; i < details.ExpMonths.length; i++) {
              var name = details.ExpMonths[i];
              result.push({id: i, name: name});
            }
            return result;
          })(),
          select2Options: (function () {
            var result = [];
            for (var i = 0; i < details.ExpYears.length; i++) {
              var name = details.ExpYears[i];
              result.push({id: i, name: name});
            }
            return result;
          })()
        };
      } else {
        resultObj.countryBillingSelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.country')+':',
          data: [
            {"id":0,"name":"USA"},
            {"id":1,"name":"Russia"},
            {"id":2,"name":"China"},
            {"id":3,"name":"Germany"},
            {"id":4,"name":"UK"}
          ],
          id: 2144
        };

        resultObj.paymentTypeSelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.payment-type')+':',
          data: [
            {"id":4,"name":"Credit Card"},
            {"id":5,"name":"Bank Account"},
            {"id":6,"name":"PayPal"},
            {"id":7,"name":"2CO"},
            {"id":8,"name":"Skrill"}
          ],
          id: 214
        };
        resultObj.cardTypeSelectOptions = {
          label: $rootScope.translate('services.crm.customersetup.card-type')+':',
          data: [
            {"id":9,"name":"VISA"},
            {"id":10,"name":"MASTERCARD"},
            {"id":11,"name":"MAESTRO"}
          ],
          id: 215
        };
      }
      resultObj.phoneNumTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.phone-number')+':',
        id: 1,
        //placeholder: 'xxx-xxx-xxxx',
        type: 'text',
        valNumber: true,
        valRequired: true,
        maxlength: 13,
      };
      resultObj.bankAccountNumberTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.bank-account-number')+':',
        type: 'text',
        valNumber: true,
        valRequired: true
      };
      resultObj.bankRoutingNumberTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.bank-routing-number')+':',
        type: 'text',
        valNumber: true,
        valRequired: true
      };
      resultObj.bankNameOnAccountTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.bank-name-on-account')+':',
        type: 'text',
        valRequired: true
      };
      resultObj.creditCardNumberTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.credit-card-number')+':',
        id: 303,
        type: 'text',
        //valNumber: true,
        valRequired: true,
        valCardNumber: true
      };
      resultObj.nameOnCardTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.name-on-card')+':',
        id: 305,
        valRequired: true
      };
      resultObj.affiliateIdTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.affiliate-id')+':',
        id: 1
      };
      resultObj.subAffiliateIdTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.sub-affiliate-id')+':',
        id: 1
      };
      resultObj.cvvCodeTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.cvv')+':',
        id: 303,
        type: 'text',
        valNumber: true,
        valRequired: true,
        disAllowNegative: true,
        maxlength: 4
      };
      resultObj.cvvCodeTxtOptionsNotRequired = {
        label: $rootScope.translate('services.crm.customersetup.cvv')+':',
        id: 303,
        type: 'text',
        valNumber: true,
        disAllowNegative: true,
        maxlength: 4
      };
      resultObj.transactionIdTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.transaction-id')+':',
        id: 1
      };
      resultObj.customerIdTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.customer-id')+':',
        id: 1
      };
      // lead type radio list
      resultObj.typeRLOptions = {
        label: $rootScope.translate('services.crm.customersetup.type')+':',
        labelInline: true,
        data: [{"id":1,"name":"lead"},{"id":2,"name":"customer", "checked": "checked"}]
      };
      resultObj.lastnameShippingAddressTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.last-name')+':',
        id: 2023
      }
      resultObj.firstnameShippingAddressTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.first-name')+':',

        id: 2023
      }
      resultObj.firstnameBillingTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.first-name')+':',
        valRequired: true,
        id: 2024
      }
      resultObj.lastnameBillingTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.last-name')+':',
        valRequired: true,
        id: 2034
      };
      resultObj.address1BillingTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.address-1')+':',
        id: 204
      };
      resultObj.address2BillingTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.address-2')+':',
        id: 2084,
        //valRequired: true
      };
      resultObj.cityBillingTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.city')+':',
        id: 2064
      };
      resultObj.stateBillingTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.state')+':',
        id: 2094
      };
      resultObj.zipBillingTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.zip')+':',
        id: 2104,
        type: 'text',
        valZip: true,
        //valRequired: true,
        maxlength: 9
      };
      return resultObj;
    };

    var customerRecurringFieldOptions = function (recurring) {
      var resultObj = {};
      resultObj.chargeSelectOptions = {
        label: $rootScope.translate('services.crm.customersetup.charge')+':',
        data: recurring.Charges,
        valRequired: true,
        id: 214
      };
      resultObj.retryTimeframeComboOptions = {
        label: $rootScope.translate('services.crm.customersetup.retry-timeframe')+':',
        number: true,
        select: true,
        placeholder: '0',
        data: [
          {"id":61,"name":$rootScope.translate('services.crm.customersetup.days')},
          {"id":62,"name":$rootScope.translate('services.crm.customersetup.months')},
          {"id":63,"name":$rootScope.translate('services.crm.customersetup.years')}
        ]
      };
      resultObj.nextChargeDueDateOptions = {
        label: $rootScope.translate('services.crm.customersetup.next-charge-due-date')+':',
        valRequired: true,
        id: 304
      };
      resultObj.retryChargeDueDateOptions = {
        label: $rootScope.translate('services.crm.customersetup.retry-charge-due-date')+':',
        disabled: true,
        id: 3045
      };
      resultObj.amountTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.amount')+':',
        //placeholder: '40.67',
        id: 303,
        type: 'number',
        valNumber: true,
        valRequired: true,
        disAllowNegative: true
        //disabled: true
      };
      resultObj.chargeCountTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.charge-count')+':',
        id: 305,
        type: 'number'
      };
      resultObj.totalChargesToRunTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.total-charges-to-run')+':',
        id: 306,
        tip: '(enter 0 if charges are to run indefinitely)',
        placeholder: '0',
        type: 'number',
        valNumber: true,
        disAllowNegative: true
      };
      resultObj.activeCheckboxOptions = {
        inline: 'column',
        class: 'weight-bold form-control search-box gray-bg',
        data: [
          {"id":320,"name":"ACTIVE?"}
        ]
      };
      resultObj.subsequentChargeIntervealComboOptions = {
        label: $rootScope.translate('services.crm.customersetup.subsequent-charge-interveal')+':',
        number: true,
        select: true,
        placeholder: '0',
        data: [
          {"id":61,"name":$rootScope.translate('services.crm.customersetup.days')},
          {"id":62,"name":$rootScope.translate('services.crm.customersetup.months')},
          {"id":63,"name":$rootScope.translate('services.crm.customersetup.years')}
        ]
      };
      resultObj.retryAtemptIntervealComboOptions = {
        label: $rootScope.translate('services.crm.customersetup.retry-attempt-interveal')+':',
        number: true,
        placeholder: '0',
        button: true,
        data: {"id":4, "icon": "fa-rotate-left", "name": $rootScope.translate('services.crm.customersetup.reset'), "class": "CancelColor"}
      };
      resultObj.retryAmountTxtOptions = {
        label: $rootScope.translate('services.crm.customersetup.retry-amount')+':',
        //id: 305,
        placeholder: '0',
        type: 'number',
        valNumber: true
      };

      return resultObj;
    };

    function isNumeric(n) {
      return !isNaN(parseFloat(n)) && isFinite(n);
    }

    var setFieldValues = function (details) {
      var resultObj = {},
        paymentTypeObj = $filter('filter')(details.PaymentTypes, {id: details.PaymentInformation.PaymentType}, true)[0],
        cardTypeObj = $filter('filter')(details.CardTypes, {id: details.PaymentInformation.CardType}, true)[0],
        countryShippingObj = $filter('filter')(details.Countries, {id: details.ShippingAddress.CountryID}, true)[0],
        countryBillingObj = $filter('filter')(details.Countries, {id: details.BillingAddress.CountryID}, true)[0],
        expireMonthObj =  $filter('filter')(expireComboOptions.select1Options, {name: details.PaymentInformation.ExpMonth}, true)[0],
        expireYearObj =  $filter('filter')(expireComboOptions.select2Options, {name: parseInt(details.PaymentInformation.ExpYear)}, true)[0];
      resultObj.emailTxtValue = details.Email;
      resultObj.phoneTxtValue = isNumeric(details.Phone) ? parseInt(details.Phone) : null;
      resultObj.paymentTypeSelectValue = paymentTypeObj;
      resultObj.cardTypeSelectValue = cardTypeObj;
      // make double select exp month + year
      resultObj.expireComboValue = {};
      resultObj.expireComboValue.select1Value = expireMonthObj;
      resultObj.expireComboValue.select2Value = expireYearObj;

      resultObj.creditCardNumberTxtValue = details.PaymentInformation.CCNumber ? '*********' + parseInt(details.PaymentInformation.CCNumber) : '';
      resultObj.nameOnCardTxtValue = details.PaymentInformation.NameOnCard;

      resultObj.bankAccountNumberValue = details.PaymentInformation.BankAccountNumber;
      resultObj.bankRoutingNumberValue = details.PaymentInformation.BankRoutingNumber;
      resultObj.bankNameOnAccountValue = details.PaymentInformation.BankNameOnAccount;
      resultObj.bankAccountTypeValue = $filter('filter')(details.AccountType, {id: details.PaymentInformation.BankAccountType}, true)[0];
      //details.PaymentInformation.BankAccountType;
      resultObj.bankHolderTypeValue = $filter('filter')(details.HolderType, {id: details.PaymentInformation.BankHolderType}, true)[0];
      //details.PaymentInformation.BankHolderType;

      resultObj.firstnameShippingAddressTxtValue = details.ShippingAddress.FirstName;
      resultObj.lastnameShippingAddressTxtValue = details.ShippingAddress.LastName;
      resultObj.address1TxtValue = details.ShippingAddress.Address1;
      resultObj.address2TxtValue = details.ShippingAddress.Address2;
      resultObj.cityTxtValue = details.ShippingAddress.City;
      resultObj.stateTxtValue = details.ShippingAddress.State;
      if (details.ShippingAddress.ZipCode)
        resultObj.zipTxtValue = parseInt(details.ShippingAddress.ZipCode);
      resultObj.countrySelectValue = countryShippingObj;

      resultObj.firstnameBillingTxtValue = details.BillingAddress.FirstName;
      resultObj.lastnameBillingTxtValue = details.BillingAddress.LastName;
      resultObj.address1BillingTxtValue = details.BillingAddress.Address1;
      resultObj.address2BillingTxtValue = details.BillingAddress.Address2;
      resultObj.countryBillingSelectValue = countryBillingObj;
      resultObj.cityBillingTxtValue = details.BillingAddress.City;
      resultObj.stateBillingTxtValue = details.BillingAddress.State;
      if (details.BillingAddress.ZipCode)
        resultObj.zipBillingTxtValue = parseInt(details.BillingAddress.ZipCode);

      return resultObj;
    };

    var makeSaveObject = function (fields) {
      var resultObj = {
          "FirstName": fields.firstnameTxtValue,
          "LastName": fields.lastnameTxtValue,
          "Email": fields.emailTxtValue,
          "Phone": fields.phoneTxtValue ? '' + fields.phoneTxtValue : '',
          "ShippingAddress": {
            "FirstName": fields.firstnameShippingAddressTxtValue,
            "LastName": fields.lastnameShippingAddressTxtValue,
            "Address1": fields.address1TxtValue,
            "Address2": fields.address2TxtValue,
            "City": fields.cityTxtValue,
            "State": fields.stateTxtValue,
            "CountryID": fields.countrySelectValue && fields.countrySelectValue.id ? '' + fields.countrySelectValue.id : '',
            "ZipCode": fields.zipTxtValue
          },
          "BillingAddress": {
            "Firstname": fields.firstnameBillingTxtValue,
            "Lastname": fields.lastnameBillingTxtValue,
            "Address1": fields.address1BillingTxtValue,
            "Address2": fields.address2BillingTxtValue,
            "City": fields.cityBillingTxtValue,
            "CountryID": fields.countryBillingSelectValue && fields.countryBillingSelectValue.id ? '' + fields.countryBillingSelectValue.id : '',
            "State": fields.stateBillingTxtValue,
            "ZipCode": fields.zipBillingTxtValue
          }
      };

      if (fields.paymentTypeSelectValue && fields.paymentTypeSelectValue.id == 4){
        resultObj.PaymentInformation = {
          "BankAccountNumber": fields.bankAccountNumberValue,
          "BankRoutingNumber": fields.bankRoutingNumberValue,
          "BankNameOnAccount": fields.bankNameOnAccountValue,
          "BankAccountType": fields.bankAccountTypeValue && fields.bankAccountTypeValue.id ? fields.bankAccountTypeValue.id : '',
          "BankHolderType": fields.bankHolderTypeValue && fields.bankHolderTypeValue.id ? fields.bankHolderTypeValue.id : '',
        }
      }else{
        resultObj.PaymentInformation = {
          "ExpMonth": fields.expireComboValue.select1Value && fields.expireComboValue.select1Value.name ? '' + fields.expireComboValue.select1Value.name : '',
          "ExpYear": fields.expireComboValue.select2Value && fields.expireComboValue.select2Value.name ? '' + fields.expireComboValue.select2Value.name : '',
          "CCNumber": fields.creditCardNumberTxtValue ? '' + fields.creditCardNumberTxtValue : '',
          "NameOnCard": fields.nameOnCardTxtValue,
          "CVV": fields.cvvTxtValue,
        }

      }

      if (fields.paymentTypeSelectValue && fields.paymentTypeSelectValue.id)
        resultObj.PaymentInformation.PaymentType = fields.paymentTypeSelectValue.id
      if (fields.cardTypeSelectValue && fields.cardTypeSelectValue.id)
        resultObj.PaymentInformation.CardType = fields.cardTypeSelectValue.id


      return resultObj;
    };

    // Return directly only functions and constants (whiteLabel), other things through function(){return {val: someobject};}
    return {
      transactionFieldOptions: transactionFieldOptions,
      customerFieldOptions: customerFieldOptions,
      customerRecurringFieldOptions: customerRecurringFieldOptions,
      setFieldValues: setFieldValues,
      makeSaveObject: makeSaveObject
    };
  });
