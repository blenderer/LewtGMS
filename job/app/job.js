require([
	'knockout',
	'komapping',
	'underscore',
	'lewtgms.common'
	], function (ko, komapping, _, common) {

	viewModel = function(data) {
		//map the original properties so we dont add in unecessary IDs and selected stuff
		data.originalProps = common.getPropertyMap(data);

		//originalProps doesn't need to be observable
		var options = {
			"copy": ["originalProps"]
		};

		//bind the data to the viewmodel
		var self = komapping.fromJS(data, options);

		//Add in some observables to help us order and select things on the UI
		for (var i=0; i<self.jobs().length; i++) {
			self.jobs()[i].selected = ko.observable(false)
			self.jobs()[i].id = ko.observable(i);
		}
		self.jobs()[0].selected(true);
		self.selectedJob = ko.observable("");

		//Gets bound to an anchor tag for download the saved DB
		self.saveLink = ko.observable();

		self.changeSelectedJob = function() {
			for (var i=0; i<self.jobs().length; i++) {
				if (self.jobs()[i].id() == self.selectedJob()) {
					self.jobs()[i].selected(true);
				}
				else {
					self.jobs()[i].selected(false);
				}
			}
		}

		self.getSelectedJob = function() {
			return _.find(self.jobs(), function(job) { return job.selected()});
		}

		self.newJob = function() {
			var newId = self.jobs().length + 1;
			self.stats.push({
				"name": ko.observable("{Enter Name}"),
				"id": ko.observable(newId),
				"statpriorities": ko.observableArray(),
				"secondaries": ko.observableArray()
			});
			self.selectedJob(newId);
			self.changeSelectedJob();
		}

		self.removeSelectedJob = function() {
			self.jobs.remove(_.find(self.jobs(), function(job) {
				return job.selected()
			}));
		}

		self.addPriority = function(stat) {
			var selectedJob = self.getSelectedJob();
			selectedJob.statpriority.push(stat);
		}

		self.addSecondary = function(stat) {
			var selectedJob = self.getSelectedJob();
			
			selectedJob.secondaries.push(
				{
					"stat": _.find(self.getSecondaryStats(), function(vanillaStat) {
						return vanillaStat.short() == stat;
					}).short,
					"min": 0,
					"max": 0
				}
			);
		}

		self.removePriority = function(stat) {
			var selectedJob = self.getSelectedJob();
			var statP = selectedJob.statpriority;
			statP.remove(stat);
		}

		self.movePriorityUp = function(stat) {
			var selectedJob = self.getSelectedJob();
			var statP = selectedJob.statpriority;
			var triggeredStatArrayIndex = statP.indexOf(stat);

			var newPos = triggeredStatArrayIndex - 1;

			if (newPos < 0) {
				return false;
			}

			statP.splice(triggeredStatArrayIndex, 1);
			statP = statP.splice(newPos, 0, stat);
		}

		self.movePriorityDown = function(stat) {
			var selectedJob = self.getSelectedJob();
			var statP = selectedJob.statpriority;
			var triggeredStatArrayIndex = statP.indexOf(stat);

			var newPos = triggeredStatArrayIndex + 1;

			if (newPos > statP().length - 1) {
				return false;
			}

			statP.splice(triggeredStatArrayIndex, 1);
			statP = statP.splice(newPos, 0, stat);
		}

		self.getBaseStats = function() {
			return _.filter(self.stats(), function(stat) {
				return stat.base()
			});
		}

		self.getSecondaryStats = function() {
			return _.filter(self.stats(), function(stat) {
				return !stat.base()
			});
		}

		self.mapStatName = function(short) {
			if (_.isFunction(short)) {
				short = short();
			}
			var stats = ko.toJS(self.stats());
			var indexed = _.indexBy(stats, 'short');

			if (!indexed[short]) {
				return short;
			}

			return indexed[short].long;
		}

		self.notPriorityList = ko.computed(function() {
			var selectedJob = self.getSelectedJob();
			var statP = selectedJob.statpriority;

			var baseStatList = _.map(komapping.toJS(self.getBaseStats()), function(stat){return stat.short});
			var statPList = komapping.toJS(statP);

			return ko.observableArray(_.difference(baseStatList, statPList));
		}).extend({throttle: 50});

		self.notSecondaryList = ko.computed(function() {
			var selectedJob = self.getSelectedJob();
			var secondaries = komapping.toJS(selectedJob.secondaries());

			var secondaryStatList = _.map(komapping.toJS(self.getSecondaryStats()), function(stat){return stat.short;});
			var alreadySecondaries = _.pluck(komapping.toJS(secondaries), 'stat');

			return ko.observableArray(_.difference(secondaryStatList, alreadySecondaries));
		}).extend({throttle: 50});

		self.removeSecondary = function(secondary) {
			var selectedJob = self.getSelectedJob();
			var secondaries = selectedJob.secondaries;
			secondaries.remove(secondary);
		}

		self.save = function() {
			//File creation magic
			var originalProps = self.originalProps;
			delete self.originalProps;
			var removed = common.removeAppSpecificProperties(komapping.toJS(self), originalProps);

			var blob = new Blob([JSON.stringify(removed, null, '    ')], {type: "application/octet-stream"});
        	self.saveLink(window.URL.createObjectURL(blob));

        	self.originalProps = originalProps;
		}

		return self;
	}

	//Attach the viewModel to the form and intiate it on fileupload
	common.uploaderTie("#fileupload input", viewModel, "#form");
});