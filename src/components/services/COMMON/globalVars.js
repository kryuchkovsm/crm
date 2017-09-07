'use strict';

angular.module('GlobalVarsService', []) .factory('GlobalVars', function() {

  var title = { name: '' }
  var login = '';
  var loading;
  var commonObject;
  var loginInfo;
  
  return   {
    baseUrl: window.BaseURI,
    login: login,
    loadingRequest: function(){
      return loading
    },
    setLoadingRequestStatus: function(status){
      loading = status
    },
    whiteLabel: {
      CRMGuid: window.CRMGuid
    },
    setLoginInfo: function(obj){
      loginInfo = obj || {}
    },
    loginInfo: function(){
      return loginInfo || {}
    },
    setCommonObject: function(obj){
      commonObject = obj;
    },
    clean: function(){
      commonObject = undefined;
      title.name = '';
    },
    commonObject: function() {
      return commonObject;
    },
    title: function() {
      return title;
    },
    styleColors: {
      defaultColors: {
        ThemeColor: '#44A2E0',
        ActiveElement: '#2C6A93',
        CancelColor: '#363D43',
        WarningColor: '#FF9041',
        ApplyColor: '#7DB341',
        FormBackground: '#2C6A93',
        GraphBackground: '#44A2E0',
        SmallGraphBackground: '#EEEEEE',
        CircleGraphBackground: '#BBBBBB',
        FontColor: '#FFFFFF',
        TitleBars: '#b6b6b6',
        MenuDelimiter: '#74B5E0',
        NegativeGraphs: '#f68f42',
        PositiveGraphs: '#7CB242',
        NullGraphs: '#383D42',
        flowImage: ''
      },
      colorLabels: {
        ThemeColor: 'Theme color',
        ActiveElement: 'Active element',
        CancelColor: 'Cancel color',
        WarningColor: 'Warning color',
        ApplyColor: 'Apply color',
        FormBackground: 'Form background',
        GraphBackground: 'Graph background',
        SmallGraphBackground: 'Small Graph background',
        CircleGraphBackground: 'Circle Graph background',
        FontColor: 'Font Color',
        TitleBars: 'Title bars',
        MenuDelimiter: 'Menu Delimiter',
        NegativeGraphs: 'Negative Graphs',
        PositiveGraphs: 'Positive Graphs',
        NullGraphs: 'Null Graphs'
      }
    }
  }
});
