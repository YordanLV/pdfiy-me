'use strict';

var config = {
  url: '',
};

module.exports.setConfig = function (customConfig) {
  config = customConfig;
};

module.exports.pdfiyMe = function (tag) {
  if (!config.url) {
    throw 'Missing url'
  }

  var fileName = "myPdf";
  var url = window.location.href;

  var postInfo = {
    url,
    tag
  };

  var headers = new Headers();
  headers.append('Content-Type', 'application/json');

  fetch(config.url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(postInfo)
  })
    .then(async res => ({
      blob: await res.blob()
    }))
    .then(resObj => {
      // It is necessary to create a new blob object with mime-type explicitly set for all browsers except Chrome, but it works for Chrome too.
      const newBlob = new Blob([resObj.blob], { type: 'application/pdf' });

      // MS Edge and IE don't allow using a blob object directly as link href, instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
      } else {
        // For other browsers: create a link pointing to the ObjectURL containing the blob.
        var objUrl = window.URL.createObjectURL(newBlob);

        var link = document.createElement('a');
        link.href = objUrl;
        link.download = fileName;
        link.click();

        // For Firefox it is necessary to delay revoking the ObjectURL.
        setTimeout(() => { window.URL.revokeObjectURL(objUrl); }, 250);
      }
    })
    .catch((error) => {
      console.log('DOWNLOAD ERROR', error);
    });
};