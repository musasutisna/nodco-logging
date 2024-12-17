const fs = require('fs');

/**
 * Create a log configuration.
 *
 * @param   object    { ids: { date, path, stream } }
 * @return  object
 */
module.exports = function nodcoLoggingConfig(config = {}) {
  /**
   * Manage log and write log into file.
   *
   * @param   string
   * @param   string
   * @return  void
   */
  async function send(ids, msg) {
    let selectedLog = config[ids];

    if (typeof selectedLog === 'undefined') {
      selectedLog = {
        date: null,
        path: null, 
        stream: null
      };
    }

    const d = new Date();

    if (selectedLog.date === null || (d.getDate() !== selectedLog.date.getDate())) {
      if (selectedLog.stream) {
        selectedLog.stream.end();
      }

      selectedLog.date = d;
      selectedLog.path = `logs/${ids}/${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}.log`;
      selectedLog.stream = fs.createWriteStream(selectedLog.path, {
        flags: 'a+'
      });
    }

    const timestamp = d.toLocaleString('en-CA', {
      hourCycle: 'h23'
    });

    await selectedLog.stream.write(`${timestamp} : ${msg}` + "\n");
  }

  return {
    send
  };
};
