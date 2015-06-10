var orderModel = require("./models/order"),
	crypto = require("crypto"),
	agent = require("superagent"),
	path = require("path"),
	url = require("url"),
	fs = require('fs'),
	request = require('request');

var proxy = process.env.PROXY;

var cOneflowClient = function(url, token, secret){
	this.endpoint = url;
	this.token = token;
	this.secret = secret;
};

cOneflowClient.prototype.request = function(method, resourcePath, data, options, callback) {

	if (!callback)	{
		callback = options;
		options = {};
	}

	var postURL = this.endpoint + resourcePath;
	var parseUrl = url.parse(postURL);
	var pathname = parseUrl.pathname;

	var timestamp = new Date().toISOString();
	var headers = {
		"x-oneflow-authorization":	this.makeToken(method, pathname, timestamp),
		"x-oneflow-date":			timestamp,
		"content-type":				"application/json"
	};

	if (options.serviceUser && options.accountId) {
		headers["x-oneflow-account"] = options.accountId;
	}

	switch (method.toLowerCase()) {
		case "post":
			this.postRequest(postURL, data, headers, callback);
		break;
		case "put":
			this.putRequest(postURL, data, headers, callback);
		break;
		case "get":
			this.getRequest(postURL, headers, callback);
		break;
		case "delete":
			this.deleteRequest(postURL, headers, callback);
		break;
	}

};

cOneflowClient.prototype.completeRequest = function(req, headers, callback) {
	for (var key in headers)	{
		var value = headers[key];
		req.set(key, value);
	}
	req.end(function(results){
		if (results.error)	{
			if (results.body)	{
				if (results.body.error)	{
					callback(results.body.error);
				}	else	{
					callback(results.body);
				}
			}	else	{
				callback(results.error);
			}
		}	else	{
			callback(null, results.body);
		}
	});
};

cOneflowClient.prototype.postRequest = function(url, data, headers, callback) {
	var self = this;
	var req = agent.post(url).send(data);
	if (proxy)	{
		req.proxy(proxy);
	}
	self.completeRequest(req, headers, callback);
};

cOneflowClient.prototype.getRequest = function(url, headers, callback) {
	var self = this;
	var req = agent.get(url);
	if (proxy)	{
		req.proxy(proxy);
	}
	self.completeRequest(req, headers, callback);
};

cOneflowClient.prototype.putRequest = function(url, data, headers, callback) {
	var self = this;
	var req = agent.put(url).send(data);
	if (proxy)	{
		req.proxy(proxy);
	}
	self.completeRequest(req, headers, callback);
};

cOneflowClient.prototype.deleteRequest = function(url, headers, callback) {
	var self = this;
	var req = agent.delete(url);
	if (proxy)	{
		req.proxy(proxy);
	}
	self.completeRequest(req, headers, callback);
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
			"Content-Type":		"application/pdf",
			"Content-Length":	fileStat.size
		}
	}, callback));

};

cOneflowClient.prototype.makeToken = function(method, path, timestamp)	{
	var StringToSign = method.toUpperCase()+" " + path + " " + timestamp;
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

