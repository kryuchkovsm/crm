angular.module('read-more-directive', [])
  .directive('readMore', function ($compile) {
  return {
    restrict:'AE',
    scope:{
      hmtext : '@',
      hmlimit : '@',
      hmfulltext:'@',
      hmMoreText:'@',
      hmLessText:'@',
      hmMoreClass:'@',
      hmLessClass:'@'
    },
    templateUrl: 'components/directives/COMMON/readMore/template.html',
    transclude: true,
    controller : function($scope){
      $scope.toggleValue=function(){
        $scope.hmfulltext = !$scope.hmfulltext;
      }
    }
  };
});
