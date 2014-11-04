require([
	'sql',
	'knockout',
	'komapping',
	'kosortable',
	'underscore',
	'lewtgms.common'
	], function (SQL, ko, komapping, kosort, _, common) {

	var uploader = document.querySelector("#fileupload input");
	//When we add a file to the uploader, do the following
	var initInterface = function() {
		var formElement = document.getElementById('form');
		var f = this.files[0];
	    var r = new FileReader();
	    r.onload = function() {
	        var Uints = new Uint8Array(r.result);
	        //Turn our file into a sqlite database in memory
	        db = new SQL.Database(Uints);

	        //Make our viewmodel global, so we can easily debug in chrome
	        viewModel = viewModel();
	        //Then apply the binding
	        ko.applyBindings(viewModel, formElement);
	        formElement.style.display = "block";
	        uploader.style.display = "none";
	    }
	    r.readAsArrayBuffer(f);
	}

	uploader.addEventListener('change', initInterface);

	//keep this global for debugging porpoises
	viewModel = function() {
		//get our data from the db first
		var data = loadJob();

		//These properties need to not be observable
		var options = {
		    'copy': [
		    	"statlist",
		    	"clean"
		    ]
		}

		//Apply our ko.mapping
		var self = komapping.fromJS(data, options);

		//Observables for when someone uses a bound select
		self.selectedStat = ko.observable();
		self.selectedSecondary = ko.observable();
		self.selectedJob = ko.observable();

		//All of the basestats: (str, dex, int, etc...)
		self.baseStats = ko.observableArray(_.where(self.statlist, {basestat: 1}));
		self.secondaryStats = ko.observableArray(_.where(self.statlist, {secondary: 1}));

		//Adds a stat priority to the stat priority observable array
		self.addPriority = function() {
			if (!_.contains(self.properties.statpriority(), self.selectedStat())) {
				self.properties.statpriority.push(self.selectedStat());
			}
			else {
				alert("Stat Priority already contains that stat!");
			}
		}

		//Adds a secondary stat to the Job
		self.addSecondary = function() {
			if (!_.contains(_.pluck(self.properties.secondary(), "stat"), self.selectedSecondary())) {
				self.properties.secondary.push({
					longname: self.selectedSecondary(),
					min: 0,
					max: 0,
					stat_id: _.findWhere(self.secondaryStats(), {longname: self.selectedSecondary()}).id
				});
			}
			else {
				alert("Secondary stats already contains that stat!");
			}
		}

		//Gets bound to an anchor tag for download the saved DB
		self.saveLink = ko.observable();

		//Remaps the new data from a new job (Or the same one)
		self.changeJob = function() {
			komapping.fromJS(loadJob(self.selectedJob()), self)
		}

		self.newJob = function() {
			var sql = "INSERT INTO Jobs (name) VALUES ('New Job')";

			db.run(sql);

			//File creation magic
			var blob = new Blob([db.export()], {type: "application/octet-stream"});
        	self.saveLink(window.URL.createObjectURL(blob));

        	//Reload the selected job so our viewmodel is clean
        	self.changeJob();
		}

		self.removeStat = function(stat) {
			self.properties.statpriority.remove(stat);
		}
		self.removeSecondary = function(stat) {
			self.properties.secondary.remove(stat);
		}

		//Returns the job back to its "clean" state (Which we have saved)
		self.resetJob = function() {
			_.each(JSON.parse(self.clean), function(value, key) {
				self.properties[key](value);
			});
		}

		self.removeJob = function() {
			if (window.confirm("Do you really want to delete this job?")) { 
				self.jobs.remove(function(item) { 
					return item.id() == self.properties.id() 
				});
			}
		}

		self.saveJob = function() {
			//makes our properties easy to work with
			var props = ko.toJS(self.properties);

			var priorityDiff = common.getChanged(JSON.parse(self.clean).statpriority, props.statpriority);
			var secondaryDiff = common.getChanged(JSON.parse(self.clean).secondary, props.secondary);
			var jobId = self.properties.id();

			//save any added priorities
			for (var i=0; i<priorityDiff.added.length; i++) {
				var newStat = priorityDiff.added[i];
				var order = self.properties.statpriority().indexOf(newStat);
				var statId = _.findWhere(self.statlist, {longname: newStat}).id;
				var sql = 'INSERT INTO job_priorities (job_id, priority, stat_id) VALUES ' +
						  '(' + jobId + ', ' + order + ', ' + statId + ')';
				db.run(sql);
			}

			//save any removed priorities
			for (var i=0; i<priorityDiff.removed.length; i++) {
				var removingStat = priorityDiff.removed[i];
				var statId = _.findWhere(self.statlist, {longname: removingStat}).id;

				var sql = 'DELETE FROM job_priorities where job_id = ' + jobId +
						  ' and stat_id = ' + statId;
				db.run(sql);
			}

			//Now update the order/priority
			for (var i=0; i<=props.statpriority.length - 1; i++) {
				var statId = _.findWhere(self.statlist, {longname: props.statpriority[i]}).id;
				var sql = 'UPDATE job_priorities set priority = ' + i + ' WHERE job_id = ' +
						  jobId + ' and stat_id = ' + statId;
				db.run(sql);
			}

			//save any added secondaries
			for (var i=0; i<secondaryDiff.added.length; i++) {
				var newStat = secondaryDiff.added[i];

				var sql = 'INSERT INTO job_secondaries (min, max, job_id, stat_id) VALUES ' +
						  '(' + newStat.min + ', ' + newStat.max + ', ' + jobId + ', ' + newStat.stat_id + ')';
				db.run(sql);
			}

			//save any removed secondaries
			for (var i=0; i<secondaryDiff.removed.length; i++) {
				var removingStat = secondaryDiff.removed[i];

				var sql = 'DELETE FROM job_secondaries where id = ' + removingStat.id;
				db.run(sql);
			}

			var sql = "INSERT OR REPLACE INTO Jobs" +
			"(id, name)" +
			"VALUES ('"+props.id+"', '"+props.name+"')";

			

			db.run(sql);

			//File creation magic
			var blob = new Blob([db.export()], {type: "application/octet-stream"});
        	self.saveLink(window.URL.createObjectURL(blob));

        	//Reload the selected job so our viewmodel is clean
        	self.changeJob();
		}

		//Compares the current viewmodel to the original state on load
		//We use a rateLimit extension because for some reason it was calculating
		//too fast after we saved
		self.isDirty = ko.computed(function() {
			return JSON.stringify(common.stringyProperties(ko.toJS(self.properties))) 
			!= 
			common.stringyJsonString(self.clean);
		}).extend({ rateLimit: 10 });


		return self;
	}

	/**
	 * Loads a job as a js object from the sqlite database
	 * Accepts a job id number as a parameter
	 *
	 */ 
	function loadJob(job) {
		//LOAD JOB NAMES/IDs
        var stmt = db.prepare("SELECT id, name FROM Jobs");
		stmt.getAsObject();

		var jobs = [];
		
		while(stmt.step()) {
	        var row = stmt.getAsObject();
	        jobs.push(row);
	    }

	    //If no job id provided, use the first one from the list
	    var jobId = job || jobs[0].id;

	    //GET STAT NAMES
	    var statList = [];

        var stmt = db.prepare("SELECT * FROM stats_type");
		stmt.getAsObject();
		
		while(stmt.step()) {
	        var row = stmt.getAsObject();
	        statList.push(row);
	    }

	    //LOAD JOB*
        var stmt = db.prepare("SELECT * FROM Jobs where id = '" + jobId + "'");
		stmt.getAsObject();

		var properties = [];
		
		while(stmt.step()) {
	        var row = stmt.getAsObject();
	        row.statpriority = [];

	    	//get stat priorities
	    	var stpr = db.prepare("select st.longname from job_priorities jp, stats_type st where job_id = "+row.id+" and st.id = jp.stat_id order by priority ASC");
			stpr.getAsObject();
			while(stpr.step()) {
				row.statpriority.push(stpr.getAsObject().longname);
			}

			row.secondary = [];
			//get secondary stats
			var stSec = db.prepare("select js.id, js.stat_id, st.longname, js.min, js.max from job_secondaries js, stats_type st where job_id = "+row.id+" and st.id = js.stat_id");
			while(stSec.step()) {
				row.secondary.push(stSec.getAsObject());
			}


	        properties = row;
	    }

	    //Return our object which will be consumed by the ViewModel
	    return {
	    	jobs: jobs,
	    	properties: properties,
	    	statlist: statList,
	    	clean: JSON.stringify(properties)
	    };
	}
});