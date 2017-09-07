const Order = require("./models/Order");
const crypto = require("crypto");
const path = require("path");
const URL = require("url");
const fs = require('fs');
const axios = require('axios');

function OneFlowClient(baseUrl, token, secret) {

	let order;

	async function request(method, resourcePath, data, options = {}) {
		const url = `${baseUrl}${resourcePath}`;
		const headers = makeHeaders(url, method, options);
		const results = await axios({ method, url, data, headers });
		return results.data;
	}

	function makeHeaders(url, method, options) {
		const parsedUrl = URL.parse(url);
		const pathname = parsedUrl.pathname;
		const timestamp = new Date().toISOString();
		const headers = {
			"x-oneflow-authorization": makeToken(method, pathname, timestamp),
			"x-oneflow-date": timestamp,
			"content-type": "application/json"
		};
		if (options.serviceUser && options.accountId) {
			headers["x-oneflow-account"] = options.accountId;
		}
		return headers;
	}

	function makeToken(method, path, timestamp) {
		const StringToSign = method.toUpperCase() + " " + path + " " + timestamp;
		const hmac = crypto.createHmac("SHA1", secret);
		hmac.update(StringToSign);
		const Signature = hmac.digest("hex");
		const localAuthorization = token + ":" + Signature;
		return localAuthorization;
	}

	function createOrder(destination, config) {
		order = new Order(destination, config);
		return order;
	}

	const orderToJSON = () => JSON.stringify(order, null, 2);
	const validateOrder = () => request("POST", "/order/validate", order);
	const submitOrder = () => request("POST", "/order", order);

	return {
		createOrder,
		orderToJSON,
		validateOrder,
		submitOrder
	};

}

module.exports = OneFlowClient;
