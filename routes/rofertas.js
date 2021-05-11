module.exports = function(app, swig, gestorBD, logger) {

    //Metodo que manda la lista de ofertas paginadas  a la vista de ofertas.
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
                        usuario: req.session.usuario,
                        user: req.session.usuario,
                        dinero: req.session.dinero,
                        actual : pg
                    });
                logger.info("Se ha accedido a la lista de ofertas.");
                res.send(respuesta);
            }
        });
    });

    //Metodo que recupera las ofertas que tienen el atributo destacar a true y las manda a
    //la vista de ofertas destacadas.
    app.get("/ofertas/destacadas", function (req, res) {
        let criterio = {destacar: true};

        gestorBD.obtenerOferta(criterio, function (ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ofertas");
            } else {
                let respuesta = swig.renderFile('views/ofertasDestacadas.html',
                    {
                        user: req.session.usuario,
                        dinero: req.session.dinero,
                        ofertas : ofertas
                    });
                logger.info("Se ha accedido a la lista de ofertas destacadas.");
                res.send(respuesta);
            }
        });
    })

    //Metodo que recupera las ofertas creadas por el usuario que se encuentra en sesion
    //y las manda a la vista de ofertas propias.
    app.get("/ofertas/propias",function(req,res) {

        let criterio = {usuario : req.session.usuario};
        gestorBD.obtenerOferta(criterio, function(ofertas) {
            if (ofertas == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/ofertasPropias.html',
                    {
                        user: req.session.usuario,
                        dinero: req.session.dinero,
                        ofertas : ofertas
                    });
                logger.info("Se ha accedido a la lista de ofertas propias.");
                res.send(respuesta);
            }
        });
    });

    //Metodo que recupera la vista para agregar una oferta.
    app.get('/oferta/agregar', function (req,res){
        let respuesta = swig.renderFile('views/addOferta.html',{
            user: req.session.usuario,
            dinero: req.session.dinero
        });
        logger.info("Se ha accedido a la vista para agregar una oferta.");
        res.send(respuesta);
    });

    //Metodo que recupera del cuerpo de la vista de agregar oferta los valores
    //necesarios para crearla en la base de datos, se realizan las comprobaciones
    //pertinentes para que los datos sigan el formato adecuado.
    app.post('/oferta/agregar', function (req,res){

    var fecha = new Date();

    let oferta = {
        titulo : req.body.titulo.toLowerCase(),
        detalles : req.body.detalles,
        precio : req.body.precio,
        fecha : fecha.toLocaleDateString(),
        comprada : false,
        destacar : false,
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
                    if (typeof req.body.destacar!=='undefined'){
                        logger.info("Se ha agregado la oferta " + oferta.titulo +" y se ha destacado.");
                        res.redirect("/oferta/destacar/" + id.toString());
                    } else{
                        logger.info("Se ha agregado la oferta " + oferta.titulo);
                        res.redirect('/ofertas/propias');
                    }
                }

            });
        }
    });

    //Metodo que a traves del id de la oferta la recupera de la base de datos, si existe es eliminada
    //si no existe en la base no se puede eliminar.
    app.get('/oferta/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.eliminarOferta(criterio,function(ofertas){
            if ( ofertas == null){
                res.redirect("/ofertas?mensaje=Error al eliminar oferta");
            } else {
                logger.info("Se ha eliminado la oferta ");
                res.redirect("/ofertas/propias");
            }
        });
    });

    //Metodo que a traves del id de la oferta, primero la recupera de la base de datos
    //si existe y cumple el requisito de la funcion sepuedecomprar esta oferta cambia el atrinuto
    //comprada a true, y decrementa el dinero del usuario.
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
                        if (req.session.dinero<compra.precio){
                            res.redirect("/ofertas" +
                                "?mensaje=Dinero insuficiente"+
                                "&tipoMensaje=alert-danger ");
                        }else{
                            gestorBD.insertarCompra(compra ,function(idCompra){
                                if ( idCompra == null ){
                                    res.send("La oferta no ha podido ser insertada.");
                                }
                                else {
                                    logger.info("Se ha comprado la oferta " + compra.titulo);
                                    let criterio_comprada={"_id":ofertaID};
                                    let oferta = {
                                        comprada : true
                                    }
                                    gestorBD.modificarOferta(criterio_comprada,oferta, function (result){
                                        if (result == null) {
                                            res.send("Error al modificar ");
                                        } else {
                                            let criterio_usuario = {email:usuario};
                                            let dineroTrasCompra = req.session.dinero-compra.precio;
                                            let usuarioModificado = {
                                                dinero : dineroTrasCompra
                                            }
                                            gestorBD.modificarUsuario(criterio_usuario, usuarioModificado, function (result){
                                                if (result == null) {
                                                    res.send("Error al pagar ");
                                                } else {
                                                    logger.info("Se ha cobrado al usuario " + usuario +" " + compra.precio + "€");
                                                    req.session.dinero=dineroTrasCompra;
                                                    res.redirect("/ofertas/compradas");
                                                }
                                            });

                                        }
                                    });

                                }
                            });
                        }
                    }
                });

            } else{
                res.send("La oferta no ha podido ser comprada.");
            }
        });

    });

    //Metodo que recupera de la base de datos las ofertas que han sido compradas por el usuario
    //activo en sesion y las manda a la vista de ofertas compradas.
    app.get("/ofertas/compradas",function(req,res) {

        let criterio = {usuario : req.session.usuario};
        gestorBD.obtenerCompras(criterio, function(compras) {
            if (compras == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/ofertasCompradas.html',
                    {
                        user: req.session.usuario,
                        dinero: req.session.dinero,
                        compras : compras
                    });
                logger.info("Se ha cargado la pagina de ofertas compradas.");
                res.send(respuesta);
            }
        });
    });

    //Metodo que a traves del id recupera la oferta de la base de datos si es que esta existe
    //cambia el atributo destacar a true y modifica el dinero del usuario restandole 20€.
    app.get('/oferta/destacar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };
        let usuario = req.session.usuario;

        let oferta = {
            destacar: true
        }

        if (req.session.dinero>=20){
            gestorBD.modificarOferta(criterio,oferta,function(result){
                if ( result == null){
                    res.redirect("/ofertas/propias?mensaje=Error al destacar oferta");
                } else {
                    logger.info("Se ha destacado la oferta");
                    let criterio_usuario = {email:usuario};
                    let dineroTrasDestacar = req.session.dinero-20;
                    let usuarioAModificar = {
                        dinero: dineroTrasDestacar
                    };
                    gestorBD.modificarUsuario(criterio_usuario, usuarioAModificar, function (result){
                        if (result == null) {
                            res.send("Error al pagar ");
                        } else {
                            logger.info("Se ha cobrado al usuario " + usuario +" " + 20 + "€");
                            req.session.dinero=dineroTrasDestacar;
                            res.redirect("/ofertas");
                        }
                    });
                }
            });
        }
        else{
            res.redirect("/ofertas/propias?mensaje=No dispone de saldo suficiente.");
        }

    });

    //Funcion que comprueba si la oferta se puede comprar, osea que no sea una oferta propia
    //o una oferta ya comprada.
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