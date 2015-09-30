# sp-list-query
Query list items among multiple SharePoint list.

## Installation
```
npm install sp-list-query --save
```

## Usage
```js
var listQuery = require('sp-list-query');

var options = {
    'webUrl': 'web url',
    'useAppContextSite': false,
    'listFilters': {
        'baseTemplate': 100 // Or baseType
    },
    'camlQuery': new SP.CamlQuery(),
    'includes': 'Include(Title)'
};

listQuery(options, function (listItems) {
    // Do something
}, function (sender, args) {
    // Error
});

// Or pass a function to options.filters
var options = {
    'webUrl': 'web url',
    'useAppContextSite': false,
    'listFilters': function (list) {
        return list.get_baseType() === 0;
    },
    'camlQuery': new SP.CamlQuery(),
    'includes': 'Include(Title)'
};
```

## License
MIT.
