const fs = require('fs');
const path = require('path');

/**
 * Create a log configuration.
 *
 * @param {Object} [options={}] - Configuration options for the logging.
 * @param {String} [options.path='logs'] - Relative path where logs stored.
 * @param {Number} [options.size=1024 * 1024] - Max size of file log in bytes, the default is 1 MB.
 * @param {String} [options.format='date'] - The format of filename log date 'YYYY-MM-DD' and datetime 'YYYY-MM-DD-HH'
 * @param {Boolean} [options.json=false] - Format line log into json.
 * @returns {Object}
 */
module.exports = function nodcoLoggingConfig({
    dirs = 'logs',
    size = 1024 * 1024,
    format = 'date',
    json = false
} = {}) {
  /**
   * The list of current logs config.
   *
   * @typedef {Object} logs
   * @property {Object} [ids.date] - The date component when log created.
   * @property {String} [ids.path] - Base path location to file log without index.
   * @property {Number} [ids.index] - The file index of log.
   * @property {Number} [ids.initial_size] - Size of initial file log in bytes.
   * @property {Number} [ids.current_size] - The calculate of current file log in bytes.
   * @property {Object} [ids.stream] - File log stream.
   */
  const logs = {};

  /**
   * Write logs.
   *
   * @param {String} ids - The logs unique identity.
   * @param {String|Object} message - The message will be write.
   * @returns {Promise<void>}
   */
  async function write(ids, message) {
    const log = getLogger(ids);
    const timestamp = (new Date).toISOString();

    let line;

    if (json) {
      message._t = timestamp;

      line = JSON.stringify(message);
    } else {
      line = `${timestamp} : ${message}`;
    }

    return new Promise((resolve, reject) => {
      log.stream.write(line + '\n', err => {
        if (err) {
          reject(err);
        } else {
          logs[ids].current_size += logs[ids].stream.bytesWritten

          resolve();
        }
      });
    });
  }

  /**
   * Get the logs by ids.
   *
   * @param {String} ids - The logs unique identity.
   * @returns {Object}
   */
  function getLogger(ids) {
    let newLoggerDate = null;
    let newLoggerIndex = 0;

    if (typeof logs[ids] === 'undefined') {
      // add new log
      logs[ids] = {};

      newLoggerDate = getDateComponents(new Date());
    } else {
      const isShouldRotateByDate = shouldRoateByDate(logs[ids].date);

      if (isShouldRotateByDate) {
        newLoggerDate = isShouldRotateByDate;
      } else {
        const isShouldRotateBySize = logs[ids].current_size >= size;

        if (isShouldRotateBySize) {
          newLoggerDate = logs[ids].date;
          newLoggerIndex = logs[ids].index + 1;
        }
      }
    }

    if (newLoggerDate !== null) {
      findAvailableFile(ids, newLoggerDate, newLoggerIndex);
    }

    return logs[ids];
  }

  /**
   * Generate date components.
   *
   * @param {Object} date - The date will be generate.
   * @returns {Object}
   */
  function getDateComponents(date) {
    return {
      year: date.getFullYear(),
      month: padDate(date.getMonth() + 1),
      day: padDate(date.getDate()),
      hour: padDate(date.getHours())
    };
  }

  /**
   * Pad the date component with leading zero.
   *
   * @param {Number} n - The component will be leading.
   * @returns {String}
   */
  function padDate(n) {
    return String(n).padStart(2, '0');
  }

  /**
   * Find available file to use for log.
   *
   * @param {String} ids - The logs unique identity.
   * @param {Object} datelog - Date of log.
   * @param {Number} index - Index of log if rotation. 
   * @returns {String}
   */
  function findAvailableFile(ids, datelog, index = 0) {
    let base;

    if (format === 'datetime') {
      base = `${datelog.year}-${datelog.month}-${datelog.day}-${datelog.hour}`;
    } else {
      base = `${datelog.year}-${datelog.month}-${datelog.day}`;
    }

    logs[ids].path = base;

    let filesize = 0;
    let filepath = '';

    while (true) {
      filepath = path.join(dirs, ids, `${base}.${index}.log`);

      if (fs.existsSync(filepath)) {
        filesize = fs.statSync(filepath).size;

        if (filesize >= size) {
          index += 1;

          continue;
        }
      }

      logs[ids].index = index;

      break;
    }

    // there was existing stream
    // close that stream
    if (logs[ids].stream !== undefined && logs[ids].stream !== null) {
      logs[ids].stream.end();
    }

    logs[ids].date = datelog;
    logs[ids].path = base;
    logs[ids].initial_size = filesize;
    logs[ids].current_size = filesize;
    logs[ids].index = index;
    logs[ids].stream = createStream(filepath);
  }

  /**
   * Create log stream file.
   *
   * @param {String} filepath - The path of log file.
   * @returns {Object}
   */
  function createStream(filepath) {
    ensureDir(filepath);

    return fs.createWriteStream(filepath, {
      flags: 'a'
    });
  }

  /**
   * Ensure directory of log is exists then created.
   *
   * @param {String} filePath - The path of log file.
   * @returns {void}
   */
  function ensureDir(filePath) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
  }

  /**
   * To determine is time to rotation log file.
   *
   * @param {String} oldDate - The log date will be compared.
   * @returns {Object}
   */
  function shouldRoateByDate(oldDate) {
    const newDate = getDateComponents(new Date());

    if (
      oldDate.year !== newDate.year ||
      oldDate.month !== newDate.month ||
      oldDate.day !== newDate.day
    ) {
      return true;
    }

    if (format === 'datetime' && oldDate.hour !== newDate.hour) {
      return newDate;
    }

    return false;
  }

  return {
    write
  };
};
