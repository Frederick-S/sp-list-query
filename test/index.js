var listQuery = require('../index.js');

var getQueryStringParameter = function (param) {
    var params = document.URL.split("?")[1].split("&");
    var strParams = "";

    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");

        if (singleParam[0] == param) {
            return decodeURIComponent(singleParam[1]);
        }
    }
};

var hostWebUrl = getQueryStringParameter('SPHostUrl');

var options = {
    'webUrl': hostWebUrl,
    'useAppContextSite': true,
    'filters': {
        'baseTemplate': 100
    },
    'camlQuery': new SP.CamlQuery()
};

listQuery(options, function (items) {
    $('#message').html('There are ' + items.length + ' list items in "Custom List" based lists under host web.');
}, function (sender, args) {
    $('#message').text(args.get_message());
});
