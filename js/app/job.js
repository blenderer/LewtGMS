require({
    //Set config for finding 'jqueryui'. The path is relative
    //to the location of require-jquery.js.
    paths: {
        jqueryui: 'jquery-ui.min'
    }
}, ['require', 'jquery', 'jqueryui'], function (req, $) {

	$(function() {
		jobList = [];
		statList = [];
		$("#fileupload").change(function() {
			var f = $(this).prop("files")[0];
		    var r = new FileReader();
		    r.onload = function() {
		        var Uints = new Uint8Array(r.result);
		        db = new SQL.Database(Uints);

		        //LOAD JOBS
		        var stmt = db.prepare("SELECT * FROM Jobs");
				stmt.getAsObject();
				
				while(stmt.step()) { //
			        var row = stmt.getAsObject();
			        row.statpriority = row.statpriority.split(",");
			        jobList.push(row);
			    }

			    //LOAD stats
		        var stmt = db.prepare("SELECT * FROM stats_type");
				stmt.getAsObject();
				
				while(stmt.step()) { //
			        var row = stmt.getAsObject();
			        statList[row.id] = row;
			    }

		        app = new FormViewModel();
				ko.applyBindings(app);
		    }
		    r.readAsArrayBuffer(f);
		});

		var FormViewModel = function() {
			self = this;

			self.jobList = ko.observableArray(jobList);
			self.statList = ko.observableArray(statList);

			self.job = ko.observable(null);

			self.getJob = function() {
				return _.find(self.jobList(), function(item) { return item.id == self.job()})
			};

			self.getStatById = function(id) {
				if (!_.findWhere(self.statList(), {id: id*1}))
				{
					return false;
				}
				return _.findWhere(self.statList(), {id: id*1});
			}

			self.baseStats = ko.computed(function() {
				return _.where(self.statList(), {basestat: 1})
			});

			self.name = ko.computed(function() {
				if (!self.job()) {
					return "";
				}
				return self.getJob().name
			});

			self.hitdie = ko.computed(function() {
				if (!self.job()) {
					return "";
				}
				return self.getJob().hitdie
			});

			self.statPriority = ko.computed(function() {
				if (!self.job()) {
					return [];
				}
				return self.getJob().statpriority;
			});

			self.selectedNewStat = ko.observable();

			self.addPriority = function() {
				self.statPriority().push(self.selectedNewStat());
			}
		};
	});

});