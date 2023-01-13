'use strict';

const sqlite = require('sqlite3');

// open the database
const db = new sqlite.Database('database.db', (err) => {
  if(err) throw err;
});

exports.indovinelli = () => {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT indovinelli.codice, domanda, livello, durata, rispostacorretta, sugg1, sugg2, stato, utente, data, utenti.nome as nomevincitore, primarisposta FROM indovinelli LEFT JOIN utenti ON vincitore=utenti.codice ';
      db.all(sql, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        const indovinelli = rows.map((i) => ({codice: i.codice, domanda: i.domanda, livello: i.livello, durata:i.durata, rispostacorretta: i.rispostacorretta, sugg1: i.sugg1, sugg2:i.sugg2, stato:i.stato, utente: i.utente, data: i.data, vincitore: i.nomevincitore, primarisposta: i.primarisposta}));
        resolve(indovinelli);
      });
    });
};

exports.risposteIndovinello = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT domanda, risposta FROM risposte';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const risposte = rows.map((i) => ({domanda: i.domanda, risposta: i.risposta}));
      resolve(risposte);
    });
  });
};

exports.addIndovinello = (indovinello) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO indovinelli(codice, domanda, livello, durata, rispostacorretta, sugg1, sugg2, stato, utente, data, vincitore, primarisposta) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.run(sql, [indovinello.codice, indovinello.domanda, indovinello.livello, indovinello.durata, indovinello.rispostacorretta, indovinello.sugg1, indovinello.sugg2, indovinello.stato, indovinello.utente, indovinello.data, indovinello.vincitore, indovinello.primarisposta], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.maxCodice = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT MAX(codice) as max FROM indovinelli';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows[0].max);
    });
  });
};

exports.addRisposta = (risposta) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO risposte(utente,domanda,risposta) VALUES(?,?,?)';
    db.run(sql, [risposta.utente, risposta.domanda, risposta.risposta], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.updateStato = (indovinello,stato) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE indovinelli SET stato=? WHERE codice=?';
    db.run(sql, [stato,indovinello], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.updateData = (indovinello,data) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE indovinelli SET data=? WHERE codice=?';
    db.run(sql, [data,indovinello], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.updateVincitore = (indovinello,vincitore) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE indovinelli SET vincitore=? WHERE codice=?';
    db.run(sql, [vincitore,indovinello], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.updatePrimarisposta = (indovinello,utente) => {
  return new Promise((resolve, reject) => {
    const sql = 'UPDATE indovinelli SET primarisposta=? WHERE codice=?';
    db.run(sql, [utente,indovinello], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.addPunteggio = (punteggio) => {
  return new Promise((resolve, reject) => {
    const sql = 'INSERT INTO classifica(utente,punteggio) VALUES(?,?)';
    db.run(sql, [punteggio.utente, punteggio.punteggio], function (err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this.lastID);
    });
  });
};

exports.classifica = () => {
  return new Promise((resolve, reject) => {
    const sql = 'SELECT utente, nome, SUM(punteggio) as punteggio, DENSE_RANK() OVER (ORDER BY SUM(punteggio) DESC) as rank FROM classifica JOIN  utenti ON utente=utenti.codice GROUP by utente;';
    db.all(sql, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      const classifica  = rows.map((c) => ({codice: c.utente, utente: c.nome, punteggio: c.punteggio, rank: c.rank}));
      resolve(classifica);
    });
  });
};


