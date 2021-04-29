let express = require('express');
let app = express();

let jwt = require('jsonwebtoken');
app.set('jwt',jwt);
let fs = require('fs');
let https = require('https');

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
let crypto = require('crypto');
let fileUpload = require('express-fileupload');
app.use(fileUpload());
let mongo = require('mongodb');
let swig = require('swig');
let bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


let gestorBD = require("./modules/gestorBD.js");
gestorBD.init(app,mongo);


//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig,gestorBD);

//variables
app.set('port', 8081);
app.set('db','mongodb://admin:sdi@wallapop-shard-00-00.emuii.mongodb.net:27017,wallapop-shard-00-01.emuii.mongodb.net:27017,wallapop-shard-00-02.emuii.mongodb.net:27017/myFirstDatabase?ssl=true&replicaSet=atlas-10h1zi-shard-0&authSource=admin&retryWrites=true&w=majority');
app.set('clave','abcdefg');
app.set('crypto',crypto);

https.createServer({
    key: fs.readFileSync('certificates/alice.key'),
    cert: fs.readFileSync('certificates/alice.crt')
}, app).listen(app.get('port'), function() {
    console.log("Servidor activo");
});