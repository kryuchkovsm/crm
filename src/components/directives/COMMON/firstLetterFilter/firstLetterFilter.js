/**
 * Created by user on 31.03.15.
 */
'use strict';

angular.module('first-letter-filter', []).filter('firstLetterFilter', function () {
  return function (input, fieldsLetter) {

    if ( !fieldsLetter )
      return input;

    var out = [];
    input = input || [];

    input.forEach(function (item) {
      if ( !item )
        return;

      for (var key in fieldsLetter) {
        if (item[key].charAt(0).toLowerCase() == fieldsLetter[key]) {
          out.push(item);
        }
      }
    });
    return out;
  }
});
