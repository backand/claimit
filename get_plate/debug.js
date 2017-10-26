var util = require('util');
var getPlate = require('./index.js').get_plate;

var events = require('./payload.json');

getPlate(events, {}, function (error, result) {
  if (!error) {
    console.log("success:\n" + util.inspect(result, {depth: null, colors: true}));
    process.exit(0);
  }
  else {
    console.log(error);
    process.exit(1);
  }
});