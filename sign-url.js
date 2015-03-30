var oneflowClient = require("./lib/oneflow");

var endpoint = "http://localhost:3000";
var token = "";
var secret = "";

var oneflow = new oneflowClient(endpoint, token, secret);

oneflow.request("GET", "/api/order", null, function(response){
	console.log(response.body);
});
