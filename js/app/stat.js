require([
	'jquery',
	'jquery.ui.sortable',
	'sql',
	'knockout',
	'komapping',
	'kosortable',
	'underscore'
	], function ($, jui, SQL, ko, komapping, kosort, _) {

		//When we add a file to the uploader, do the following
		$("#fileupload").change(function() {
			$("#form").show();
			var f = $(this).prop("files")[0];
		    var r = new FileReader();
		    r.onload = function() {
		        var Uints = new Uint8Array(r.result);
		        //Turn our file into a sqlite database in memory
		        db = new SQL.Database(Uints);

		        //Make our viewmodel global, so we can easily debug in chrome
		        viewModel = viewModel();
		        //Then apply the binding
		        ko.applyBindings(viewModel);
		    }
		    r.readAsArrayBuffer(f);
		});

		var viewModel = function() {
			//get our data from the db first
			var data = loadJob();

			//These properties need to not be observable
			var options = {
			    'copy': [
			    	"statlist",
			    	"jobs.id",
			    	"jobs.name",
			    	"clean"
			    ]
			}

			//Apply our ko.mapping
			self = komapping.fromJS(data, options);

			

			//Gets bound to an anchor tag for download the saved DB
			self.saveLink = ko.observable();

			//Remaps the new data from a new job (Or the same one)
			self.changeJob = function() {
				komapping.fromJS(loadJob(self.selectedJob()), self)
			}

			//Returns the job back to its "clean" state (Which we have saved)
			self.resetJob = function() {
				_.each(JSON.parse(self.clean), function(value, key) {
					self.properties[key](value);
				});
			}

			self.saveJob = function() {
				//makes our properties easy to work with
				var props = ko.toJS(self.properties);

				//Recreates our comma-delimted id string for db insert
				var idstatpriority = _.map(props.statpriority, function(longname) {
							return _.findWhere(self.statlist, {longname: longname}).id;
						}).join();

				var sql = "INSERT OR REPLACE INTO Jobs" +
				"(id, name, hitdie, statpriority)" +
				"VALUES ('"+props.id+"', '"+props.name+"', '"+props.hitdie+"', '"+idstatpriority+"')";

				

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
				return JSON.stringify(ko.toJS(self.properties)) != self.clean;
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
		        //turn our comma delimted string into an array
		        row.statpriority = row.statpriority.split(",");
		        properties = row;
		    }

		    //Then step through the array and map it to its human-readable name
		    for (var i=0; i<properties.statpriority.length; i++) {
		    	properties.statpriority[i] = _.findWhere(statList, {id: properties.statpriority[i]*1}).longname;
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