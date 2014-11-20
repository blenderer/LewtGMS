define([
    'knockout',
    'komapping',
    'underscore'
    ], function (ko, komapping, _) {

    function ContentCollection(name, structure, collectionArray, callbackArray) {
        this.structure = structure;
        this.collectionArray = collectionArray;
        this.callbackArray = callbackArray;
        this.name = name;

        var self = this;

        self.fillProperty = function(item, propBlueprint, property, callbackArray) {
            var actual = item[property];

            if (actual !== undefined) {
                return ko.observable(actual);
            }
            else {
                if (propBlueprint.hasOwnProperty("default")) {
                    return ko.observable(propBlueprint["default"]);
                }
                else if (propBlueprint.hasOwnProperty("callback")) {
                    return ko.observable(callbackArray[propBlueprint["callback"]]())
                }
            }
        }
        
        self.newItemForApp = function(callbackArray) {
            var newItem = {};

            //foreach property of the structure
            _.each(self.structure, function(propBlueprint, propertyName) {

                //if property is an array
                if (propBlueprint.hasOwnProperty("array")) {
                    //create our observableArray
                    newItem[propertyName] = ko.observableArray([]);
                }
                //if property is not array
                else {
                    //fill the property, with actual, default or callback
                    newItem[propertyName] = self.fillProperty(
                        {},
                        propBlueprint,
                        propertyName,
                        callbackArray
                    );
                }
            });

            return newItem;
        }

        self.prepItemForApp = function(item, structure, callbackArray) {
            var newItem = {};

            //foreach property of the structure
            _.each(structure, function(propBlueprint, propertyName) {

                //if property is an array
                if (propBlueprint.hasOwnProperty("array")) {
                    //create our observableArray
                    newItem[propertyName] = ko.observableArray([]);

                    //foreach element in the data's array
                    for (var i=0; i<item[propertyName].length; i++) {
                        //prep the sub item with the sub structure
                        newItem[propertyName]()[i] = self.prepItemForApp(
                            item[propertyName][i],
                            structure[propertyName].array[0],
                            callbackArray
                        );
                    }
                }
                //if property is not array
                else {
                    //fill the property, with actual, default or callback
                    newItem[propertyName] = self.fillProperty(
                        item,
                        propBlueprint,
                        propertyName,
                        callbackArray
                    );
                }
            });

            return newItem;
        }

        self.getCollection = function() {
            return komapping.toJS(self.collection);
        }

        self.getSavable = function() {
            var collection = self.getCollection();
            var savableCollection = [];
            
            for (var i=0; i<collection.length; i++) {
                savableCollection.push(self.cleanseProperties(collection[i], self.structure));
            }
            return savableCollection;
        }

        self.cleanseProperties = function(dataObject, structure) {
            var newObj = {};
            _.each(dataObject, function(data, propertyName) {
                if (structure[propertyName].hasOwnProperty('save') && structure[propertyName].save === true) {
                    if (Array.isArray(data)) {
                        newObj[propertyName] = [];
                        for (var i=0; i<data.length; i++) {
                            newObj[propertyName][i] = self.cleanseProperties(data[i], structure[propertyName].array[0]);
                        }
                    }
                    else {
                        newObj[propertyName] = data;
                    }
                }
            });

            return newObj;
        }

        //populate stats with UI-specific properties
        for (var i=0; i<self.collectionArray.length; i++) {
            self.collectionArray[i] = self.prepItemForApp(this.collectionArray[i], this.structure, callbackArray);
        }
        self.collection = ko.observableArray(self.collectionArray);
    }

    return ContentCollection;
});