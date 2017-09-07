'use strict';

angular.module('crm')
  .controller('UsersCtrl', function ( $scope, ModalService, GlobalVars, DataStorage, Notification, DataProcessing, $rootScope) {

    $scope.usersHeaderOptions = {title: $rootScope.translate('administration.users.users.controller.select-client')};
    $scope.manageUsersHeaderOptions = {title: $rootScope.translate('administration.users.users.controller.manage-users')};
    $scope.clientsModel = [];

    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: 'Client',
      showCheckAll: true,
      showUncheckAll: true
      //selectionLimit: 1
    };

    DataStorage.anyApiMethod('/users/add').query(function(resp){
      if (resp && !resp.Status) {
        $scope.sections = resp.Sections;
        $scope.userTypes = resp.UserTypes;
      }
    });

    var fetchUsers = function(cb){
      cb = cb || function(){};
      if ($scope.clientsModel && $scope.clientsModel.length>0){
        var ids = _.map($scope.clientsModel, function(v){ return v.id});
        $scope.fetchedData = false;
        DataStorage.userApi.getByClientIds().post({ClientIDs: ids}, function(resp){
          $scope.fetchedData = true;
          if (resp.Index && resp.Index.Users && resp.Index.Users.length>0){
            DataProcessing.updateSafeArr(resp.Index.Users, $scope.copyUsersTable, 'UserID')
          };
          cb();
        })
      }
    }
    $scope.$watchCollection('clientsModel',
      function(newValue) {
        $scope.userNames = [];
        $scope.usersTable = [];
        $scope.copyUsersTable = [];
        if (newValue && newValue.length>0) {
          fetchUsers();
        }else
          $scope.fetchedData = false;
      }
    );

    $scope.deleteUserRow = function (row) {
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle: $rootScope.translate('administration.users.users.controller.delete-user'),
            modalTxt: $rootScope.translate('administration.users.users.controller.are-you-sure-you-want-to-delete-this-user?')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result === 'false') return false;
          DataStorage.anyApiMethod('/users/delete/'+row.UserID).post({}, function(resp){
            if (resp && !resp.Status){
              Notification.success({message: 'User ' + row.UserName + ' has been deleted', delay: 5000});
              var index = $scope.copyUsersTable.indexOf(row)
              if (index != -1)
                $scope.copyUsersTable.splice(index,1)
            }
          });
          return true;
        });
      });
    };

    $scope.addOrEdit = function (userId) {
      if (userId) {
        DataStorage.userApi.get().query({userId: userId}, function(resp){
          if (resp.Status != 0) {
            return;
          }

          showAddEditModal(resp);
        });
      } else {
        showAddEditModal();
      }
    };

    var showAddEditModal = function(resp){
      var user = resp ? resp.User : null;

      ModalService.showModal({
        templateUrl: "components/modals/ADMINISTRATION/user/addUser.html",
        controller: "AddUserModalCtrl",
        inputs: {
          data: {
            modalTitle: user && user.UserID 
              ? $rootScope.translate('administration.users.users.controller.add-user') 
              : $rootScope.translate('administration.users.users.controller.edit-user'),
            User: user,
            Sections: angular.copy($scope.sections),
            UserTypes: angular.copy($scope.userTypes)
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (!result) 
            return false;
          fetchUsers(function(){
            _.each($scope.copyUsersTable, function(user){
              if (user.UserID == result){
                var action = user.UserID 
                  ? $rootScope.translate('administration.users.users.controller.changed') 
                  : $rootScope.translate('administration.users.users.controller.added');

                Notification.success({
                  message: $rootScope.translate('administration.users.users.controller.user') + ' '
                    + user.UserName + ' ' 
                    + $rootScope.translate('administration.users.users.controller.has-been') + ' ' 
                    + action, 

                  delay: 5000
                })
              }
            })
          });
        });
      });
    }

  });
