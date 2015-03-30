var cBase = function(){
	this._class = "base";
	this._obj = {
		name:"nigel"
	};
};

cBase.prototype.toJSON = function(){
	return JSON.stringify(this._obj);
};

module.exports = cBase;