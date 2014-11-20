define([
    'knockout',
    'komapping',
    'underscore',
    'lewtgms.common',
    'lewtgms.stat.structure',
    'lewtgms.contentcollection'
    ], function (ko, komapping, _, common, structure, Collection) {

    var self = {};

    self.vm = {};

    self.init = function(data) {
        var i = 0;
        var idCallback = function(){return i++;};

        var self = new Collection("characters", structure, data.characters, [idCallback]);
        self.vm = {};

        return self;
    }

    


    return self;
});