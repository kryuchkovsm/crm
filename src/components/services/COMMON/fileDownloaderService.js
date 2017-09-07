'use strict';

angular.module('FileDownloaderService', [])
  .factory('FileDownloaderService', function($document, $timeout) {

    var downloadFile = function (filename, content) {
        var filename = "import_example.csv";
        var charset = "utf-8";
        var blob = new Blob([content], {
          type: "text/csv;charset="+ charset + ";"
        });

        if (window.navigator.msSaveOrOpenBlob) {
          navigator.msSaveBlob(blob, filename);
        } else {
          var downloadContainer = angular.element('<div data-tap-disabled="true"><a></a></div>');
          var downloadLink = angular.element(downloadContainer.children()[0]);
          downloadLink.attr('href', window.URL.createObjectURL(blob));
          downloadLink.attr('download', filename);
          downloadLink.attr('target', '_blank');

          $document.find('body').append(downloadContainer);
          $timeout(function () {
            downloadLink[0].click();
            downloadLink.remove();
          }, null);
        }
    };

    return {
      downloadFile: downloadFile
    };
  });
