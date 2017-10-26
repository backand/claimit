require('dotenv').config();

module.exports.get_plate = (event, context, cb) => {

  var OpenalprApi = require('openalpr_api');

  var api = new OpenalprApi.DefaultApi()
  var imageUrl = event.url;
  var secretKey = process.env.secretKey; 
  var country = process.env.country;

  var options = { 
    'recognizeVehicle': 1,
    'topn': 2
  };

  console.log("url:" + imageUrl);

  api.recognizeUrl(imageUrl, secretKey, country, options, function (error, reponse) {
    if (!error) {
      var result = reponse.results[0];
      var data = {
        plate: result.plate,
        region: result.region,
        vehicle: {
          color: result.vehicle.color[0].name,
          make: result.vehicle.make[0].name,
          make_model: result.vehicle.make_model[0].name,
          body_type: result.vehicle.body_type[0].name
        },
        vehicle_region: result.vehicle_region
      };
      cb(null, data);
    }
    else {
      cb(error);
    }
  }); 

};
