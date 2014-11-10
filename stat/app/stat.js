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
		for (var i=0; i<self.stats().length; i++) {
			self.stats()[i].selected = ko.observable(false)
			self.stats()[i].id = ko.observable(i);
		}
		self.stats()[0].selected(true);
		self.selectedStat = ko.observable("");

		//Gets bound to an anchor tag for download the saved DB
		self.saveLink = ko.observable();

		self.changeSelectedStat = function() {
			for (var i=0; i<self.stats().length; i++) {
				self.stats()[i].selected(false);
			}

			_.find(self.stats(), function(stat) {
				return stat.id() == self.selectedStat()
			}).selected(true)
		}

		self.newStat = function() {
			var newId = self.stats().length + 1;
			self.stats.push({
				"long": ko.observable("{Enter Name}"),
				"short": ko.observable(""),
				"id": ko.observable(self.stats().length + 1),
				"base": ko.observable(false),
				"selected": ko.observable(false)
			});
			self.selectedStat(newId);
			self.changeSelectedStat();
		}

		self.removeSelectedStat = function() {
			var result = confirm("Deleting this will remove all references to the stat in Jobs. Are you sure?");

			if (result) {
				var selectedStat = _.find(self.stats(), function(stat) {
					return stat.selected()
				});

				self.stats.remove(selectedStat);

				_.each(self.jobs(), function(job) {
					if (selectedStat.base()) {
						_.each(job.statpriority(), function(stat) {
							if (stat == selectedStat.short()) {
								job.statpriority.remove(stat);
							}
						})
					}
					else {
						_.each(job.secondaries(), function(stat) {
							if (stat.stat() == selectedStat.short()) {
								job.secondaries.remove(stat);
							}
						});
					}
				});
			}
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