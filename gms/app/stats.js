define([
    'knockout',
    'komapping',
    'underscore',
    'lewtgms.common',
    'lewtgms.stat.structure',
    'lewtgms.contentcollection'
    ], function (ko, komapping, _, common, structure, Collection) {

    var self = {};

    self.init = function(statList) {
        var i = 0;
        var idCallback = function(){return i++;};

        var self = new Collection("stats", structure, statList, [idCallback]);
        self.vm = {};

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
        };

        self.collection()[0].selected(true);

        return self;
    }

    


    return self;
});