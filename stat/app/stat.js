require([
	'knockout',
	'komapping',
	'kosortable',
	'underscore',
	'lewtgms.common'
	], function (ko, komapping, kosort, _, common) {

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
		        ko.applyBindings(viewModel(JSON.parse(r.result), formElement));
		        formElement.style.display = "block";
		        uploader.style.display = "none";
		    }
		    r.readAsText(f);
		}

		uploader.addEventListener('change', initInterface);

		viewModel = function(data) {

			for (var i=0; i<data.stats.length; i++) {
				data.stats[i].selected = false;
			}

			data.stats[0].selected = true;

			var self = komapping.fromJS(data);

			self.baseFields = ["short", "long", "base"];

			self.originalProps = function(){ return _.map(ko.toJS(self).stats, function(stat) {
				var returnSet = {};

				for (var i=0; i<self.baseFields.length; i++) {
					var property = self.baseFields[i]
					returnSet[property] = stat[property];
				}

				return returnSet;
			})};

			self.selectedStat = ko.observable("");

			//Gets bound to an anchor tag for download the saved DB
			self.saveLink = ko.observable();

			self.changeSelected = function() {
				for (var i=0; i<data.stats.length; i++) {
					self.stats()[i].selected(false);
				}
				_.find(self.stats(), function(stat) {
					return stat.long() == self.selectedStat();
				}).selected(true);
			}

			self.save = function() {
				//File creation magic
				var blob = new Blob([JSON.stringify({"stats": self.originalProps()}, null, '    ')], {type: "application/octet-stream"});
	        	self.saveLink(window.URL.createObjectURL(blob));
			}

			return self;
		}
});