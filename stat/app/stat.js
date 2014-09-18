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

		viewModel = function() {
			//get our data from the db first
			var data = loadStats();

			//These properties need to not be observable
			var options = {
			    'copy': [
			    	"clean"
			    ]
			}

			//Apply our ko.mapping
			self = komapping.fromJS(data, options);

			

			//Gets bound to an anchor tag for download the saved DB
			self.saveLink = ko.observable();

			//Remaps the new data from a new job (Or the same one)
			self.changeStat = function() {
				komapping.fromJS(loadJob(self.selectedStat()), self)
			}

			//Returns the job back to its "clean" state (Which we have saved)
			self.resetJob = function() {
				_.each(JSON.parse(self.clean), function(value, key) {
					self.properties[key](value);
				});
			}

			self.saveStat = function() {
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
		function loadStats(stat) {
			//LOAD JOB NAMES/IDs
	        var stmt = db.prepare("SELECT * FROM stats_type");
			stmt.getAsObject();

			var stats = [];
			
			while(stmt.step()) {
		        var row = stmt.getAsObject();
		        stats.push(row);
		    }

		    //If no job id provided, use the first one from the list
		    var statId = stat || stats[0].id;

		    //Return our object which will be consumed by the ViewModel
		    return {
		    	stats: stats,
		    	clean: JSON.stringify(stats)
		    };
		}
});