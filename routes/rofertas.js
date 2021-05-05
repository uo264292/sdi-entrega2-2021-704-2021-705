module.exports = function(app, swig, gestorBD) {


    app.get("/ofertas",function(req,res) {

        let criterio = {};
        gestorBD.obtenerOferta(criterio, function(ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/ofertas.html',
                    {
                        ofertas : ofertas
                    });
                res.send(respuesta);
            }
        });
    });

    app.get("/ofertas/propias",function(req,res) {

        let criterio = {usuario : req.session.usuario};
        gestorBD.obtenerOferta(criterio, function(ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/ofertasPropias.html',
                    {
                        ofertas : ofertas
                    });
                res.send(respuesta);
            }
        });
    });

    app.get('/oferta/agregar', function (req,res){
        let respuesta = swig.renderFile('views/addOferta.html',{
        });
        res.send(respuesta);
    });

    app.post('/oferta/agregar', function (req,res){

    var fecha = new Date();

    let oferta = {
        titulo : req.body.titulo,
        detalles : req.body.detalles,
        precio : req.body.precio,
        fecha : fecha.toLocaleDateString(),
        usuario: req.session.usuario
    }

    if (oferta.titulo.length<=1||oferta.detalles.length<=1||oferta.precio<=0){
        res.redirect("/oferta/agregar" +
            "?mensaje=Titulo, detalles o precio no validos"+
            "&tipoMensaje=alert-danger ");
    }
    else {
            // Conectarse
            gestorBD.insertarOferta(oferta, function (id) {
                if (id == null) {
                    res.send("Error al insertar oferta");
                } else {
                    res.redirect('/ofertas/propias');
                }

            });
        }
    });

    app.get('/oferta/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.eliminarOferta(criterio,function(ofertas){
            if ( ofertas == null){
                res.redirect("/ofertas?mensaje=Error al eliminar oferta");
            } else {
                res.redirect("/ofertas/propias");
            }
        });
    });
}