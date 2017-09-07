'use strict';

var directiveModule = angular.module('angularjs-dropdown-multiselect', []);

directiveModule.directive('ngDropdownMultiselect', ['$filter', '$document', '$compile', '$parse',
  function ($filter, $document, $compile, $parse) {

    return {
      restrict: 'AE',
      scope: {
        selectedModel: '=',
        extraSettings: '=',
        options: '=',
        events: '=',
        searchFilter: '=?',
        translationTexts: '=',
        groupBy: '@'
      },
      template: function (element, attrs) {
        var checkboxes = attrs.checkboxes ? true : false;
        var groups = attrs.groupBy ? true : false;
        var template = 
          '<div class="well well-sm well-light bg-greyEEE">';
        template += 
          '<span class="block" ng-class="{\'margin-bottom-5\': !settings.enableSearch}" ng-if="settings.showTitle">\
            {{::settings.selectName}}: {{getButtonText()}}\
          </span>';
        template += 
          '<span ng-show="settings.enableSearch">\
            <input type="text" class="form-control search-box margin-top-0" ng-model="searchFilter" \
              placeholder="{{::settings.searchPlaceholder}}" />\
           </span>';
        template += 
          '<div crm-when-scrolled="showMore()" \
            ng-style="{height : settings.scrollable ? settings.scrollableHeight : \'auto\' }" \
            style="margin-bottom: 10px; overflow-y: auto; overflow-x: auto;" \
            class="form-control">';
        template += 
          '<div ng-show="searchFilter && (options | filter: searchFilter | limitTo: elemsLimit).length==0" \
            class="disable-cursor select-element ellipsis">\
            Nothing found\
           </div>';
        template += 
          '<div ng-show="!searchFilter && options.length==0" style="color: gray;" class="disable-cursor \
            select-element ellipsis" role="presentation">\
            {{extraSettings.defaultText || "No data"}}\
           </div>';
           
        if (attrs.idprop) {
          template += 
            '<div ng-keydown="onKeyDown($event)" ng-keyup="onKeyUp($event)" \
              ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp), false, option.disabled)" \
              data-ng-class="{\'bg-greyEEE\': isChecked(getPropertyForObject(option,settings.idProp)), \'disable-cursor\': option.disabled}" \
              class="select-element ellipsis" role="presentation" \
              ng-repeat="option in searchBy(options, settings.displayProp, settings.idProp) | limitTo: elemsLimit track by option.' + attrs.idprop + '">';
        } else {
          template += 
            '<div ng-keydown="onKeyDown($event)" ng-keyup="onKeyUp($event)" \
              ng-click="setSelectedItem(getPropertyForObject(option,settings.idProp), false, option.disabled)" \
              data-ng-class="{\'bg-greyEEE\': isChecked(getPropertyForObject(option,settings.idProp)), \'disable-cursor\': option.disabled}" \
              class="select-element ellipsis" role="presentation" \
              ng-repeat="option in searchBy(options, settings.displayProp, settings.idProp) | limitTo: elemsLimit">';
        }

        template += 
          '<a role="menuitem" tabindex="-1" style="color: gray;" \
            class="dropdown-multiselect-item tooltips" data-toggle="tooltip">';

        if (checkboxes) {
          template += 
            '<div class="checkbox">\
              <label>\
                <input class="checkboxInput" type="checkbox" \
                  ng-click="checkboxClick($event, getPropertyForObject(option,settings.idProp))" \
                  ng-checked="isChecked(getPropertyForObject(option,settings.idProp))" />\
                {{::getPropertyForObject(option, settings.displayProp)}}\
              </label>\
             </div>\
            </a>';
        } else {
          template += 
            '<span data-ng-class="{\'fa fa-check margin-left-10\': isChecked(getPropertyForObject(option,settings.idProp))}">\
            </span>\
            {{::getPropertyForObject(option, settings.displayProp) | translate}}\
            </a>';
        }
        template += '</div>';

        template += '</div>';
        template += '<span ng-show="settings.showLimitText" class="text-warning"><br />{{::settings.limitText}}</span>';
        template += '<div class="row">';
        template += '<div class="col-md-6 col-sm-6 margin-bottom-10"><a ng-show="settings.showUncheckAll" data-ng-click="deselectAll();"  href="javascript:;" class="btn btn-rounded full-width CancelColor">{{::texts.uncheckAll}}</a></div>';
        template += '<div class="col-md-6 col-sm-6"><a ng-hide="!settings.showCheckAll || settings.selectionLimit > 0" data-ng-click="selectAll()"  class="btn btn-rounded full-width ApplyColor">{{::texts.checkAll}}</a></div>';
        template += '</div>';
        template += '<p class="error-message" ng-show="showError">The {{settings.selectName}} required</p>';
        template += '</div>' +
          '';
        element.html(template);
      },
      link: function ($scope, $element, $attrs) {
        $('body').on('mouseenter', '.ellipsis', function(){
          var $this = $(this);
          if(this.offsetWidth < this.scrollWidth && !$this.attr('title')){
            $this.attr('title', $this.text());
          }
        });

        if (!$scope.selectedModel) $scope.selectedModel = [];
        var $dropdownTrigger = $element.children()[0];
        $scope.$on('show-errors-check-validity', function(event, name) {
          if ($scope.settings.valRequired && (angular.isUndefined(name) || angular.element($element).parents('form').attr('name') === name) &&
            (!$scope.selectedModel || ($scope.selectedModel && ($scope.selectedModel.length==0)))){
            $scope.showError = true;
          }
        });

        $scope.$watchCollection('selectedModel', function(val){
          if (val && val.length>0) $scope.showError = false;
        })

        $scope.toggleDropdown = function () {
          $scope.open = !$scope.open;
        };
        $scope.checkboxClick = function ($event, id) {
          $scope.setSelectedItem(id, false);
          $event.stopImmediatePropagation();
        };
        $scope.externalEvents = {
          onItemSelect: angular.noop,
          onItemDeselect: angular.noop,
          onSelectAll: angular.noop,
          onDeselectAll: angular.noop,
          onInitDone: angular.noop,
          onMaxSelectionReached: angular.noop
        };
        $scope.settings = {
          selectedByDefault: [],
          dynamicTitle: true,
          scrollable: false,
          scrollableHeight: '300px',
          closeOnBlur: true,
          displayProp: 'label',
          idProp: 'id',
          searchPlaceholder: $filter('translate')('common.clients-type-here-or-select-from-list'),
          selectName: $filter('translate')('common.clients'),
          externalIdProp: 'id',
          enableSearch: false,
          selectionLimit: 0,
          showTitle: true,
          showLimitText: false,
          limitText: $filter('translate')('common.select-only-one-item'),
          showCheckAll: true,
          showUncheckAll: true,
          closeOnSelect: false,
          buttonClasses: 'btn btn-default',
          closeOnDeselect: false,
          groupBy: $attrs.groupBy || undefined,
          groupByTextProvider: null,
          smartButtonMaxItems: 0,
          smartButtonTextConverter: angular.noop,
          valRequired: false,
          autoFocus: false
        };

        $scope.texts = {
          checkAll: $filter('translate')('common.select-all'),
          uncheckAll: $filter('translate')('common.unselect-all'),
          selectionCount: $filter('translate')('common.checked'),
          selectionOf: '/',
          buttonDefaultText: '0',
          dynamicButtonTextSuffix: $filter('translate')('common.selected'),
        };
        $scope.elemsLimit = 20;
        $scope.showMore = function () {
          $scope.elemsLimit += 20;
        };

        $scope.searchBy = function(options, displayName, idProp){
          var obj = {}
          obj[displayName] = $scope.searchFilter
          var resArr = $filter('filter')(options, obj) || []
          if (idProp){
            var t = {};
            t[idProp] = $scope.searchFilter
            resArr = resArr.concat($filter('filter')(options, t))
            resArr = resArr.filter(function(v){return !!v});
            resArr = _.uniq(resArr, function(p){
                return p[idProp];
            });
          }
          return resArr
        };

        $scope.$watchCollection('extraSettings', function (newValue, oldValue) {
          $scope.searchFilter = $scope.searchFilter || '';
          angular.extend($scope.settings, $scope.extraSettings || []);
          angular.extend($scope.externalEvents, $scope.events || []);
          angular.extend($scope.texts, $scope.translationTexts);
          if (newValue.deselectAll){
            $scope.deselectAll()
            newValue.deselectAll= false
          }
          else if (newValue && newValue.selectedByDefault && newValue.selectedByDefault.length) {
            defaultSelections();
            newValue.selectedByDefault = [];
          }

          if ($scope.settings && $scope.settings.autoFocus)
            setTimeout(function() { $($element).find('.search-box').focus() }, 500);

        });

        if (angular.isDefined($scope.settings.groupBy)) {
          $scope.$watch('options', function (newValue) {
            if (angular.isDefined(newValue)) {
              $scope.orderedItems = $filter('orderBy')(newValue, $scope.settings.groupBy);
            }
          });
        }

        var moveSelected = function (array, old_index, new_index) {
          if (new_index >= array.length) {
            var k = new_index - array.length;
            while ((k--) + 1) {
              array.push(undefined);
            }
          }
          array.splice(new_index, 0, array.splice(old_index, 1)[0]);
          return array; // for testing purposes
        };

        var defaultSelections = function () {
          var items = $scope.settings.selectedByDefault;
          for (var i = 0; i < items.length; i++) {
            var selItem = items[i];
            var selOption = {};
            if ($scope.options.length==1 && $scope.options[0].disabled) return
            for (var j = 0; j < $scope.options.length; j++) {
              var option = $scope.options[j];
              if (option[$scope.settings.idProp].toString() == selItem[$scope.settings.idProp].toString()) {
                selOption = option;
              }
            }
            $scope.setSelectedItem($scope.getPropertyForObject(selOption, $scope.settings.idProp), false);
          }
        };

        $scope.singleSelection = $scope.settings.selectionLimit === 1;

        function getFindObj(id) {
          var findObj = {};
          if ($scope.settings.externalIdProp === '') {
            findObj[$scope.settings.idProp] = id;
          } else {
            findObj[$scope.settings.externalIdProp] = id;
          }
          return findObj;
        }

        function clearObject(object) {
          for (var prop in object) {
            delete object[prop];
          }
        }

        if ($scope.singleSelection) {
          if (angular.isArray($scope.selectedModel) && $scope.selectedModel.length === 0) {
            clearObject($scope.selectedModel);
          }
        }

        if ($scope.settings.closeOnBlur) {
          $document.on('click', function (e) {
            var target = e.target.parentElement;
            var parentFound = false;
            while (angular.isDefined(target) && target !== null && !parentFound) {
              if (_.contains(target.className.split(' '), 'multiselect-parent') && !parentFound) {
                if(target === $dropdownTrigger) {
                  parentFound = true;
                }
              }
              target = target.parentElement;
            }
            if (!parentFound) {
              $scope.$apply(function () {
                $scope.open = false;
              });
            }
          });
        }

        $scope.getGroupTitle = function (groupValue) {
          if ($scope.settings.groupByTextProvider !== null) {
            return $scope.settings.groupByTextProvider(groupValue);
          }
          return groupValue;
        };
        $scope.getButtonText = function () {
          if ($scope.settings.dynamicTitle && (($scope.selectedModel && $scope.selectedModel.length > 0) || (angular.isObject($scope.selectedModel) && _.keys($scope.selectedModel).length > 0))) {
            if ($scope.settings.smartButtonMaxItems > 0) {
              var itemsText = [];
              angular.forEach($scope.options, function (optionItem) {
                if ($scope.isChecked($scope.getPropertyForObject(optionItem, $scope.settings.idProp))) {
                  var displayText = $scope.getPropertyForObject(optionItem, $scope.settings.displayProp);
                  var converterResponse = $scope.settings.smartButtonTextConverter(displayText, optionItem);
                  itemsText.push(converterResponse ? converterResponse : displayText);
                }
              });
              if ($scope.selectedModel.length > $scope.settings.smartButtonMaxItems) {
                itemsText = itemsText.slice(0, $scope.settings.smartButtonMaxItems);
                itemsText.push('...');
              }
              return itemsText.join(', ');
            } else {
              var totalSelected;
              if ($scope.singleSelection) {
                totalSelected = ($scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp])) ? 1 : 0;
              } else {
                totalSelected = angular.isDefined($scope.selectedModel) ? $scope.selectedModel.length : 0;
              }
              if (totalSelected === 0) {
                return $scope.texts.buttonDefaultText;
              } else {
                return totalSelected + ' ' + $scope.texts.dynamicButtonTextSuffix;
              }
            }
          } else {
            return $scope.texts.buttonDefaultText;
          }
        };
        $scope.getPropertyForObject = function (object, property) {
          if (property && typeof (property) == 'function') {
            return property(object);
          }
          if (angular.isDefined(object) && object.hasOwnProperty(property)) {
            return object[property];
          }
          return '';
        };
        $scope.selectAll = function () {
          //$scope.deselectAll(false);
          $scope.externalEvents.onSelectAll();
          var tmpArr = $filter('filter')($scope.options, $scope.searchFilter)
          angular.forEach(tmpArr, function (value) {
            if (!value.disabled){
              $scope.setSelectedItem(value[$scope.settings.idProp], true);
            }
          });
        };
        $scope.deselectAll = function (sendEvent) {
          sendEvent = sendEvent || true;
          if (sendEvent) {
            $scope.externalEvents.onDeselectAll();
          }
          if ($scope.singleSelection) {
            clearObject($scope.selectedModel);
          } else if ($scope.selectedModel){
            $scope.selectedModel.splice(0, $scope.selectedModel.length);
          }
        };

        var arrayObjectIndexOf = function (myArray, searchTerm, property) {
          for(var i = 0, len = myArray.length; i < len; i++) {
            if (myArray[i][property] === searchTerm) return i;
          }
          return -1;
        };

        var getKeyboardEventResult = function (keyEvent, keyEventDesc) {
          keyEvent.stopPropagation();
          keyEvent.preventDefault();
          $scope.shiftKey = keyEvent.shiftKey;
        };
        $scope.onKeyDown = function ($event) {
          getKeyboardEventResult($event, "Key down");
        };
        $scope.onKeyUp = function ($event) {
          getKeyboardEventResult($event, "Key up");
        };

        var lastChecked = null;
        $scope.setSelectedItem = function (id, dontRemove, disable) {
          if (disable) return false;
          var findObj = getFindObj(id);
          var finalObj = null;
          if ($scope.settings.externalIdProp === '') {
            finalObj = _.find($scope.options, findObj);
          } else {
            finalObj = findObj;
          }

          if ($scope.singleSelection) {
            clearObject($scope.selectedModel);
            angular.extend($scope.selectedModel, finalObj);
            $scope.externalEvents.onItemSelect(finalObj);
            return;
          }
          dontRemove = dontRemove || false;
          addObject();

          if (!lastChecked) {
            lastChecked = id;
            return;
          }

          if ($scope.shiftKey) {
            var start = arrayObjectIndexOf($scope.options, id, $scope.settings.idProp);
            var end = arrayObjectIndexOf($scope.options, lastChecked, $scope.settings.idProp);
            for (var i = Math.min(start,end) + 1; i <= Math.max(start,end) - 1; i++) {
              var obj = $scope.options[i];
              obj = {id: obj[$scope.settings.idProp]};
              findObj = finalObj = obj;
              addObject();
            }
            $scope.shiftKey = false;
          }

          function addObject() {
            if ($scope.settings.selectionLimit == 1) {
              if ($scope.selectedModel.length == 1){
                var selectedId = $scope.selectedModel[0].id;
                $scope.externalEvents.onDeselectAll();
                $scope.selectedModel.splice(0,1)
                if (selectedId != findObj.id){
                  $scope.selectedModel.push(finalObj);
                  $scope.externalEvents.onItemSelect(finalObj);
                }
              }else{
                $scope.selectedModel.push(finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
              }
            }else{
              var exists = _.findIndex($scope.selectedModel, findObj) !== -1;
              if (!dontRemove && exists) {
                $scope.selectedModel.splice(_.findIndex($scope.selectedModel, findObj), 1);
                $scope.externalEvents.onItemDeselect(findObj);
              } else if (!exists && ($scope.settings.selectionLimit === 0 || $scope.selectedModel.length < $scope.settings.selectionLimit)) {
                $scope.selectedModel.push(finalObj);
                $scope.externalEvents.onItemSelect(finalObj);
              }
            }
          }

          lastChecked = id;
        };
        $scope.isChecked = function (id) {
          if ($scope.singleSelection) {
            return $scope.selectedModel !== null && angular.isDefined($scope.selectedModel[$scope.settings.idProp]) && $scope.selectedModel[$scope.settings.idProp] === getFindObj(id)[$scope.settings.idProp];
          }
          return _.findIndex($scope.selectedModel, getFindObj(id)) !== -1;
        };
        $scope.externalEvents.onInitDone();
      }
    };
  }])
