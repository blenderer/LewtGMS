define([
    'knockout',
    'komapping',
    'underscore',
    'lewtgms.common',
    'lewtgms.job.structure',
    'lewtgms.contentcollection'
    ], function (ko, komapping, _, common, structure, Collection) {

    var self = {}

    self.stats = [];

    self.init = function(jobList) {
        var i = 0;
        var idCallback = function(){return i++;};

        self = new Collection("jobs", structure, jobList.jobs, [idCallback]);
        self.vm = {};

        self.stats = jobList.stats;

        self.vm.selectedJob = ko.observable(0);


        self.getSelectedJob = function() {
            return _.find(self.collection(), function(job) { return job.selected()});
        }

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

        self.vm.changeSelectedJob();

        self.vm.newJob = function() {
            var newItem = self.newItemForApp([self.findNewId]);

            var newId = newItem.id();

            self.collection.push(newItem);

            self.vm.selectedJob(newId);
            self.vm.changeSelectedJob();
        }

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
        };

        self.findNewId = function() {
            var idsArray = _.map(self.getCollection(), function(stat) {
                return stat.id;
            });

            if (idsArray.length == 0) {
                return 0;
            }

            return common.getHighestNumber(idsArray) + 1;
        }
        
        self.vm.removeSelectedJob = function() {
            self.collection.remove(_.find(self.collection(), function(job) {
                return job.selected()
            }));
        }

        self.vm.mapStatName = function(short) {
            if (_.isFunction(short)) {
                short = short();
            }

            if (short.hasOwnProperty("short")) {
                short = short.short();
            }
            else if (short.hasOwnProperty("stat")) {
                short = short.stat();
            }

            var stats = komapping.toJS(self.stats);
            var indexed = _.indexBy(stats, 'short');

            if (!indexed[short]) {
                return short;
            }

            return indexed[short].long;
        }

        self.vm.removePriority = function(stat) {
            var selectedJob = self.getSelectedJob();
            var statP = selectedJob.statpriority;
            statP.remove(stat);
        }

        self.vm.removeSecondary = function(secondary) {
            var selectedJob = self.getSelectedJob();
            var secondaries = selectedJob.secondaries;
            secondaries.remove(secondary);
        }

        self.vm.movePriorityUp = function(stat) {
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

        self.vm.movePriorityDown = function(stat) {
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

        self.vm.addPriority = function(stat) {
            var selectedJob = self.getSelectedJob();
            selectedJob.statpriority.push({"short": ko.observable(stat)});
        }

        self.getBaseStats = function() {
            return _.filter(self.stats, function(stat) {
                return stat.base()
            });
        }

        self.vm.addSecondary = function(stat) {
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

        self.getSecondaryStats = function() {
            return _.filter(self.stats, function(stat) {
                return !stat.base()
            });
        }

        self.vm.notPriorityList = ko.computed(function() {
            var selectedJob = self.getSelectedJob();
            var statP = selectedJob.statpriority;

            var baseStatList = _.map(komapping.toJS(self.getBaseStats()), function(stat){return stat.short});
            var statPList = _.map(komapping.toJS(statP), function(stat) {
                                return stat.short;
                            });

            return ko.observableArray(_.difference(baseStatList, statPList));
        }).extend({throttle: 50});

        self.vm.notSecondaryList = ko.computed(function() {
            var selectedJob = self.getSelectedJob();
            var secondaries = komapping.toJS(selectedJob.secondaries());

            var secondaryStatList = _.map(komapping.toJS(self.getSecondaryStats()), function(stat){return stat.short;});
            var alreadySecondaries = _.pluck(komapping.toJS(secondaries), 'stat');

            return ko.observableArray(_.difference(secondaryStatList, alreadySecondaries));
        }).extend({throttle: 50});

        self.collection()[0].selected(true);

        return self;
    }

    return self;
});