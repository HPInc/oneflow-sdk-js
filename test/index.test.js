const oneflowSDK = require("../lib/oneflow");
const should = require("should");

describe("index", function () {
	let sdk, order;
	it("should successfully create an instance of the SDK", function (done) {
		sdk = oneflowSDK("url", "token", "secret");
		sdk.should.have.property("createOrder");
		done();
	});
	it("should successfully create an order structure", function (done) {
		order = sdk.createOrder("my-account", { sourceOrderId: '1234' });
		order.should.have.property('destination');
		order.should.have.property('orderData');
		order.destination.should.have.property('name').equal('my-account');
		order.orderData.should.have.property('sourceOrderId').equal('1234');
		done();
	});
	it("should successfully create add items to the order", function (done) {
		const item = order.addItem({
			sourceItemId: "ABCD"
		});
		item.addComponent({
			barcode: "XYZ"
		});
		order.should.have.property('destination');
		order.should.have.property('orderData');
		order.destination.should.have.property('name').equal('my-account');
		order.orderData.should.have.property('items').length(1);
		order.orderData.items[0].should.have.property('components').length(1);
		done();
	});
});