define([
	'knockout',
	'komapping',
	'underscore',
	'lewtgms.common',
	'app/stats',
	'app/jobs'
	], function (ko, komapping, _, common, statCollection, jobCollection) {

	var viewModel = function(data) {
		var self = {};

		var collectionList = [];
		self.views = ko.observableArray([]);

		self.currentView = function(viewString) {
			return viewString == self.views()[self.selectedView()];
		}

		self.changeSelectedView = function(viewString) {
			var indexOfClicked = self.views.indexOf(viewString);

			self.selectedView(indexOfClicked);
		}

		//Stats stuff - '0'
		var statsCollection = statCollection.init(data.stats);;
		self.stats = statsCollection.collection;
		self.statsVm = statsCollection.vm;
		collectionList.push(statsCollection);
		self.views.push("stats");

		//Jobs stuff - '0'
		var jobsCollection = jobCollection.init(data);;
		self.jobs = jobsCollection.collection;
		self.jobsVm = jobsCollection.vm;
		collectionList.push(jobsCollection);
		self.views.push("jobs");
		jobsCollection.stats = self.stats();

		//start off viewing the stats view
		self.selectedView = ko.observable(0);

		self.save = function() {
			//File creation magic

			var printObj = common.buildJSONString(collectionList);

			var JSONString = JSON.stringify(printObj, null, '    ');

			var blob = new Blob([JSONString], {type: "application/octet-stream"});
        	self.saveLink(window.URL.createObjectURL(blob));
		}

		self.saveLink = ko.observable();

		return self;
	}
	//Attach the viewModel to the form and intiate it on fileupload
	common.uploaderTie("#fileupload input", viewModel, "#form");
});