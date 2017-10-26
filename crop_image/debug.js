var util = require('util');
var cropImage = require('./index.js').crop_image;

var events = require('./payload.json');

cropImage(events, {}, function (error, result) {
  if (!error) {
    console.log("success:\n" + util.inspect(result, {depth: null, colors: true}));
    process.exit(0);
  }
  else {
    console.log(error);
    process.exit(1);
  }
});