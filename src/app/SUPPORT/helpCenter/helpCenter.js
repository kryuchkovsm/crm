'use strict';

angular.module('crm')
  .controller('HelpCenterCtrl', function ($scope, $http, $filter, $stateParams, $state) {
    var zendeskBaseUri = 'https://responsecrm.zendesk.com/api/v2/help_center';
    $scope.articleId = $stateParams.articleId
    $scope.$watch(function(){
      return $state.current.name
    }, function(val){
      $scope.currentStateName = val;
    });

    if (!$scope.categories){
      $scope.categories = [];

      var sections = [], articles = [];
      async.parallel([
        function(cb){
          $http.get(zendeskBaseUri + "/categories.json?per_page=100").success(function(resp){
            $scope.categories = resp.categories || [];
            cb()
          }).error(function(){cb()})
        },
        function(cb){
          $http.get(zendeskBaseUri + "/sections.json?per_page=100").success(function(resp){
            sections = resp.sections || [];
            cb()
          }).error(function(){cb()})
        },
        function(cb){
          $http.get(zendeskBaseUri + "/articles.json?per_page=100").success(function(resp){
            articles = resp.articles || [];
            cb()
          }).error(function(){cb()})
        }
      ], function(){
        $scope.sections = []
        angular.forEach($scope.categories, function(category, n){
          category.sections = $filter('filter')(sections, {category_id: category.id, id: '!200821468'})
          angular.forEach(category.sections, function(section){
            section.articles = $filter('filterByField')(articles, {section_id: section.id})
          })
          $scope.sections = $scope.sections.concat(angular.copy(category.sections))
        })
      });
    }
    $scope.searchHC = function(searchString, categoryId){
      if (!searchString) return $scope.browseKB()
      $scope.searchHCStringCopy = angular.copy($scope.searchHCString)
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

    var showArticle = function(articleId){
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
        $scope.showArticleItem = article;
      });
    };
    if ($stateParams.articleId){
      showArticle($stateParams.articleId)
    }
    $scope.browseKB = function(){
      $scope.showSearchHCResults=false;
      $scope.searchHCStringCopy = false
      $scope.searchHCResults=[];
      $scope.searchHCString = undefined;
      $scope.showArticleItem = undefined;
    };

    $scope.articlesCount = function(category){
      var length = 0;
      _.each(category.sections, function(section){
        section.articles = section.articles || []
        length += section.articles.length
      })
      return length
    }
    $scope.goToArticle = function(articleId){
      $state.go('main.helpcenter.article', {articleId: articleId})
    };

  });
