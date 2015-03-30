var cItem = require("./item");

var cOrderData = {
    "attributes":	[],
    "items":		[],
    "shipments":	[],
};

cOrderData.prototype.addItem = function(){
	return new cItem();
};

module.exports = function(){
	return Object.create(cOrderData.prototype);
};