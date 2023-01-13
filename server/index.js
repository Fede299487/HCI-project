
'use strict';
const express = require('express');
const morgan = require('morgan'); // logging middleware
const {check, validationResult} = require('express-validator'); // validation middleware
const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const userDao = require('./user-dao'); // module for accessing the users in the DB
const cors = require('cors');

/* Set up Passport */
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function(email, password, done) {
    userDao.getUser(email, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });
        
      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.codice);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = express();
const port = 3006;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
};
app.use(cors(corsOptions));

const isLoggedIn = (req, res, next) => {
  if(req.isAuthenticated())
    return next();
  
  return res.status(401).json({ error: 'not authenticated'});
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'indovinello',
  resave: false,
  saveUninitialized: false 
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/indovinelli', (req, res) => {
  dao.indovinelli()
    .then(indovinelli => res.json(indovinelli))
    .catch(() => res.status(500).end());
});

  app.get('/api/risposte', (req, res) => {
    dao.risposteIndovinello()
      .then(risposte => res.json(risposte))
      .catch(() => res.status(500).end());
    });

    app.get('/api/classifica', (req, res) => {
      dao.classifica()
        .then(classifica => res.json(classifica))
        .catch(() => res.status(500).end());
    });

    app.post('/api/addindovinelli',isLoggedIn, [
      check('domanda').isLength({min: 1}),
      check('durata').isInt({min:30, max:600}),
      check('livello').custom((value) => {
          if(value === "facile" || value === "medio" || value === "difficile"){
            return Promise.resolve();
          }else{
            return Promise.reject('Livello di difficoltà non valido');
          }
      }),
      check('rispostacorretta').isLength({min: 1}),
      check('sugg1').isLength({min: 1}),
      check('sugg2').isLength({min: 1}),
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }
    let codice;
      try {
       codice = await dao.maxCodice();
      } catch(err) {
        res.status(503).json({error: `Database error`});
      }
      codice=codice+1;
      const indovinello = {
        codice: codice,
        domanda: req.body.domanda,
        livello: req.body.livello,
        durata: req.body.durata,
        rispostacorretta: req.body.rispostacorretta,
        sugg1: req.body.sugg1,
        sugg2: req.body.sugg2,
        stato: req.body.stato,
        utente: req.user.codice, 
        data: req.body.data,
        vincitore: req.body.vincitore,
        primarisposta: req.body.primarisposta
      };
      try {
        await dao.addIndovinello(indovinello);
        res.status(201).end();
      } catch(err) {
        res.status(503).json({error: `Database error during the creation of Indovinello ${indovinello.codice}.`});
      }
    });

    app.post('/api/addrisposta',isLoggedIn, [
      check('risposta').isLength({min: 1}),
    ], async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }
      const risposta = {
        utente: req.user.codice,
        domanda: req.body.domanda,
        risposta: req.body.risposta
      };
      try {
        await dao.addRisposta(risposta);
        res.status(201).end();
      } catch(err) {
        res.status(503).json({error: `Database error during the insert of Risposta.`});
      }
    });

    app.put('/api/updatestato',isLoggedIn, async (req, res) => {
      try {
        await dao.updateStato(req.body.codice, req.body.stato);
        res.status(200).end();
      } catch(err) {
        res.status(503).json({error: `Database error during the update of Indovinello`});
      }
    
    });

    app.put('/api/updatedata',isLoggedIn, async (req, res) => {
      try {
        await dao.updateData(req.body.codice, req.body.data);
        res.status(200).end();
      } catch(err) {
        res.status(503).json({error: `Database error during the update of Indovinello`});
      }
    });

    app.put('/api/updatevincitore',isLoggedIn, async (req, res) => {
      try {
        await dao.updateVincitore(req.body.codice, req.body.vincitore);
        res.status(200).end();
      } catch(err) {
        res.status(503).json({error: `Database error during the update of Indovinello`});
      }
    });

    app.put('/api/updateprimarisposta',isLoggedIn, async (req, res) => {
      try {
        await dao.updatePrimarisposta(req.body.codice, req.body.primarisposta);
        res.status(200).end();
      } catch(err) {
        res.status(503).json({error: `Database error during the update of Indovinello`});
      }
    });

    app.post('/api/addpunteggio',isLoggedIn, async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(422).json({errors: errors.array()});
      }
      const punteggio = {
        utente: req.user.codice,
        punteggio: req.body.punteggio
      };
      try {
        await dao.addPunteggio(punteggio);
        res.status(201).end();
      } catch(err) {
        res.status(503).json({error: `Database error during the insert of Punteggio.`});
      }
    });

/* Users APIs */

// POST /sessions 
// login
app.post('/api/sessions', function(req, res, next) {
    passport.authenticate('local', (err, user, info) => {
      if (err)
        return next(err);
        if (!user) {
          // display wrong login messages
          return res.status(401).json(info);
        }
        // success, perform the login
        req.login(user, (err) => {
          if (err)
            return next(err);
          
          // req.user contains the authenticated user, we send all the user info back
          // this is coming from userDao.getUser()
          return res.json(req.user);
        });
    })(req, res, next);
  });

  
  // DELETE /sessions/current 
  // logout
  app.delete('/api/sessions/current', (req, res) => {
    req.logout( ()=> { res.end(); } );
  });
  
  // GET /sessions/current
  // check whether the user is logged in or not
  app.get('/api/sessions/current', (req, res) => {  if(req.isAuthenticated()) {
    res.status(200).json(req.user);}
  else
    res.status(401).json({error: 'Unauthenticated user!'});;
  });
  
  /* Other express-related instructions */
  
  // Activate the server
  app.listen(port, () => {
    console.log(`react-score-server listening at http://localhost:${port}`);
  });
  