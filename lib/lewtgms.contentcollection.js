define([
    'knockout',
    'komapping',
    'underscore'
    ], function (ko, komapping, _) {

    var self = {};

    self.vm = {};
    self.collection = ko.observableArray([]);
    self.name = "";

    self.build = function(name, structure, collectionArray) {
        self.structure = structure;
        self.collection = ko.observableArray(collectionArray);
        self.name = name;

        var i = 0;
        var idCallback = function(){return i++;};

        //populate stats with UI-specific properties
        _.each(self.collection(), function(item) {
            item = self.populateItemFromStructure(item, [idCallback]);
        });
    };

    self.newItemFromStructure = function(callbackArray) {
        var retObj = {};
        _.each(self.structure, function(bluePrint, property) {
            if (bluePrint.hasOwnProperty("default")) {
                retObj[property] = ko.observable(bluePrint.default);
            }
            else if (bluePrint.hasOwnProperty("callback")) {
                retObj[property] = ko.observable(callbackArray[bluePrint.callback]());
            }
        });

        return retObj;
    };

    self.populateItemFromStructure = function(item, callbackArray) {
        var mappedWithName = _.map(self.structure, function(specific, property) {
            specific.name = property;
            return specific;
        });

        _.each(mappedWithName, function(property) {
            if (!property.hasOwnProperty('save') || property.save === false) {
                if (property.hasOwnProperty("default")) {
                item[property.name] = ko.observable(property.default);
                }
                else if (property.hasOwnProperty("callback")) {
                    item[property.name] = ko.observable(callbackArray[property.callback]());
                }
            }
            else {
                item[property.name] = ko.observable(item[property.name]);
            }
        });

        return item;
    }

    self.getCollection = function() {
        return komapping.toJS(self.collection);
    }

    self.getSavable = function() {
        var cleanCollection = [];

        _.each(self.getCollection(), function(item) {
            cleanCollection.push(self.cleanseProperties(item, self.structure));
        });

        return cleanCollection;
    };

    self.cleanseProperties = function(dataObject, originalProperties) {
        var cleansedData = {};

        for (var property in dataObject) {
            if (originalProperties[property] && originalProperties[property].save) {
                if (Array.isArray(dataObject[property])) {
                    
                    cleansedData[property] = [];
                    for (var i=0; i<dataObject[property].length; i++) {
                        if (originalProperties[property] === true) {
                            cleansedData[property][i] = dataObject[property][i];
                        }
                        else {
                            cleansedData[property][i] = self.cleanseProperties(dataObject[property][i], originalProperties[property][0]);
                        }
                    }
                }
                else if (typeof(property) == "object" && originalProperties[property].sub) {
                    cleansedData[property] = self.cleanseProperties(dataObject[property], originalProperties[property])
                }
                else {
                    cleansedData[property] = dataObject[property];
                }
            }
        }

        return cleansedData;
    };

    return self;
});