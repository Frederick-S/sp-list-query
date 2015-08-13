# SPSiteDataQuery.js
JavaScript implementation of SPSiteDataQuery class.

## Usage
### Properties
#### webUrl
The this property to specify which web site to include in the query.

```js
var siteDataQuery = new SPSiteDataQuery();
siteDataQuery.webUrl = 'web url';
```

#### crossDomain
Use this property to specify if the query cross domain. For example, make query to host web in an app web.

```js
var siteDataQuery = new SPSiteDataQuery();
siteDataQuery.webUrl = 'host web url';
siteDataQuery.crossDomain = true.
```

#### webs
The webs property specifies which web sites to include in the query.
By default, the query considers only the web site specified by the webUrl.
You can broaden the scope of the query by setting the webs property containing a scope attribute.

```js
var siteDataQuery = new SPSiteDataQuery();
siteDataQuery.webUrl = 'web url';
siteDataQuery.webs = {
    'scope': 'Recursive' // The query considers the current web site and all subsites of the current web site.
};

// Or
siteDataQuery.webs = {
    'scope': 'SiteCollection' // The query considers all web sites that are in the same site collection as the current web site.
};
```

#### lists
The lists property specifies which lists to include in the query.

```js
var siteDataQuery = new SPSiteDataQuery();
siteDataQuery.webUrl = 'web url';
siteDataQuery.lists = {
    'serverTemplate': 104 // Limits the query to lists of the specified server template.
};

// Or
siteDataQuery.lists = {
    'baseType': 1 // Limits the query to lists of the specified base type.
};

// Or
siteDataQuery.lists = {
    'lists': ['7A9FDBE6-0841-430a-8D9A-53355801B5D5', '3D18F506-FCA1-451e-B645-2D720DC84FD8'] // This allows the query to include specific lists.
};

// Or
siteDataQuery.lists = {
    'hidden': true // Determines whether the query includes hidden lists.
};
```
