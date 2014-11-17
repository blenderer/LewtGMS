define([
    'knockout',
    'komapping',
    'underscore',
    'lewtgms.common',
    'lewtgms.stat.structure',
    'lewtgms.contentcollection'
    ], function (ko, komapping, _, common, structure, collection) {

    var self = Object.create(collection);

    self.init = function(statList) {
        self.build("stats", structure, statList);

        self.collection()[0].selected(true);
    }

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
        var newItem = self.newItemFromStructure([self.findNewId]);

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


    return self;
});