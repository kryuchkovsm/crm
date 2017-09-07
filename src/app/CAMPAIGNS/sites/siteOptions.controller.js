'use strict';

angular.module('crm')
  .controller('SiteOptionsCtrl', function ($scope, $state, $stateParams, GlobalVars, ModalService, SitesSetup,
    DataStorage, resolvedSiteDetails, DataProcessing, $document, Notification, $timeout, $filter) {

    $scope.clientsData = GlobalVars.commonObject().Clients;
    $scope.selectSitePortletHeaderOptions = {title: 'Select Client'};
    $scope.mDFieldsPHeader = {title: 'Merchant Defined Fields'};
    $scope.setupPGroupPHeader = {title: 'Setup Product Groups'};
    $scope.fields = {};
    $scope.fields.mdfSelectModels = [];
    $scope.fields.pgSelectModels = [];
    $scope.showAddClient = false;
    $scope.showSiteSaved = false;
    $scope.showSiteSavedError = false;
    $scope.newSiteId = {id: 0, show: false};
    $scope.siteMDFs = [];
    $scope.siteMDFsSafe = [];
    $scope.sitePGs = [];
    $scope.sitePGsSafe = [];
    $scope.clientProductGroups = [];
    $scope.inTableSelectsClientPGs = [];
    $scope.setSitePortletHeaderOptions = { title: 'Enter site settings' };
    $scope.siteOptionsFormClass = 'col-md-8';
    $scope.clientsModel = [];

    $scope.$watchCollection('clientsModel', function(arr){
      $scope.showForm = arr && arr.length>0;
    });

    var getClientID = function(){
      var clientID;
      if ($scope.clientsModel && $scope.clientsModel.length>0 && $scope.clientsModel[0].id)
        clientID = angular.copy($scope.clientsModel[0].id)
      else if ($stateParams.ClientID)
        clientID = $stateParams.ClientID
      return clientID
    }

    if ($stateParams.email){
      $timeout(function(){
        var someElement = angular.element(document.getElementById('email-autoresponders'));
        if (someElement && someElement.length)
          $document.scrollToElementAnimated(someElement, 300);
      },1000)
    }

    if ($stateParams.offers){
      $timeout(function(){
        var someElement = angular.element(document.getElementById('terms-offers'));
        if (someElement && someElement.length)
          $document.scrollToElementAnimated(someElement, 300);
      },1000)
    }

    var setMode = function (newSite) {
      if (newSite) {
        $scope.mDFieldsShow = false;
        $scope.fields = {
          domainUrlTxtValue: ''
        };
        $scope.deliveryMethodRLOptions.data[0].checked = "checked";
        $scope.deliveryMethodRLOptions.data[1].checked = "";
        $scope.isActiveOptions.data[0].checked = "checked";
        $scope.isActiveOptions.data[1].checked = "";
        $scope.$broadcast('show-errors-reset');
        $scope.siteOptionsFormClass = 'col-md-8';
      } else {
        $scope.mDFieldsShow = true;
        $scope.siteOptionsFormClass = 'col-md-6';
      }
    };

    $scope.deliveryMethodRLOptions = {
      label: 'Delivery Method:',
      data: [
        {"id":1,"name":"Online", checked: true},
        {"id":2,"name":"Shipped"}
      ]
    };
    $scope.isActiveOptions = {
      label: 'Is Active:',
      data: [
        {"id":1,"name":"Yes", checked: true},
        {"id":2,"name":"No"}
      ]
    };

    if (resolvedSiteDetails.Site && resolvedSiteDetails.Site.DeliveryMethods)
      $scope.deliveryMethodRLOptions.data = _.map(resolvedSiteDetails.Site.DeliveryMethods, function(method){
        return {
          name: method.Name,
          id: method.id
        }
      });
    $scope.deliveryMethodRLOptions.data[1].checked = "checked"

    var processingCharges = function(events){
      angular.forEach(events, function(ev,n){
        events[n].Charges = _.map(events[n].Charges, function(charge){return charge.ChargeID || charge.id})
      })
      return events
    }

    var fetch = function(cb){
      cb = cb || function(){}
      if ($stateParams.SiteID)
        DataStorage.sitesAnyApi('edit/' + $stateParams.SiteID).query(function(resp){
          if (resp && resp.Site){
            //$scope.eventsData = processingCharges(resp.Site.Events)
            //$scope.offersData = processingCharges(resp.Site.OfferImageAndTerms)
            $scope.eventsDataSafe = processingCharges(resp.Site.Events)
            $scope.offersDataSafe = processingCharges(resp.Site.OfferImageAndTerms)
            cb()
          }
        })
    };

    $scope.addNewItem = function(itemName, selectedItems){
      selectedItems = selectedItems || []
      ModalService.showModal({
        templateUrl: "components/modals/CAMPAIGNS/sites/assignItem.html",
        controller: "AssignItemsCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            modalTitle: itemName=='offers' ? 'Select Offer' : 'Select Event',
            itemName: itemName,
            selectedItems: selectedItems || [],
            resolvedSiteDetails: resolvedSiteDetails
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (!result) return;

          fetch(function(){
            var names = [];
            if (itemName=='offers'){
              angular.forEach(result, function(of){
                names.push($filter('filterByField')($scope.offersDataSafe, {id: of})[0].name)
              });
            }else{
              angular.forEach(result, function(of){
                names.push($filter('filterByField')($scope.eventsDataSafe, {id: of})[0].name)
              });
            }
            Notification.success({message: names.join(',') + ' '+(names.length>1 ? 'have' : 'has') +' been assigned', delay: 5000})
          });
          return false;
        });
      });

    };

    $scope.unassignEvent = function(itemId, itemName){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTitle:  'Unassign Item',
            modalTxt: 'Are you sure you want to unassign this item?'
          }
        }
      }).then(function (modal) {
        modal.element.modal();
        modal.close.then(function (result) {
          if (result == 'false') return false;
          var method = 'events/unassign/site';
          var obj = {
            "SiteID": $stateParams.SiteID,
            "EventID": itemId
          }
          if (itemName == 'offersData'){
            method = 'offerandterms/unassign/site';
            obj.OfferFormID = itemId
          }else
            obj.EventID = itemId
          DataStorage.sitesAnyApi(method).post(obj, function(resp){
            if (resp && !resp.Status){
              if (itemName == 'offersData'){
                Notification.success({message: $filter('filterByField')($scope.offersDataSafe, {id: itemId})[0].name +' been unassigned', delay: 5000})
                //$scope.offersData = $scope.offersData.filter(function(evD){return evD.id != itemId});
                $scope.offersDataSafe = $scope.offersDataSafe.filter(function(evD){return evD.id != itemId});
              }else{
                Notification.success({message: $filter('filterByField')($scope.eventsDataSafe, {id: itemId})[0].name +' been unassigned', delay: 5000})
                $scope.eventsDataSafe = $scope.eventsDataSafe.filter(function(evD){return evD.id != itemId});
                //$scope.eventsData = $scope.eventsData.filter(function(evD){return evD.id != itemId});
              }
            }
          });
        });
      });

    }

    $scope.selectPG = function(chargeOption, chargeId, arr){
        if (!chargeOption.rowCharges) chargeOption.rowCharges = [];
        if (chargeOption.rowCharges.indexOf(chargeId)>-1)
          chargeOption.rowCharges.splice(chargeOption.rowCharges.indexOf(chargeId), 1)
        else
          chargeOption.rowCharges.push(chargeId)
    }

    $scope.saveCharges = function(row, itemName, rowCharges){
      var obj = {
        "SiteID": $stateParams.SiteID,
        "ChargeIDs": rowCharges
      };
      var method = 'events/assign/charge';
      if (itemName == 'offers'){
        method = 'offerandterms/assign/charge'
        obj.OfferFormID = row.id;
      }else
        obj.EventID = row.id;
      DataStorage.sitesAnyApi(method).post(obj, function(resp){
        if (resp && resp.Status == 0){
          row.Charges = angular.copy(rowCharges)
          Notification.success({message: "Charges assigned", delay: 5000})
        }
      });
    };
    $scope.chargeOptions = [];
    $scope.chargeOptionsOffers = [];
    $scope.openOrCloseOption = function(index, itemName){
      if (!$scope[itemName][index]) $scope[itemName][index] = {}
      if (!$scope[itemName][index].show){
        angular.forEach($scope[itemName], function(opt, n){
          $scope[itemName][n].show=false;
        })
        $scope[itemName][index].show=true;
      }else
        $scope[itemName][index].show=false;
    }

    var normalizeData = function(resolvedSiteDetails){
      var site = resolvedSiteDetails.Site;
      //$scope.eventsData = processingCharges(resolvedSiteDetails.Site.Events);
      //$scope.offersData = processingCharges(resolvedSiteDetails.Site.OfferImageAndTerms);
      $scope.eventsDataSafe = processingCharges(resolvedSiteDetails.Site.Events);
      $scope.offersDataSafe = processingCharges(resolvedSiteDetails.Site.OfferImageAndTerms);
      $scope.chargesData = [];
      angular.forEach(resolvedSiteDetails.Site.ProductGroups, function(sPg){
        if (sPg.Charges)
          $scope.chargesData = $scope.chargesData.concat(sPg.Charges)
      });
      $scope.fields.siteNameTxtValue = site.SiteName;
      $scope.fields.domainUrlTxtValue = site.DomainUrl;
      $scope.fields.siteTitleTxtValue = site.SiteTitle;

      angular.forEach($scope.deliveryMethodRLOptions.data, function(d,n){
        if (d.id==site.DeliveryMethod) d.checked="checked"
      });

      if (!site.IsActive){
        delete $scope.isActiveOptions.data[0].checked
        $scope.isActiveOptions.data[1].checked = true
      }

      var client = resolvedSiteDetails.Client;
      // ********************* Fill MDFs ************************
      // Make site mdfs from client's, for mdfs table
      $scope.siteMDFs = client.Mdfs.filter(function (cMDF) {
        var res = false;
        for (var i = 0; i < site.Mdfs.length; i++) {
          var mdfId = site.Mdfs[i];
          if (cMDF.ID === mdfId)  res = true;
          // break is for one item only!
          //break;
        }
        return res;
      });
      $scope.siteMDFsSafe = angular.copy($scope.siteMDFs)
      // Constant Client Total MDFs for empty notice
      $scope.clientMDFs = angular.copy(client.Mdfs);
      // Removable Client MDFs for ADD select options
      $scope.addSelectClientMDFs = angular.copy(client.Mdfs);

      // For select default values
      for (var j = 0; j < $scope.siteMDFs.length; j++) {
        var mdf = $scope.siteMDFs[j];
        $scope.fields.mdfSelectModels[j] = { ID: mdf.ID, Name: mdf.Name };
        // Remove added from select
        $scope.addSelectClientMDFs = $scope.addSelectClientMDFs.filter(function (cMDF) {
          return mdf.ID !== cMDF.ID;
        });
      }

      // ********************* Fill Product Groups ************************
      $scope.sitePGs = client.ProductGroups.filter(function (cPG) {
        var res = false;
        for (var i = 0; i < site.ProductGroups.length; i++) {
          var SiteProductGroup = site.ProductGroups[i];
          if (cPG.ID === SiteProductGroup.id) res = true;
          // break is for one item only!
          //break;
        }
        return res;
      });
      $scope.sitePGsSafe = angular.copy($scope.sitePGs)
      // Constant Client Total Product Groups for empty notice
      $scope.clientProductGroups = angular.copy(client.ProductGroups);
      // Removable Client  Product Groups for ADD select options
      $scope.addSelectClientPGs = angular.copy(client.ProductGroups);
      // For select default values
      for (var j = 0; j < $scope.sitePGs.length; j++) {
        var pg = $scope.sitePGs[j];
        $scope.fields.pgSelectModels[j] = { ID: pg.ID, Name: pg.Name };
        // Remove added from select
        $scope.addSelectClientPGs = $scope.addSelectClientPGs.filter(function (cPG) {
          return pg.ID !== cPG.ID;
        });
      }
      // mode to edit

      setMode();
    };

    if (resolvedSiteDetails && resolvedSiteDetails.Site){
      $scope.resolvedSiteDetails = resolvedSiteDetails;
      normalizeData(resolvedSiteDetails)
    }

    //  1st select
    $scope.clientsSettings = {
      enableSearch: true,
      scrollableHeight: '243px',
      scrollable: true,
      idProp: 'ClientID',
      displayProp: 'CompanyName',
      selectName: 'Selected',
      showCheckAll: false,
      showUncheckAll: false,
      selectionLimit: 1
    };

    if ($stateParams.ClientID) {
      $scope.clientsSettings.selectedByDefault = [{ClientID: $stateParams.ClientID}];
      $stateParams.ClientID = false;
    }

    $scope.clientsSelectModel1 = $scope.clientsData[0];
    $scope.clientsSelectModel2 = $scope.clientsData[1];

    $scope.$watchCollection( 'clientsModel',
      function( newValue, oldValue ) {
        if (!newValue.length && !oldValue.length) return;
        if (!newValue.length && oldValue.length) {
          $scope.sitesModel = [];
          return;
        }
      }
    );

    $scope.siteNameTxtOptions = {
      label: 'Site Name:',
      id: 1,
      valRequired: true
    };

    $scope.domainUrlTxtOptions = {
      label: 'Domain URL:',
      id: 2,
      type: 'url',
      placeholder: 'Example http://google.com',
      valUrl: true,
      valRequired: true
    };

    $scope.siteTitleTxtOptions = {
      label: 'Site Title:',
      id: 3,
      valRequired: true
    };

    $scope.deleteMdf = function (obj) {
      $scope.siteMDFs = $scope.siteMDFs.filter(function(row){
        return row.ID != obj.ID
      });
      $scope.siteMDFsSafe = $scope.siteMDFsSafe.filter(function(row){
        return row.ID != obj.ID
      });
      $scope.fields.addMDFSelectModel = '';
      $scope.addSelectClientMDFs.push(obj);
    };

    $scope.deletePg = function (obj) {
      $scope.sitePGs = $scope.sitePGs.filter(function(row){
        return row.ID != obj.ID
      });
      $scope.sitePGsSafe = $scope.sitePGsSafe.filter(function(row){
        return row.ID != obj.ID
      });
      $scope.fields.addPGSelectModel = '';
      $scope.addSelectClientPGs.push(obj);
    };

    $scope.$watch('fields.addMDFSelectModel', function(val){
       if (val){
         if (!$scope.siteMDFs) $scope.siteMDFs = [];
         if (!$scope.siteMDFsSafe) $scope.siteMDFsSafe = [];
         $scope.siteMDFs.push(val);
         $scope.siteMDFsSafe.push(val);
         $scope.addSelectClientMDFs = $scope.addSelectClientMDFs.filter(function(s){
           return s.ID != val.ID
         })
       }
    });

    $scope.$watch('fields.addPGSelectModel', function(val){
       if (val){
         if (!$scope.sitePGs) $scope.sitePGs = [];
         if (!$scope.sitePGsSafe) $scope.sitePGsSafe = [];
         $scope.sitePGs.push(val);
         $scope.sitePGsSafe.push(val);
         $scope.addSelectClientPGs = $scope.addSelectClientPGs.filter(function(s){
           return s.ID != val.ID
         })
       }
    });

    $scope.save = function () {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.siteOptionsForm.$invalid) { return; }
      if (!$scope.clientsModel || !$scope.clientsModel.length) {
        $scope.showAddClient = true;
        return;
      }
      var saveObj = {
        "ClientID": getClientID(),
        "SiteName": $scope.fields.siteNameTxtValue || '',
        "DomainUrl": $scope.fields.domainUrlTxtValue || '',
        "SiteTitle": $scope.fields.siteTitleTxtValue || '',
        "DeliveryMethod": $scope.fields.deliveryMethodRLValue && $scope.fields.deliveryMethodRLValue.id ? $scope.fields.deliveryMethodRLValue.id : 1,
        "IsActive": !!($scope.fields.isActiveValue && $scope.fields.isActiveValue.id == 1)
      };
      var savePromise = DataStorage.sitesAddNewApi().post(saveObj).$promise;
      $scope.saving = true
      savePromise.then(
        function (reply) {
          if (reply.Status) {
            $scope.saving = false
            return false;
          }

          $scope.saving = false
          $state.go('main.siteoptions', {SiteID: reply.SiteID, ClientID: getClientID()}, {
            reload: true,
            inherit: false,
            notify: true
          })
        },
        function (error) {
          console.log(' save site req error ', error);
        }
      );
    };

    $scope.saveEdited = function (formValid) {
      $scope.$broadcast('show-errors-check-validity');
      if ($scope.siteOptionsForm.$invalid) {
        $timeout(function(){
          var someElement = angular.element('.help-block:visible').eq(0);
          if (someElement && someElement.length>0)
            $document.scrollToElementAnimated(someElement,300);
        });
        return
      }
      var action = 'edit',
          siteMdfs = [],
          sitePgs = [],
          actionPromise = {},
          SiteID = $stateParams.SiteID ? parseInt($stateParams.SiteID) : $scope.newSiteId.id,
          saveObj = {
            "SiteID": SiteID,
            "SiteName": $scope.fields.siteNameTxtValue || '',
            "DomainUrl": $scope.fields.domainUrlTxtValue || '',
            "SiteTitle": $scope.fields.siteTitleTxtValue || '',
            "DeliveryMethod": $scope.fields.deliveryMethodRLValue && $scope.fields.deliveryMethodRLValue.id || 1,
            "IsActive": $scope.fields.isActiveValue && $scope.fields.isActiveValue.id == 1
          };
      if ($scope.sitePGsSafe && $scope.sitePGsSafe.length) {
        sitePgs = $scope.sitePGsSafe.map(function (pg) {
          return pg.ID;
        });
      }
      if ($scope.siteMDFsSafe && $scope.siteMDFsSafe.length) {
        siteMdfs = $scope.siteMDFsSafe.map(function (mdf) {
          return mdf.ID;
        });
      }
      saveObj.Mdfs = siteMdfs;
      saveObj.SiteProductGroups = sitePgs;
      actionPromise = DataStorage.sitesAnyApi(action).post(saveObj).$promise;
      $scope.saving = true;
      actionPromise.then(function (data) {
        if (data && !data.Status){
          $scope.saving = false;
          $scope.showSiteSaved = true;
        }else
          $scope.saving = false;
      },
      function (error) {
        $scope.showSiteSavedError = true;
      });
    };

    $scope.showChargesOrReccurings = function (groupID, type) {
      var action = '/sites/groupcharges/'+groupID+'/'+ (type == 'recurrings'),
      actionPromise = DataStorage.anyApiMethod(action).query().$promise;
      actionPromise.then(function (data) {
        if (data && !data.Status)
          ModalService.showModal({
            templateUrl: "components/modals/CAMPAIGNS/sites/groupChargesTable.html",
            controller: "ChargesReccuringsTableCtrl",
            windowClass: 'big-modal',
            inputs: {
              data: {
                modalTitle: type == 'recurrings' ? 'Recurrings' : 'Charges',
                data: data.Charges
              }
            }
          }).then(function (modal) {
            modal.element.modal();
          });
      },
      function (error) {
        //console.log(' group charges error ', error);
      });
    };

    $scope.reset = function () {
      // Reset to new site
      setMode(true);
    };


    $scope.addMDFs = function () {
      if (!getClientID()) return false;
      $state.go('main.mdfconfig', {clientID: getClientID()});
    };

    $scope.addPGs = function () {
      if (!getClientID()) return false;
      $state.go('main.products', {clientID: getClientID()});
    };

    $scope.closeNewSiteIDNotice = function () {
      $scope.newSiteId.show = false;
      $scope.showSiteSaved = false;
      $scope.showSiteSavedError = false;
    };

    $scope.deletePGRow = function (pg) {
      //console.log(' deletePGRow: ', pg);
    };

    angular.element($document).mouseup(function (e){
      var container = $(".charges-dropdown");
      if (!container.is(e.target) && container.has(e.target).length === 0){
        angular.forEach($scope.chargeOptions, function(opt, n){
          $scope.chargeOptions[n].show=false
        });
        angular.forEach($scope.chargeOptionsOffers, function(opt, n){
          $scope.chargeOptionsOffers[n].show=false
        });
      }
    });
  });
