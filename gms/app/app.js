requirejs.config({
    baseUrl: '../lib',
    paths: {
        app: '../gms/app',
        knockout: 'knockoutdebug',
        komapping: 'knockoutmapping'
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/gms']);