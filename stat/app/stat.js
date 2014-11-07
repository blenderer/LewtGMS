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

			data.originalProps = common.getPropertyMap(data);

			var options = {
				"copy": ["originalProps"]
			};

			var self = komapping.fromJS(data, options);

			for (var i=0; i<self.stats().length; i++) {
				self.stats()[i].selected = ko.observable(false)
				self.stats()[i].id = ko.observable(i);
			}

			self.stats()[0].selected(true);

			self.selectedStat = ko.observable("");

			//Gets bound to an anchor tag for download the saved DB
			self.saveLink = ko.observable();

			self.changeSelected = function() {
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
				self.changeSelected();
			}

			self.removeSelectedStat = function() {
				self.stats.remove(_.find(self.stats(), function(stat) {
					return stat.selected()
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