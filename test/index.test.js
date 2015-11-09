var oneflowSDK = require("../lib/oneflow"),
	should = require("should");

describe("index", function () {
	it("should successfully create an instance of the SDK", function (done) {
		var sdk = new oneflowSDK("url", "token", "secret");
		sdk.should.have.property("endpoint").equal("url");
		done();
	});
});