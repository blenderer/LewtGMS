require([
	'jquery',
	'jquery.ui.sortable',
	'sql',
	'knockout',
	'komapping',
	'kosortable',
	'underscore'
	], function ($, jui, SQL, ko, komapping, kosort, _) {

	$(function() {

		viewModel = null;

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
			var options = {
			    'copy': ["statlist"]
			}
			var self = komapping.fromJS(loadJob(), options);

			self.selectedStat = ko.observable();

			self.baseStats = ko.observableArray(_.where(self.statlist, {basestat: 1}));

			self.addPriority = function() {
				if (!_.contains(self.properties.statpriority(), self.selectedStat())) {
					self.properties.statpriority.push(self.selectedStat());
				}
				else {
					alert("Stat Priority already contains that stat!");
				}
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
		    	statlist: statList
		    };
		}

		/*var FormViewModel = function() {
			self = this;

			self.ready = ko.observable(true);

			self.jobList = ko.observableArray(jobList);
			self.statList = ko.observableArray(statList);

			self.job = ko.observable(null);
			self.name = ko.observable("");
			self.id = ko.observable(null);

			self.getJob = ko.computed(function() {
				return _.find(self.jobList(), function(item) { return item.id == self.job()})
			});

			self.hitdie = ko.observable();
			self.statPriority = ko.observableArray();

			self.vanillaVM = null;

			self.selectedNewStat = ko.observable();

			self.jobProps = function() {
				return _.pick(ko.toJS(self), 
					"hitdie", 
					"name", 
					"statPriority",
					"id");
			};

			self.job.subscribe(function(newValue) {
				if (!self.job()) {
					return false;
				}

				var thisJob = self.getJob();

				self.hitdie(thisJob.hitdie);
				self.name(thisJob.name);
				self.id(thisJob.id);
				self.statPriority(
					_.map(thisJob.statpriority, function(item) {
						return self.getStatById(item).longname;
					})
				);

				var deepProps = self.jobProps();
				self.vanillaVM = JSON.stringify(deepProps);
			});

			self.isDirty = function() {
				return JSON.stringify(self.jobProps()) != self.vanillaVM;
			};

			self.getStatById = function(id) {
				if (!_.findWhere(self.statList(), {id: id*1}))
				{
					return false;
				}
				return _.findWhere(self.statList(), {id: id*1});
			};

			self.getStatIdByLongname = function(longname) {
				if (!_.findWhere(self.statList(), {longname: longname}))
				{
					return false;
				}
				return _.findWhere(self.statList(), {longname: longname}).id;
			};

			self.baseStats = ko.computed(function() {
				return _.where(self.statList(), {basestat: 1})
			});

			self.removeStat = function(stat) {
				self.statPriority.remove(stat)
			}

			self.saveLink = ko.observable("");

			self.saveJob = function() {
				var props = self.jobProps();
				var idstatp = _.map(props.statPriority, function(longname) {
							return self.getStatIdByLongname(longname);
						}).join();

				var sql = "INSERT OR REPLACE INTO Jobs" +
				"(id, name, hitdie, statpriority)" +
				"VALUES ('"+props.id+"', '"+props.name+"', '"+props.hitdie+"', '"+idstatp+"')";

				

				db.run(sql);

				//self.jobList.removeAll();
				//self.jobList.push(loadJobs());

				var blob = new Blob([db.export()], {type: "application/octet-stream"});
	        	self.saveLink(window.URL.createObjectURL(blob));
			}

			self.resetJob = function() {
				_.each(JSON.parse(self.vanillaVM), function(value, key) {
					self[key](value);
				});
			}
		};*/
	});

});