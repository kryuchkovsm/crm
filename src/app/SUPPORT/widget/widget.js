'use strict';

angular.module('crm')
  .controller('HcWidget', function ($scope, $state, $rootScope, GlobalVars,  $timeout, DataStorage, ModalService, $http, $filter, $window, $sce, HCCategories) {

    $scope.commonObject = GlobalVars.commonObject;
    $scope.showSectionsContent = false;
    $scope.categoryList = HCCategories.categories()

    var zendeskBaseUri = 'https://responsecrm.zendesk.com/api/v2/help_center';

    $scope.currentRouteName = $state.current.name
    $rootScope.$on('$stateChangeSuccess',
      function(event, toState, toParams, fromState, fromParams){
        $scope.currentRouteName = $state.current.name
        $scope.showSectionsContent = false;
        $scope.showSearchHCResults = false;
        $scope.searchHCString = undefined;
        $scope.searchHCResults = [];
      });

    $scope.changeSectionHelpContent = function(){
      $scope.browseKB()
      var articles = [], sections = [];
      if ($scope.categoryList[$state.current.name]){
        var catId = $scope.categoryList[$state.current.name].categoryId;
        $scope.showSectionsContent=true;
        $scope.showAnimated = true
        $timeout(function(){
          $scope.showAnimated = false
        },2000)
        if (!$scope.categoryList[$state.current.name].sections){
          $scope.searchingHCSections = true;
          async.parallel([
            function(cb){
              $http.get(zendeskBaseUri + '/categories/'+catId+'/sections.json').success(function(resp){
                sections = resp.sections || []
                if ($scope.categoryList[$state.current.name].showSections)
                  sections = sections.filter(function(section){
                    return $scope.categoryList[$state.current.name].showSections.indexOf(section.id)>-1
                  });
                cb()
              })
            },
            function(cb){
              $http.get(zendeskBaseUri + '/categories/'+catId+'/articles.json').success(function(resp){
                articles = resp.articles || [];
                cb()
              })
            }
          ], function(){
            angular.forEach(sections, function(section){
              section.articles = $filter('filterByField')(articles, {section_id: section.id})
            });
            $scope.categoryList[$state.current.name].sections = sections;
            $scope.searchingHCSections = false;
          })
        }
      }
    }


    $scope.searchHC = function(searchString, categoryId){
      $scope.showArticleItem = undefined;
      $scope.showSearchHCResults = true;
      $scope.searchHCResults = [];
      $scope.searchHCStringDup = '';
      var query = 'query='+searchString
      if (categoryId)
        query += '&category'+categoryId;
      $http.get(zendeskBaseUri+'/articles/search.json?'+query).success(function(resp){
        if (resp && resp.results){
          $scope.searchHCStringDup = angular.copy($scope.searchHCString)
          $scope.searchHCResults = resp.results;
        }
      });
    };


    $scope.browseKB = function(){
      $scope.showSearchHCResults=false;
      $scope.searchHCResults=[];
      $scope.searchHCString = undefined;
      $scope.showArticleItem = undefined;
    };

    $scope.goToArticle = function(articleId){
      $state.go('main.helpcenter.article', {articleId: articleId})
    };


    $scope.showArticle = function(articleId){
      var article = {};
      async.parallel([
        function(cb){
          $http.get(zendeskBaseUri + '/articles/'+articleId+'.json').success(function(resp){
            if (resp && resp.article)
              _.extend(article, resp.article)
            cb()
          })
        },
        function(cb){
          $http.get(zendeskBaseUri + '/articles/'+articleId+'/attachments.json').success(function(resp){
            if (resp && resp.article_attachments)
              _.extend(article, {article_attachments: resp.article_attachments})
            cb()
          })
        }
      ], function(){
        window.a = article.body
        _.each(article.body.match(/\[youtube_video].*?\[\/youtube_video]/g), function(video){
          var video_url = video.replace('[youtube_video]','').replace('[/youtube_video]','').trim();
          article.body = article.body.replace(video,'<iframe style="width: 100%" height="180" frameborder="0"  src="'+video_url+'" allowfullscreen></iframe>')
        });
        $scope.showArticleItem = article;
      });
    };

    $scope.checkIfImage = function(type){
      type = type || '';
      return /jpg|jpeg|bmp|gif|png/.test(type.toLowerCase())
    };

    $scope.originUrl = location.origin

    $scope.openNewWindow = function(url, name){
      window.open(url, name, "width=670,height=780,resizable=yes,scrollbars=yes,status=yes")
    };

    $scope.goToHelpCenter = function(){
      $scope.showArticleItem = {};
      $state.go('main.helpcenter')
    }
    $scope.trustAsHtml = function(string) {
      return $sce.trustAsHtml(string);
    };

    angular.element(document).on('click', '.article-html-body.preview-mode img', function(e){
      ModalService.showModal({
        templateUrl: "components/modals/COMMON/sure.html",
        controller: "DataModalCtrl",
        windowClass: 'big-modal',
        inputs: {
          data: {
            modalTitle: $rootScope.translate('support.widget.widget.preview-image'),
            modalHtml: '<img style="width: 100%; height: 100%;" src="'+$(e.target).attr('src')+'" />',
            cancelButtonText: 'CLOSE',
            hideProceedButton: true
          }
        }
      }).then(function (modal) {
        modal.element.modal();
      });
    })

    $scope.ticketRequest = {}
    $scope.createNewTicket = function(){
      $scope.showTicketsSection=true
    }

    $scope.cancelTicketForm = function(){
      $scope.ticketRequest = {};
      $scope.sentTicketMessage=false
      $scope.showTicketsSection=false;
      $scope.submittedTicketForm=false
    }

    $scope.createTicket = function(form, ticketRequest){
      $scope.submittedTicketForm = true;
      if (form.$invalid) return;
      $scope.submittedTicketForm = false;
      $scope.sendingTicket = true;
      DataStorage.anyApiMethod('/support/zendesk/request/new').post(ticketRequest, function(resp){
        $scope.sendingTicket = false;
        if (resp && !resp.Status) {
          $scope.ticketRequest = {}
          $scope.sentTicketMessage = true;
        }
      })
    }

  });
