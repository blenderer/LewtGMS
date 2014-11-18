define([
    'knockout',
    'komapping',
    'underscore'
    ], function (ko, komapping, _) {

    function ContentCollection(name, structure, collectionArray, callbackArray) {
        this.structure = structure;

        this.name = name;

        //populate stats with UI-specific properties
        for (var i=0; i<collectionArray.length; i++) {
            collectionArray[i] = this.prepItemForApp(collectionArray[i], this.structure, callbackArray);
        }
        this.collection = ko.observableArray(collectionArray);
    }

    ContentCollection.prototype = {};

    var ptype = ContentCollection.prototype;

    ptype.fillProperty = function(item, propBlueprint, property, callbackArray) {
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
    },
    ptype.newItemForApp = function(callbackArray) {
        var newItem = {};

        //foreach property of the structure
        _.each(ptype.structure, function(propBlueprint, propertyName) {

            //if property is an array
            if (propBlueprint.hasOwnProperty("array")) {
                //create our observableArray
                newItem[propertyName] = ko.observableArray([]);
            }
            //if property is not array
            else {
                //fill the property, with actual, default or callback
                newItem[propertyName] = ptype.fillProperty(
                    {},
                    propBlueprint,
                    propertyName,
                    callbackArray
                );
            }
        });

        return newItem;
    },
    ptype.prepItemForApp = function(item, structure, callbackArray) {
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
                    newItem[propertyName]()[i] = ptype.prepItemForApp(
                        item[propertyName][i],
                        structure[propertyName].array[0],
                        callbackArray
                    );
                }
            }
            //if property is not array
            else {
                //fill the property, with actual, default or callback
                newItem[propertyName] = ptype.fillProperty(
                    item,
                    propBlueprint,
                    propertyName,
                    callbackArray
                );
            }
        });

        return newItem;
    },
    ptype.getCollection = function() {
        return komapping.toJS(ptype.collection);
    },
    ptype.getSavable = function() {
        
    },
    ptype.cleanseProperties = function(dataObject, originalProperties) {
        
    }

    return ContentCollection;
});