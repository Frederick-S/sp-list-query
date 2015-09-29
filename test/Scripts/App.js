/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var listQuery = __webpack_require__(1);

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
	    var html = '<p>The list items in "Custom" list template based lists under host web are:</p>';
	    html += '<ul>';

	    for (var i = 0, length = items.length; i < length; i++) {
	        html += '<li>' + items[i].get_item('Title') + '</li>';
	    }

	    html += '</ul>';

	    $('#message').html(html);
	}, function (sender, args) {
	    $('#message').text(args.get_message());
	});


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var each = __webpack_require__(2);
	var listFilter = __webpack_require__(3);
	var contextHelper = __webpack_require__(6);

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


/***/ },
/* 2 */
/***/ function(module, exports) {

	var spEach = function (collection, iteratee, context) {
	    if (typeof collection.getEnumerator === 'function') {
	        var index = 0;
	        var current = null;
	        var enumerator = collection.getEnumerator();

	        while (enumerator.moveNext()) {
	            current = enumerator.get_current();

	            iteratee.call(context, current, index, collection);

	            index++;
	        }
	    }
	};

	module.exports = spEach;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var each = __webpack_require__(4);
	var contextHelper = __webpack_require__(5);

	var isEmpty = function (obj) {
	    for (var key in obj) {
	        if (obj.hasOwnProperty(key)) {
	            return false;
	        }
	    }

	    return true;
	}

	module.exports = function (options, done, error) {
	    var contextWrapper = contextHelper(options.webUrl, options.useAppContextSite);
	    var clientContext = contextWrapper.clientContext;
	    var web = contextWrapper.web;
	    var lists = web.get_lists();

	    clientContext.load(lists);
	    clientContext.executeQueryAsync(function () {
	        var filters = options.filters;
	        var listCollection = [];

	        if (typeof filters === 'function') {
	            each(lists, function (list) {
	                if (filters(list)) {
	                    listCollection.push(list);
	                }
	            });
	        } else if (isEmpty(filters)) {
	            each(lists, function (list) {
	                listCollection.push(list);
	            });
	        } else {
	            each(lists, function (list) {
	                if (filters.baseTemplate && list.get_baseTemplate() === filters.baseTemplate) {
	                    listCollection.push(list);
	                } else if (filters.baseType && list.get_baseType() === filters.baseType) {
	                    listCollection.push(list);
	                }
	            });
	        }

	        done(listCollection);
	    }, error);
	};


/***/ },
/* 4 */
/***/ function(module, exports) {

	var spEach = function (collection, iteratee, context) {
	    if (typeof collection.getEnumerator === 'function') {
	        var index = 0;
	        var current = null;
	        var enumerator = collection.getEnumerator();

	        while (enumerator.moveNext()) {
	            current = enumerator.get_current();

	            iteratee.call(context, current, index, collection);

	            index++;
	        }
	    }
	};

	module.exports = spEach;


/***/ },
/* 5 */
/***/ function(module, exports) {

	function contextHelper(webUrl, crossSite) {
	    var web = null;
	    var site = null;
	    var clientContext = null;
	    var appContextSite = null;

	    if (!webUrl) {
	        clientContext = SP.ClientContext.get_current();
	        web = clientContext.get_web();
	        site = clientContext.get_site();
	    } else if (crossSite) {
	        clientContext = SP.ClientContext.get_current();
	        appContextSite = new SP.AppContextSite(clientContext, webUrl);
	        web = appContextSite.get_web();
	        site = appContextSite.get_site();
	    } else {
	        clientContext = new SP.ClientContext(webUrl);
	        web = clientContext.get_web();
	        site = clientContext.get_site();
	    }

	    return {
	        web: web,
	        site: site,
	        clientContext: clientContext,
	        appContextSite: appContextSite
	    };
	}

	module.exports = contextHelper;


/***/ },
/* 6 */
/***/ function(module, exports) {

	function contextHelper(webUrl, crossSite) {
	    var web = null;
	    var site = null;
	    var clientContext = null;
	    var appContextSite = null;

	    if (!webUrl) {
	        clientContext = SP.ClientContext.get_current();
	        web = clientContext.get_web();
	        site = clientContext.get_site();
	    } else if (crossSite) {
	        clientContext = SP.ClientContext.get_current();
	        appContextSite = new SP.AppContextSite(clientContext, webUrl);
	        web = appContextSite.get_web();
	        site = appContextSite.get_site();
	    } else {
	        clientContext = new SP.ClientContext(webUrl);
	        web = clientContext.get_web();
	        site = clientContext.get_site();
	    }

	    return {
	        web: web,
	        site: site,
	        clientContext: clientContext,
	        appContextSite: appContextSite
	    };
	}

	module.exports = contextHelper;


/***/ }
/******/ ]);