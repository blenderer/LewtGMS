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
			    /*'copy': [
			    	"clean"
			    ]*/
			}

			//Apply our ko.mapping
			self = komapping.fromJS(data, options);

			self.selectedStat = ko.observable();

			//Gets bound to an anchor tag for download the saved DB
			self.saveLink = ko.observable();

			//Remaps the new data from a new job (Or the same one)
			self.changeStat = function() {
				komapping.fromJS(loadStats(self.selectedStat()), self)
			}

			self.getSavableProperties = function() {
				var secondary = 0;
				var base = 0;
				if (self.type() == 'secondary') {
					secondary = 1;
				}
				if (self.type() == 'base') {
					base = 1;
				}
				return {
					id: self.id(),
					longname: self.longname(),
					shortname: self.shortname(),
					basestat: base,
					secondary: secondary
				}
			}

			self.saveStat = function() {
				//makes our properties easy to work with
				var currentStat = self.getSavableProperties();

				var sql = "INSERT OR REPLACE INTO Stats_type" +
				"(id, shortname, longname, basestat, secondary)" +
				"VALUES ('"+currentStat.id+"', '"+currentStat.shortname+"', '"+currentStat.longname+
					"', '"+currentStat.basestat+"', '"+currentStat.secondary+"')";

				

				db.run(sql);

				//File creation magic
				var blob = new Blob([db.export()], {type: "application/octet-stream"});
	        	self.saveLink(window.URL.createObjectURL(blob));

	        	//Reload the selected job so our viewmodel is clean
	        	self.changeStat();
			}

			//Compares the current viewmodel to the original state on load
			//We use a rateLimit extension because for some reason it was calculating
			//too fast after we saved
			self.isDirty = ko.computed(function() {
				return JSON.stringify(ko.toJS(
					{
						id: self.id(),
						shortname: self.shortname(),
						longname: self.longname(),
						type: self.type()
					}
					)) != self.clean();
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

		    var statObject = _.findWhere(stats, {id: statId});

		    if (statObject.basestat) {
		    	statObject.type = "base";
		    }
		    else if(statObject.secondary) {
		    	statObject.type = "secondary";
		    }
		    else {
		    	statObject.type = "none";
		    }

		    delete statObject.basestat;
		    delete statObject.secondary;

		    //Return our object which will be consumed by the ViewModel
		    return {
		    	stats: stats,
		    	id: statObject.id,
		    	shortname: statObject.shortname,
		    	longname: statObject.longname,
		    	type: statObject.type,
		    	clean: JSON.stringify(statObject)
		    };
		}
});