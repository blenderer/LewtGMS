define(['underscore'], function(_){
	self = this;

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

	return self;
});