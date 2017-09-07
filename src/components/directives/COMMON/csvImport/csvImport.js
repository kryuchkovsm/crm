'use strict';

var csvImport = angular.module('csv-import-directive', []);

csvImport.directive('crmCsvImport', function() {
  return {
    restrict: 'E',
    transclude: true,
    replace: true,
    scope:{
      content:'=',
      result: '=',
      options: '='
    },

    template: 
    '<div class="btn btn-success btn-lg ApplyColor full-width margin-bottom-20 fileUpload">\
      <span>\
        <i class="fa fa-plus"></i> {{ options.uploadCaption }}\
      </span>\
      <input class="upload" type="file" />\
    </div>',

    link: function(scope, element) {
      var parseCSV = function(content) {
        var lines=content.csv.split('\n');
        var result = [];
        var start = 0;
        var columnCount = lines[0].split(content.separator).length;

        var headers = [];

        if (content.header) {
          headers=lines[0].split(content.separator);
          start = 1;
        }

        for (var i=start; i<lines.length; i++) {
          var obj = {};
          var currentline=lines[i].split(new RegExp(content.separator+'(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));
          if ( currentline.length === columnCount ) {
            if (content.header) {
              for (var j=0; j<headers.length; j++) {
                obj[headers[j]] = currentline[j];
              }
            } else {
              for (var k=0; k<currentline.length; k++) {
                obj[k] = currentline[k];
              }
            }
            result.push(obj);
          }
        }
        return result;
      };

      var control = element.find('input');

      scope.$on('clear-uploaded-files', function() {
        return control.replaceWith( control = control.clone(true) );
      });

      scope.options = scope.options || {
        header: true,
        separator: ','
      };

      control.on('click', function(onClickEvent) {
        this.value = null;
      });

      element.on('change', function(onChangeEvent) {
        var target = onChangeEvent.target;

        if ( target.type != "file" || !target.files || !target.files.length ) 
          return;

        var file = (onChangeEvent.srcElement || onChangeEvent.target).files[0];
        var name = file.name;
        var ext = name.split('.')[name.split('.').length-1];

        if (ext != 'csv' && ext != 'xlsx' && ext != 'xls') 
          return false;

        var reader = new FileReader();
        reader.onload = function(onLoadEvent) {
          scope.$apply(function() {
            var content = {
              csv: onLoadEvent.target.result.replace(/\r\n|\r/g,'\n'),
              header: scope.options.header,
              separator: scope.options.separator
            };

            scope.content = content.csv;
            scope.result = {
              name: name,
              data: parseCSV(content)
            };
          });
        };
        reader.readAsText(file);
      });
    }
  };
});
