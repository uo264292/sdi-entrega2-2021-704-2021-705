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
app.use("/compras",routerUsuarioSession);






//Rutas/controladores por lógica
require("./routes/rusuarios.js")(app, swig,gestorBD);
require("./routes/rofertas")(app,swig,gestorBD);

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