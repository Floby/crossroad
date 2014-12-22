[![Build Status][travis-image]][travis-url] [![Coverage][coveralls-image]][coveralls-url]

node-crossroad
==================

> Semantically-versionned service discovery

This module aims to address the problem of service discovery within
a distributed architecture. It is not specific to Node.js.

The main design points are:

* An agent running per host
* Gossipping between agents to synchronise running services
* HTTP is the communication protocol
* The client is your regular HTTP client
* Proactive and Reactive consumption from clients

Installation
------------

    npm install --save crossroad

Usage
-----

##### Agent

```bash
$ crossroadd --port 5555 --interface 0.0.0.0
```

This is all that's needed to start an agent. `port` and `interface` here are the defaults anyway

##### Service

```http
POST /services
Host: localhost:5555
Content-Type: application/json

{
  "type": "my-web-service",
  "version": "1.0.3",
  "location": {
    "host": "172.50.60.22",
    "port": 8080
  }
}

-> 201 Created
-> (keeps connection indefinitely)
```

The `crossroadd` server holds the connection for this request open as long as necessary.
When the connection is broken, the service is considered to be down.


##### Client

```http
GET /services/my-web-service/~1.0.0
Host: localhost:5555
Accept: application/json

-> 200 OK
-> Content-Type: application/json
-> 
-> {
->   "type": "my-web-service",
->   "uuid": "my-web-service-bd80ddff76e8ae5",
->   "version": "1.0.3",
->   "location": {
->     "host": "172.50.60.22",
->     "port": 8080
->   }
-> }
```

Test
----

Tests are written with [mocha][mocha-url] and covered with [istanbul][istanbul-url]
You can run the tests with `npm test`.

Contributing
------------

Anyone is welcome to submit issues and pull requests


License
-------

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2014 Florent Jaby

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


[travis-image]: http://img.shields.io/travis/Floby/node-crossroad/master.svg?style=flat
[travis-url]: https://travis-ci.org/Floby/node-crossroad
[coveralls-image]: http://img.shields.io/coveralls/Floby/node-crossroad/master.svg?style=flat
[coveralls-url]: https://coveralls.io/r/Floby/node-crossroad
[mocha-url]: https://github.com/visionmedia/mocha
[istanbul-url]: https://github.com/gotwarlost/istanbul
