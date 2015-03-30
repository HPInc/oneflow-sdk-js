var cBase = function(){

};

cBase.prototype.init = function(config){
    for (var key in config) {
        this[key] = config[key];
    }
};

// cBase.prototype.toJSON = function(){
//     return JSON.stringify(this._obj, null, 2);
// };

////////////////////////////////////////////////////////////////////////////////////////////////////////////
var cOrder = function(name, config){
    var orderData = new cOrderData(config);
    this.destination = {
        "name" : name
    };
    this.orderData = orderData;
};

cOrder.prototype = Object.create(cBase.prototype);
cOrder.prototype.contructor = cOrder;

cOrder.prototype.setDestination = function(name){
    this.destination.name = name;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
var cOrderData = function(config){
    this.attributes =   [];
    this.items      =   [];
    this.shipments  =   [];
    this.init(config);
};

cOrderData.prototype = Object.create(cBase.prototype);
cOrderData.prototype.contructor = cOrderData;

cOrderData.prototype.addItem = function(config){
    var item = new cItem(config);
    this.items.push(item);
    return item;
};
cOrderData.prototype.addShipment = function(config){
    this.shipments.push(new cShipment(config));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
var cItem = function(config){
    var self = this;
    this.attributes =    [];
    this.components =    [];
    this.quantity   =    1;
    this.shipmentIndex =  0;
    this.sku           =  "";
    this.sourceItemId  =  "";
    this.init(config);
    if (config.components)  {
        config.components.forEach(function(componentConfig){
            self.addComponent(componentConfig);
        });
    }
};

cItem.prototype = Object.create(cBase.prototype);
cItem.prototype.contructor = cItem;

cItem.prototype.addComponent = function(config){
    this.components.push(new cComponent(config));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
var cComponent = function(config){
    this.code       =   "";
    this.fetch      =   false;
    this.infotech   =   false;
    this.localFile  =   false;
    this.path       =   "";
    this.preflight  =   false;
    this.init(config);
};

cComponent.prototype = Object.create(cBase.prototype);
cComponent.prototype.contructor = cComponent;

cComponent.prototype.addComponent = function(config){
    this.items.push(new cComponent(config));
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////
var cShipment = function(config){
    this.shipmentIndex = 0;
    this.packages = [];
    this.shipTo =   {
        name:       "",
        address1:   "",
        address2:   "",
        town:       "",
        postcode:   "",
        state:      "",
        isoCountry: ""
    };
    this.carrier = {
        code:       "",
        service:    ""
    };
    this.init(config);
};

cShipment.prototype = Object.create(cBase.prototype);
cShipment.prototype.contructor = cShipment;

cShipment.prototype.setShipTo = function(shipTo){
    this.shipTo = shipTo;
};

cShipment.prototype.setReturnTo = function(returnTo){
    this.returnTo = returnTo;
};

cShipment.prototype.setCarrier = function(code, service){
    this.carrier.code    = code;
    this.carrier.service = service;
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = cOrder;