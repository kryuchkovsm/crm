'use strict';

angular.module('HCCategoriesService', [])
  .factory('HCCategories',
  function() {
    var categories = function(){
      return {
        'main.login': {
          categoryName: "Authentification Page",
          categoryId: 202520878
        },
        'main.export': {
          categoryName: "Export Data",
          categoryId: 202513177
        },
        'main.search':{
          categoryName: "Search Customer",
          categoryId: 202520898
        },
        'main.addlead':{
          categoryName: "Add new Lead/Customer",
          categoryId: 202513027
        },
        'main.customer': {
          categoryName: "Customer",
          categoryId: 202513027
        },
        'main.editcustomer': {
          categoryName: "Customer",
          categoryId: 202513027
        },
        'main.editcustomerrecurring': {
          categoryName: "Customer",
          categoryId: 202513027
        },
        'main.addcustomerrecurring': {
          categoryName: "Customer",
          categoryId: 202513027
        },
        'main.sites': {
          categoryName: "Sites",
          categoryId: 202513077
        },
        'main.newsite': {
          categoryName: "New Site",
          categoryId: 202513077
        },
        'main.siteoptions': {
          categoryName: "Sites",
          categoryId: 202513077
        },

        'main.products': {
          categoryName: "Products",
          categoryId: 202513077
        },
        'main.mdfconfig': {
          categoryName: "MDF Configuration",
          categoryId: 202513087
        },

        'main.processorconfig': {
          categoryName: "Processor Configuration",
          categoryId: 202520978
        },

        'main.emailtemplates': {
          categoryName: "Email Templates",
          categoryId: 202520998
        },
        'main.emailtemplates.modify': {
          categoryName: "Email Templates",
          categoryId: 202520998
        },
        'main.emailsmtp': {
          categoryName: "Email Smtp",
          categoryId: 202520998
        },
        'main.emailevents': {
          categoryName: "Email Events",
          categoryId: 202520998
        },

        'main.offerimageandterms':{
          categoryName: "Offer Image and Terms",
          categoryId: 202513137
        },
        'main.mycampaigns': {
          categoryName: "My Campaigns",
          categoryId: 202521058
        },
        'main.campaignsetup': {
          categoryName: "Campaign Setup",
          categoryId: 202521058
        },

        'main.declinerunner': {
          categoryName: "Decline Runner",
          categoryId: 202521008
        },
        'main.users': {
          categoryName: "Users",
          categoryId: 202520878
        },
        'main.style': {
          categoryName: "Style Setup",
          categoryId: 202521028
        },
        'main.whitelabels': {
          categoryName: "Whitelabel Partners",
          categoryId: 202521028
        },
        'main.merchants': {
          categoryName: "Merchant Accounts",
          categoryId: 202520978
        },

        'main.clients': {
          categoryName: "Clients",
          categoryId: 202521028
        },

        'main.siteDuplicator': {
          categoryName: "Site Duplicator",
          categoryId: 202513077
        },
        'main.configCenter': {
          categoryName: "Configuration Center",
          categoryId: 202513197
        },
        'main.dashboard': {
          categoryName: "Dashboard",
          categoryId: 202520888
        },

        'main.chargebackreport':{
          categoryName: "Chargeback Report",
          categoryId: 202513177
        },
        'main.conversionreport':{
          categoryName: "Conversion Report",
          categoryId: 202513177
        },
        'main.transactionreport':{
          categoryName: "Transaction Report",
          categoryId: 202513177
        },
        'main.billingreport':{
          categoryName: "Billing Report",
          categoryId: 202513177
        },
        'main.processingreport':{
          categoryName: "Processing Report",
          categoryId: 202513177
        },
        'main.projectionreport':{
          categoryName: "Projection Report",
          categoryId: 202513177
        },
        'main.userreport':{
          categoryName: "User Report",
          categoryId: 202513177
        },
        'main.periscopeConversion':{
          categoryName: "Conversion Report",
          categoryId: 202513177
        },
        'main.periscopeTransaction':{
          categoryName: "Transaction Report",
          categoryId: 202513177
        },
        'main.searchchargebacks':{
          categoryName: "Chargeback System",
          categoryId: 202529777
        },
        'main.addchargeback':{
          categoryName: "Chargeback System",
          categoryId: 202529777
        },
        'main.editchargeback':{
          categoryName: "Chargeback System",
          categoryId: 202529777
        },
        'main.addnewchargeback':{
          categoryName: "Chargeback System",
          categoryId: 202529777
        }
      }
    };

    return {
      categories: categories
    };
  });
