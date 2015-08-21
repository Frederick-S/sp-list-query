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

(function () {
    var siteDataQuery = new SPSiteDataQuery();
    siteDataQuery.crossDomain = true;
    siteDataQuery.webUrl = getQueryStringParameter('SPHostUrl');

    siteDataQuery.executeQueryAsync(function (listItems) {
        for (var i = 0, length = listItems.length; i < length; i++) {
            $('#list-items-under-host-web').append('<li>' + listItems[i].get_item('FileLeafRef') + '</li>');
        }
    }, function (sender, args) {
        alert(args.get_message());
    });
})();

(function () {
    var siteDataQuery = new SPSiteDataQuery();
    siteDataQuery.crossDomain = true;
    siteDataQuery.webUrl = getQueryStringParameter('SPHostUrl');
    siteDataQuery.lists = {
        hidden: true
    };

    siteDataQuery.executeQueryAsync(function (listItems) {
        for (var i = 0, length = listItems.length; i < length; i++) {
            $('#list-items-under-host-web-including-hidden-lists').append('<li>' + listItems[i].get_item('FileLeafRef') + '</li>');
        }
    }, function (sender, args) {
        alert(args.get_message());
    });
})();