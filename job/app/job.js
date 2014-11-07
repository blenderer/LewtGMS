require([
	'knockout',
	'komapping',
	'underscore',
	'lewtgms.common'
	], function (ko, komapping, _, common) {

		var uploader = document.querySelector("#fileupload input");
		//When we add a file to the uploader, do the following
		var initInterface = function() {
			var formElement = document.getElementById('form');
			var f = this.files[0];
		    var r = new FileReader();
		    r.onload = function() {
		        //Make our viewmodel global, so we can easily debug in chrome
		        //viewModel = viewModel(JSON.parse(r.result));
		        //Then apply the binding

		        ko.applyBindings(viewModel(JSON.parse(r.result)), formElement);
		        formElement.style.display = "block";
		        uploader.style.display = "none";
		    }
		    r.readAsText(f);
		}

		uploader.addEventListener('change', initInterface);

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

				self.jobs()[i].removePriority = function() {

				}

				self.jobs()[i].movePriorityUp = function() {

				}

				self.jobs()[i].movePriorityDown = function() {

				}

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
});