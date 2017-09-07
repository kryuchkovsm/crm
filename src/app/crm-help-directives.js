var app = angular.module('crm');

app.directive('draggable', function() {
  return {
    scope: {
      options: '='
    },
    link: function(scope, element, attr) {
      scope.options = scope.options || {};
      angular.element(element).draggable(scope.options)
    }
  }
});

app.directive('customNumberRange', function() {
  return {
    restrict: 'A',
    require: '?ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
        var maxNumber = parseInt(attrs.maxNumber);
        var minNumber = parseInt(attrs.minNumber);
        var fromUser = function (userNumber) {
          if (userNumber || userNumber==0){
            userNumber = parseInt(userNumber);
            if (userNumber > maxNumber) {
              ngModelCtrl.$setViewValue(maxNumber);
              ngModelCtrl.$render();
              return maxNumber;
            }else if (userNumber < minNumber){
              ngModelCtrl.$setViewValue(minNumber);
              ngModelCtrl.$render();
              return minNumber;
            }
          }
          return userNumber;
        }
        ngModelCtrl.$parsers.push(fromUser);
    }
  };
});


app.directive('pageSelect', function() {
  return {
    restrict: 'E',
    template: '<input type="text" class="select-page" ng-model="inputPage" ng-keyup="detectMax($event)" ng-change="selectPage(inputPage)">',
    link: function(scope, element, attrs) {

      scope.detectMax = function(ev){
        var t = angular.element(ev.target).val()
        var rT= t.replace(/[^0-9]+/g, "");
        if (!t)
          return scope.inputPage = 1

        if (rT!=t || parseInt(t)>scope.numPages){
          scope.inputPage = parseInt(angular.copy(scope.oldVal) || 1)
        }
      };

      scope.$watch('currentPage', function(c) {
        scope.oldVal = angular.copy(c);
        scope.inputPage = c;
      });
    }
  }
});


app.directive('validNumber', function () {
  return {
    require: '?ngModel',
    link: function(scope, element, attrs, ngModelCtrl) {
      if(!ngModelCtrl) return;

      ngModelCtrl.$parsers.push(function(val) {
        val = val || '';
        var clean = val.replace( /[^0-9]+/g, '');
        if (val !== clean) {
          ngModelCtrl.$setViewValue(clean);
          ngModelCtrl.$render();
        }
        return clean;
      });

      element.bind('keypress', function(event) {1
        if(event.keyCode === 32) {
          event.preventDefault();
        }
      });
    }
  };
});

app.directive('focusMe', function($timeout) {
  return {
    scope: { trigger: '@focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === "true") {
          $timeout(function() {
            element[0].focus();
          });
        }else if (value === "false"){
          element[0].blur();
        }
      });
    }
  };
});

app.directive('checkUniqueEmail', function (DataStorage, $timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        var checkUnique = function(){
          if (!attrs.except || (attrs.except && attrs.except != element.val())){
            ngModel.checking_email = true;
            DataStorage.anyApiMethod('/users/isexist/email/'+element.val()).query(function(resp){
              ngModel.checking_email = false;
              ngModel.$setValidity('uniqueEmail', resp && !resp.Status);
            });
          }
          else
            ngModel.$setValidity('uniqueEmail', true);
        };

        var watcher = scope.$watch(function () {
          return ngModel.$modelValue;
        }, function(newValue) {
          if (newValue) {
            checkUnique()
            watcher()
          }
        });

        element.bind('blur', function (e) {
          if (!ngModel || !element.val()) return;
          checkUnique()
        });
      }
    }
  });

app.directive('checkUniqueUsername', function (DataStorage, $timeout) {
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, element, attrs, ngModel) {
        var checkUnique = function(){
          if (!attrs.except || (attrs.except && attrs.except != element.val())){
            ngModel.checking_username = true;
            DataStorage.anyApiMethod('/users/isexist/username/'+element.val()).query(function(resp){
              ngModel.checking_username = false;
              ngModel.$setValidity('uniqueUsername', resp && !resp.Status);
            });
          }else
            ngModel.$setValidity('uniqueUsername', true);
        }
        var watcher = scope.$watch(function () {
          return ngModel.$modelValue;
        }, function(newValue) {
          if (newValue) {
            checkUnique()
            watcher()
          }
        });

        element.bind('blur', function (e) {
          if (!ngModel || !element.val()) return;
          checkUnique()
        });
      }
    }
  });

