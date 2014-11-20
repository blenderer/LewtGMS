define([
	'knockout',
	'komapping',
	'underscore',
	'lewtgms.common',
	'app/stats',
	'app/jobs',
	'app/characters'
	], function (ko, komapping, _, common, statCollection, jobCollection, characterCollection) {

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

		//Stats stuff
		var statsCollection = statCollection.init(data);;
		self.stats = statsCollection.collection;
		self.statsVm = statsCollection.vm;
		collectionList.push(statsCollection);
		self.views.push("stats");

		//Jobs stuff
		var jobsCollection = jobCollection.init(data);;
		self.jobs = jobsCollection.collection;
		self.jobsVm = jobsCollection.vm;
		collectionList.push(jobsCollection);
		self.views.push("jobs");

		//Jobs stuff
		var charactersCollection = characterCollection.init(data);;
		self.characters = charactersCollection.collection;
		self.charactersVm = charactersCollection.vm;
		collectionList.push(charactersCollection);
		self.views.push("characters");


		jobsCollection.stats = self.stats();
		statsCollection.jobs = self.jobs();

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