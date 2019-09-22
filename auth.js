const fs = require('fs');
const email = require('emailjs');

import path from 'path';

const keyLength = 64;
const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';


class DatabaseNew {
  constructor(path) {

    this._dbPath = path;

    try {
      this._db = JSON.parse(fs.readFileSync(this._dbPath));
    }
    catch (e) {
      this._db = {
        keys: [],
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


class AuthBuilder {

  directory(dir) {
    this._dir = dir;
    return this;
  }

  serviceName(name) {
    this._serviceName = name;
    return this;
  }

  build() {

    return new Auth({
      directory: this._dir,
      serviceName: this._serviceName,
    });
  }
}


class Auth {
  constructor(options) {

    const dir = options.directory ? options.directory : './';
    this._serviceName = options.serviceName ? options.serviceName : "emauth";

    this._db = new DatabaseBuilder(path.join(dir, 'auth_db.json'))
      .build();

    const emailConfigFilePath = path.join(dir, 'email_config.json');
    this._emailConfig = JSON.parse(fs.readFileSync(emailConfigFilePath));

    this._emailServer = email.server.connect({
      user: this._emailConfig.user,
      password: this._emailConfig.password,
      host: this._emailConfig.host,
      ssl: true,
    });
  }
  
  createAndSendKey(email) {
    const key = this._genKey();

    const keyTable = this._db.getTable('keys');

    const entry = Object.assign({ email, key });

    keyTable.push(entry);
    
    this._db.persist();

    const html = `
      <html>
        <h1>Here's your key:</h1>
        <input type='text' style='width: 640px; font-size: 16px;' readonly='readonly' value='${key}'></input>
        <p style='font-size: 16px;'>
          Copy and paste it into the verification form.
        </p>
      </html>
    `;

    this._emailServer.send({
      from:    `${this._serviceName} authenticator <${this._emailConfig.from}>`, 
      to:      `<${email}>`,
      subject: `${this._serviceName} login key`,
      attachment: {
        data: html,
        alternative: true,
      },
    }, function(err, message) {
      console.log(err || message);
    });

    return key;
  }

  getData(key) {
    const keyTable = this._db.getTable('keys');

    const matches = keyTable
      .filter(x => x.key === key);

    return matches[0];
  }

  deleteKey(key) {
    const keyTable = this._db.getTable('keys');

    const records = keyTable;

    let index = -1;

    for (let i = 0; i < records.length; i++) {
      if (records[i].key === key) {
        index = i;
        break;
      }
    }

    if (index !== -1) {
      records.splice(index, 1);
      this._db.persist();
    }
  }

  _genKey() {
    let key = "";
    for (let i = 0; i < keyLength; i++) {
      key += chars[Math.floor(Math.random()*chars.length)];
    }
    return key;
  }
}

module.exports = {
  AuthBuilder,
};
