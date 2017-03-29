import http from "http";
import moment from "moment";

const msgs = [
  'Passing in the same time value for both sleep and wake is not allowed.',
  'Time values must be numbers greater than 0 and less than or equal 12.',
  'You must at least pass in an appName value to the first function parameters array.',
  'Periodic Ping task began as expected. http requests commencing for delivery via setInterval loop...'
];

const err = ind => { throw new Error(msgs[ind]) };

const sendRequest = name => http.get(`http://${name}.herokuapp.com/periodicping`);

const modifyAndFormatTimeInput = (time, amBool) => moment().startOf('day').add(time + (amBool ? time === 12 ? 12 : 0 : time === 12 ? 0 : 12), 'hours').format();

/**
 * Dispatches http requests within a setInterval timeout, configured via various arguments passed in.
 * [Makes no adjustment to account for time-zones or other conversions, beyond basic AM/PM calculation.
 * Assumes the user will manage their own operating system / ensure
 * their runtime environment has the appropriate time-zone set for the intended use.]
 * @param opts
 */
const createInterval = opts => {
  if (opts.appName != null && typeof opts.appName === 'string') {
    if (
      opts.wakeTime != null
      && opts.sleepTime != null
      && opts.wakeAm != null
      && opts.sleepAm != null
    ) {
      if (
        opts.wakeTime > 0
        && opts.wakeTime <= 12
        && opts.sleepTime > 0
        && opts.sleepTime <= 12
      ) {
        const wake = modifyAndFormatTimeInput(opts.wakeTime, opts.wakeAm);
        const sleep = modifyAndFormatTimeInput(opts.sleepTime, opts.sleepAm);
        if (!moment(wake).isSame(sleep)) {
          // All checks complete, perform the case for when a wake schedule is properly defined
          console.log(msgs[3]);
          return setInterval(() => {
            const curTime = moment(Date.now()).format();
            if (
              moment(curTime).isBetween(wake, sleep)
              || moment(wake).isAfter(sleep) && moment(curTime).isAfter(wake)
            ) {
              sendRequest(opts.appName);
            }
          }, opts.frequency);
        }
        err(0);
      }
      err(1);
    }
    // Perform the case for when no start / wake time is specified
    console.log(msgs[3]);
    return setInterval(() => sendRequest(opts.appName), opts.frequency);
  }
  err(2);
};

export let ping = ({
  appName = null,
  frequency = 300000, // every 5 minutes (300000)
  wakeTime = null,
  wakeAm = null,
  sleepTime = null,
  sleepAm = null
}) => createInterval({
  appName,
  frequency,
  wakeTime,
  wakeAm,
  sleepTime,
  sleepAm
});

/**
 * Created by joec on 3/27/2017.
 */
