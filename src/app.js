import http from 'http';
import moment from 'moment';

const msgs = [
  'Passing in the same time value for both sleep and wake is not allowed.',
  'Time values must be numbers greater than 0 and less than or equal 12.',
  'You must at least pass in an appName value to the first function parameters array.',
  'Periodic Ping task began as expected and first request delivered. Http request interval loop commencing for scheduled app pings as defined...'
];

const err = ind => { throw new Error(msgs[ind]) };

const sendRequest = name => http.get(`http://${name}.herokuapp.com/periodicping`).on('error', err => {}).end();

const modifyAndFormatTimeInput = (time, amBool) => moment().startOf('day').add(time + (amBool ? time === 12 ? 12 : 0 : time === 12 ? 0 : 12), 'hours').format();

const pingLogic = ({ wake, sleep, appName }) => {
  const curTime = moment(Date.now()).format();
  if (
    moment(curTime).isBetween(wake, sleep)
    || moment(wake).isAfter(sleep) && moment(curTime).isAfter(wake)
  ) {
    sendRequest(appName);
  }
};

/**
 * Dispatches http requests within a setInterval timeout, configured via various arguments passed in.
 * [Makes no adjustment to account for time-zones or other conversions, beyond basic AM/PM calculation.
 * Assumes the user will manage their own operating system / ensure
 * their runtime environment has the appropriate time-zone set for the intended use.]
 * @param appName
 * @param wakeTime
 * @param sleepTime
 * @param wakeAm
 * @param sleepAm
 * @param frequency
 * @return {number}
 */
export const ping = ({
  appName = null,
  frequency = 300000, // every 5 minutes (300000)
  wakeTime = null,
  wakeAm = null,
  sleepTime = null,
  sleepAm = null
}) => {
  if (appName != null && typeof appName === 'string') {
    if (
      wakeTime != null
      && sleepTime != null
      && wakeAm != null
      && sleepAm != null
    ) {
      if (
        wakeTime > 0
        && wakeTime <= 12
        && sleepTime > 0
        && sleepTime <= 12
      ) {
        const wake = modifyAndFormatTimeInput(wakeTime, wakeAm);
        const sleep = modifyAndFormatTimeInput(sleepTime, sleepAm);
        if (!moment(wake).isSame(sleep)) {
          // All checks complete, perform the case for when a wake schedule is properly defined
          pingLogic({ wake, sleep, appName });
          console.log(msgs[3]);
          return setInterval(
            () => pingLogic({ wake, sleep, appName }),
            frequency
          );
        }
        err(0);
      }
      err(1);
    }
    // Perform the case for when no start / wake time is specified
    console.log(msgs[3]);
    return setInterval(() => sendRequest(appName), frequency);
  }
  err(2);
};


/**
 * Created by joec on 3/27/2017.
 */
