(function (SP) {
    'use strict';

    var each = function (collection, iteratee) {
        if (typeof collection.getEnumerator === 'function') {
            var enumerator = collection.getEnumerator();

            while (enumerator.moveNext()) {
                iteratee(enumerator.get_current());
            }
        } else if (Object.prototype.toString.call(collection) === '[object Array]') {
            for (var i = 0, length = collection.length; i < length; i++) {
                iteratee(collection[i]);
            }
        }
    };

    function SPSiteDataQuery(webUrl) {
        /*
        The webs property specifies which web sites to include in the query.
        By default, the query considers only the web site specified by the webUrl.
        You can broaden the scope of the query by setting the webs property containing a scope attribute.
        
        SPSiteDataQuery.webs = { 'scope': 'Recursive' }; The query considers the current web site and all subsites of the current web site.
        SPSiteDataQuery.webs = { 'scope': 'SiteCollection' }; The query considers all web sites that are in the same site collection as the current web site.
        */
        this.webs = {};

        /*
        The lists property specifies which lists to include in the query.
    
        SPSiteDataQuery.lists = { 'serverTemplate': 104 }; Limits the query to lists of the specified server template.
        SPSiteDataQuery.lists = { 'baseType': 1 }; Limits the query to lists of the specified base type.
        SPSiteDataQuery.lists = { 'hidden': true }; Determines whether the query includes hidden lists.
        SPSiteDataQuery.lists = { 'maxListLimit': 500 } Limits the query to the total number of lists specified. By default, the limit is 1000. When set to 0, there is no limit to the number of lists that are considered.
        SPSiteDataQuery.lists = { 'lists': ['7A9FDBE6-0841-430a-8D9A-53355801B5D5', '3D18F506-FCA1-451e-B645-2D720DC84FD8'] }; This allows the query to include specific lists.
    
        A complete example of lists property is:
    
        SPSiteDataQuery.lists = {
            'serverTemplate': 104, or 'baseType': 1, 'lists': ['7A9FDBE6-0841-430a-8D9A-53355801B5D5', '3D18F506-FCA1-451e-B645-2D720DC84FD8']
            'hidden': true,
            'maxListLimit': 500
        };
        */
        this.lists = {};

        /*
        The inner xml that defines the query.
        SPSiteDataQuery.query = 
            <Where>
              <Eq>
                <FieldRef Name="AssignedTo" />
                <Value Type="Integer">
                  <UserID />
                </Value>
              </Eq>
            </Where>
            <OrderBy>
              <FieldRef Name="Priority" />
              <ProjectProperty Name="Title" />
              <ListProperty Name="Title" />
            </OrderBy>
        */
        this.query = '';

        /*
        The inner xml that specifies the view fields used in the query.
    
        SPSiteDataQuery.viewFields = 
            <FieldRef Name="Title" Type="Text" />
            <FieldRef Name="PercentComplete" Type="Number" />
        */
        this.viewFields = '';

        /*
        The SP.ClientContext object to execute queries.
        */
        this.clientContext = null;

        if (webUrl) {
            this.clientContext = new SP.ClientContext(webUrl);
        }
    }

    SPSiteDataQuery.prototype.executeQueryAsync = function (successHandler, errorHandler) {
        if (!this.clientContext) {
            throw new Error('this.clientContext is not initialized.');
        }

        var web = this.clientContext.get_web();

        var done = function (listlistItemCollections) {
            var listItems = [];

            each(listlistItemCollections, function (listItemCollection) {
                each(listItemCollection, function (listItem) {
                    listItems.push(listItem);
                });
            });

            successHandler(listItems);
        };

        if (this.webs.scope) {
            switch (this.webs.scope) {
                case 'Recursive':
                    getListItemsByWebRecursively(web, this.clientContext, done, errorHandler);

                    break;
                case 'SiteCollection':
                    web = this.clientContext.get_site().get_rootWeb();

                    getListItemsByWebRecursively(web, this.clientContext, done, errorHandler);

                    break;
                default:
                    getListItemsByWeb(web, this.clientContext, done, errorHandler);

                    break;
            }
        } else {
            getListItemsByWeb(web, this.clientContext, done, errorHandler);
        }
    };

    // Get list items under web
    function getListItemsByWeb(web, clientContext, successHandler, errorHandler) {
        var lists = web.get_lists();

        // Array of SP.SPListItemCollection
        var listItemCollections = [];

        clientContext.load(lists);
        clientContext.executeQueryAsync(function (sender, args) {
            each(lists, function (list) {
                var listItemCollection = list.getItems(new SP.CamlQuery());

                clientContext.load(listItemCollection);
                listItemCollections.push(listItemCollection);
            });

            clientContext.executeQueryAsync(function (sender, args) {
                successHandler(listItemCollections);
            }, errorHandler);
        }, errorHandler);
    }

    // Get list items under web and its all subwebs
    function getListItemsByWebRecursively(web, clientContext, successHandler, errorHandler) {
        var lists = web.get_lists();
        var webs = web.get_webs();

        // Array of SP.SPListItemCollection
        var listItemCollections = [];

        clientContext.load(webs);
        clientContext.load(lists);
        clientContext.executeQueryAsync(function (sender, args) {
            var subWebs = [];

            each(webs, function (web) {
                subWebs.push(web);
            });

            var count = subWebs.length;

            each(lists, function (list) {
                var listItemCollection = list.getItems(new SP.CamlQuery());

                clientContext.load(listItemCollection);
                listItemCollections.push(listItemCollection);
            });

            clientContext.executeQueryAsync(function (sender, args) {
                if (count > 0) {
                    each(subWebs, function (subWeb) {
                        getListItemsByWebRecursively(subWeb, clientContext, function (listItems) {
                            count--;
                            listItemCollections.push.apply(listItemCollections, listItems);

                            if (count === 0) {
                                successHandler(listItemCollections);
                            }
                        });
                    });
                } else {
                    successHandler(listItemCollections);
                }
            }, errorHandler);
        }, errorHandler);
    }
})(SP);