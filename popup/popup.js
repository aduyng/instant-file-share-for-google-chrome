requirejs.config({
                     baseUrl: './',
                     paths: {
                         underscore: 'vendors/underscore/underscore',
                         bootstrap: 'vendors/bootstrap/bootstrap',
                         text: 'vendors/requirejs/plugins/text',
                         async: 'vendors/requirejs/plugins/async',
                         goog: 'vendors/requirejs/plugins/goog',
                         jquery: 'vendors/jquery/jquery-2.0.3',
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
        'https://apis.google.com/js/client.js?onload=gApiClientLoaded'
    ], function () {
    });


function gApiClientLoaded() {
    console.log('google api client loaded!', gapi);
    run();
}

function run() {
    require(
        [
            'jquery',
            'underscore',
            'bootstrap',
            'config'
        ], function ($, _, TwitterBoostrap, Config) {
            window.setTimeout(checkAuth, 1);
            function handleAuthResult(authResult) {
                if (!authResult || authResult.error) {
                    gapi.auth.authorize(
                        {'client_id': Config.google.clientId, 'scope': Config.google.drive.scopes, 'immediate': false},
                        handleAuthResult);
                } else {
                    console.log('successfully authenticated!');
                    gapi.client.load('drive', 'v2', function () {
                        window.drive = gapi.client.drive;
                        console.log('drive javascript loaded!');
                        var request = drive.files.list({
                                                           q: "title='" + Config.app.name + "' and mimeType='application/vnd.google-apps.folder'"
                                                       });
                        request.execute(function (resp) {
                            var item;

                            if (resp && resp.result && resp.result.items && resp.result.items.length > 0) {
                                item = resp.result.items[0];
                            }
                            if (!item) {
                                console.log(_.sprintf("Default folder '%s' is not found. Attempt to create one.", Config.app.name));
                                var request = drive.files.insert({resource: {
                                    title: Config.app.name,
                                    mimeType: 'application/vnd.google-apps.folder',
                                    description: 'Default folder for ' + Config.app.name
                                }});
                                request.execute(function (resp) {
                                    console.log(_.sprintf("Default folder '%s' has been created successfully."));
                                });
                            }
                        });
                    });

                }

            }

//        function retrieveAllFiles(callback) {
//            var retrievePageOfFiles = function (request, result) {
//                request.execute(function (resp) {
//
//                    result = result.concat(resp.items);
//                    var nextPageToken = resp.nextPageToken;
//                    if (nextPageToken) {
//                        request = gapi.client.drive.files.list({
//                                                                   'pageToken': nextPageToken
//                                                               });
//                        retrievePageOfFiles(request, result);
//                    } else {
//                        callback(result);
//                    }
//                });
//            }
//            var initialRequest = gapi.client.drive.files.list();
//            retrievePageOfFiles(initialRequest,
//                                [
//                                ]);
//        }

            function checkAuth() {
                gapi.auth.authorize(
                    {'client_id': Config.google.clientId, 'scope': Config.google.drive.scopes, 'immediate': true},
                    handleAuthResult);
            }
        });
}
