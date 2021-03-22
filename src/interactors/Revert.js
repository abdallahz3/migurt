const _get = require("lodash/get");
const _reverse = require("lodash/reverse");
const fs = require("fs");
const template = require('es6-template-strings');
const path = require("path");
const Log = require("logurt");
const { alreadyRunFileNames, getNumberToRun } = require("../helpers/utils");

class Revert {
  static async perform({ dbClient, downDir, numToRevert, tableName }) {
    try {
      await dbClient.query("BEGIN");

      const alreadyRunFilenamesSorted = _reverse(
        (await alreadyRunFileNames({ dbClient, tableName })).sort()
      );

      const numToRun = getNumberToRun({
        userInput: numToRevert,
        remaining: alreadyRunFilenamesSorted.length
      });

      if (numToRun === 0) {
        Log.info("Nothing to revert.");
        return true;
      }

      for (var i = 0; i < numToRun; i++) {
        const filename = alreadyRunFilenamesSorted[i];
        const sqlRaw = fs.readFileSync(path.join(downDir, filename), {
          encoding: "utf-8"
        });

        let sql = '';
        if (filename.endsWith('.sqlt')) {
          sql = template(sqlRaw, {process: process})
        } else {
          sql = sqlRaw
        }

        await this.runReversion({ dbClient, filename, sql, tableName });

        Log.info(`Ran reversion "${filename}".`);
      }

      await dbClient.query("COMMIT");
      Log.success("Done.");
    } catch (err) {
      Log.error(err.message);
      Log.warning("Rolling back any database changes.");
      await dbClient.query("ROLLBACK");

      return false;
    }

    return true;
  }

  static async runReversion({ dbClient, filename, sql, tableName }) {
    await dbClient.query(sql);
    const query = {
      text: `DELETE FROM ${tableName} WHERE name = $1;`,
      values: [filename]
    };
    await dbClient.query(query);

    return true;
  }
}

module.exports = Revert;
