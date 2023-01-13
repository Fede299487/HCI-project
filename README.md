# Exam #299487: "Indovinelli"
## Student: s299487 D'AMBROSIO FEDERICA 

## React Client Application Routes

- Route `/`: in questa route l'utente vede, nell'header, il pulsante per effettuare il login, e due tabelle; nella prima sono presenti tutti gli indovinelli con il loro stato (aperto o chiuso), nella seconda è presente la classifica top3 degli utenti. 
- Route `/indovinelli`: in questa route l'utente che ha effettuato il login vede, nell'header, il pulsante per effettuare il logout, un messaggio di benvenuto e una barra di navigazione. Tramite quest'ultima l'utente ha la possibilià di visualizzare gli indovinelli dai lui aggiunti divisi in due tabelle in base al loro stato, gli indovinelli che può risolvere aggiunti da altri utenti sempre divisi in due tabelle e poi la classifica top3. L'utente avrà, in questa pagina, anche la possibilità di navigare verso la route `/add` tramite il tasto 'Aggiungi un nuovo indovinello'.
- Route `/login`: in questa route è presente il form di login mediante il quale l'utente può autenticarsi.
- Route `/add`: in questa route è presente il form utilizzato dall'utente per aggiungere un nuovo indovinello specificando il testo dell'indovinello, la difficoltà (facile, medio, difficile), la durata (secondi compresi tra 30 e 600), la risposta corretta e due suggerimenti.  

## API Server

- GET `/api/indovinelli`
  - Ritorna un array contenente tutti gli indovinelli
  - request parameters: empty
  - response body content: '200 OK' (success); body: un array di oggetti descritti da codice, domanda, livello, durata, rispostacorretta, sugg1, sugg2, stato, utente, data, vincitore, primarisposta
  
- GET `/api/risposte`
  - Ritorna un array contenente tutte le risposte
  - request parameters: empty
  - response body content: '200 OK' (success); body: un array di oggetti descritti da domanda, risposta 

- GET `/api/classifica`
  - Ritorna un array contenente la classifica degli utenti
  - request parameters: empty
  - response body content: '200 OK' (success); body: un array di oggetti descritti da codice, utente, punteggio, rank

- POST `/api/addindovinelli`
  - Aggiunge un nuovo indovinello
  - request header contiene una linea: Content-Type/application/JSON 
  - request body content: oggetto JSON contenente codice, domanda, livello, durata, rispostacorretta, sugg1, sugg2, stato, utente, data, vincitore, primarisposta relativi ad un indovinello
  - response body content: '201 Created' (success);
  - error response: '503 Service Unavailable' (Database error during the creation of Indovinello ${indovinello.codice})

- POST `/api/addrisposta`
  - Aggiunge la risposta ad un indovinello di un utente
  - request header contiene una linea: Content-Type/application/JSON 
  - request body content: oggetto JSON contenente utente, domanda, risposta
  - response body content: '201 Created' (success);
  - error response: '503 Service Unavailable' (Database error during the insert of Risposta.)

- POST `/api/addpunteggio`
  - Aggiunge il punteggio ottenuto da un utente
  - request header contiene una linea: Content-Type/application/JSON 
  - request body content: oggetto JSON contenente utente, punteggio
  - response body content: '201 Created' (success);
  - error response: '503 Service Unavailable' (Database error during the insert of Punteggio.)

- PUT `/api/updatestato`
  - Aggiorna lo stato di un indovinello
  - request header contiene una linea: Content-Type/application/JSON 
  - request body content: oggetto JSON contenente codice, stato
  - response body content: '200 OK' (success);
  - error response: '503 Service Unavailable' (Database error during the update of Indovinello.)

- PUT `/api/updatedata`
  - Aggiorna la data dell'inizio del conteggio del timer di un indovinello
  - request header contiene una linea: Content-Type/application/JSON 
  - request body content: oggetto JSON contenente codice, data
  - response body content: '200 OK' (success);
  - error response: '503 Service Unavailable' (Database error during the update of Indovinello.)

