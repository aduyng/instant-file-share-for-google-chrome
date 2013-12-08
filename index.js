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
        'jquery',
        'underscore',
        'bootstrap'
    ], function ($, _, TwitterBoostrap) {
        window.backgroundPage = chrome.extension.getBackgroundPage();

        $('#upload').click(function(event){
            var files = document.getElementById('pick-a-file').files;
            backgroundPage.performUpload(files);
        });

    });
