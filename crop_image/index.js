require('dotenv').config();
var gm = require('gm').subClass({imageMagick: true});
var request = require('request');
var fs = require('fs');
var backand = require('@backand/nodejs-sdk');

backand.init({
    appName: process.env.appName,
    anonymousToken: process.env.anonymousToken
});


module.exports.crop_image = (event, context, cb) => {

	try{
		var imageUrl = event.imageUrl;
		var region = (event.vehicleRegion.constructor === Object) ? event.vehicleRegion : JSON.parse(event.vehicleRegion);
		var dbId = event.id;

		console.log("url:" + imageUrl);
		
		gm(request(imageUrl))
		.crop(region.width, region.height, region.x, region.y)
		.toBuffer('JPG',function (err, buffer) {
			if (err) return cb(err);

			//Convert to buffer
			var filedata = new Buffer(buffer).toString('base64');

			//add sufix to the name
			var fileType = imageUrl.substring(imageUrl.lastIndexOf('.')+1);
			var fileName = imageUrl.substring(imageUrl.lastIndexOf('/')+1).replace('.' + fileType, '') + '_vehicle.'+fileType;

			//upload the file to Backand Storage and Update the Database
			backand.file.upload("_root", "files", fileName, filedata)
					.then(function (response) {
						console.log(response.data.url);
						backand.object.update("claims", dbId, {
							"vehicleUrl": response.data.url
						})
						.then(function(data) {
							cb(null, {fileUrl: response.data.url});
						})
						.catch(function(error) {
							cb(error);
						})
						
					})
					.catch(function(error) { 
						cb(error);
					})
			})
	}
	catch(error){
		cb(error);
	}
};
