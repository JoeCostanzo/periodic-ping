[![NPM](https://nodei.co/npm/periodic-ping.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/periodic-ping/)

# Intro

#### Periodic Ping
_Stand-alone node task that sends out periodic HTTP requests to keep servers awake._

- Sets up a setInterval task that will 'ping' a server (send an HTTP GET request) every so often
    - Original purpose: to keep Heroku dynos alive during certain times of day, when they might otherwise scale down
    - (Future version may allow sending pings to other URLs for various reasons)
- Takes several parameters to let you customize how it behaves
    - Set the `wakeTime`, `sleepTime`, etc (i.e. define a "time-window" within which the pings will be actually sent)
        - While the task will still continue to loop at the set interval, as long as it is OUTSIDE of the sleep/wake threshold, nothing will happen.
    - Useful for having the server get awoken only during a PART of every day, instead of around-the-clock, to better conserve resources, etc.
- Or simply pass an `appName`, to have the process automatically ping the Heroku app by that name, every 5 minutes.


# Alternatives

- [heroku-self-ping](https://www.npmjs.com/package/heroku-self-ping)
- [hubot-heroku-keepalive](https://www.npmjs.com/package/hubot-heroku-keepalive)

# Usage in your .js code

_Special notes:_

- App will assume standard herokuapp.com naming convention (i.e. 'abc123dummyHerokuDomainName' === http://abc123dummyHerokuDomainName.herokuapp.com)
- App will assume your Heroku server has an HTTP handler at `/periodicping`, and dispatch the HTTP GET request to that endpoint (this could perhaps cause 404s or other errors, if you did not create this URL).

Import package as per usual conventions:
```JS
import {ping} from 'periodic-ping';
```

Pre-ES6 syntax will still work:
```JS
var ping = require('periodic-ping').ping;
```

### Base case
Call with only an appName parameter supplied:
```JS
ping({appName: "abc123dummyHerokuDomainName"});// will take the default 'frequency' variable of 300000 (every 5 minutes)
...
ping({appName: "abc123dummyHerokuDomainName", frequency: 60000});// will override the default and use the specified frequency
```

### Advanced case
Define a config object...
```JS
const myPingConfig = {
  appName: "abc123dummyHerokuDomainName",
  wakeTime: 9,
  wakeAm: true,
  sleepTime: 5,
  sleepAm: false
};
```

...supply the config object when calling the package function, to enable the "time-window" feature a.k.a. set wake/sleep thresholds, between which are the only times pings will be sent out:
```JS
ping(myPingConfig); // will only ping server between 9am and 5pm
```
_Special notes for advanced case:_

- `wakeTime` and `sleepTime` may be decimal or whole number form, but must be JavaScript numbers greater than 0 and less-than or equal to 12, representing a time along a 12-hour clock.
- A.M. / P.M. options are passed in via `wakeAm` and `sleepAm` respectively, where `true` will correspond to A.M., and `false` will convert the supplied number into it's respective P.M. form
