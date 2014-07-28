require([
	'jquery',
	'jquery.ui.sortable',
	'sql',
	'knockout',
	'kosortable',
	'underscore'
	], function ($, jui, SQL, ko, kosort, _) {

	$(function() {

		jobList = [];
		statList = [];
		$("#fileupload").change(function() {
			$("#form").show();
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

			self.ready = ko.observable(true);

			self.jobList = ko.observableArray(jobList);
			self.statList = ko.observableArray(statList);

			self.job = ko.observable(null);
			self.name = ko.observable("");

			self.getJob = ko.computed(function() {
				return _.find(self.jobList(), function(item) { return item.id == self.job()})
			});

			self.hitdie = ko.observable();
			self.statPriority = ko.observableArray();

			self.vanillaVM = null;

			self.selectedNewStat = ko.observable();

			self.addPriority = function() {
				if (!_.contains(self.statPriority(), self.selectedNewStat())) {
					self.statPriority.push(self.selectedNewStat());
				}
				else {
					alert("Stat Priority already contains that stat!");
				}
			}

			self.JobProps = function(aViewModel) {
				return _.pick(ko.toJS(aViewModel), "hitdie", "name", "statPriority");
			};

			self.job.subscribe(function(newValue) {
				if (!self.job()) {
					return false;
				}

				var thisJob = self.getJob();

				self.hitdie(thisJob.hitdie);
				self.statPriority(
					_.map(thisJob.statpriority, function(item) {
						return self.getStatById(item).longname;
					})
				);

				var deepProps = self.JobProps(self);
				self.vanillaVM = JSON.stringify(deepProps);
			});

			self.isDirty = function() {
				return JSON.stringify(self.JobProps(self)) != self.vanillaVM;
			};

			self.getStatById = function(id) {
				if (!_.findWhere(self.statList(), {id: id*1}))
				{
					return false;
				}
				return _.findWhere(self.statList(), {id: id*1});
			};

			self.baseStats = ko.computed(function() {
				return _.where(self.statList(), {basestat: 1})
			});

			self.removeStat = function(stat) {
				self.statPriority.remove(stat)
			}

			self.saveLink = ko.observable("");

			self.saveJob = function() {
				var blob = new Blob([db.export()], {type: "application/octet-stream"});
	        	self.saveLink(window.URL.createObjectURL(blob));
			}

			self.resetJob = function() {
				_.each(JSON.parse(self.vanillaVM), function(value, key) {
					self[key](value);
				});
			}
		};
	});

});