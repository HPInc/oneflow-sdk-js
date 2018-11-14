const Order = require('./models/Order');
const crypto = require('crypto');
const URL = require('url');
const axios = require('axios');
const axiosRetry = require('axios-retry');

axiosRetry(axios);

function OneFlowClient(baseUrl, token, secret) {

	let order;

	function request(method, resourcePath, data, options = {}) {
		const url = `${baseUrl}${resourcePath}`;
		const headers = makeHeaders(url, method, options);
		return axios.request({ method, url, data, headers }).then(res => res.data)
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

	function orderToJSON() {
		return JSON.stringify(order, null, 2);
	}

	function validateOrder() {
		return this.request("POST", "/order/validate", order);
	}

	function submitOrder() {
		return this.request("POST", "/order", order)
			.then(r => {
				// connect submission API
				if (r.order) return r.order;

				// order service submission API
				return r;
			})
			.catch(err => {
				if (err.response && err.response.status === 400 && err.response.data) {
					if (err.response.data.error) throw err.response.data.error;
				}
				throw err;
			});
	}

	return {
		request,
		createOrder,
		orderToJSON,
		validateOrder,
		submitOrder
	};

}

module.exports = OneFlowClient;

