requirejs.config({
                     baseUrl: './',
                     paths: {
                         underscore: 'vendors/underscore/underscore',
                         bootstrap: 'vendors/bootstrap/bootstrap',
                         text: 'vendors/requirejs/plugins/text',
                         async: 'vendors/requirejs/plugins/async',
                         goog: 'vendors/requirejs/plugins/goog',
                         jquery: 'vendors/jquery/jquery-2.0.3',
                         gApiClient: 'vendors/google/client',
                         moment: "vendors/moment/moment",
                         'underscore.string': 'vendors/underscore/underscore.string'
                     },
                     shim: {
                         bootstrap: {
                             deps:
                                 [
                                     "jquery"
                                 ],
                             exports: "$.fn.popover"
                         },
                         underscore: {
                             deps:
                                 [
                                     'underscore.string'
                                 ],
                             exports: '_',
                             init: function (UnderscoreString) {
                                 _.mixin(UnderscoreString);
                             }
                         }
                     }
                 });

require(
    [
        'jquery',
        'underscore',
        'bootstrap',
        'config',
        'gApiClient'
    ], function ($, _, TwitterBoostrap, Config) {

        gapi.auth.authorize(
            {'client_id': Config.google.clientId, 'scope': Config.google.drive.scopes, 'immediate': true},
            function(authResult){
                console.log(authResult);
                if( !authResult){
                }
            });

    });
