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

		data = komapping.fromJS(data);

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

		//Jobs stuff
		var jobsCollection = jobCollection.init(data);;
		self.jobs = jobsCollection.collection;
		self.jobsVm = jobsCollection.vm;
		collectionList.push(jobsCollection);

		//Jobs stuff
		var charactersCollection = characterCollection.init(data);;
		self.characters = charactersCollection.collection;
		self.charactersVm = charactersCollection.vm;
		collectionList.push(charactersCollection);

		_.each(collectionList, function(collection) {
			//add this collection's name to the view list
			self.views.push(collection.name);

			//assign the entire viewmodel to this collection so it can access it's live changes
			collection.ref = self;
		});

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