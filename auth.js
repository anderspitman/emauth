const fs = require('fs');
const uuidv4 = require('uuid/v4');
const email = require('emailjs');

import path from 'path';


class DatabaseNew {
  constructor(path) {

    this._dbPath = path;

    try {
      this._db = JSON.parse(fs.readFileSync(this._dbPath));
    }
    catch (e) {
      this._db = {
        tokens: [],
      };
      this.persist();
    }
  }

  getTable(tableName) {
    return this._db[tableName];
  }

  async persist() {
    await fs.promises.writeFile(this._dbPath, JSON.stringify(this._db, null, 2));
  }
}


class DatabaseBuilder {
  constructor(path) {
    this._path = path;
  }

  build() {
    return new DatabaseNew(this._path);
  }
}


class Auth {
  constructor(dir, baseUrl) {
    this._baseUrl = baseUrl;

    this._db = new DatabaseBuilder(path.join(dir, 'auth_db.json'))
      .build();

    const emailAuthFilePath = path.join(dir, 'emailAuth.json');
    const emailAuth = JSON.parse(fs.readFileSync(emailAuthFilePath));

    this._emailServer = email.server.connect({
      user: emailAuth.user,
      password: emailAuth.password,
      host: "smtp.gmail.com",
      ssl: true,
    });
  }
  
  createAndSendToken(data) {
    const token = uuidv4();

    const tokenTable = this._db.getTable('tokens');

    const entry = Object.assign({ token }, data);

    tokenTable.push(entry);
    
    this._db.persist();

    const message = `Here's your key:\n${token}`;

    this._emailServer.send({
      text:    message, 
       from:    "remoFS auth <tapitman11@gmail.com>", 
       to:      "<tapitman11@gmail.com>",
       subject: "remoFS login key"
    }, function(err, message) {
      console.log(err || message);
    });

    return token;
  }

  getData(token) {
    const tokenTable = this._db.getTable('tokens');

    const matches = tokenTable
      .filter(x => x.token === token);

    return matches[0];
  }

  deleteToken(token) {
    const tokenTable = this._db.getTable('tokens');

    const records = tokenTable;

    let index = -1;

    for (let i = 0; i < records.length; i++) {
      if (records[i].token === token) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      records.splice(index, 1);
      this._db.persist();
    }
  }
}

module.exports = {
  Auth,
};