- PUT `/api/updatevincitore`
  - Aggiorna il vincitore di un indovinello
  - request header contiene una linea: Content-Type/application/JSON 
  - request body content: oggetto JSON contenente codice, vincitore
  - response body content: '200 OK' (success);
  - error response: '503 Service Unavailable' (Database error during the update of Indovinello.)

- PUT `/api/updateprimarisposta`
  - Aggiorna l'utente che ha dato la prima risposta
  - request header contiene una linea: Content-Type/application/JSON 
  - request body content: oggetto JSON contenente codice, primarisposta
  - response body content: '200 OK' (success);
  - error response: '503 Service Unavailable' (Database error during the update of Indovinello.)

- POST `/api/sessions`
  - Effettua il login di un utente
  - request header contiene una linea: Content-Type/application/JSON 
  - request body content: un oggetto JSON contenente email utente e password 
  - response body content: '200 OK' (success); body: oggetto JSON che descrive l'utente
  - error rsponse: '401 Unauthorized'
  
- GET `/api/sessions/current`
  - Verifica se l'utente ha una sessione valida 
  - request body content: empty
  - response body content: '200 OK' (success); body: oggetto JSON che descrive l'utente
  - error rsponse: '401 Unauthorized' (Unauthenticated user!)
  
- DELETE `/api/sessions/current`
  - Effettua il logout di un utente  
  - response body content: '200 OK' (success);
  - error response: '503 Service Unavailable' 

## Database Tables

- Table `classifica` - contiene utente, punteggio
- Table `indovinelli` - contiene codice, domanda, livello, durata, rispostacorretta, sugg1, sugg2, stato, utente, data, vincitore, primarisposta
- Table `risposte` - contiene utente, domanda, risposta
- Table `utenti` - contiene codice, email, password, nome, SALT

## Main React Components

- `IndovinelliForm` (in `Form.js`): contiene il form utilizzato dall'utente per aggiungere un indovinello. Il form è caratterizzato dai campi: domanda, difficoltà, durata, rispostacorretta, sugg1, sugg2

- `LoginForm` (in `LoginComponents.js`): contiene il form di login
- `LogOutButton` (in `LoginComponents.js`): contiene il pulsante di logout

- `Header` (in `App.js`): se l'utente non è autenticato contiene il pulsante di login altrimenti quello di logout

- `All` (in `TableComponents.js`): contiene due tabelle: `GeneralTable`, `Classifica`
- `GeneralTable` (in `TableComponents.js`): tabella che contiene tutti gli indovinelli con il relativo stato
- `Classifica` (in `TableComponents.js`): tabella che contiene la classifica top3 degli utenti
- `Indovinelli` (in `TableComponents.js`): componente che contiene la barra di navigazione, la tabella indovinelli aperti e la tabella indovinelli chiusi oppure la classifica
- `Nav` (in `TableComponents.js`): barra di navigazione grazie alla quale sarà possibile visualizzare 'I miei indovinelli', 'Risolvi indovinelli', 'Classifica TOP 3'. E' presente anche il tasto 'Aggiungi un nuovo indovinello' che permette all'utente, tramite la compilazione di un form, di aggiungere un nuovo indovinello
- `TabellaIndovinelli` (in `TableComponents.js`): cliccando su 'I miei indovinelli' nella Nav l'utente vede gli indovinelli da lui aggiunti divisi in aperti e chiusi, degli indovinelli aperti l'utente vede le risposte aggiornate ogni secondo e il tempo restante, degli indovinelli chiusi l'utente vede le risposte, la risposta corretta e il vincitore. Cliccando su 'Risolvi Indovinelli' l'utente vede gli indovinelli aggiunti da altri utenti divisi in aperti e chiusi che può risolvere, degli indovinelli aperti l'utente vede la difficoltà, il tempo restante, un form per rispondere una sola volta ad ogni indovinello e dei suggerimenti che compariranno dopo un certo intervallo di tempo, degli indovinelli chiusi l'utente vede la difficoltà, le risposte, la riposta corretta e il vincitore

## Screenshot

![Screenshot](./img/screenshot.png)

## Users Credentials

- s1@polito.it, pass
- s2@polito.it, pass
- s3@polito.it, pass
- s4@polito.it, pass
- s5@polito.it, pass
