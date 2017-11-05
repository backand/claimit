require('dotenv').config();
const gm = require('gm').subClass({imageMagick: true});
const request = require('request');
const fs = require('fs');
const backand = require('@backand/nodejs-sdk');

module.exports.crop_image = (event, context, cb) => {

	try{

		console.log(event);

		initBackand(event);

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

function initBackand(event){

		if(backand.defaults){
				backand.defaults.accessToken = event.userProfile.token;
        backand.useAccessAuth();
		} else{
			var backandConfig = {
				appName: event.userProfile.app
			};
			if(event.userProfile.token){
				backandConfig.accessToken = event.userProfile.token;
			} else {
				backandConfig.anonymousToken = process.env.anonymousToken
			}
			backand.init(backandConfig);
		}
}