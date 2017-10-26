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

  var url = event.url;
	var region = event.region;
	//var returnImage = '/tmp/resized1.jpg';
	console.log("url:" + url);
	
	gm(request(url))
	.crop(region.width, region.height, region.x, region.y)
	.toBuffer('JPG',function (err, buffer) {
		if (err) return cb(err);
		var filedata = new Buffer(buffer).toString('base64');
		var fileType = url.substring(url.lastIndexOf('.')+1);
		var fileName = url.substring(url.lastIndexOf('/')+1).replace('.' + fileType, '') + '_vehicle.'+fileType;

		backand.file.upload("_root", "files", fileName, filedata)
        .then(function (response) {
          console.log(response.data.url);
          cb(null, {fileUrl: response.data.url});
        })
        .catch(function(error) { 
          cb(error);
        })
	})
};
