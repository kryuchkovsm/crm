angular.module('crm')
  .controller('CampaignSetupCtrl', function (
  $scope, DataStorage, resolveCampaign, DataProcessing, GlobalVars, CampaignSetup, 
  $filter, ScrollService, $timeout, ModalService, $state, $document, $http, $rootScope) {
  
  GlobalVars.setLoadingRequestStatus(false)

  $scope.tokens = ['{{customer_id}}', '{{transaction_id}}']
  $scope.transaction_id = '{{transaction_id}}'
  $scope.customer_id = '{{customer_id}}'
  $scope.addToken = function(token, event){
    var id = angular.element(event.target).parents('.tokens-container').attr('textarea-id')
    var domElement = angular.element('#'+id)[0];
    if (document.selection) {
      domElement.focus();
      var sel = document.selection.createRange();
      sel.text = token;
      domElement.focus();
    } else if (domElement.selectionStart || domElement.selectionStart === 0) {
      var startPos = domElement.selectionStart;
      var endPos = domElement.selectionEnd;
      var scrollTop = domElement.scrollTop;
      domElement.value = domElement.value.substring(0, startPos) + token + domElement.value.substring(endPos, domElement.value.length);
      domElement.focus();
      domElement.selectionStart = startPos + token.length;
      domElement.selectionEnd = startPos + token.length;
      domElement.scrollTop = scrollTop;
    } else {
      domElement.value += token;
      domElement.focus();
    }
    angular.element('#'+id).trigger('input');
  };


  $scope.common = {showProductsAsPage: false, pagesCount: 1};
  $scope.fields = {
    WebSiteType: 'singlepage',
    IsAlternateBillingAddress: true,
    Pages: []
  };
  $scope.formNames = {
    'singlepage': $rootScope.translate('campaigns.campaigns.campaignsetup.single-form'),
    'twopages': $rootScope.translate('campaigns.campaigns.campaignsetup.two-pages-form'),
    'multiplepages': $rootScope.translate('campaigns.campaigns.campaignsetup.multi-pages-form')
  };
  $scope.clientsModel = [];
  $scope.sitesModel = [];
  $scope.clientsData = GlobalVars.commonObject().Clients;
  var origFields
  $scope.stepPageUrl = 'app/CAMPAIGNS/campaigns/steps/step0.html';

  if (resolveCampaign && resolveCampaign.CampaignJson){
    $scope.fields = JSON.parse(resolveCampaign.CampaignJson);
    $scope.fields.CampaignGuid = $state.params.campaignGuid
    angular.forEach($scope.fields.Pages, function(page){
      if (page.Type =='billing') page.Type ='landing'
      if (page.MerchantDefinedFields && page.MerchantDefinedFields.length>0){
        if (!page.Columns) page.Columns = []
        page.Columns = page.Columns.concat(page.MerchantDefinedFields)
      }
    });
    origFields = angular.copy($scope.fields);
    if ($scope.fields.WebSiteType=='multiplepages')
      $scope.common.pagesCount = $filter('filter')(origFields.Pages, {Type: 'landing'}).length;

    $scope.sitesData = $filter('filterByField')($scope.clientsData, {ClientID: $scope.fields.ClientID})[0].Sites
    $scope.clientsModel = [{id: $scope.fields.ClientID}];

    $timeout(function(){
      $scope.sitesModel = [{id: $scope.fields.SiteID}];
    },10)

    $scope.moveToLeft = true;
    $scope.stepPageUrl = ''
    $timeout(function(){
      $scope.stepPageUrl = 'app/CAMPAIGNS/campaigns/steps/step1.html'
    },500)
//console.log($scope.fields.Pages)
  }

  DataStorage.anyApiMethod('/campaigns/add').query(function(resp){
    if (resp.Status == 0)
      $scope.countries = resp.Countries
  });

  $scope.showTypeIDs = {
    'singlepage': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15],
    'twopages': [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22],
    'multiplepages': []
  };

  $scope.pageTypes = ['landing', 'upsell', 'billing', 'confirmation'];

  var gotoTop = function() {
    ScrollService.scrollTo('top');
  };

  var scrollToInvalidEl = function(){
    $timeout(function(){
      var someElement = angular.element('.ng-invalid').eq(0);
      if (someElement && someElement.length)
        $document.scrollToElementAnimated(someElement, 300);
    },100);
  }


  $scope.prevStep = function(num){
    $scope.moveToLeft = false;
    $scope.stepPageUrl = ''
    $timeout(function(){
      $scope.stepPageUrl = 'app/CAMPAIGNS/campaigns/steps/step'+num+'.html'
    },500)

    if (num == 4 || num == 5){
      $scope.currentPageID = $scope.currentPageID - 1;
      $scope.common.showProductsAsPage = $scope.fields.WebSiteType != 'multiplepages';
    }
    gotoTop()
  };
  $scope.nextStep = function(num, form, validProductGroups){
    if ((angular.isDefined(validProductGroups) && !validProductGroups) || (form && form.$invalid)) {
      scrollToInvalidEl()
      return;
    }

    if (num == 4) $scope.currentPageID=1;
    if (num == 5) {
      if (!checkCountries()) return
      if (checkGroupsOnForm()) $scope.addUpsell()
      else return
    }
    if (num == 6) {
      var removeUpsells = $filter('filter')($scope.fields.Pages, {Type: 'upsell', PageID: $scope.currentPageID+1}) || [];
      var confirmationPages = $filter('filter')($scope.fields.Pages, {Type: 'confirmation'})
      if (removeUpsells.length>0){
        $scope.fields.Pages = $scope.fields.Pages.filter(function(page){
          return !(page.Type == 'upsell' && page.PageID>$scope.currentPageID)
        });
      }
      $scope.currentPageID += 1;
      if (confirmationPages.length == 0){
        $scope.fields.Pages.push({
          Type: 'confirmation', PageID: angular.copy($scope.currentPageID),
          "Properties": {
            "CustomerInformation": {},
            "OrderInformation": {},
            "UseTables": {}
          }
        })
      }else{
        angular.forEach($scope.fields.Pages, function(page){
          if (page.Type == 'confirmation')
            page.PageID = angular.copy($scope.currentPageID)
        })
      }
    }
    $scope.moveToLeft = true;
    $scope.stepPageUrl = ''
    $timeout(function(){
      $scope.stepPageUrl = 'app/CAMPAIGNS/campaigns/steps/step'+num+'.html'
    },500)

    gotoTop()
  };

  $scope.$watch('currentPageID', function(val){
    if (val && $filter('filterByField')($scope.fields.Pages,{PageID: val}).length && $filter('filterByField')($scope.fields.Pages,{PageID: val})[0].Type=='confirmation'){
      $scope.completeSetup(true);
    }
  });

  $scope.prevStepFromPage = function(){
    switch($scope.fields.WebSiteType){
      case 'singlepage':
        $scope.nextStep(3)
        break;
      case 'twopages':
        if (!$filter('filter')($scope.fields.Pages, {Type: 'landing', PageID: angular.copy($scope.currentPageID)-1}).length)
          $scope.nextStep(3)
        else {
          $scope.currentPageID -= 1;
          gotoTop()
        }
        break;
      case 'multiplepages':
        if (!$filter('filter')($scope.fields.Pages, {Type: 'landing', PageID: angular.copy($scope.currentPageID)-1}).length)
          $scope.nextStep(3)
        else {
          $scope.currentPageID -= 1;
          gotoTop()
        }
        break;
    }
  }

  $scope.prevFromComplete = function(){
    if ($scope.fields.WebSiteType == 'multiplepages')
      $scope.prevStep(4)
    else{
      if ($filter('filter')($scope.fields.Pages, {Type: 'upsell', PageID: angular.copy($scope.currentPageID)-1}).length)
        $scope.prevStep(5)
      else
        $scope.prevStep(4)
    }
  };

  $scope.showRecurings = function(activeRecurrings){
    ModalService.showModal({
      templateUrl: "components/modals/CAMPAIGNS/campaignSetup/activeRecurrings.html",
      controller: "ActiveRecurringsCtrl",
      windowClass: 'big-modal',
      inputs: {
        data: {
          modalTitle: 'Active Recurrings',
          ClientID: $scope.clientID,
          activeRecurrings: activeRecurrings
        }
      }
    }).then(function (modal) {
      modal.element.modal();
    });
  }

  $scope.showCharges = function (productGroup) {
    var prGroup = angular.copy(productGroup);
    prGroup.Charges = prGroup.Charges || [];
    prGroup.Charges = _.map(prGroup.Charges, function(charge){
      if (!charge.Name)
        _.extend(charge, {
          Name: charge.name,
          ID: charge.id
        });
      return charge
    });

    ModalService.showModal({
      templateUrl: "components/modals/CAMPAIGNS/products/productChargeTable.html",
      controller: "ProductChargeTableCtrl",
      windowClass: 'big-modal',
      inputs: {
        data: {
          modalTitle: 'Product Charges',
          ClientID: $scope.clientID,
          data: prGroup,
          disallowActions: true
        }
      }
    }).then(function (modal) {
      modal.element.modal();
    });
  };

  $scope.submittedPage = {};
  var checkCountries = function(){
    $scope.submittedPage[$scope.currentPageID] = true;
    var currentPage = $filter('filter')($scope.fields.Pages, {Type: 'landing', PageID: $scope.currentPageID})[0];
    if (currentPage && currentPage.Columns){
      var countryField = $filter('filterByField')(currentPage.Columns, {Name: 'Country'})
      if (!countryField || countryField && !countryField.length) return true;
      var check = (countryField[0].Properties && countryField[0].Properties.options &&
      countryField[0].Properties.options.length)
      if (!check)
        $timeout(function(){
          var someElement = angular.element('.countries-selector');
          if (someElement && someElement.length)
            $document.scrollToElementAnimated(someElement, 300);
        },100);

      return check
    }else
      return true
  };

  $scope.nextStepFromPage = function(){
    var checkC = checkCountries();
    switch($scope.fields.WebSiteType){
      case 'singlepage':
        if (checkC){
          $scope.common.showProductsAsPage=true;
          gotoTop()
        }
        break;
      case 'twopages':
        if (checkC) {
          if (!$filter('filter')($scope.fields.Pages, {Type: 'landing', PageID: $scope.currentPageID + 1}).length)
            $scope.common.showProductsAsPage = true;
          else
            $scope.currentPageID += 1;
          gotoTop()
        }
        break;
      case 'multiplepages':
        if (checkC){
          if (!$filter('filter')($scope.fields.Pages, {Type: 'landing', PageID: $scope.currentPageID+1}).length){
            $scope.skipUpsellPages()
          }else{
            $scope.currentPageID += 1;
            gotoTop()
          }
        }

        break;
    }
  };

  $scope.prevUpsellPage = function(){
    var upsellPages = $filter('filter')($scope.fields.Pages, {Type: 'upsell', PageID: angular.copy($scope.currentPageID)-1});
    if (upsellPages.length == 0) {
      $scope.prevStep(4)
    }else{
      $scope.currentPageID = $scope.currentPageID - 1;
      gotoTop()
    }
  }

  $scope.addUpsell = function(form, validProductGroups){
    if ((angular.isDefined(validProductGroups) && !validProductGroups) || (form && form.$invalid)) {
      scrollToInvalidEl()
      return;
    }
    var upsellPages = $filter('filter')($scope.fields.Pages, {Type: 'upsell', PageID: angular.copy($scope.currentPageID)+1});
    if (upsellPages.length==0){
      $scope.currentPageID += 1;
      $scope.fields.Pages.push({
        Type: 'upsell',
        PageID: angular.copy($scope.currentPageID),
        Groups: []
      });

      angular.forEach($scope.fields.Pages, function(page){
        if (page.Type == 'confirmation') page.PageID = angular.copy($scope.currentPageID)+1;
      });
    }else
      $scope.currentPageID = angular.copy(upsellPages[0].PageID)
    gotoTop()
  };

  $scope.clientsSettings = {
    enableSearch: true,
    scrollableHeight: '100px',
    scrollable: true,
    idProp: 'ClientID',
    displayProp: 'CompanyName',
    selectName: $filter('translate')('common.clients'),
    selectionLimit: 1
  };

  $scope.sitesSettings = {
    idProp: 'SiteID',
    displayProp: 'Name',
    enableSearch: true,
    scrollableHeight: '100px',
    scrollable: true,
    searchPlaceholder: $rootScope.translate('campaigns.campaigns.campaignsetup.type-site-name-here-or-select-from-list.'),
    selectName: $filter('translate')('common.sites'),
    selectionLimit: 1
  };
  $scope.searchFilter = {
    sites: '',
    clients: ''
  }

  $scope.upsellPageNameTxtOptions = {
    label: $rootScope.translate('campaigns.campaigns.campaignsetup.page-name')+':',
    placeholder: $rootScope.translate('campaigns.campaigns.campaignsetup.type-page-name'),
    id: 1,
    valRequired: true
  };

  $scope.upsellPageTitleTxtOptions = {
    label: $rootScope.translate('campaigns.campaigns.campaignsetup.page-title')+':',
    placeholder: $rootScope.translate('campaigns.campaigns.campaignsetup.type-page-title'),
    id: 1,
    valRequired: true
  };

  $scope.$watchCollection("clientsModel",
    function(clients) {
      $scope.sitesModel = [];
      if (clients && clients.length>0){
        $scope.clientID = clients[0].id;
        $scope.sitesData = DataProcessing.newMakeSites(clients, $scope.clientsData) || [];
      }else
        $scope.sitesData = [];
    }
  );

  $scope.checkStep3 = function(site, client){
    if (!(site && client)) return;
    $scope.fieldOptions = CampaignSetup.fieldOptions();

    $scope.checkingStep3 = true;
    DataStorage.anyApiMethod('/campaigns/mdfs/'+site).query(function(resp){
      $scope.checkingStep3 = false;
      var mxN = 0;
      angular.forEach(resp.MDFs, function(mdf, n){
        mxN = n;
        $scope.fieldOptions.push({
              Label: mdf.name + ':',
              ID: mdf.id,
              ElementType: "input",
              FieldType: "text",
              isMDF: true,
              Properties: {
                options: []
              },
              id: n+16
        })
      });

      $scope.clientID = client;
      $scope.fields.SiteID = site;

      //determinate pages
      var columns = []
      angular.forEach(angular.copy($scope.fields.Pages), function(t){
        if (t.Columns) columns = columns.concat(t.Columns)
      });

      _.each(columns, function(column){
        if (column.ID && !$filter('filter')($scope.fieldOptions, {ID: column.ID}).length){
          $scope.fieldOptions.push({
            Label: column.Label,
            ID: column.ID,
            ElementType: column.Properties.ElementType,
            FieldType: column.Properties.FieldType,
            isMDF: true,
            Properties: column.Properties,
            id: mxN+16
          })
          mxN += 1;
        }
      });

      angular.forEach($scope.fieldOptions, function(opt, n){
        if (!opt.Properties || (opt.Properties && !opt.Properties.sort) ){
          opt.Properties = opt.Properties || {};
          opt.Properties.sort = n;
        }
      });
      $scope.hiddenOptions = [];
      $scope.fields.Pages = $scope.fields.Pages || [];
      switch($scope.fields.WebSiteType) {
        case 'singlepage':
          if (origFields && $filter('filter')(origFields.Pages, {Type: 'landing'}).length==1){
            $scope.fields.Pages = origFields.Pages
            angular.forEach($scope.fieldOptions, function(opt){
              var oldOpt = [];
              if (opt.ID){
                oldOpt = $filter('filterByField')(columns, {ID: opt.ID})
              }
              else
                oldOpt = $filter('filterByField')(columns, {Name: opt.Name})
              if (!oldOpt.length){
                $scope.hiddenOptions.push(opt)
              }
            })
          }else{
            $scope.fields.Pages = [{PageID: 1, Type: 'landing', Columns: []}];
            angular.forEach($scope.fieldOptions, function(opt){
              var oldOpt = [];
              if (opt.ID)
                oldOpt = $filter('filterByField')(columns, {ID: opt.ID})
              else
                oldOpt = $filter('filterByField')(columns, {Name: opt.Name})
              var t = {
                Label: opt.Label
              }
              if (opt.ID)
                t.ID = opt.ID
              else
                t.Name = opt.Name
              if (oldOpt.length>0)
                t = oldOpt[0];
              if (!t.Properties)
                t.Properties = {options: []};
              t.Properties.sort = opt.id;
              if (_.range(1,36).indexOf(opt.id)>-1)
                $scope.fields.Pages[0].Columns.push(t);
              else
                $scope.hiddenOptions.push(t)
            });
          }
          break;
        case 'twopages':
          if (origFields && $filter('filter')(origFields.Pages, {Type: 'landing'}).length==2){
            $scope.fields.Pages = origFields.Pages
          }else{
            $scope.fields.Pages = [{PageID: 1, Type: 'landing', Columns: []},
              {PageID: 2, Type: 'landing', Columns: []}];
            angular.forEach($scope.fieldOptions, function(opt){
              var oldOpt = [];
              if (opt.ID)
                oldOpt = $filter('filterByField')(columns, {ID: opt.ID})
              else
                oldOpt = $filter('filterByField')(columns, {Name: opt.Name})
              var t = {
                Label: opt.Label
              }
              if (opt.ID)
                t.ID = opt.ID
              else
                t.Name = opt.Name

              if (oldOpt.length>0)
                t = oldOpt[0]
              if (!t.Properties)
                t.Properties = {options: []};
              t.Properties.sort = opt.id;
              if ([11,12,13,14,15].indexOf(opt.id)>-1)
                $scope.fields.Pages[1].Columns.push(t);
              else if (_.range(1,36).indexOf(opt.id)>-1)
                  $scope.fields.Pages[0].Columns.push(t);
            });
            $scope.hiddenOptions = [];
          }
          break;
        case 'multiplepages':
          if (origFields && $filter('filter')(origFields.Pages, {Type: 'landing'}).length==$scope.common.pagesCount){
            $scope.fields.Pages = origFields.Pages
            angular.forEach($scope.fieldOptions, function(opt){
              var oldOpt = [];
              if (opt.ID)
                oldOpt = $filter('filterByField')(columns, {ID: opt.ID})
              else
                oldOpt = $filter('filterByField')(columns, {Name: opt.Name})
              if (!oldOpt.length)
                $scope.hiddenOptions.push(opt)
            })
          }else{
            $scope.fields.Pages = [];
            for (var i=0; i < $scope.common.pagesCount; i++){
              $scope.fields.Pages.push({PageID: i+1, Type: 'landing', Columns: []});
            }
            angular.forEach($scope.fieldOptions, function(opt){
              var oldOpt = [];
              if (opt.ID)
                oldOpt = $filter('filterByField')(columns, {ID: opt.ID})
              else
                oldOpt = $filter('filterByField')(columns, {Name: opt.Name})
              var t = {
                Label: opt.Label
              }
              if (opt.ID)
                t.ID = opt.ID
              else
                t.Name = opt.Name

              if (oldOpt.length>0)
                t = oldOpt[0]
              if (!t.Properties)
                t.Properties = {options: []};
              t.Properties.sort = opt.id;
              $scope.hiddenOptions.push(t)
            });
            break;
          }
      }

      _.each($scope.fieldOptions, function(opt){
        if (!opt) return
        var f = false
        _.each($scope.fields.Pages, function(page){
          if (!page.Columns) return
          if ($filter('filter')(page.Columns, {Name: opt.Name}).length)
            f = true;
        });
        if (!f && !$filter('filter')($scope.hiddenOptions, {Name: opt.Name}).length)
          $scope.hiddenOptions.push(opt)
      });

      DataStorage.anyApiMethod('/campaigns/productgroups/'+site).query(function(resp){
        $scope.safeProductsTableData = [];
        if (resp.ProductGroups) $scope.safeProductsTableData = resp.ProductGroups;
        $scope.productsTableData = angular.copy($scope.safeProductsTableData);
        $scope.nextStep(4)
      });
    });
  };
  //$scope.checkStep3(1003300, 193)

  var paymentFields = ['NameOnCard', 'CardType', 'CardNumber', 'ExpirationDate', 'CVV'];

  $rootScope.$on('changedAutoselect', function (event, data) {
    var i = paymentFields.indexOf('CardType')
    if (data && i > -1)
      paymentFields.splice(i,1)
    else if (!data && i == -1){
      paymentFields.push('CardType')
      if ($scope.hiddenOptions){
        angular.forEach($scope.hiddenOptions, function(opt){
          if (opt.Name == 'CardType')
            $scope.toggleField(opt, 'hidden')
        })
      }
    }
  });


  $scope.toggleField = function(opt, type){
    var nS =[];
    if (type == 'page'){
      if (paymentFields.indexOf(opt.Name)>-1){
        $filter('filterByField')($scope.fields.Pages, {PageID: $scope.currentPageID})[0].Columns =
          $filter('filterByField')($scope.fields.Pages, {PageID: $scope.currentPageID})[0].Columns.filter(function(column){
            if (paymentFields.indexOf(column.Name)>-1){
              $scope.hiddenOptions.push(column)
            }
            return paymentFields.indexOf(column.Name)==-1
          });
      }else{
        $filter('filterByField')($scope.fields.Pages, {PageID: $scope.currentPageID})[0].Columns =
          $filter('filterByField')($scope.fields.Pages, {PageID: $scope.currentPageID})[0].Columns.filter(function(column){
            if (column.Name && opt.Name && column.Name == opt.Name || (opt.Name == 'Country' && column.Name == 'State')) {
              $scope.hiddenOptions.push(column)
              return false
            }else if (column.ID && opt.ID && column.ID == opt.ID ){
              $scope.hiddenOptions.push(column)
              return false
            }
            return true
          })
      }
    }else{
      var viewColumn = function(opt){
        angular.forEach($scope.fields.Pages, function(page){
          if (page.PageID == $scope.currentPageID){
            page.Columns.splice(opt.Properties.sort-1, 0, opt)
          }
        })

        $scope.hiddenOptions = $scope.hiddenOptions.filter(function(o){
          if (opt.ID){
            return o.ID != opt.ID
          }else{
            return o.Name != opt.Name
          }
        })
      };

      if (paymentFields.indexOf(opt.Name)>-1){
        _.each($scope.hiddenOptions, function(hiddenOpt){
          if (paymentFields.indexOf(hiddenOpt.Name)>-1) viewColumn(hiddenOpt)
        })
      }else{
        viewColumn(opt)
      }

    }
  };

  $scope.sortableOptions = {
    axis:   'y',
    containment: '.campaign-setup-container',
    revert: 50,
    tolerance: 'pointer',
    cursor: 'move',
    stop: function(e, ui) {
      angular.forEach($scope.fields.Pages[$scope.currentPageID-1].Columns, function(column,n){
        column.Properties.sort = n + 1
      })
    }
  };

  $scope.addProductGroup = function(){
    var t = {
      Properties: {
        active: true,
        cbRadio: 'radio'
      }
    };
    angular.forEach($scope.fields.Pages, function(page,n){
      if (page.PageID == $scope.currentPageID){
        if (!page.Groups) page.Groups = [];
        page.Groups.push(t)
      }
    })
  };

  $scope.validProductGroups = function(groups){
    if (!groups || (groups && !groups.length)) return false
    var f=false;
    _.each(groups, function(group){
      if (group.ProductGroupGuid) f = true;
    })
    return f
  };

  var checkGroupsOnForm = function(){
    var existGroup = false;
    _.each($scope.fields.Pages, function(page){
      if (page.Type == 'landing' && page.Groups && page.Groups.length){
        _.each(page.Groups, function(gr){
          if (gr.ProductGroupGuid)
            existGroup = true;
        })
      }
    });
    if (!existGroup)
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/errorPopup.html",
        controller: "DataModalCtrl",
        inputs: {
          data: {
            modalTxt: $rootScope.translate('campaigns.campaigns.campaignsetup.form-page-should-contain-at-least-1-product-group')
          }
        }
      }).then(function (modal) {
        modal.element.modal();
      });

    return existGroup;
  };

  $scope.skipUpsellPages = function(){
    if (!checkCountries()) return
    if (!checkGroupsOnForm()) return
    $scope.fields.Pages = $scope.fields.Pages.filter(function(page){
      return page.Type != 'upsell'
    })
    $scope.nextStep(6);
  }

  $scope.setCommonCb = function(type){
    switch(type){
      case 'CustomerInformation':
        $scope.cbCustomerInformation = !$scope.cbCustomerInformation
        var v = angular.copy($scope.cbCustomerInformation)
        angular.forEach($scope.fields.Pages, function(page){
          if (page.Type == 'confirmation')
            angular.extend(page.Properties.CustomerInformation, {
              "FirstLastName": v,
              "BillingShippingAddress": v,
              "Phone": v,
              "Email": v
            })
        })
        break;
      case 'OrderInformation':
        $scope.cbOrderInformation= !$scope.cbOrderInformation
        var v = angular.copy($scope.cbOrderInformation)
        angular.forEach($scope.fields.Pages, function(page){
          if (page.Type == 'confirmation')
            angular.extend(page.Properties.OrderInformation, {
              "ProductName": v,
              "ProductAmount": v,
              "TotalProductTax": v,
              "Subtotal": v,
              "ShippingAmount": v,
              "TotalAmount": v,
              "TransactionID": v,
              "CustomerID": v
            })
        });
        break;
      case 'UseTables':
        $scope.cbUseTables = !$scope.cbUseTables
        var v = angular.copy($scope.cbUseTables)
        angular.forEach($scope.fields.Pages, function(page){
          if (page.Type == 'confirmation')
            angular.extend(page.Properties.UseTables, {
              "EnableBorders": v,
              "HorizontallyCenteredWithinPage": v,
              "CenterText": v
            })
        });
        break;
    }
  };

  var getStates = function(countriesArr, cb){
    if (countriesArr && countriesArr.length>0)
      DataStorage.anyApiMethod('/campaigns/states').post({CountryIDs: countriesArr}, function(resp) {
        if (resp.CountriesWithStates) cb(resp.CountriesWithStates)
        else cb(countriesArr)
      })
    else
      cb(countriesArr)
  }

  $scope.completeSetup = function(preview){
    var countries = [];
    $scope.resObj  = angular.copy($scope.fields);
    angular.forEach($scope.resObj.Pages, function(page, n){
      if (page.Columns){
        page.MerchantDefinedFields = [];
        angular.forEach(page.Columns, function(column, nC){
          column.Properties.sort = nC + 1

          if (column.ID){
            if (!page.MerchantDefinedFields) page.MerchantDefinedFields = [];
            var f;
            angular.forEach(page.MerchantDefinedFields, function(merch, mN){
              if (merch.ID == column.ID){
                f = true
                page.MerchantDefinedFields[mN] = angular.copy(column)
              }
            })
            if (!f)
              page.MerchantDefinedFields.push(column)
          }
        })
        page.Columns = page.Columns.filter(function(column){
          return !column.ID
        })
      }

      if (page.Groups){
        page.Groups = page.Groups.filter(function(group){
          if (!group.ProductGroupGuid) return false
          return true
        });
      }
    })
    $scope.resObj.Pages = $scope.resObj.Pages.filter(function(page){
      if (page.Type == 'upsell' && (!page.Groups || (page.Groups && page.Groups.length==0))) return false
      return true
    })
    angular.forEach($scope.resObj.Pages, function(page, n){
      if ($scope.resObj.WebSiteType == 'twopages' && page.Columns && $filter('filter')(page.Columns, {Name: 'CardNumber'}).length>0)
        page.Type = 'billing';
      if (page.Columns)
        _.each(page.Columns, function(c){
          if (c && c.Name == 'Country' && c.Properties)
            countries = _.map(c.Properties.options, function(opt){ return opt.id}) || [];
        })
    });

    getStates(countries, function(respArrCountries) {
      angular.forEach($scope.resObj.Pages, function (page) {
        if (page.Columns){
          var columnsRes = [];
          angular.forEach(page.Columns, function(column, n){
            if (column && column.Name == 'Country' && column.Properties)
              page.Columns[n].Properties.options = respArrCountries
            if (!column.ID) columnsRes.push(column)
          });
          page.Columns = columnsRes;
        }
      });
      var resPages = JSON.parse(angular.toJson($scope.resObj));
      if (preview){
        var previewJson = angular.copy(resPages);
        previewJson.ApiGuid = 'test';
        localStorage.setObject('campaignSite', angular.toJson(previewJson))
        //location.href = '/kit'
      }else{
        var method = '/campaigns/add';
        if (resPages.CampaignGuid)
          method = '/campaigns/edit'
        delete resPages.ApiGuid

        $scope.submitting = true;
        DataStorage.anyApiMethod(method).post(resPages, function(resp){
          $scope.submitting = false;
          if (resp.CampaignGuid || resPages.CampaignGuid){
            $scope.apiGuid = resp.CampaignGuid || resPages.CampaignGuid;
            $scope.common.generatedSite = true
            $scope.fields.CampaignGuid = angular.copy($scope.apiGuid)
            $timeout(function(){
              $scope.common.generatedSite = false
            },5000)
          }
        });
      }

    })
  };

  $scope.go = function(url, params){
    $state.go(url, params)
  }

  $scope.downloadKit = function(){
    if ($scope.apiGuid)
      DataStorage.anyApiMethod('/campaigns/download/'+$scope.apiGuid).query(function(resp){
        if (resp && resp.Content){
          //var blob = $.b64toBlob(resp.Content, 'application/zip');
          //$.downloadBlob(blob, resp.Filename || 'kit.zip')
          //$.downloadUrl('data:application/zip;base64,' + resp.Content, resp.Filename || 'kit.zip')
          download('data:application/zip;base64,' + resp.Content, resp.Filename || 'kit.zip', "application/zip");
        }
      })
  };

  $scope.checkConfirmationCb = function(obj){
    var f = false;
    angular.forEach(obj, function(v,k){
      if (v) f = true
    })
    return f;
  };
    //$http.get('/kit/website.b64').success(function(resp){
    //  DataStorage.anyApiMethod('/dev/update-website').post({"Base64ZipArchive": resp}, function(resp1){
    //    console.log(resp1)
    //  })
    //})
});
