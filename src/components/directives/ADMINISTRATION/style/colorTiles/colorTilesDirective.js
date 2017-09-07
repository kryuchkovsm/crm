/**
 * Created by user on 04.03.15.
 */
'use strict';
angular.module('color-tiles-directive', [])
  .directive('crmColorTiles',
  function (ModalService, GlobalVars) {

    return {
      scope: {
        value: '=',
        options: '='
      },
      templateUrl: 'components/directives/ADMINISTRATION/style/colorTiles/colorTilesTpl.html',
      link: function ($scope, $element, $attrs) {
        $scope.lightOrDark = function(color){
          var r,b,g,hsp
            , a = color;

          if (a.match(/^rgb/)) {
            a = a.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
            r = a[1];
            g = a[2];
            b = a[3];
          } else {
            a = +("0x" + a.slice(1).replace(
                a.length < 5 && /./g, '$&$&'
              )
            );
            r = a >> 16;
            b = a >> 8 & 255;
            g = a & 255;
          }
          hsp = Math.sqrt(
            0.299 * (r * r) +
            0.587 * (g * g) +
            0.114 * (b * b)
          );
          if (hsp>200) {
            return 'light';
          } else {
            return 'dark';
          }
        }

        $scope.resetAll = function(){
          $scope.value = 'reset';
          angular.forEach($scope.options.data, function(d){
            d.bgColor = GlobalVars.styleColors.defaultColors[d.id]
          });
        };

        $scope.toLowerCase = function(text){
          return text.toLowerCase();
        };

        $scope.showModal = function (id, originalColor) {

          ModalService.showModal({
            templateUrl: "components/modals/ADMINISTRATION/style/colorPickerTemplate.html",
            controller: "ColorPickerCtrl",
            inputs:{
              data: {
                widthPicker: Metronic.getViewPort().width > 500 ? 300 : 200,
                color: originalColor
              }
            }
          }).then(function (modal) {
            //it's a bootstrap element, use 'modal' to show it
            modal.element.modal();
            modal.close.then(function (result) {
              if (result === 'false') {
                result = originalColor;
              }
              for (var i = 0; i < $scope.options.data.length; i++) {
                var item = $scope.options.data[i];
                if(item.id === id){
                  item.bgColor = result;
                  $scope.value = angular.copy(item);
                }
              }
              return false;
            });
          });
        }
      }
    };
  });
