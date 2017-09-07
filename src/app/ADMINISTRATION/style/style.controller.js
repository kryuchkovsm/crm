'use strict';

angular.module('crm')
  .controller('StyleCtrl',

  function ($scope, GlobalVars, ThemeColorChanger, resolvedStyles, DataStorage, $state, $rootScope) {
    var styleJson = resolvedStyles && resolvedStyles.StyleJson ? JSON.parse(resolvedStyles.StyleJson) : {};
    var flowImage = styleJson.flowImage || '';
    delete styleJson.flowImage;

    $scope.flowImage = resolvedStyles && resolvedStyles.StyleJson ? JSON.parse(resolvedStyles.StyleJson).flowImage : 'https://www.placehold.it/220x45/EFEFEF/AAAAAA&amp;text=no+image';

    var defaultColors = angular.copy(GlobalVars.styleColors.defaultColors),
    colorLabels = angular.copy(GlobalVars.styleColors.colorLabels);
    var currentColors = angular.copy(GlobalVars.styleColors.defaultColors)
    _.extend(currentColors, styleJson);
    delete currentColors.flowImage
    $scope.validExt = true;
    $scope.validDms = true;
    $scope.imageReady = false;

    $scope.images = [];
    $scope.processFiles = function (files, flow) {
      $scope.validExt = true;
      $scope.validDms = true;
      var ext = files[0].getExtension();
      if (ext !== 'png') {
        $scope.validExt = false;
        $scope.currExtension = ext;
        flow.files = [];
      }
      angular.forEach(files, function (flowFile, i) {
        $scope.images[i]={};
        var fileReader = new FileReader();
        var image = new Image();
        fileReader.onload = function (event) {
          var uri = event.target.result;
          image.src = uri;
          image.onload = function(){
            $scope.images[i].width = this.width;
            $scope.images[i].height = this.height;
            if (this.width > 220 || this.height > 45) {
              $scope.validDms = false;
              flow.files = [];
            }
            // update scope to display dimension
            $scope.$apply();
          };

          if ($scope.validExt && $scope.validDms ) {
            flowImage = uri;
            changeColors();
            $scope.images[i].uri = uri;
            $scope.imageReady = true;
          } else {
            $scope.images[i].uri = '';
            $scope.imageReady = false;
          }
        };
        fileReader.readAsDataURL(flowFile.file);
      });



    };

    function randValue() {
      return (Math.floor(Math.random() * (1 + 40 - 20))) + 20;
    }

    $scope.dottedLinechartOptions = {
      total: 154,
      chartID: 1,
      tooltipLabel: $rootScope.translate('administration.style.style.controller.weekly-conversions'),
      chartData: [
        [1, randValue()],
        [2, 50 + randValue()],
        [3, 20 + randValue()],
        [4, 70 + randValue()],
        [5, 110 + randValue()],
        [6, 90 + randValue()],
        [7, 154]
      ],
      bottomBlock: true,
      bottomLabel: 'CONVERSIONS',
      clickTrough: 100,
      upsels: 50,
      preClicks: 4
    };

    $scope.colorTilesOptions = {data: []};
    $scope.sampleTableHeaderOptions = {title: 'Conversion viewer', icon: 'fa-line-chart', fullReportButton: {cb: void(0)}};

    for (var i in currentColors) {
      $scope.colorTilesOptions.data.push({"id": i, "label": colorLabels[i], "bgColor": currentColors[i]});
    }

    function reloadStylesheets() {
      var queryString = '?reload=' + new Date().getTime();
      angular.element('link#crm-style')[0].href = angular.element('link#crm-style')[0].href.replace(/\?.*|$/, queryString)
    }
    var changeColors = function(){
      currentColors.flowImage = flowImage;
      $rootScope.logoImage = flowImage;
      var rObj = {
        StylesCss: ThemeColorChanger.changeBgColor(currentColors)
      };
      DataStorage.anyApiMethod('/common/styles').post({
        Styles: angular.toJson(currentColors)
      }, function(resp){
        reloadStylesheets();
      });
      DataStorage.anyApiMethod('/common/styles/css').post(rObj);
    };

    $scope.$watchCollection( "colorTilesValue",
      function( newValue, oldValue ) {
        if(newValue == 'reset') $scope.resetAll();
        else if ($scope.colorTilesValue) {
            currentColors[$scope.colorTilesValue.id] = $scope.colorTilesValue.bgColor;
            changeColors()
        }
      }
    );

    $scope.resetAll = function(){
      currentColors = angular.copy(defaultColors);
      changeColors()
    };

    $scope.goTo = function(state){
      $state.go(state)
    }

  });
