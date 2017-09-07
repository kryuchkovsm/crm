/**
 * Created by user on 09.03.15.
 */
'use strict';

angular.module('ThemeColorChangerService', [])
  .factory('ThemeColorChanger',
  function() {

    var cssText = '';
    var changeWrappedBySelector = function(selector, cssStyle){
      cssText += selector + '{' + cssStyle + '}'
    };

    var changeBgColor = function(currentColors) {
      cssText = '';
      angular.forEach(currentColors, function(color, className){
        switch(className){
          case 'flowImage':
            changeWrappedBySelector('.CustomLogo', 'background-image: url('+color+');height: 44px;width: 220px;background-size: contain;');
            break;
          case 'ThemeColor':
            changeWrappedBySelector('.ThemeColor', 'background: '+color+' !important;');
            changeWrappedBySelector('.ThemeColor .view-full', 'color: '+color+' !important;');
            changeWrappedBySelector('.ThemeColor.dropdown-menu::before', 'border-bottom-color: '+color+' !important;');
            break;
          case 'ActiveElement':
            changeWrappedBySelector('.ActiveElementColor',  'background: '+color+' !important;');
            changeWrappedBySelector('.ActiveElementHoverColor:hover',  'background: '+color+' !important;');
            changeWrappedBySelector('a.active-login-tab', 'color: ' + color +' !important;')
            break;
          case 'FontColor':
            changeWrappedBySelector('.FontColor',  'color: '+color+' !important;');
            changeWrappedBySelector('.ActiveElementHoverColor:hover',  'color: '+color+' !important;');
            changeWrappedBySelector('.ThemeColor div, .ThemeColor label, .ThemeColor span, .ThemeColor a', 'color: '+color+';');
            break;
          case 'MenuDelimiter':
            changeWrappedBySelector('.MenuDelimiterColor', 'border-left: 1px solid '+color+' !important;');
            break;
          case 'CancelColor':
            changeWrappedBySelector('.CancelColor', 'background: '+color+' !important;');
            break;
          case 'WarningColor':
            changeWrappedBySelector('.WarningColor', 'background: '+color+' !important;');
            break;
          case 'ApplyColor':
            changeWrappedBySelector('.ApplyColor', 'background: '+color+' !important;');
            break;
          case 'FormBackground':
            changeWrappedBySelector('.FormBackground', 'background: '+color+' !important;');
            changeWrappedBySelector('.FormBackgroundTopBorder', 'border-top-color: '+color+' !important;');
            break;
          case 'GraphBackground':
            changeWrappedBySelector('.GraphBackgroundColor', 'background: '+color+' !important;');
            break;
          case 'SmallGraphBackground':
            changeWrappedBySelector('.SmallGraphBackgroundColor', 'background: '+color+' !important;');
            break;
          case 'TitleBars':
            changeWrappedBySelector('.TitleBars', 'background: '+color+' !important;');
            break;
        }
      });
      return cssText;
    };

    return {
      changeBgColor: changeBgColor
    };
  });
