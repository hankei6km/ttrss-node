# ttrss-node

ttrss-node is a [Tiny Tiny RSS](http://tt-rss.org/) client library
for [Node.js](https://nodejs.org/)
that is inspiered [ttrss-python](https://github.com/Vassius/ttrss-python).

## Install

```bash
$ git clone https://github.com/hankei6km/ttrss-node.git ttrss-node
$ cd ttrss-node && npm install
```

## Usage

### Basic

```Javascript
var ttr_client = require('ttrss-node');
var client;

client = new ttr_client('http://url-to-rss-installation', {
    user: 'username'
    password: 'super-secret-password',
    auto_login: true
  }
);

var req = client.get_headlines({
    feed_id: -4,
    is_cat: true,
  }, function(err, headlines){
    if(!err){
      headlines.forEach(function(item){
          console.log(item.title);
      });
    }else{
      console.error(err);
    }
  });
```

### SSL

```Javascript
client = new ttr_client('https://url-to-rss-installation', {
    user: 'username',
    password: 'super-secret-password',
    ca: fs.readFileSync('path/to/ca.pem'),
    auto_login: true
  }
);
```

### SSL Auth

```Javascript
client = new ttr_client('https://url-to-rss-installation', {
    user: 'username',
    ca: fs.readFileSync('path/to/ca.pem'),
    cert: fs.readFileSync('path/to/cert.pem'),
    key: fs.readFileSync('path/to/secret.key'),
    auto_login: true
  }
);
```

### Abort

```Javascript
var req = client.get_headlines({
    feed_id: -4,
    is_cat: true,
  }, function(err, headlines){
    console.error(err); // [Error: abort]
  });

setTimeout(function(){
  req.abort();
}, 100);
```


## Development

ttrss-node is still in early development and not yet feature complete.
If there's a specific feature you'd like me to prioritize,
feel free to submit an issue or a pull request.

The source code is available at
[https:// /ttrss-node](https://github.com/hankei6km/ttrss-node.git)

Can be generate API documentation by below procedure.

* `$ jsdoc index.js`
* open `out/index.html` in browser.
