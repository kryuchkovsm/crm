/**
 * Created by user on 04.03.15.
 */
'use strict';
function isEmpty(value) {
  return angular.isUndefined(value) || value === '' || value === null || value !== value;
}

angular.module('text-input-directive', [])
  .directive('equals', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, elem, attrs, ngModel) {

        if(!ngModel) return;

        scope.$watch(attrs.ngModel, function() {
          validate();
        });

        attrs.$observe('equals', function () {
          validate();
        });

        var validate = function() {
          // values
          if (attrs.equals){
            var val1 = ngModel.$viewValue;
            var val2 = attrs.equals;
            ngModel.$setValidity('equals', val1 === val2);
          }
        };
      }
    };
  })

  .directive('crmTextInput', function ($timeout) {
  return {
    // Controller $ngModelCtrl should be taken from parent (^) form element ng-model directive to see form state, if take from itself - it will be div state (always empty)
    require: '?^ngModel',
    restrict: 'A',
    scope: {
      options: '=',
      value: '=',
      ccType: '='
    },
    templateUrl: 'components/directives/COMMON/textInput/textInputTpl.html',
    link: function ($scope, $element, $attrs, $ngModelCtrl) {
      if ($scope.options.type == 'number' && typeof $scope.value == 'string')
        $scope.value = $scope.value && parseInt($scope.value)? parseInt($scope.value) : '';
      $timeout(function(){
        if (!$ngModelCtrl) return;
        var inputEl = {};
        $scope.options = $scope.options || {};
        $scope.name = $scope.options.label ? $scope.options.label.replace(/\W/g, '') + $scope.options.id : '';
        $scope.options.label = $scope.options.label || 'Input Label';
        var $input = $element.find('input');
        if ($scope.options.mask)
          $input.attr('mask',$scope.options.mask)
        $scope.error = {};

        if ($scope.options.type=='url')
          $scope.patternVal = /^((?:http|ftp)s?:\/\/)(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+(?:[A-Z]{2,6}\.?|[A-Z0-9-]{2,}\.?)|localhost|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})(?::\d+)?(?:\/?|[\/?]\S+)$/i
        else if ($scope.options.alphanumeric)
          $scope.patternVal = /^[a-zA-Z0-9]*$/;

        if (!$scope.options.valMin){
          if ($scope.options.disAllowNegative)
            $scope.options.valMin =  0;
          else if (!$scope.options.valMin)
            $scope.options.valMin = false;
        }
        if ($scope.options.type == 'number')
          $($input).keypress(function(event) {
            if (event.which == 101) event.preventDefault();
          });

        $scope.$on('show-errors-check-validity', function(event, name) {
          if (angular.isUndefined(name) || angular.element($element).parents('form').attr('name') === name){
            $scope.options.showError = true;
          }
        });

        $scope.$on('show-errors-reset', function(event, name) {
          if (angular.isUndefined(name) || angular.element($element).parents('form').attr('name') === name){
            $scope.options.showError = false;
          }
        });

        if ($scope.options.disAllowNegative){
          $($input).keypress(function(event) {
            if ( event.which == 45 || event.which == 189 ) {
              event.preventDefault();
            }
          });
        }

        if ($scope.options.valZip)
          angular.element($input).keypress(function (e) {
            if (!((e.which >= 48 && e.which <= 57) || (e.which >= 97 && e.which <= 122) || (e.which >= 65 && e.which <= 90) || e.which == 32) && e.which != 8)
              return false;
          });

        if ($scope.options.valNumber)
          angular.element($input).keypress(function (e) {
            if (e.which != 46 && e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57))
              return false;
          });

        $scope.$watchCollection(function () {
          if ($ngModelCtrl.$modelValue) {
            return $ngModelCtrl.$modelValue[$scope.name];
          }
        }, function(newValue, oldValue) {
          if (!newValue) {
            $scope.newValue = {}
            return;
          }
          $scope.newValue = newValue;

          if ($scope.options.valCardNumber && $scope.value){
            $scope.error.cardNumber = !valid_credit_card($scope.value, $scope.ccType);
            $scope.newValue.$setValidity('cardNumber', valid_credit_card($scope.value, $scope.ccType));
          }
        });

        $scope.$watch('ccType', function(val){
          if ($scope.options.valCardNumber && $scope.value){
            $scope.error.cardNumber = !valid_credit_card($scope.value, val);
            $scope.newValue.$setValidity('cardNumber', valid_credit_card($scope.value, val));
          }
        })


        function valid_credit_card(value, cardType) {
          value = value ? value.toString() : '';
          if (value.indexOf('*********')>-1) return true;
          // accept only digits, dashes or spaces
          if (/[^0-9-\s]+/.test(value)) return false;

          // The Luhn Algorithm. It's so pretty.
          var nCheck = 0, nDigit = 0, bEven = false;
          value = value.replace(/\D/g, "");

          for (var n = value.length - 1; n >= 0; n--) {
            var cDigit = value.charAt(n),
              nDigit = parseInt(cDigit, 10);

            if (bEven) {
              if ((nDigit *= 2) > 9) nDigit -= 9;
            }

            nCheck += nDigit;
            bEven = !bEven;
          }

          if (!cardType)
            return (nCheck % 10) == 0;
          else{
            var checkObj = {
              "MasterCard": new RegExp('^5[1-5]'),
              "Visa": new RegExp('^4'),
              "Discover": new RegExp('^6011|65|64[4-9]|622(1(2[6-9]|[3-9]\d)|[2-8]\d{2}|9([01]\d|2[0-5]))'),
              "Maestro": new RegExp('^(?:5[0678]\d\d|6304|6390|67\d\d)\d{8,15}$'),
              "Amex": new RegExp('^3[47]')
            };
            return checkObj[cardType].test(value)
          }
        }
      })
    }
  };
}).directive('myMaxlength', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function (scope, element, attrs, ngModelCtrl) {
        attrs.$observe('myMaxlength', function (val) {
          if (val){
            var maxlength = Number(attrs.myMaxlength);
            var fromUser = function (text) {
              text = text || '';
              text = text.toString()
              if (text.length > maxlength) {
                var transformedInput = text.substring(0, maxlength);
                if (attrs.type=='number')
                  transformedInput = parseInt(transformedInput)
                ngModelCtrl.$setViewValue(transformedInput);
                ngModelCtrl.$render();
                return transformedInput;
              }
              return text;
            }
            ngModelCtrl.$parsers.push(fromUser);
          }
        });
      }
    };
  })
