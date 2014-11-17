define([
	'knockout',
	'komapping',
	'underscore',
	'lewtgms.common',
	'app/stats'
	], function (ko, komapping, _, common, statCollection) {

	var viewModel = function(data) {
		var self = this;

		var collectionList = [];
		self.views = ko.observableArray([]);

		self.currentView = function(viewString) {
			return viewString == self.views()[self.selectedView()];
		}

		//Stats stuff - '0'
		var statsCollection = Object.create(statCollection);
		statsCollection.init(data.stats);
		self.stats = statsCollection.collection;
		self.statsVm = statsCollection.vm;
		collectionList.push(statsCollection);
		self.views.push("stats");


		self.selectedView = ko.observable(0);

		self.save = function() {
			//File creation magic

			var print = common.buildJSONString(collectionList);

			var JSONString = JSON.stringify(print, null, '    ');

			var blob = new Blob([JSONString], {type: "application/octet-stream"});
        	self.saveLink(window.URL.createObjectURL(blob));
		}

		self.saveLink = ko.observable();

		return self;
	}
	//Attach the viewModel to the form and intiate it on fileupload
	common.uploaderTie("#fileupload input", viewModel, "#form");
});