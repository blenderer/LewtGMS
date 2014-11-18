define([
    'knockout',
    'komapping',
    'underscore',
    'lewtgms.common',
    'lewtgms.job.structure',
    'lewtgms.contentcollection'
    ], function (ko, komapping, _, common, structure, Collection) {

    var self = {}

    self.init = function(jobList) {
        var i = 0;
        var idCallback = function(){return i++;};

        self = new Collection("jobs", structure, jobList, [idCallback]);
        self.vm = {};

        self.vm.changeSelectedJob = function() {
            _.each(self.collection(), function(job) {
                job.selected(false);
            })

            var toSelect = _.find(self.collection(), function(job) {
                return job.id() == self.vm.selectedJob()
            });
            if (toSelect) {
                toSelect.selected(true);
            }
        }

        self.vm.selectedJob = ko.observable(0);
        /*
        self.getSelectedJob = function() {
            return _.find(self.jobs(), function(job) { return job.selected()});
        }

        self.newJob = function() {
            var newId = self.jobs().length + 1;
            self.jobs.push({
                "name": ko.observable("{Enter Name}"),
                "id": ko.observable(newId),
                "statpriority": ko.observableArray(),
                "secondaries": ko.observableArray(),
                "selected": ko.observable(false)
            });
        }
        */
        self.vm.removeSelectedJob = function() {
            self.jobs.remove(_.find(self.jobs(), function(job) {
                return job.selected()
            }));
        }
        /*
        self.addPriority = function(stat) {
            var selectedJob = self.getSelectedJob();
            selectedJob.statpriority.push(stat);
        }

        self.addSecondary = function(stat) {
            var selectedJob = self.getSelectedJob();
            
            selectedJob.secondaries.push(
                {
                    "stat": _.find(self.getSecondaryStats(), function(vanillaStat) {
                        return vanillaStat.short() == stat;
                    }).short,
                    "min": 0,
                    "max": 0
                }
            );
        }

        self.removePriority = function(stat) {
            var selectedJob = self.getSelectedJob();
            var statP = selectedJob.statpriority;
            statP.remove(stat);
        }

        self.movePriorityUp = function(stat) {
            var selectedJob = self.getSelectedJob();
            var statP = selectedJob.statpriority;
            var triggeredStatArrayIndex = statP.indexOf(stat);

            var newPos = triggeredStatArrayIndex - 1;

            if (newPos < 0) {
                return false;
            }

            statP.splice(triggeredStatArrayIndex, 1);
            statP = statP.splice(newPos, 0, stat);
        }

        self.movePriorityDown = function(stat) {
            var selectedJob = self.getSelectedJob();
            var statP = selectedJob.statpriority;
            var triggeredStatArrayIndex = statP.indexOf(stat);

            var newPos = triggeredStatArrayIndex + 1;

            if (newPos > statP().length - 1) {
                return false;
            }

            statP.splice(triggeredStatArrayIndex, 1);
            statP = statP.splice(newPos, 0, stat);
        }

        self.getBaseStats = function() {
            return _.filter(self.stats(), function(stat) {
                return stat.base()
            });
        }

        self.getSecondaryStats = function() {
            return _.filter(self.stats(), function(stat) {
                return !stat.base()
            });
        }

        self.mapStatName = function(short) {
            if (_.isFunction(short)) {
                short = short();
            }
            var stats = ko.toJS(self.stats());
            var indexed = _.indexBy(stats, 'short');

            if (!indexed[short]) {
                return short;
            }

            return indexed[short].long;
        }

        self.notPriorityList = ko.computed(function() {
            var selectedJob = self.getSelectedJob();
            var statP = selectedJob.statpriority;

            var baseStatList = _.map(komapping.toJS(self.getBaseStats()), function(stat){return stat.short});
            var statPList = komapping.toJS(statP);

            return ko.observableArray(_.difference(baseStatList, statPList));
        }).extend({throttle: 50});

        self.notSecondaryList = ko.computed(function() {
            var selectedJob = self.getSelectedJob();
            var secondaries = komapping.toJS(selectedJob.secondaries());

            var secondaryStatList = _.map(komapping.toJS(self.getSecondaryStats()), function(stat){return stat.short;});
            var alreadySecondaries = _.pluck(komapping.toJS(secondaries), 'stat');

            return ko.observableArray(_.difference(secondaryStatList, alreadySecondaries));
        }).extend({throttle: 50});

        self.removeSecondary = function(secondary) {
            var selectedJob = self.getSelectedJob();
            var secondaries = selectedJob.secondaries;
            secondaries.remove(secondary);
        }
        */

        self.collection()[0].selected(true);

        return self;
    }

    return self;
});