var oneflowClient = require("./lib/oneflow");

//oneflow local
// var endpoint = "http://localhost:3000/api";
var endpoint = "https://pro-api.oneflowcloud.com/api";
var token = "";
var secret = "";

///////////////
var oneflow = new oneflowClient(endpoint, token, secret);
var orderId = Math.ceil(Math.random()*1000000);

var order = oneflow.createOrder("ultraprint", {
	sourceOrderId:	orderId
});

var item = order.orderData.addItem({
	sku:			"GreetingsCard",
	quantity:		2,
	sourceItemId:	orderId+"-1"
});

item.addComponent({
	code:	"ITEM",
	fetch:	false,
	path:	"greetings-card.pdf"
});

order.orderData.addShipment({
	shipTo: {
		name:		"Nigel Watson",
		address1:	"999 Letsbe Avenue",
		town:		"London",
		isoCountry:	"UK",
		postcode:	"EC2N 0BJ"
	},
	carrier: {
		code:		"royalmail",
		service:	"firstclass"
	}
});

oneflow.submitOrder(function(error, result)	{
	var response = result.body;

	if (response.error)	{
		console.log("Error");
		console.log("=====");
		console.log(response.error.message);
		if (response.error.code==208)	{
			response.error.validations.forEach(function(validation){
				console.log(validation.path, " -> ", validation.message);
			});
		}
	}	else	{

		var savedOrder = response.order;

		console.log("Success");
		console.log("=======");
		console.log("Order ID        :", savedOrder._id);

		savedOrder.files.forEach(function(file){

			console.log("Uploading File  :", file._id);

			var localFilename = "files/greetings-card.pdf";

			oneflow.uploadFile(file, localFilename, function(err, result){
				if (err)	{

				}	else	{
					console.log();
				}
			});

		});

	}
	console.log();
});








