define(['knockout', 'underscore'], function(ko, _){
	var self = this;

	self.numSort = function(a, b) {
		return a - b;
	}

	self.removeLowest = function(numberArray) {
		var sorted = numberArray.sort(self.numSort);
		var removed = sorted.slice(1);
		return {
			dice: removed,
			total: removed.reduce(function(a, b) {
				return a + b;
			})
		}
	}

	self.getRandomInt = function(min, max) {
		return Math.floor(Math.random() * (max - min)) + min;
	}

	self.rollSet = function(rollString, multiplier, removeLowest) {
		var rolls = [];

		removeLowest = removeLowest || false;

		for (var i=0; i<multiplier; i++) {
			var roll = self.roll(rollString);

			if (removeLowest) {
				var removeLowest = self.removeLowest(roll.dice);

				roll.dice = removeLowest.dice;
				roll.total = removeLowest.total;
			}

			rolls.push(roll);
		}

		return rolls;
	}

	self.roll = function(rollString) {
		var pattern = /(\d*)?d(\d+)([\+\-\*\/])?(\d+)?/;
		var regMatch = rollString.match(pattern);

		var multiplier = regMatch[1] || 1;
		var die = regMatch[2];

		var operation = regMatch[3] || "+";
		var modifier = regMatch[4] || 0;

		var total = 0;

		var rollArray = [];

		for (var i=0; i<multiplier; i++) {
			var singleRoll = self.getRandomInt(1, die);
			rollArray.push(singleRoll);
			total = total + singleRoll;
		}

		switch (operation) {
			case "+":
				total = total + modifier*1;
				break;
			case "-":
				total = total - modifier*1;
				break;
			case "*":
				total = total * modifier*1;
				break;
			case "/":
				total = total / modifier*1;
				break;
		}

		return {
			total: total,
			dice: rollArray
		};
	}

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