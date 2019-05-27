const { Database } = require('kiffdb');
const uuidv4 = require('uuid/v4');

const db = new Database('auth_db');


class Auth {
  createAndSendToken(data) {
    const token = uuidv4();

    const tokenTable = db.getTable('tokens');

    const entry = {};

    for (const column of tokenTable.getColumns()) {
      entry[column.name] = data[column.name];
      entry.token = token;
    }

    tokenTable.append(entry);
    
    db.persist();

    return token;
  }

  getData(token) {
    const tokenTable = db.getTable('tokens');

    const matches = tokenTable.getAll()
      .filter(x => x.token === token);

    return matches[0];
  }

  deleteToken(token) {
    const tokenTable = db.getTable('tokens');

    const records = tokenTable.getAll();

    let index = -1;

    for (let i = 0; i < records.length; i++) {
      if (records[i].token === token) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      records.splice(index, 1);
      db.persist();
    }
  }
}

module.exports = {
  Auth,
};
