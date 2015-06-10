var chain = require("api-chain"),
	oneflowSDK = require("./oneflow");

var cShipment = {
	shipTo: {
	    name: 			"",
	    companyName: 	"",
	    address1: 		"",
	    address2: 		"",
	    address3: 		"",
	    town: 			"",
	    postcode: 		"",
	    state:			"",
	    isoCountry: 	"",
	    country: 		"",
	    email:	 		"",
	    phone: 			""
	},
	carrier: {
		code:		"",
		service:	"",
		alias:		""
	}
};

var cComponent = {
	code:	"",
	path:	"",
	fetch:	false
};

var cItem = {
	sku:		"",
	quantity:	1,
	components:	[]
};

var cStockItem = {
	code:		"",
	quantity:	1
};

var cOrder = {
	destination: {
		name:	""
	},
	orderData:	{
		items: 		[],
		stockItems: [],
		shipments:	[]
	}
};

var deepClone = function(obj){
	return JSON.parse(JSON.stringify(obj));
}

var oneflowAPI = chain.create({
	onError: function(err) {
		console.log(JSON.stringify(err));
	}
}, {
	credentials:	function(endpoint, token, secret, next)	{
		this._oneflow = new oneflowSDK(endpoint, token, secret);
		next();
	},
	createOrder:	function(name, orderId, next)	{
		var newOrder = deepClone(cOrder);
		newOrder.orderData.sourceOrderId = orderId;
		newOrder.destination.name = name;
		this._order = newOrder;
		next();
	},
	addItem:		function(sku, quantity, next)	{
		var newItem = deepClone(cItem);
		newItem.sourceItemId = this._order.orderData.sourceOrderId+"-"+this._order.orderData.items.length+1;
		newItem.sku = sku;
		if (this._lastShipment)	{
			newItem.shipmentIndex = this._lastShipment.shipmentIndex;
		}
		this._order.orderData.items.push(newItem);
		this._lastItem = newItem;
		next();
	},
	addComponent:	function(code, path, fetch, next)	{
		var newComponent = deepClone(cComponent);
		newComponent.code = code;
		newComponent.path = path;
		newComponent.fetch = fetch || false;
		this._lastItem.components.push(newComponent);
		this._lastComponent = newComponent;
		next();
	},
	addShipment:	function(name, companyName, address1, address2, address3, town, state, postcode, isoCountry, country, email, phone, next)	{
		var newShipment = deepClone(cShipment);
		newShipment.shipTo.name = name;
		newShipment.shipTo.companyName = companyName;
		newShipment.shipTo.address1 = address1;
		newShipment.shipTo.address2 = address2;
		newShipment.shipTo.address3 = address3;
		newShipment.shipTo.town = town;
		newShipment.shipTo.state = state;
		newShipment.shipTo.postcode = postcode;
		newShipment.shipTo.isoCountry = isoCountry;
		newShipment.shipTo.country = country;
		newShipment.shipTo.email = email;
		newShipment.shipTo.phone = phone;
		newShipment.shipmentIndex = this._order.orderData.shipments.length;
		this._order.orderData.shipments.push(newShipment);
		this._lastShipment = newShipment;
		next();
	},
	addCarrier:		function(code, service, next)	{
		this._lastShipment.carrier.code = code;
		this._lastShipment.carrier.service = service;
		next()
	},
	addCarrierByAlias:	function(alias, next)	{
		this._lastShipment.carrier.alias = alias;
		next()
	},
	addStockItem:	function(code, quantity, next)	{
		var newStockItem = deepClone(cStockItem);
		newStockItem.code = code;
		if (this._lastShipment)	{
			newStockItem.shipmentIndex = this._lastShipment.shipmentIndex;
		}
		this._order.orderData.stockItems.push(newStockItem);
		this._lastStockItem = newStockItem;
		next();
	},
	submit:	function(next)	{
		this._oneflow.request("POST", "/order", this._order, {}, function(err, data){
			next(err, data);
		});
	},
	output:	function()	{
		var args = Array.prototype.slice.call(arguments);
		var next = args.pop();
		console.log(JSON.stringify(args, null, 2));
		next();
	},
	get: function(name, next)	{
		var path = "/"+name;
		this._oneflow.request("GET", path, {}, function(err, data){
			// console.log(144, err, data);
			next(err, data);
		});
	}
});

module.exports = oneflowAPI;