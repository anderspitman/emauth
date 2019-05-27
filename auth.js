const fs = require('fs');
const { Database } = require('kiffdb');
const uuidv4 = require('uuid/v4');
const email = require('emailjs');

const db = new Database('auth_db');

const emailAuth = JSON.parse(fs.readFileSync('emailAuth.json'));

const emailServer = email.server.connect({
  user: emailAuth.user,
  password: emailAuth.password,
  host: "smtp.gmail.com",
  ssl: true,
});


class Auth {
  constructor(baseUrl) {
    this._baseUrl = baseUrl;
  }
  
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

    const message = `Click on the following link to login to GlutenTags:
http://localhost:9001?token=${token}`;

    emailServer.send({
      text:    message, 
       from:    "Me <tapitman11@gmail.com>", 
       to:      "<tapitman11@gmail.com>",
       subject: "GlutenTags login key"
    }, function(err, message) {
      console.log(err || message);
    });

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
