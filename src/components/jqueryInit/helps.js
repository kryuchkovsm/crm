(function($){
  $.b64toBlob = function(b64Data, contentType, sliceSize) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;

    var byteCharacters = atob(b64Data);
    var byteArrays = [];

    for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      var slice = byteCharacters.slice(offset, offset + sliceSize);

      var byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }

      var byteArray = new Uint8Array(byteNumbers);

      byteArrays.push(byteArray);
    }

    var blob = new Blob(byteArrays, {type: contentType});
    return blob;
  }

  $.downloadBlob = function(blob, fileName) {
    var url = window.URL.createObjectURL(blob);
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName;
    setTimeout(function() {
      a.click();
      window.URL.revokeObjectURL(url);
    }, null)
  };

  $.downloadUrl = function(url, fileName) {
    var a = document.createElement("a");
    document.body.appendChild(a);
    a.href = url;
    a.download = fileName;
    setTimeout(function() {
      a.click();
    }, null)
  };

  $.getPeriods = function(val){
    var date = new Date();
    var firstDate, lastDate;
    switch(val){
      case 'Today':
        firstDate = date;
        lastDate = date;
        break;
      case 'Yesterday':
        date.setDate(date.getDate() - 1);
        firstDate = date;
        lastDate = date;
        break;
      case 'This Week':
        firstDate = new Date(date.setDate(date.getDate() - date.getDay()+1));
        lastDate = new Date(date.setDate(date.getDate() - date.getDay()+7));
        break;
      case 'Last Week':
        var beforeOneWeek = new Date(new Date().getTime() - 60 * 60 * 24 * 7 * 1000)
        var beforeOneWeek2 = new Date(beforeOneWeek);
        var day = beforeOneWeek.getDay()
        var diffToMonday = beforeOneWeek.getDate() - day + (day === 0 ? -6 : 1)
        firstDate = new Date(beforeOneWeek.setDate(diffToMonday))
        lastDate = new Date(beforeOneWeek2.setDate(diffToMonday + 6));
        break;
      case 'This Month':
        firstDate = new Date(date.getFullYear(), date.getMonth(), 1);
        lastDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
        break;
      case 'Last Month':
        firstDate = new Date(date.getFullYear(), date.getMonth()-1, 1);
        lastDate = new Date(date.getFullYear(), date.getMonth(), 0);
        break;
      case 'This Year':
        firstDate = new Date(date.getFullYear(), 0, 1);
        lastDate = date;
        break;
      case 'Last Year':
        firstDate = new Date(date.getFullYear()-1, 0, 1);
        lastDate = new Date(date.getFullYear(), 0, 1);
        lastDate.setDate(lastDate.getDate()-1);
        break;
    }
    return {
      firstDate: firstDate,
      lastDate: lastDate
    }

  }

})(jQuery)
