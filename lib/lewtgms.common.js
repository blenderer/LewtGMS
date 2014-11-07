define(['knockout',], function(ko){
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