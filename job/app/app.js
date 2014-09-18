requirejs.config({
    baseUrl: '../lib',
    paths: {
        app: '../job/app',
        knockout: 'knockoutdebug',
        kosortable: 'knockout-sortable',
        komapping: 'knockoutmapping'
    },
    shim: {
    	kosortable: {
    		deps: ['knockout'],
    		exports: 'kosortable'
    	}
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/job']);