app.directive('customTooltip', function () {
  return {
    restrict: 'A',
    link: function (scope, element, attrs) {
      var setPosition = function(){
        var linkPos = $(element).find('.link').position()
        linkPos.top = linkPos.top-120
        linkPos.left = linkPos.left-100
        $(element).find(".custom-tooltip").css(linkPos);
      }
      setPosition()
      $(element).find('.link').onPositionChanged(setPosition);
    }
  }
});

app.directive('jqueryNumeric', function () {
  return {
    link: function (scope, element, attrs) {
      $(element).keypress(function(event) {
        if (event.which == 101) event.preventDefault();
      });
    }
  }
});


app.directive('enterInput', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which == 13 || event.which == 18) {
        scope.$apply(function (){
          scope.$eval(attrs.enterInput);
        });

        event.preventDefault();
      }
    });
  };
});

app.directive('positiveNumber', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if ( event.which == 45 || event.which == 189 || event.which == 101 ) {
        event.preventDefault();
      }
    });
  };
});

app.directive('checkHttps', function () {
  return {
    require: 'ngModel',
    link: function(scope, elem, attr, ngModel) {
      scope.$watch(function () {
        return ngModel.$viewValue;
      }, function(newValue) {
        if (newValue)
          ngModel.$setValidity('validhttps', newValue.indexOf('http:')==-1);
        else
          ngModel.$setValidity('validhttps', false);
      });

    }
  }
});

app.directive('fixedHeader', ['$timeout', function ($timeout) {
  return {
    restrict: 'A',
    scope: {
      arr: '=',
      heq: '=',
      tableHeight: '@'
    },
    link: function ($scope, $elem, $attrs, $ctrl) {
      function isVisible(el) {
        var style = window.getComputedStyle(el);
        return (style.display != 'none' && el.offsetWidth !=0 );
      }

      function isTableReady() {
        return isVisible(elem.querySelector("tbody")) && elem.querySelector('tbody tr:first-child') != null;
      }

      var elem = $elem[0];
      var watchProcessing = function(){
        // reset display styles so column widths are correct when measured below
        angular.element(elem.querySelectorAll('thead, tbody, tfoot')).css('display', '')

        // wrap in $timeout to give table a chance to finish rendering
        $timeout(function () {
          // set widths of columns
          var sel = 'tr:first-child th'
          if ($scope.heq)
            sel = 'tr:nth-child(2) th'
          angular.forEach(elem.querySelectorAll(sel), function (thElem, i) {

            var tdElems = elem.querySelector('tbody tr:first-child td:nth-child(' + (i + 1) + ')');
            var columnWidth = tdElems ? tdElems.offsetWidth : thElem.offsetWidth;
            if(tdElems) {
              tdElems.style.width = columnWidth + 'px';
            }

            if(thElem) {
              $(thElem).css('min-width', columnWidth + 'px')
              thElem.style.width = columnWidth + 'px';
            }

            var tfElems = elem.querySelector('tfoot tr:first-child td:nth-child(' + (i + 1) + ')');
            if (tfElems) {
              tfElems.style.width = columnWidth + 'px';
            }
          });

          // set css styles on thead and tbody
          angular.element(elem.querySelectorAll('thead, tfoot')).css('display', 'block')

          angular.element(elem.querySelectorAll('tbody')).css({
            'display': 'block',
            'max-height': $attrs.tableHeight + 'px' || 'inherit',
            'overflow-y': 'auto',
            'overflow-x': 'hidden'
          });

          // reduce width of last column by width of scrollbar
          var tbody = elem.querySelector('tbody');
          var scrollBarWidth = tbody.offsetWidth - tbody.clientWidth;
          if (scrollBarWidth > 0) {
            // for some reason trimming the width by 2px lines everything up better
            scrollBarWidth -= 2;
            var lastColumn = elem.querySelector('tbody tr:first-child td:last-child');
            lastColumn.style.width = (lastColumn.offsetWidth - scrollBarWidth) + 'px';
          }
        });

        //we only need to watch once
        //unbindWatch();
      };

      //var unbindWatch = $scope.$watch(isTableReady, function(newValue){
      //  watchProcessing(newValue)
      //  unbindWatch();
      //});

      $scope.$watchCollection('arr', function(newValue){
        if (newValue && newValue.length)
          watchProcessing(newValue)
      })
    }
  };
}]);
