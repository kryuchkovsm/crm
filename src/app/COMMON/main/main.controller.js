'use strict';

angular.module('crm')
  .controller('MainCtrl', function ($scope, AuthService, $state, $rootScope, GlobalVars,  $timeout, DataStorage, ModalService, $window) {
    DataStorage.anyApiMethod('/common/styles/'+GlobalVars.whiteLabel.CRMGuid).query(function(resp){
      if (resp.StyleJson && JSON.parse(resp.StyleJson).flowImage)
        $rootScope.logoImage = JSON.parse(resp.StyleJson).flowImage
    });


    $scope.loadingRequest = GlobalVars.loadingRequest
    $scope.commonObject = GlobalVars.commonObject;
    $scope.loginInfo = GlobalVars.loginInfo;
    $scope.currentSection = {};
    $scope.showSectionsContent = false;
    $scope.dataReady = true;
    if ($state.current.url == '/')
      $state.go('main.dashboard')

    var previousState

    $rootScope.$on("$stateChangeStart", function(event, next, current) {
      angular.element('.modal').modal('hide');
    });

    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams){
        previousState = fromState
        $scope.dataReady = true;
        $('li.menu-dropdown.mega-menu-dropdown.open').removeClass("open");
        if (toState.url == '/'){
          $state.go('main.dashboard')
        }
      });

    var getCurrentSection = function(currRouteName, authSections){
      $scope.currentSection = {}
      authSections = authSections || [];
      angular.forEach(authSections, function(orObj){
        orObj.Sections = orObj.Sections || [];
        if (orObj.RouteName == currRouteName){
          $scope.currentSection = orObj;
        }else{
          var throughArr = function(obj){
            angular.forEach(obj.Sections, function(section){
              if (section.RouteName == currRouteName){
                $scope.currentSection = section;
              }else if (section.Sections && section.Sections.length>0)
                throughArr(section)
            });
          };
          throughArr(orObj)
        }
      })
    };


    $scope.$watchCollection(function() {
      return [$state.current.name, $scope.commonObject()]
    }, function(arr){
      $scope.currentStateName = $state.current.name;
      if (arr && arr[0] && arr[1] && arr[1].AuthorizedSections && arr[1].AuthorizedSections.length){
        if ($state.current.name.indexOf('main.helpcenter') != -1)
          $scope.currentSection = {name: 'Help Center'};
        else if ($state.current.name == 'main.siteoptions' && $state.params.SiteID)
          $scope.currentSection = {name: 'Edit Site'};
        else
          getCurrentSection(arr[0], arr[1].AuthorizedSections)
      }
    });

    $scope.loggedIn = AuthService.loggedIn;
    $scope.submenu = {Toggle: []};
    //$scope.showClientModal = ['main.products','main.sites','main.mdfconfig','main.processorconfig','main.emailsmtp',
    //  'main.emailtemplates','main.emailevents','main.mycampaigns','main.offerimageandterms'];


    $scope.getSectionRouteNames = function(orObj){
      orObj = orObj || {};
      orObj.Sections = orObj.Sections || [];
      var resArr = [];
      if (orObj.RouteName)
        resArr.push(orObj.RouteName)
      var throughArr = function(obj){
        angular.forEach(obj.Sections, function(section){
          resArr.push(section.RouteName)
          if (section.Sections && section.Sections.length>0)
            throughArr(section)
        });
      };
      throughArr(orObj)
      return resArr
    };

    $scope.go = function(path){
      $state.go(path)
    };

    $scope.logout = AuthService.logout;

    angular.element(document).ready(function () {
      $timeout(function () {
        $(function(){
          // initiate layout
          //debugger;
          Metronic.init(); // init metronic core components
          Layout.init(); // init current layout
        });
      }, 500);
    });

    $rootScope.showSelectClientModal = function () {
      var clients = GlobalVars.commonObject().Clients
      if (clients && clients.length == 1){
        $scope.dataReady = true;
        
        var name = $state.current.name;
        $timeout(function() { 
          $state.go(name, {clientID: clients[0].ClientID}, {reload: true})
        });
      }else{
        $scope.dataReady = false;
        ModalService.showModal({
          templateUrl: "components/modals/COMMON/clientSelect/clientSelect.html",
          controller: "clientSelectCtrl",
          inputs: {
            data: {
              modalTitle: 'Select Client'
            }
          }
        }).then(
          function (modal) {
            modal.element.modal({
              backdrop: 'static',
              keyboard: false
            });
            modal.close.then(function (result) {
              if (!result || result == 'false') {
                if (previousState)
                  $window.history.back();
                else
                  $state.go(previousState || 'main.dashboard')
                return
              }
              $state.go($state.current, {clientID: result}, {reload: true})
            });
          }
        );

      }
    };

    $scope.iconsClass = {
      'top.dashboard': 'fa fa-tachometer',
      'top.crm': 'fa fa-database',
      'top.campaigns': 'fa fa-bullhorn',
      'top.reports': 'fa fa-bar-chart',
      'top.tools': 'fa fa-wrench',
      'top.administration': 'fa fa-cogs',
      'top.support': 'fa fa-headphones'
    };


});
