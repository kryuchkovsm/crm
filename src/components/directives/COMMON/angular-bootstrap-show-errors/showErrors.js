(function() {
  var showErrorsModule;

  showErrorsModule = angular.module('ui.bootstrap.showErrors', []);

  showErrorsModule.directive('showErrors', [
    '$timeout', 'showErrorsConfig', '$interpolate', function($timeout, showErrorsConfig, $interpolate) {
      var getShowSuccess, getTrigger, linkFn;
      getTrigger = function(options) {
        var trigger;
        trigger = showErrorsConfig.trigger;
        if (options && (options.trigger != null)) {
          trigger = options.trigger;
        }
        return trigger;
      };
      getShowSuccess = function(options) {
        var showSuccess;
        showSuccess = showErrorsConfig.showSuccess;
        if (options && (options.showSuccess != null)) {
          showSuccess = options.showSuccess;
        }
        return showSuccess;
      };
      linkFn = function(scope, el, attrs, formCtrl) {

        $timeout(function() {

          var blurred, inputEl, inputName, inputNgEl, options, showSuccess, toggleClasses, trigger;
          blurred = false;
          options = scope.$eval(attrs.showErrors);
          showSuccess = getShowSuccess(options);
          trigger = getTrigger(options);
          inputEl = el[0].querySelector('.form-control[name]');
          inputNgEl = angular.element(inputEl);
          inputName = $interpolate(inputNgEl.attr('name') || '')(scope);
          if (!inputName) {
            throw "show-errors element has no child input elements with a 'name' attribute and a 'form-control' class";
          }
          var submittedForm;
          inputNgEl.bind(trigger, function() {
            if (submittedForm){
              blurred = true;
              return toggleClasses(formCtrl[inputName].$invalid);
            }
          });
          scope.$watch(function() {
            return formCtrl[inputName] && formCtrl[inputName].$invalid;
          }, function(invalid) {
            if (!blurred) {
              return;
            }
            return toggleClasses(invalid);
          });
          scope.$on('show-errors-check-validity', function(event, name) {
            if (angular.isUndefined(name) || formCtrl['$name'] === name){
              submittedForm = true;
              return toggleClasses(formCtrl[inputName].$invalid);
            }
          });
          scope.$on('show-errors-reset', function(event, name) {
            if (angular.isUndefined(name) || formCtrl['$name'] === name)
              return $timeout(function() {
                el.removeClass('has-error');
                el.removeClass('has-success');
                return blurred = false;
              }, 0, false);
          });
          return toggleClasses = function(invalid) {
            el.toggleClass('has-error', invalid);
            if (showSuccess) {
              return el.toggleClass('has-success', !invalid);
            }
          };

        }, 1000);


      };
      return {
        restrict: 'A',
        require: '^^form',
        compile: function(elem, attrs) {
          if (angular.element(elem).parents('form').length==0) return false
          if (attrs['showErrors'].indexOf('skipFormGroupCheck') === -1) {
            if (!(elem.hasClass('form-group') || elem.hasClass('input-group'))) {
              throw "show-errors element does not have the 'form-group' or 'input-group' class";
            }
          }
          return linkFn;
        }
      };
    }
  ]);

  showErrorsModule.provider('showErrorsConfig', function() {
    var _showSuccess, _trigger;
    _showSuccess = false;
    _trigger = 'blur';
    this.showSuccess = function(showSuccess) {
      return _showSuccess = showSuccess;
    };
    this.trigger = function(trigger) {
      return _trigger = trigger;
    };
    this.$get = function() {
      return {
        showSuccess: _showSuccess,
        trigger: _trigger
      };
    };
  });

}).call(this);
