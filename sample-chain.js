var oneflowAPI = require("./lib/chain.js");

var endpoint = process.env.ONEFLOW_ENDPOINT;
var token = process.env.ONEFLOW_TOKEN;
var secret = process.env.ONEFLOW_SECRET;
var path = "https://s3-eu-west-1.amazonaws.com/oneflow-public/business_cards.pdf";
var fetch = true;
var orderId = Math.ceil(Math.random()*1000000);

oneflowAPI
	.credentials(endpoint, token, secret)
	// .get("product")
	// .chain(function(products, next){
	// 	var pHash = {};
	// 	products.data.forEach(function(p){
	// 		pHash[p.productCode] = {
	// 			description:	p.description,
	// 			components:		[]
	// 		};
	// 		p.components.forEach(function(c){
	// 			pHash[p.productCode].components.push({
	// 				code:	c.code
	// 			});
	// 		});
	// 	});
	// 	// next(null, pHash);
	// 	next(null);
	// })
	// .output()
	.createOrder("oneflow", orderId)
	.addShipment("name", "companyName", "address1", "address2", "address3", "town", "state", "postcode", "isoCountry", "country", "email", "phone")
	.addCarrier("royalmail", "firstclass")
	.addItem("Business Cards 90x55", 1)
	.addComponent("text", path, fetch)
	.submit()
	.output();
