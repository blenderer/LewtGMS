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
            //get access to jobs mapping
            var jobs = komapping.toJS(self.ref.jobs);
            //find the job that the current character is selected
            var job = _.find(jobs, function(job) {
                return job.name == self.currentCharacter().job();
            });

            //roll 6 x 4d6, drop the lowest of the 4
            var rolls = common.rollSet("4d6", 6, true);

            //just get the totals
            var rollTotals = _.pluck(rolls, "total").sort(common.numSort).reverse();

            //get the current job's statpriority
            var priorities = job.statpriority;
            //shuffle the base stats so we can assign them randomly later
            var priorityStack = _.shuffle(_.pluck(komapping.toJS(self.ref.statsVm.getBaseStats()), "short"));

            //assign our best rolls in order to the stat priority
            _.each(priorities, function(mainStat) {
                self.removeStatIfExists(mainStat.short);

                self.currentCharacter().stats.push({
                    "stat": ko.observable(mainStat.short),
                    "max": ko.observable(rollTotals[0]),
                    "current": ko.observable(rollTotals[0])
                });
                
                priorityStack.splice(priorityStack.indexOf(mainStat.short), 1);
                rollTotals = rollTotals.slice(1);
            });

            //now fill the remaining stats with the not-so-good rolls
            while (priorityStack.length > 0) {
                self.removeStatIfExists(priorityStack[0]);

                self.currentCharacter().stats.push({
                    "stat": ko.observable(priorityStack[0]),
                    "max": ko.observable(rollTotals[0]),
                    "current": ko.observable(rollTotals[0])
                });
                rollTotals = rollTotals.slice(1);
                priorityStack = priorityStack.slice(1);
            }

            //Lets give the character a class-specific hp according to the hitdie
            self.removeStatIfExists("hd");
            self.removeStatIfExists("hp");
            
            var hitDieStat = _.find(job.secondaries, function(stat) {
                return stat.stat == "hd";
            });
            var hitDie = common.getRandomInt(hitDieStat.min, hitDieStat.max);

            self.currentCharacter().stats.push({
                "stat": ko.observable("hd"),
                "max": ko.observable(hitDie),
                "current": ko.observable(hitDie)
            });

            var newHp = hitDie + self.vm.getAbilityModifier("con");

            self.currentCharacter().stats.push({
                "stat": ko.observable("hp"),
                "max": ko.observable(newHp),
                "current": ko.observable(newHp)
            });
        }

        self.vm.getAbilityModifier = function(statShort) {
            var indexed = _.indexBy(komapping.toJS(self.currentCharacter().stats()), 'stat');
            var abilityScore = indexed[statShort].current;

            return Math.floor((abilityScore - 10) / 2)
        }

        self.removeStatIfExists = function(short) {
            self.currentCharacter().stats.remove(_.find(self.currentCharacter().stats(), function(stat) {
                return stat.stat() == short;
            }));
        }

        self.collection()[0].selected(true);

        return self;
    }


    return self;
});