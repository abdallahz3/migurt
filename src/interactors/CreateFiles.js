const fs = require("fs");
const CreateDirectoriesIfNotExists = require("./CreateDirectoriesIfNotExists");
const Log = require("logurt");
const { Pool } = require("pg");

class CreateFiles {
  static async perform({ dirDown, dirUp, name }) {
    CreateDirectoriesIfNotExists.perform({ dirs: [dirUp, dirDown] });

    const now = Date.now();
    let filenameUp = ''
    let filenameDown = ''
    if (name.endsWith('.sqlt')) {
      filenameUp = `${dirUp}/${now}_${name}`;
      filenameDown = `${dirDown}/${now}_${name}`;
    } else {
      if (name.endsWith('.sql')) {
        filenameUp = `${dirUp}/${now}_${name}`;
        filenameDown = `${dirDown}/${now}_${name}`;
      } else {
        filenameUp = `${dirUp}/${now}_${name}.sql`;
        filenameDown = `${dirDown}/${now}_${name}.sql`;
      }
    }


    fs.writeFileSync(filenameUp, "");
    Log.success(`Created file ${filenameUp}`);

    fs.writeFileSync(filenameDown, "");
    Log.success(`Created file ${filenameDown}`);

    return { filenameUp, filenameDown };
  }
}

module.exports = CreateFiles;
