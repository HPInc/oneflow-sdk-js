const Base = require('./Base');
const Item = require("./Item");

class OrderData extends Base {
    constructor(config) {
        super(config);
        if (!this.items) this.items = [];
        if (!this.shipments) this.shipments = [];
    }

    addItem(item) {
        const newItem = new Item(item);
        this.items.push(newItem);
        return newItem;
    }

    addStockItem(stockItem) {
        if (!this.stockItems) this.stockItems = []
        const newStockItem = new stockItem(stockItem);
        this.stockItems.push(newItem);
        return newStockItem;
    }

    addShipment(shipment) {
        this.shipments.push(shipment);
    }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////
// var cShipment = function(config){
//     this.shipmentIndex = 0;
//     this.shipTo =   {
//         name:       "",
//         address1:   "",
//         address2:   "",
//         town:       "",
//         postcode:   "",
//         state:      "",
//         isoCountry: ""
//     };
//     this.carrier = {
//         code:       "",
//         service:    ""
//     };
//     this.init(config);
// };



module.exports = OrderData;
