import {ping} from '../dist/app.js';

var es5config = {
  appName: "abc123dummyHerokuDomainName",
  wakeTime: 9,
  wakeAm: true,
  sleepTime: 5,
  sleepAm: true
};

var es6 = function () {
  "use strict";
  const es6config = { ...es5config };

  ping(es6config);
};

var es5 = function () {
  "use strict";
  var ping = require('../dist/app.js').ping;

  ping(es5config);
};

var es5a = function () {
  "use strict";
  var ping = require('../dist/app.js').ping;

  ping({appName: es5config.appName});
};

var parallel = function (fnList, done) {
  var i = 0;
  for (i = fnList.length; i > 0; i--) {
    (function (arg) {
      setTimeout(function () {
        var fn = fnList.pop();
        fn();
      }, 0);
    }(i));
  }
  done("All functions successfully invoked.");
};

parallel([es6, es5, es5a], function (res) {
  console.log(res);
});

/**
 * Created by joec on 3/28/2017.
 */
