require([
	'jquery',
	'jquery.ui.sortable',
	'sql',
	'knockout',
	'komapping',
	'kosortable',
	'underscore'
	], function ($, jui, SQL, ko, komapping, kosort, _) {

		$("#fileupload").change(function() {
			$("#form").show();
			var f = $(this).prop("files")[0];
		    var r = new FileReader();
		    r.onload = function() {
		        var Uints = new Uint8Array(r.result);
		        db = new SQL.Database(Uints);

		        viewModel = viewModel();
		        ko.applyBindings(viewModel);
		    }
		    r.readAsArrayBuffer(f);
		});

		viewModel = function() {
			var data = loadJob();

			var options = {
			    'copy': [
			    	"statlist",
			    	"jobs.id",
			    	"jobs.name",
			    	"clean"
			    ]
			}

			self = komapping.fromJS(data, options);

			self.selectedStat = ko.observable();
			self.selectedJob = ko.observable();

			self.baseStats = ko.observableArray(_.where(self.statlist, {basestat: 1}));

			self.addPriority = function() {
				if (!_.contains(self.properties.statpriority(), self.selectedStat())) {
					self.properties.statpriority.push(self.selectedStat());
				}
				else {
					alert("Stat Priority already contains that stat!");
				}
			}

			self.saveLink = ko.observable();

			self.changeJob = function() {
				komapping.fromJS(loadJob(self.selectedJob()), self)
			}

			self.removeStat = function(stat) {
				self.properties.statpriority.remove(stat);
			}

			self.isDirty = function() {
				return JSON.stringify(ko.toJS(self.properties)) != self.clean;
			};

			self.resetJob = function() {
				_.each(JSON.parse(self.clean), function(value, key) {
					self.properties[key](value);
				});
			}

			self.saveJob = function() {
				var props = ko.toJS(self.properties);
				var idstatpriority = _.map(props.statpriority, function(longname) {
							return _.findWhere(self.statlist, {longname: longname}).id;
						}).join();

				var sql = "INSERT OR REPLACE INTO Jobs" +
				"(id, name, hitdie, statpriority)" +
				"VALUES ('"+props.id+"', '"+props.name+"', '"+props.hitdie+"', '"+idstatpriority+"')";

				

				db.run(sql);

				var blob = new Blob([db.export()], {type: "application/octet-stream"});
	        	self.saveLink(window.URL.createObjectURL(blob));

	        	self.changeJob();
			}

			return self;
		}

		function loadJob(job) {
			//LOAD JOB NAMES
	        var stmt = db.prepare("SELECT id, name FROM Jobs");
			stmt.getAsObject();

			var jobs = [];
			
			while(stmt.step()) { //
		        var row = stmt.getAsObject();
		        jobs.push(row);
		    }

		    var jobId = job || jobs[0].id;

		    //GET STAT NAMES
		    var statList = [];

	        var stmt = db.prepare("SELECT * FROM stats_type");
			stmt.getAsObject();
			
			while(stmt.step()) { //
		        var row = stmt.getAsObject();
		        statList.push(row);
		    }

		    //LOAD JOB*
	        var stmt = db.prepare("SELECT * FROM Jobs where id = '" + jobId + "'");
			stmt.getAsObject();

			var properties = [];
			
			while(stmt.step()) { //
		        var row = stmt.getAsObject();
		        row.statpriority = row.statpriority.split(",");
		        properties = row;
		    }

		    for (var i=0; i<properties.statpriority.length; i++) {
		    	properties.statpriority[i] = _.findWhere(statList, {id: properties.statpriority[i]*1}).longname;
		    }

		    return {
		    	jobs: jobs,
		    	properties: properties,
		    	statlist: statList,
		    	clean: JSON.stringify(properties)
		    };
		}
});