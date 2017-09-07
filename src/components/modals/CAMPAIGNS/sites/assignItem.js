'use strict';
angular.module('crm')
  .controller('AssignItemsCtrl',function($scope, data, close, DataStorage, $filter) {
    $scope.data = data;
    var origData = []
    if (data.itemName == 'emails')
      origData = (angular.copy(data.resolvedSiteDetails.Client.Events) || []).filter(function(row){
        return !$filter('filterByField')(data.selectedItems, {id: row.id}).length
      })
    else
      origData = angular.copy(data.resolvedSiteDetails.Client.OfferImageAndTerms || []).filter(function(row){
        return !$filter('filterByField')(data.selectedItems, {id: row.id}).length
      });

    $scope.safeTable = angular.copy(origData);

    var assignEvent = function(){
      var returnRes = []
      $scope.emptyEventsError = false
      if (data.resolvedSiteDetails.Site){
        var resObj = {
          SiteID: data.resolvedSiteDetails.Site.SiteID,
          EventIDs: []
        };
        angular.forEach($scope.safeTable, function(ev){
          if (ev.assign) {
            resObj.EventIDs.push(ev.id)
            if (!$filter('filterByField')(data.selectedItems, {id: ev.id}).length)
              returnRes.push(ev.id)
          }
        });
        if (resObj.EventIDs.length>0)
          DataStorage.sitesAnyApi('events/assign/site').post(resObj, function(resp){
            if (resp && !resp.Status){
              close(returnRes, 500);
            }
          })
        else $scope.emptyEventsError = true
      }
    }
    var assignOffer = function(){
      $scope.emptyOffersError = false
      var returnRes = [];
      if (data.resolvedSiteDetails.Site){
        var resObj = {SiteID: data.resolvedSiteDetails.Site.SiteID, OfferFormIDs: []};
        angular.forEach($scope.safeTable, function(offer){
          if (offer.assign) {
            resObj.OfferFormIDs.push(offer.id)
            if (!$filter('filterByField')(data.selectedItems, {id: offer.id}).length)
              returnRes.push(offer.id)
          }
        });
        if (resObj.OfferFormIDs.length>0)
          DataStorage.sitesAnyApi('offerandterms/assign/site').post(resObj, function(resp){
            if (resp && !resp.Status){
              close(returnRes, 500);
            }
          });
        else $scope.emptyOffersError = true
      }
    }

    $scope.filterEvents = function(selectedTemplateType){
      if (selectedTemplateType){
        $scope.safeTable = angular.copy(origData).filter(function(row){
          return row.TypeID == selectedTemplateType
        })
      }else
        $scope.safeTable = angular.copy(origData).filter(function(row){
          return !$filter('filterByField')(data.selectedItems, {id: row.id}).length
        })
    };

    $scope.assignItem = function(){
      if (data.itemName == 'offers') assignOffer()
      else assignEvent()
    };

    $scope.close = function() {
      close(null, 500);
    };

  });
