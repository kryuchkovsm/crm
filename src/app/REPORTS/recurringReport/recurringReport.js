'use strict';

angular.module('crm')
  .controller('recurringReportCtrl', function (
    $scope, $window, ReportsSetup, DataProcessing, 
    DataStorage, ModalService, $q, GlobalVars, ScrollService) {
  
    ReportsSetup.commonOptions($scope, 'recurring', 'RecurringReport');
    
    angular.extend($scope.clientDatesOptions, {
      groupBy: true,
      groupBySelectOptions: [
        {"id":1,"name":"Campaign", "sName":"campaign"},
        {"id":0,"name":"Affiliate", "sName":"affiliate"}
      ]
    })
    
    $scope.keysHeader = {
      "Name":"Name",
      "ID":"ID",
      "1#":"1#",
      "1$":"1$",
      "2#":"2#",
      "2$":"2$",
      "3#":"3#",
      "3$":"3$",
      "4#":"4#",
      "4$":"4$",
      "5#":"5#",
      "5$":"5$",
      "6#":"6#",
      "6$":"6$",
      "7#":"7#",
      "7$":"7$",
      "8#":"8#",
      "8$":"8$",
      "9#":"9#",
      "9$":"9$",
    };

    $scope.search = function () {
      var deferred = $q.defer();
      GlobalVars.setLoadingRequestStatus(true)
      $scope.tableObj = [];
      $scope.tableObjSafe = [];
      $scope.subTableObjSafe = [];
      
      var cd = $scope.clientDatesValue;
      var dateFrom = DataProcessing.stringToDate(cd.fromDateValue);
      var dateTo = DataProcessing.stringToDate(cd.toDateValue);
      
      var searchObj = {
        SiteIDs: cd.sitesModel.map(function (item) { return item.id; }),
        DateFrom: DataProcessing.dateToServer(dateFrom),
        DateTo: DataProcessing.dateToServer(dateTo),
        GroupBy: cd.groupBySelectValue
      };

      ///var actionPromise = tableFiltersGetDataPromise($scope, "recurring");
      var actionPromise = DataStorage.reportsAnyApi('recurring').post(searchObj).$promise;
      
      actionPromise.then(function (data) {
          deferred.resolve();
          GlobalVars.setLoadingRequestStatus(false)

          if (data.Status) {
            $scope.tableObj = [];
            $scope.tableObjSafe = [];
            $scope.dataReady = 'No';
          } else {
            var sData = data.RecurringReport;

            if (sData.Grid.length) {
              $scope.gridTotal = {};
              $scope.tableObjSafe = sData.Grid || []
          
              if (sData.GridTotal){
                  $scope.gridTotal = sData.GridTotal
                  $scope.tableObjSafe.push(sData.GridTotal)
              }

              $scope.dataReady = true;

            } else {
              $scope.keysHeader = {};
              $scope.tableObjSafe = [];
              $scope.dataReady = 'No';
            }
          }
          ScrollService.scrollTo('bottom');
        }
      );

      return deferred.promise;
    };

    $scope.showMainCountDetails = function (rowID, num, isTotal) {
      var cd = angular.copy($scope.clientDatesValue)
      var title = "Details";
      var selectedSiteIDs = _.map(cd.sitesModel, function(site){ return site.id;});
      var query = {
        Table: 'main',
        GroupBy: cd.groupBySelectValue,
        ChargeNum: num,
        DateFrom: DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone),
        DateTo: DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone),
        SiteIDs: (isTotal || cd.groupBySelectValue == 'affiliate') ? selectedSiteIDs : [rowID],
        Affiliate: cd.groupBySelectValue == 'affiliate' ? rowID : null
      };
      $scope.showModalDetails(title, query);
    }
    
    $scope.showSubCountDetails = function (rowID, num, isTotal) {
      var cd = angular.copy($scope.clientDatesValue)
      var title = "Details";
      var selectedSiteIDs = _.map(cd.sitesModel, function(site){ return site.id;});
      var query = {
        Table: 'sub',
        GroupBy: cd.groupBySelectValue,
        ChargeNum: num,
        DateFrom: DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone),
        DateTo: DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone),
        SiteIDs: cd.groupBySelectValue == 'campaign' ? [$scope.SiteID] : selectedSiteIDs,
        Affiliate: cd.groupBySelectValue == 'affiliate' ? $scope.Affiliate : null,
        SubID: cd.groupBySelectValue == 'affiliate' ? rowID : null
      };
      
      if (cd.groupBySelectValue == 'campaign'){
        query.ProductID = rowID;
      }
      $scope.showModalDetails(title, query);
    }
    
    $scope.showSubTable = function (rowID) {
      var cd = angular.copy($scope.clientDatesValue)

      var query = {
        GroupBy: cd.groupBySelectValue,
        DateFrom: DataProcessing.dateToServer(DataProcessing.stringToDate(cd.fromDateValue), $scope.selectedTimezone),
        DateTo: DataProcessing.dateToServer(DataProcessing.stringToDate(cd.toDateValue), $scope.selectedTimezone),
        SiteIDs: cd.groupBySelectValue == "affiliate" ? _.map(cd.sitesModel, function(site){ return site.id;}) : [rowID],
        Affiliate: cd.groupBySelectValue == 'affiliate' ? rowID : null
      };
      
      if (cd.groupBySelectValue == 'campaign'){
        $scope.SiteID = rowID
      }
      
      if (cd.groupBySelectValue == 'affiliate'){
        $scope.Affiliate = rowID
      }
      
      DataStorage.anyApiMethod('/reports/details/recurring/groupby').post(query, function(data){
        $scope.loading = false;
        var sData = data.RecurringGroupByDetails;
        
        if (sData && sData.Grid){
          sData.Grid = _.map(sData.Grid, function(row){
            if (row.Date)
              row.Date = DataProcessing.toDateFormat(row.Date*1000)
            return row;
          })
          $scope.subTableObj = sData.Grid;
          $scope.subTableObjSafe = sData.Grid;
          
          $scope.subGridTotal = {};
          if (sData.GridTotal){
            $scope.subGridTotal = sData.GridTotal
            $scope.subTableObjSafe.push(sData.GridTotal)
          }
        }
      });
    }

    // override function
    $scope.exportToExcel = function (keysHeader, isHeader) {
      var headerKeys = Object.keys(keysHeader);
      
      if (isHeader){
        var res = [];
        _.each(headerKeys, function(k){
          var tK = keysHeader[k];
          if (k=='KeyID') tK = idName+' ID'
          if (k=='KeyName') tK = 'Name'
          res.push(tK)
        })
        return res;
      }

      if (!$scope.tableObjSafe) 
        return false;

      var table = _.map(angular.copy($scope.tableObjSafe), function(row){
        var resRow = {};
        _.each(row, function(v, k){
          if (Object.prototype.toString.call( v ) === '[object Array]'){
            _.each(v, function(item, index){
              resRow[(index + 1) + '#'] = item.Key;
              resRow[(index + 1) + '$'] = item.Value;
            })
          } else {
            var tK = keysHeader[k];
            if (tK)
              resRow[tK] = v+'';
            else
              resRow[k] = v+'';
          }
        });
        return resRow
      });

      return table;
    };

  })
