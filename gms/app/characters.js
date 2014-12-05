define([
    'knockout',
    'komapping',
    'underscore',
    'lewtgms.common',
    'lewtgms.character.structure',
    'lewtgms.contentcollection'
    ], function (ko, komapping, _, common, structure, Collection) {

    var self = {};

    self.vm = {};

    self.init = function(data) {
        var i = 0;
        var idCallback = function(){return i++;};

        var self = new Collection("characters", structure, data.characters, [idCallback]);
        self.vm = {};

        self.findNewId = function() {
            var idsArray = _.map(self.getCollection(), function(character) {
                return character.id;
            });

            if (idsArray.length == 0) {
                return 0;
            }

            return common.getHighestNumber(idsArray) + 1;
        }

        self.vm.selectedCharacter = ko.observable(0);

        self.vm.changeSelectedCharacter = function() {
            _.each(self.collection(), function(character) {
                character.selected(false);
            })

            var toSelect = _.find(self.collection(), function(character) {
                return character.id() == self.vm.selectedCharacter()
            });
            if (toSelect) {
                toSelect.selected(true);
            }
        };

        self.currentCharacter = function() {
            return _.find(self.collection(), function(character) {
                return character.selected();
            });
        }

        self.vm.newCharacter = function() {
            var newItem = self.newItemForApp([self.findNewId]);

            var newId = newItem.id();

            self.collection.push(newItem);

            self.vm.selectedCharacter(newId);
            self.vm.changeSelectedCharacter();
        }

        self.vm.removeSelectedCharacter = function() {
            self.collection.remove(_.find(self.collection(), function(character) {
                return character.selected()
            }));
        }

        self.vm.roll = function() {
            var jobs = komapping.toJS(self.ref.jobs);
            var job = _.find(jobs, function(job) {
                return job.name == self.currentCharacter().job();
            });

            var rolls = common.rollSet("4d6", 6, true);

            var rollTotals = _.pluck(rolls, "total").sort(common.numSort).reverse();

            var priorities = job.statpriority;
            
            _.each(priorities, function(mainStat) {
                self.currentCharacter().stats.remove(_.find(self.currentCharacter().stats(), function(stat) {
                    return stat.stat() == mainStat.short;
                }));

                self.currentCharacter().stats.push({
                    "stat": ko.observable(mainStat.short),
                    "max": ko.observable(rollTotals[0]),
                    "current": ko.observable(rollTotals[0])
                });
                
                rollTotals = rollTotals.slice(1);
            });
        }

        self.collection()[0].selected(true);

        return self;
    }


    return self;
});