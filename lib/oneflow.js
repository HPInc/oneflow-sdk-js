var orderModel = require("./models/order"),
	crypto = require("crypto"),
	agent = require("superagent"),
	path = require("path"),
	url = require("url"),
	fs = require('fs'),
	request = require('request');

var cOneflowClient = function(url, token, secret){
	this.endpoint = url;
	this.token = token;
	this.secret = secret;
};

cOneflowClient.prototype.request = function(method, resourcePath, data, callback) {

	var postURL = this.endpoint + resourcePath;
	var parseUrl = url.parse(postURL);
	var pathname = parseUrl.pathname;

	var timestamp = new Date().toISOString();
	var authHeader = this.makeToken(method, pathname, timestamp);
	switch (method.toLowerCase()) {
		case "post":
			this.postRequest(postURL, data, timestamp, authHeader, callback);
		break;
		case "put":
			this.putRequest(postURL, data, timestamp, authHeader, callback);
		break;
		case "get":
			this.getRequest(postURL, timestamp, authHeader, callback);
		break;
		case "delete":
			this.deleteRequest(postURL, timestamp, authHeader, callback);
		break;
	}

};

cOneflowClient.prototype.postRequest = function(postURL, data, timestamp, authHeader, callback) {
	agent
		.post(postURL)
		.send(data)
		.set('Content-Type', 'application/json')
		.set('x-oneflow-date', timestamp)
		.set('x-oneflow-authorization', authHeader)
		.end(function(results){
			if (results.error)	{
				callback(results.error);
			}	else	{
				callback(null, results.body);
			}
		});
};

cOneflowClient.prototype.getRequest = function(postURL, timestamp, authHeader, callback) {
	agent
		.get(postURL)
		.set('x-oneflow-date', timestamp)
		.set('x-oneflow-authorization', authHeader)
		.end(function(results){
			if (results.error)	{
				callback(results.error);
			}	else	{
				callback(null, results.body);
			}
		});
};

cOneflowClient.prototype.putRequest = function(postURL, data, timestamp, authHeader, callback) {
	agent
		.put(postURL)
		.send(data)
		.set('Content-Type', 'application/json')
		.set('x-oneflow-date', timestamp)
		.set('x-oneflow-authorization', authHeader)
		.end(function(results){
			if (results.error)	{
				callback(results.error);
			}	else	{
				callback(null, results.body);
			}
		});
};

cOneflowClient.prototype.deleteRequest = function(postURL, timestamp, authHeader, callback) {
	agent
		.delete(postURL)
		.set('x-oneflow-date', timestamp)
		.set('x-oneflow-authorization', authHeader)
		.end(function(results){
			if (results.error)	{
				callback(results.error);
			}	else	{
				callback(null, results.body);
			}
		});
};

cOneflowClient.prototype.uploadRequest = function(postURL, localFilename, callback) {
	console.log("-----------------");
	console.log(localFilename);
	console.log(postURL);
	console.log("-----------------");


	var fileStat = fs.statSync(localFilename);

	fs.createReadStream(localFilename).pipe(request.put({
		url:	postURL,
		headers:	{
			"Content-Type": 	"application/pdf",
			"Content-Length":	fileStat.size
		}
	}, callback));

};

cOneflowClient.prototype.makeToken = function(method, path, timestamp)	{
	var StringToSign = method+" " + path + " " + timestamp;
	var hmac = crypto.createHmac("SHA1", this.secret);
	hmac.update(StringToSign);
	var Signature = hmac.digest("hex");
	var localAuthorization = this.token + ":" + Signature;
	return localAuthorization;
};

///////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////


cOneflowClient.prototype.createOrder = function(destination, config) {
	this.order = new orderModel(destination, config);
	return this.order;
};

cOneflowClient.prototype.orderToJSON = function() {
	return JSON.stringify(this.order, null, 2);
};

cOneflowClient.prototype.validateOrder = function(callback) {
	this.request("POST", "/order/validate", this.order, callback);
};

cOneflowClient.prototype.submitOrder = function(callback) {
	this.request("POST", "/order", this.order, callback);
};

cOneflowClient.prototype.uploadFile = function(fileRecord, localFilename, callback) {
	this.uploadRequest(fileRecord.url, localFilename, callback);
};

module.exports = cOneflowClient;

