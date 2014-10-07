define(['underscore'], function(_){
	self = this;

	self.stringyJsonString = function(crappyJsonString) {
		var pattern = /(\:\s*)(\-*[\d+\.]+)(\s*[,}])/g;
		var replace = '$1"$2"$3';
		return crappyJsonString.replace(pattern, replace)
	};

	self.stringyProperties = function(object) {
		var properJSONString = JSON.stringify({data: object});
		var JSONStringWithStringyNumbers = stringyJsonString(properJSONString);
		var finalObject = JSON.parse(JSONStringWithStringyNumbers);
		return finalObject.data;
	};

	self.getChanged = function(oldArray, newArray) {
		oldArray = stringyProperties(oldArray);
		newArray = stringyProperties(newArray);

		for (var i=0; i<oldArray.length; i++) {
			oldArray[i] = JSON.stringify(oldArray[i])
		}
		for (var i=0; i<newArray.length; i++) {
			newArray[i] = JSON.stringify(newArray[i])
		}

		var added = _.difference(newArray, oldArray);
		var removed = _.difference(oldArray, newArray);

		for (var i=0; i<added.length; i++) {
			added[i] = JSON.parse(added[i]);
		}
		for (var i=0; i<removed.length; i++) {
			removed[i] = JSON.parse(removed[i]);
		}

		return {
			"added": added,
			"removed": removed
		}
	};

	return self;
});