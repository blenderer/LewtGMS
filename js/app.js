requirejs.config({
    baseUrl: 'js/lib',
    paths: {
        app: '../app',
        kosortable: 'knockout-sortable'
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