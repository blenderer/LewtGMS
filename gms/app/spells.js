define([
    'knockout',
    'komapping',
    'underscore',
    'lewtgms.common',
    'lewtgms.spell.structure',
    'lewtgms.contentcollection'
    ], function (ko, komapping, _, common, structure, Collection) {

    var self = {};

    self.init = function(data) {
        var i = 0;
        var idCallback = function(){return i++;};

        var self = new Collection("spells", structure, data.spells, [idCallback]);
        self.vm = {};

        self.ref = data;

        self.findNewId = function() {
            var idsArray = _.map(self.getCollection(), function(spell) {
                return spell.id;
            });

            if (idsArray.length == 0) {
                return 0;
            }

            return common.getHighestNumber(idsArray) + 1;
        }

        self.getSelectedSpell = function() {
            return _.find(self.collection(), function(spell) { return spell.selected()});
        }
        
        self.vm.addNew = function() {
            var newSpell = self.newItemForApp([self.findNewId]);

            var newId = newSpell.id();

            self.collection.push(newSpell);

            self.vm.selectedSpell(newId);
            self.vm.changeSelectedSpell();
        }

        self.vm.selectedSpell = ko.observable(0);

        self.vm.changeSelectedSpell = function() {
            _.each(self.collection(), function(spell) {
                spell.selected(false);
            })

            var toSelect = _.find(self.collection(), function(spell) {
                return spell.id() == self.vm.selectedSpell()
            });
            if (toSelect) {
                toSelect.selected(true);
            }
        };

        self.vm.removeSelectedSpell = function() {
            var selectedSpell = _.find(self.collection(), function(spell) {
                return spell.selected()
            });

            self.collection.remove(selectedSpell);
        };

        self.collection()[0].selected(true);

        return self;
    }

    


    return self;
});