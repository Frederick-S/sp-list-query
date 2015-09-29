var each = require('sp-each');
var listFilter = require('sp-list-filter');
var contextHelper = require('sp-context-helper');

module.exports = function (options, done, error) {
    listFilter(options, function (lists) {
        var contextWrapper = contextHelper(options.webUrl, options.useAppContextSite);
        var clientContext = contextWrapper.clientContext;
        var allListItems = [];
        var listItemsCollection = [];

        for (var i = 0, length = lists.length; i < length; i++) {
            var camlQuery = options.camlQuery ? options.camlQuery : new SP.CamlQuery();
            var listItems = lists[i].getItems(camlQuery);

            listItemsCollection.push(listItems);
            clientContext.load(listItems);
        }

        if (listItemsCollection.length > 0) {
            clientContext.executeQueryAsync(function () {
                for (var i = 0, length = listItemsCollection.length; i < length; i++) {
                    each(listItemsCollection[i], function (item) {
                        allListItems.push(item);
                    });
                }

                done(allListItems);
            }, error);
        } else {
            done(allListItems);
        }
    }, error);
};
