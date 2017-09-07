'use strict';
angular.module('crm')
  .controller('AddUserModalCtrl',function($scope, data, close, UserSetup, DataProcessing, 
  GlobalVars, DataStorage, ModalService, $rootScope, $filter) {
  
    $scope.clientsModel = [];
    $scope.sitesModel = [];

    $scope.data = data;

    if (data.User){
      if (data.User.Email) 
        data.User.confirmEmail = data.User.Email;

      $scope.currentUserName = data.User.UserName
      $scope.currentEmail = data.User.Email
      $scope.user = data.User
      $scope.clientsModel = _.map(data.User.Clients, function(client){return {id: client};})
      $scope.sitesModel = _.map(data.User.Sites, function(site){return {id: site};})
    } else {
      $scope.user = {
        IsActive: true
      };
    }

    // ************************************  Third Tab *************************** //
    $scope.commonData = GlobalVars.commonObject();
    $scope.clientsData = angular.copy($scope.commonData).Clients;
    $scope.sitesData = [{
      'SiteID':0,
      'Name': $rootScope.translate('modals.administration.user.adduser.no-clients-selected'), 
      disabled: true
    }];


    //  1st select

    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: $filter('translate')('common.clients'),
      valRequired: true
    };

    //  2nd select
    $scope.sitesSettings = {
      idProp: 'SiteID',
      displayProp: 'Name',
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      searchPlaceholder: $rootScope.translate('modals.administration.user.adduser.type-site-name-here-or-select-from-list.'),
      selectName: $filter('translate')('common.sites'),
      valRequired: true
    };

    $scope.getSectionIdsArr = function(arr){
      return _.map(arr, function(v){return v.id})
    };
    $scope.checkAllSelected = function(arr){
      if (!$scope.user.Sections) $scope.user.Sections = []
      if (!arr) arr = [];
      var f=true;
      _.each(arr, function(aV){
        if ($scope.user.Sections.indexOf(aV)==-1) f = false;
      });
      return f
    };

    $scope.selectAll = function(arr){
      if (!$scope.user.Sections) $scope.user.Sections = []
      if (!arr) arr = [];
      if (!$scope.checkAllSelected(arr))
        _.each(arr, function(a){
          if ($scope.user.Sections.indexOf(a)==-1) $scope.user.Sections.push(a)
        })
      else
        _.each(arr, function(a){
          if ($scope.user.Sections.indexOf(a)>-1) $scope.user.Sections.splice($scope.user.Sections.indexOf(a),1)
        })
    }
    $scope.selectCheckbox = function(value){
      if (!$scope.user.Sections) $scope.user.Sections = []
      $scope.user.Sections.indexOf(value)>-1 ? $scope.user.Sections.splice($scope.user.Sections.indexOf(value),1) : $scope.user.Sections.push(value)
    };

    $scope.checkSelected = function(value){
      if (!$scope.user.Sections) $scope.user.Sections = []
      return $scope.user.Sections.indexOf(value) > -1
    };


    // ************************************  First Tab *************************** //
    $scope.fieldOptions = UserSetup.userCreateEditFormFields();

    $scope.$watchCollection('clientsModel',function(clients) {
      $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData);
      $scope.sitesModel = DataProcessing.checkAvailableSites($scope.sitesModel, clients, $scope.clientsData)
    });

    // ************************************  Tab switcher *************************** //

    $scope.userInfo = 'ActiveElement';
    $scope.sectionAccess = false;
    $scope.clientSiteAccess = false;

    $scope.changeTab = function(elem) {
      switch (true) {
        case elem === 'userInfo':
          $scope.userInfo = 'ActiveElement';
          $scope.sectionAccess = false;
          $scope.clientSiteAccess = false;
          return false;
          break;
        case elem === 'sectionAccess':
          $scope.userInfo = false;
          $scope.sectionAccess = 'ActiveElement';
          $scope.clientSiteAccess = false;
          return false;
          break;
        case elem === 'clientSiteAccess':
          $scope.userInfo = false;
          $scope.sectionAccess = false;
          $scope.clientSiteAccess = 'ActiveElement';
          return false;
          break;
        default:
          return false;
          break;
      }
    };

    $scope.prev = function() {
      if ($scope.clientSiteAccess) {
        $scope.changeTab('sectionAccess');
      } else if ($scope.sectionAccess) {
        $scope.changeTab('userInfo');
      }
    };

    $scope.next = function(obj) {
      var formName;
      if (obj.addUserForm) formName = 'addUserForm';
      if (obj.addSectionAccess) formName = 'addSectionAccess';
      if (formName == 'addUserForm'){
        $scope.$broadcast('show-errors-check-validity', formName);
        if ($scope[formName].$invalid) return false
      }
      if ($scope.userInfo) {
        $scope.changeTab('sectionAccess');
      } else if ($scope.sectionAccess) {
        $scope.changeTab('clientSiteAccess');
      }
    };

    $scope.cancel = function(){
      close(false, 500);
    };

    $scope.resendConfirmation = function(){
      $scope.sendingConfirmation = true
      DataStorage.anyApiMethod('/users/confirmation/resend/'+data.User.UserID).post({},function(resp){
        $scope.sendingConfirmation = false
        if (resp && !resp.Status)
          ModalService.showModal({
            templateUrl: "components/modals/COMMON/sure.html",
            controller: "DataModalCtrl",
            inputs: {
              data: {
                hideProceedButton: true,
                panelSuccessClass: true,
                modalTitle: $rootScope.translate('modals.administration.user.adduser.resend-confirmation'),
                modalTxt: $rootScope.translate('modals.administration.user.adduser.confirmation-message-has-been-resend')
              }
            }
          }).then(function (modal) {
            modal.element.modal();
          })
      })
    };

    $scope.close = function() {
      $scope.$broadcast('show-errors-check-validity', 'addUserSitesForm');
      $scope.sitesModel = $scope.sitesModel || [];
      $scope.clientsModel = $scope.clientsModel || [];

      if ($scope.clientsModel.length == 0 || $scope.sitesModel.length == 0 ) 
        return;

      var user = angular.copy($scope.user);
      user.SiteIDs = _.map($scope.sitesModel, function(v){ return v.id}) || [];
      user.Clients = _.map($scope.clientsModel, function(v){ return v.id}) || [];
      user.SectionIDs = user.Sections || [];
      delete user.Sections;
      var method = 'create';

      if (data.User){
        user.UserID = data.User.UserID;
        method = 'update';
      }

      $scope.submitting = true;
      DataStorage.userApi[method]().post(user, function(resp){
        $scope.submitting = false;
        if (resp){
          if (resp.Status) return
          close(resp.UserID || data.User.UserID, 500);
        }

      })
    };
  });
