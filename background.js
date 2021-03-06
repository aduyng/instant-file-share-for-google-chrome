requirejs.config({
                     baseUrl: './',
                     paths: {
                         underscore: 'vendors/underscore/underscore',
                         bootstrap: 'vendors/bootstrap/bootstrap',
                         text: 'vendors/requirejs/plugins/text',
                         async: 'vendors/requirejs/plugins/async',
                         goog: 'vendors/requirejs/plugins/goog',
                         jquery: 'vendors/jquery/jquery-2.0.3',
//                         gApiClient: 'vendors/google/client?onload=gApiClientLoaded',
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
            window.Config = Config;
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
                                    window.rootDir = resp;
                                    start();
                                });
                            } else {
                                window.rootDir = item;
                                start();
                            }
                        });
                    });

                }

            }

            function start() {
                chrome.browserAction.onClicked.addListener(function (tab) {
                    chrome.tabs.create({
                                           url: chrome.extension.getURL('index.html')
                                       }, function (tab) {
                    });
                });


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

function performUpload(files) {
    var file = files[0];
    insertFile(file, function(resp){
        console.log(resp);
    });

}


/**
 * Insert new file.
 *
 * @param {File} fileData File object to read data from.
 * @param {Function} callback Function to call when the request is complete.
 */
function insertFile(fileData, callback) {
    const boundary = '-------314159265358979323846';
    const delimiter = "\r\n--" + boundary + "\r\n";
    const close_delim = "\r\n--" + boundary + "--";

    var reader = new FileReader();
    reader.readAsBinaryString(fileData);
    reader.onload = function (e) {
        var contentType = fileData.type || 'application/octet-stream';
        var metadata = {
            'title': fileData.name,
            'mimeType': contentType,
            'parents' : [{id: window.rootDir.id}]
        };

        var base64Data = btoa(reader.result);
        var multipartRequestBody =
            delimiter +
                'Content-Type: application/json\r\n\r\n' +
                JSON.stringify(metadata) +
                delimiter +
                'Content-Type: ' + contentType + '\r\n' +
                'Content-Transfer-Encoding: base64\r\n' +
                '\r\n' +
                base64Data +
                close_delim;

        var request = gapi.client.request({
                                              'path': '/upload/drive/v2/files',
                                              'method': 'POST',
                                              'params': {'uploadType': 'multipart'},
                                              'headers': {
                                                  'Content-Type': 'multipart/mixed; boundary="' + boundary + '"'
                                              },
                                              'body': multipartRequestBody});
        if (!callback) {
            callback = function (file) {
                console.log(file)
            };
        }
        request.execute(callback);
    }
}