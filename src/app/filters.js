angular.module('crm').filter('characters', function () {
    return function (input, chars, breakOnWord) {
      if (isNaN(chars)) return input;
      if (chars <= 0) return '';
      if (input && input.length > chars) {
        input = input.substring(0, chars);

        if (!breakOnWord) {
          var lastspace = input.lastIndexOf(' ');
          //get last space
          if (lastspace !== -1) {
            input = input.substr(0, lastspace);
          }
        }else{
          while(input.charAt(input.length-1) === ' '){
            input = input.substr(0, input.length -1);
          }
        }
        return input + '…';
      }
      return input;
    };
  })
  .filter('splitcharacters', function() {
    return function (input, chars) {
      if (isNaN(chars)) return input;
      if (chars <= 0) return '';
      if (input && input.length > chars) {
        var prefix = input.substring(0, chars/2);
        var postfix = input.substring(input.length-chars/2, input.length);
        return prefix + '...' + postfix;
      }
      return input;
    };
  })
  .filter('words', function () {
    return function (input, words) {
      if (isNaN(words)) return input;
      if (words <= 0) return '';
      if (input) {
        var inputWords = input.split(/\s+/);
        if (inputWords.length > words) {
          input = inputWords.slice(0, words).join(' ') + '…';
        }
      }
      return input;
    };
  }).filter('htmlToPlaintext', function() {
    return function(text) {
      return String(text).replace(/<[^>]+>/gm, '');
    };
  }).filter('filterByField', function() {
    return function(arr, obj) {
      var keys = Object.keys(obj), resArr = [];
      angular.forEach(arr, function(a){
        var f;
        angular.forEach(keys, function(key){
          if (!a[key] || (a[key] && a[key]!=obj[key])) f = true
        })
        if (!f) resArr.push(a)
      });
      return  resArr;
    };
  })
  .filter('filterByMultiVal', function() {
    return function(arr, obj) {
      var keys = Object.keys(obj), resArr = [];
      angular.forEach(arr, function(a){
        var f;
        angular.forEach(keys, function(key){
          if (!a[key] || (a[key] && obj[key].indexOf(a[key])==-1 )) f = true
        })
        if (!f) resArr.push(a)
      });
      return  resArr;
    };
  }).filter('getIndexByField', function() {
    return function(arr, obj) {
      var keys = Object.keys(obj), resN;
      angular.forEach(arr, function(a, n){
        angular.forEach(keys, function(key){
          if (a[key]==obj[key]) resN = n
        })
      });
      return  resN;
    };
  }).filter('showUnselected', function() {
    return function(arr, obj) {
      var resArr = [];
      angular.forEach(arr, function(item1){
        var f;
        angular.forEach(obj.arr, function(item2){
          if (item1[obj.compareFields] == item2[obj.compareFields])
            f = true;
        })
        if (!f) resArr.push(item1)
      })
      return resArr;
    };
  }).filter('splitUppercase', function() {
    return function(text) {
      text = text || '';
      text = text.toString().split(/(?=[A-Z])/).join(' ')
      return  text;
    };
  }).filter('trimText', function() {
    return function(text) {
      if (typeof text == 'string'){
        text = text || '';
        return  text.trim();
      }else
        return text
    };
  }).directive('tooltip', function(){
  return {
    restrict: 'A',
    link: function(scope, element, attrs){
      $(element).hover(function(){
        $(element).tooltip('show');
      }, function(){
        $(element).tooltip('hide');
      });
    }
  };
}).filter('rangeNum', function() {
    return function(num) {
      num = num || 0;
      return _.range(num);
    };
  }).filter('objectLength', function() {
    return function(obj) {
      obj = obj || {};
      return Object.keys(obj).length;
    };
  }).filter('searchAuthSection', function() {
    return function(arr, obj) {
      var f = false;
      _.each(arr, function(mA){
        if (mA.RouteName == obj.RouteName) f = true;
        if (mA.Sections)
          _.each(mA.Sections, function(sA){
            //console.log(obj.RouteName)
            if (sA.RouteName == obj.RouteName) f = true;
            if (sA.Sections)
              _.each(sA.Sections, function(ssA){
                if (ssA.RouteName == obj.RouteName) f = true;
              })
          })
      });
      return f;
    };
  }).filter('filterCountries', function($filter) {
    return function(arr) {
      var tUsObj;
      arr = arr.filter(function(a){
        if (a.id == 'US') tUsObj = a;
        return a.id != 'US';
      });
      var t = $filter('orderBy')(arr, 'name')
      if (tUsObj)
        t.unshift(tUsObj)
      return t
    };
  })
