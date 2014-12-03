define([
    'knockout',
    'komapping',
    'underscore',
    'lewtgms.common',
    'lewtgms.stat.structure',
    'lewtgms.contentcollection'
    ], function (ko, komapping, _, common, structure, Collection) {

    var self = {};

    self.init = function(data) {
        var i = 0;
        var idCallback = function(){return i++;};

        var self = new Collection("stats", structure, data.stats, [idCallback]);
        self.vm = {};

        self.ref = data;

        self.findNewId = function() {
            var idsArray = _.map(self.getCollection(), function(stat) {
                return stat.id;
            });

            if (idsArray.length == 0) {
                return 0;
            }

            return common.getHighestNumber(idsArray) + 1;
        }
        
        self.vm.addNew = function() {
            var newItem = self.newItemForApp([self.findNewId]);

            var newId = newItem.id();

            self.collection.push(newItem);

            self.vm.selectedStat(newId);
            self.vm.changeSelectedStat();
        }

        self.vm.selectedStat = ko.observable(0);

        self.vm.changeSelectedStat = function() {
            _.each(self.collection(), function(stat) {
                stat.selected(false);
            })

            var toSelect = _.find(self.collection(), function(stat) {
                return stat.id() == self.vm.selectedStat()
            });
            if (toSelect) {
                toSelect.selected(true);
            }
        };

        self.vm.removeSelectedStat = function() {
            var selectedStat = _.find(self.collection(), function(stat) {
                return stat.selected()
            });

            self.collection.remove(selectedStat);

            //below we setup for removing references in the jobs data

            //get the observable arrays for all the priorities and secondaries
            var priorityListListObservables = _.map(self.ref.jobs(), function(job) {
                return job.statpriority;
            });
            var secondaryListListObservables = _.map(self.ref.jobs(), function(job) {
                return job.secondaries;
            });
            
            //for each priority on each job, remove any references to the removed stat
            _.each(priorityListListObservables, function(pList) {
                var anyMatch = _.filter(pList(), function(priority) {
                    return priority.short() == selectedStat.short()
                });

                _.each(anyMatch, function(priority) {
                    pList.remove(priority);
                });
            });

            //same for secondaries
            _.each(secondaryListListObservables, function(sList) {
                var anyMatch = _.filter(sList(), function(secondary) {
                    return secondary.stat() == selectedStat.short()
                });

                _.each(anyMatch, function(secondary) {
                    sList.remove(secondary);
                });
            });
        };

        self.collection()[0].selected(true);

        return self;
    }

    


    return self;
});