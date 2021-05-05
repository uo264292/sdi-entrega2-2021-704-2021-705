module.exports = function(app, swig, gestorBD) {


    app.get("/ofertas",function(req,res) {

        //Creo el criterio de busqueda, mas abajo indico que si me llega algun tipo de
        //informacion sobre el titulo en la busqueda se añada al criterio.
        let criterio = {};
        if( req.query.busqueda != null ){
            criterio = { "titulo" :  {$regex : ".*"+req.query.busqueda.toLowerCase()+".*"} };
        }

        //Creo la variable para la paginacion y si no viene como parametro le asigno el valor 1.
        let pg = parseInt(req.query.pg); // Es String !!!
        if ( req.query.pg == null){ // Puede no venir el param
            pg = 1;
        }

        gestorBD.obtenerOfertaPg(criterio, pg,function(ofertas,total) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let ultimaPg = total/5;
                if (total % 5 > 0 ){ // Sobran decimales
                    ultimaPg = ultimaPg+1;
                }
                let paginas = []; // paginas mostrar

                for(let i = pg-2 ; i <= pg+2 ; i++){
                    if ( i > 0 && i <= ultimaPg){
                        paginas.push(i);
                    }
                }

                let respuesta = swig.renderFile('views/ofertas.html',
                    {
                        ofertas : ofertas,
                        paginas : paginas,
                        sepuedecomprar: true,
                        usuario: req.session.usuario,
                        actual : pg
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
        titulo : req.body.titulo.toLowerCase(),
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

    app.get('/oferta/comprar/:id', function (req, res) {
        let ofertaID = gestorBD.mongo.ObjectID(req.params.id);
        let usuario = req.session.usuario;

        sePuedeComprar(usuario,ofertaID,function (comprar){
            if (comprar){
                let criterio = {"_id" : ofertaID};
                gestorBD.obtenerOferta(criterio,function(ofertas){
                    if (ofertas==null)
                        res.send("Oferta no comprable.");
                    else{
                        let compra = {
                            usuario : usuario,
                            ofertaID : ofertaID,
                            titulo : ofertas[0].titulo,
                            detalles : ofertas[0].detalles,
                            precio : ofertas[0].precio,
                            vendedor : ofertas[0].usuario
                        }
                        gestorBD.insertarCompra(compra ,function(idCompra){
                            if ( idCompra == null ){
                                res.send("La oferta no ha podido ser insertada.");
                            } else {
                                res.redirect("/ofertas/compradas");
                            }
                        });
                    }
                });

            } else{
                res.send("La oferta no ha podido ser comprada.");
            }
        });

    });

    app.get("/ofertas/compradas",function(req,res) {

        let criterio = {usuario : req.session.usuario};
        gestorBD.obtenerCompras(criterio, function(compras) {
            if (compras == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/ofertasCompradas.html',
                    {
                        compras : compras
                    });
                res.send(respuesta);
            }
        });
    });

    function sePuedeComprar(usuario, ofertaId, funcionCallback){
        let criterio_usuario = {$and : [{"_id": ofertaId},{"usuario":usuario}]};
        let criterio_comprada = {$and : [{"ofertaId": ofertaId},{"usuario":usuario}]};

        gestorBD.obtenerOferta(criterio_usuario,function (ofertas){
            if (ofertas==null || ofertas.length>0)
                funcionCallback(false);
            else{
                gestorBD.obtenerCompras(criterio_comprada,function (compras){
                    if (compras==null || compras.length>0)
                        funcionCallback(false);
                    else
                        funcionCallback(true);
                });
            }
        });
    }
}