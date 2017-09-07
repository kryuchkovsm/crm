/**
 * Created by user on 5/18/15.
 */
'use strict';

angular.module('DataProcessingService', [])
  .factory('DataProcessing',
  function($filter, GlobalVars) {
    var resObj = {};
    resObj.calcServerPage = function (newPage, itemsByPage, serverDataChunkSize, currDataArray) {
      var pageNumber = 0;
      // If current items amount is more than one serverDataChunkSize
      if (newPage * itemsByPage > serverDataChunkSize) {
        // If currDataArray has empty elements on the new page - set server page to download
        if (currDataArray[newPage * itemsByPage + 1].isItemEmpty) {
          pageNumber = (newPage * itemsByPage) / serverDataChunkSize | 0;
          pageNumber += 1;
        }
      }
      // Else return zero, not to update the table
      return pageNumber;
    };

    resObj.calcServerPageNew = function (newPage, itemsByPage, serverDataChunkSize, currDataArray, total) {
      var result = { load: false };
      // If items don't loaded yet
      if (currDataArray.length < total && newPage * itemsByPage > (currDataArray.length - 40)) {
        result.pageNumber = (newPage * itemsByPage) / serverDataChunkSize | 0;
        if ((newPage * itemsByPage) % serverDataChunkSize !== 0) {
          result.pageNumber += 1;
        }
        result.pageNumber += 1;
        result.load = true;
      }
      // Else return zero, not to update the table
      return result;
    };

    resObj.newMakeSites = function (clients, clientsData) {
      var sitesData = [];
      if (clients && clients.length==0) 
        sitesData = [{
          "SiteID":0,
          "Name":$filter('translate')('common.no-clients-selected'), 
          disabled: true
        }];
      else if (clients) 
        sitesData = [];

      angular.forEach(clients, function(client){
        angular.forEach(clientsData, function(clientData){
          if (clientData.ClientID == client.id) {
            var sitesMod = _.map(clientData.Sites, function(site){
              if (site.Name && site.Name.indexOf(site.SiteID)==-1)
                site.Name = site.SiteID +' - '+site.Name;
              return site;
            });
            sitesData = sitesData.concat(sitesMod)
          }
        });
      });

      return sitesData;
    };

    resObj.checkAvailableSites = function(sitesModel, clients, clientsData){
      var selectedSites = [];
      _.each(clients, function(client){
        var cl = $filter('filterByField')(clientsData, {ClientID: client.id})[0]
        if (cl){
          cl.Sites = cl.Sites || [];
          selectedSites = selectedSites.concat(cl.Sites)
        }
      });
      sitesModel = sitesModel.filter(function(site){
        return $filter('filterByField')(selectedSites, {SiteID: site.id}).length > 0
      })
      return sitesModel;
    };

    resObj.dateToServer = function(date, timezone){
      if (!timezone && GlobalVars.commonObject().UseServerOffset){
        timezone = GlobalVars.commonObject().ServerTimeZone
      }
      var d = moment(date).format('YYYY-MM-DD')
      return timezone ? moment.tz(d, timezone).unix() : moment(d).unix()
    };

    resObj.dateFromServer = function(unixDate, withTime){
      if (!unixDate) return unixDate
      var format = GlobalVars.commonObject().DateFormat || 'mm/dd/yyyy';
      if (withTime)
        format = GlobalVars.commonObject().DateTimeFormat || 'mm/dd/yyyy h:mm:ss A';

      format = format.split(' ');
      format[0] = format[0].toUpperCase();
      format = format.join(' ');

      if (GlobalVars.commonObject().UseServerOffset)
        return moment.unix(unixDate).tz(GlobalVars.commonObject().ServerTimeZone).format(format)
      return moment.unix(unixDate).format(format)
    };

    resObj.currentDate = function(){
      var d;
      if (GlobalVars.commonObject().UseServerOffset) d = moment().tz(GlobalVars.commonObject().ServerTimeZone)
      else d = moment();
      return d
    };

    resObj.stringToDate = function(dateString){
      var format = GlobalVars.commonObject().DateFormat || 'mm/dd/yyyy';
      format = format.toUpperCase();
      return moment(dateString, format)
    };

    resObj.toDateFormat = function(date, withTime){
      var format = GlobalVars.commonObject().DateFormat || 'mm/dd/yyyy';

      if (withTime)
        format = GlobalVars.commonObject().DateTimeFormat || 'mm/dd/yyyy h:mm:ss A'

      format = format.split(' ');
      format[0] = format[0].toUpperCase();
      format = format.join(' ');

      return moment(date).format(format);
    };

    resObj.updateSafeArr = function(newArr, oldArr, compareField){
      newArr = newArr || [];
      oldArr = oldArr || [];
      _.each(newArr, function(newItem){
        var f;
        angular.forEach(oldArr, function(oldItem){
          if (oldItem[compareField] == newItem[compareField]){
            f = true;
            angular.extend(oldItem, newItem)
          }
        })
        if (!f) oldArr.push(newItem)
      })
      var spliceArr = [];
      _.each(oldArr, function(oldItem, n){
        var fS;
        _.each(newArr, function(newItem){
          if (newItem[compareField] == oldItem[compareField]) fS = true;
        })
        if (!fS) spliceArr.push(n)
      });
      for (var i = spliceArr.length -1; i >= 0; i--)
        oldArr.splice(spliceArr[i],1);
    };

    return resObj;
  });
