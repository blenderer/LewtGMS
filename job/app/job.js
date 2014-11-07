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

			for (var secondary=0; secondary<self.jobs()[i].secondaries().length; secondary++) {
				self.jobs()[i].secondaries()[secondary].removeSecondary = function() {
					
				}
			}
		}
		self.jobs()[0].selected(true);
		self.selectedJob = ko.observable("");

		//Gets bound to an anchor tag for download the saved DB
		self.saveLink = ko.observable();

		self.changeSelectedJob = function() {
			for (var i=0; i<self.jobs().length; i++) {
				self.jobs()[i].selected(false);
			}

			_.find(self.jobs(), function(job) {
				return job.id() == self.selectedJob()
			}).selected(true)
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

		self.notPriorityList = ko.computed(function() {
			var selectedJob = self.getSelectedJob();
			var statP = selectedJob.statpriority;

			var baseStatList = _.map(komapping.toJS(self.getBaseStats()), function(stat){return stat.short});
			var statPList = komapping.toJS(statP);

			return ko.observableArray(_.difference(baseStatList, statPList));
		})

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