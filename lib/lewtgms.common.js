define(['knockout', 'underscore'], function(ko, _){
	var self = this;

	self.newItemFromStructure = function(structure, callbackArray) {
		var retObj = {};
		_.each(structure, function(bluePrint, property) {
			if (bluePrint.hasOwnProperty("default")) {
				retObj[property] = ko.observable(bluePrint.default);
			}
			else if (bluePrint.hasOwnProperty("callback")) {
				retObj[property] = ko.observable(callbackArray[bluePrint.callback]());
			}
		});

		return retObj;
	};

	self.buildJSONString = function(collectionListArray) {
		var retObj = {};

		_.each(collectionListArray, function(collection) {
			retObj[collection.name] = collection.getSavable();
		});

		return retObj;
	};

	self.populateItemForUI = function(structure, item, callbackArray) {
		var mappedWithName = _.map(structure, function(specific, property) {
		    specific.name = property;
		    return specific;
		});

		var additionals = _.filter(mappedWithName, function(property) {
		    if (!property.hasOwnProperty('save') || property.save === false) {
		        return true;
		    }
		});

		_.each(additionals, function(newProp) {
			if (newProp.hasOwnProperty("default")) {
				item[newProp.name] = ko.observable(newProp.default);
			}
			else if (newProp.hasOwnProperty("callback")) {
				item[newProp.name] = ko.observable(callbackArray[newProp.callback]());
			}
		});

		return item;
	};

	self.getHighestNumber = function(numberArray) {
        return numberArray.sort(function(a, b){return b-a;})[0];
    }

	self.getPropertyMap = function(object, currProp) {
		if (currProp === undefined) {
			var currProp = {};
		}

		for (var property in object) {
			if (Array.isArray(object[property])) {
				if (typeof(object[property][0]) == 'object') {
					currProp[property] = [self.getPropertyMap(object[property][0], currProp[property])];
				}
				else {
					currProp[property] = true;
				}
			}
			else if (typeof(object[property]) == 'object') {
				currProp[property] = self.getPropertyMap(object[property][0], currProp[property]);
			}
			else {
				currProp[property] = true;
			}
		}
		return currProp;
	};

	self.removeAppSpecificProperties2 = function(dataObject, originalProperties) {
		var cleansedData = {};

		for (var property in dataObject) {
			if (originalProperties[property] && originalProperties[property].save) {
				if (Array.isArray(dataObject[property])) {
					
					cleansedData[property] = [];
					for (var i=0; i<dataObject[property].length; i++) {
						if (originalProperties[property] === true) {
							cleansedData[property][i] = dataObject[property][i];
						}
						else {
							cleansedData[property][i] = self.removeAppSpecificProperties(dataObject[property][i], originalProperties[property][0]);
						}
					}
				}
				else if (typeof(property) == "object" && originalProperties[property].sub) {
					cleansedData[property] = self.removeAppSpecificProperties(dataObject[property], originalProperties[property])
				}
				else {
					cleansedData[property] = dataObject[property];
				}
			}
		}

		return cleansedData;
	}

	self.removeAppSpecificProperties = function(dataObject, originalProperties) {
		var cleansedData = {};

		for (var property in dataObject) {
			if (originalProperties[property]) {
				if (Array.isArray(dataObject[property])) {
					
					cleansedData[property] = [];
					for (var i=0; i<dataObject[property].length; i++) {
						if (originalProperties[property] === true) {
							cleansedData[property][i] = dataObject[property][i];
						}
						else {
							cleansedData[property][i] = self.removeAppSpecificProperties(dataObject[property][i], originalProperties[property][0]);
						}
					}
				}
				else if (typeof(property) == "object") {
					cleansedData[property] = self.removeAppSpecificProperties(dataObject[property], originalProperties[property])
				}
				else {
					cleansedData[property] = dataObject[property];
				}
			}
		}

		return cleansedData;
	}

	self.uploaderTie = function(fileuploadSelector, viewModel, viewModelSelector) {
		var uploader = document.querySelector(fileuploadSelector);
		//When we add a file to the uploader, do the following
		var initInterface = function() {
			var formElement = document.querySelector(viewModelSelector);
			var f = this.files[0];
		    var r = new FileReader();
		    r.onload = function() {
		        ko.applyBindings(viewModel(JSON.parse(r.result)), formElement);
		        formElement.style.display = "block";
		        uploader.style.display = "none";
		    }
		    r.readAsText(f);
		}

		uploader.addEventListener('change', initInterface);
	}

	return self;
});