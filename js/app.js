requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
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