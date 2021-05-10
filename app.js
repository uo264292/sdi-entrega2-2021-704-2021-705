let express = require('express');
let app = express();

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Methods", "POST, GET, DELETE, UPDATE, PUT");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
    // Debemos especificar todas las headers que se aceptan. Content-Type , token
    next();
});

let jwt = require('jsonwebtoken');
app.set('jwt',jwt);
let fs = require('fs');
let https = require('https');
var rest = require('request');
app.set('rest',rest);

let expressSession = require('express-session');
app.use(expressSession({
    secret: 'abcdefg',
    resave: true,
    saveUninitialized: true
}));
app.use(express.static('public'));
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




// routerUsuarioToken
let routerUsuarioToken = express.Router();
routerUsuarioToken.use(function(req, res, next) {
    // obtener el token, vía headers (opcionalmente GET y/o POST).
    let token = req.headers['token'] || req.body.token || req.query.token;
    if (token != null) {
        // verificar el token
        jwt.verify(token, 'secreto', function(err, infoToken) {
            if (err || (Date.now()/1000 - infoToken.tiempo) > 240 ){
                res.status(403); // Forbidden
                res.json({
                    acceso : false,
                    error: 'Token invalido o caducado'
                });
                // También podríamos comprobar que intoToken.usuario existe
                return;

            } else {
                // dejamos correr la petición
                res.usuario = infoToken.usuario;
                next();
            }
        });

    } else {
        res.status(403); // Forbidden
        res.json({
            acceso : false,
            mensaje: 'No hay Token'
        });
    }
});
// Aplicar routerUsuarioToken
app.use('/api/ofertas/ajenas', routerUsuarioToken);

app.use('/api/mensaje', routerUsuarioToken);
app.use('/api/mensajes', routerUsuarioToken);
app.use('/api/conversaciones', routerUsuarioToken);
app.use('/api/conversacion', routerUsuarioToken);



// routerUsuarioSession
var routerUsuarioSession = express.Router();
routerUsuarioSession.use(function(req, res, next) {
    console.log("routerUsuarioSession");
    if ( req.session.usuario ) {
        // dejamos correr la petición
        next();
    } else {
        console.log("va a : "+req.session.destino)
        res.redirect("/identificarse");
    }
});
//Aplicar routerUsuarioSession
app.use("/oferta/agregar",routerUsuarioSession);
app.use("/ofertas",routerUsuarioSession);
app.use("/usuarios",routerUsuarioSession);
app.use("/usuarios/eliminar",routerUsuarioSession);
app.use("/oferta/modificar",routerUsuarioSession);
app.use("/oferta/eliminar",routerUsuarioSession);
app.use("/ofertas/compradas",routerUsuarioSession);
app.use("/ofertas/destacar",routerUsuarioSession);

//routerUsuarioAutor
let routerUsuarioAutor = express.Router();
routerUsuarioAutor.use(function(req, res, next) {
    console.log("routerUsuarioAutor");
    let path = require('path');
    let id = path.basename(req.originalUrl);
// Cuidado porque req.params no funciona
// en el router si los params van en la URL.
    gestorBD.obtenerOferta(
        {_id: mongo.ObjectID(id) }, function (ofertas) {
            console.log(ofertas[0]);
            if(ofertas[0].usuario == req.session.usuario ){
                next();
            } else {
                res.redirect("/ofertas");
            }
        })
});
//Aplicar routerUsuarioAutor
app.use("/oferta/modificar",routerUsuarioAutor);
app.use("/oferta/eliminar",routerUsuarioAutor);
app.use("/oferta/destacar",routerUsuarioAutor);

//routerUsuarioRol
let routerUsuarioRol = express.Router();
routerUsuarioRol.use(function(req, res, next) {
    console.log("routerUsuarioRol");
    gestorBD.obtenerUsuarios({email : req.session.usuario }, function (usuarios){
       if (usuarios[0].rol=="admin"){
           next();
       }
       else{
           res.redirect("/ofertas");
       }
    });

});
//Aplicar routerUsuarioRol
app.use("/usuarios",routerUsuarioRol);
app.use("/usuarios/eliminar",routerUsuarioRol);
app.use("/usuario/eliminar",routerUsuarioRol);



//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig,gestorBD);
require("./routes/rofertas.js")(app,swig,gestorBD);
require("./routes/rapiwallapop.js")(app,gestorBD);
require("./routes/rapiconversaciones.js")(app,gestorBD);
app.get('/', function (req, res) {
    res.redirect('/identificarse');
})

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