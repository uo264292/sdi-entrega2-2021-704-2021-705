module.exports = function (app, gestorBD, logger) {


    //Metodo que crea un mensaje nuevo recibe desde el cliente un id correspondiente
    //a una oferta.
    app.post("/api/mensajes/:id/nuevoMensaje", function (req, res) {
         let mensaje = {
            "mensaje": req.body.mensaje,
            "leer": false,
            "fecha": fechaFormatoCorrecto(new Date(Date.now())),
            "emisor": req.session.usuario
        }
        let criterioOff = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerOferta(criterioOff, function (ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                let criterioConver = esVendedor(ofertas[0],req);
                gestorBD.obtenerConversacion(criterioConver, function (conversaciones) {
                    if (conversaciones == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else if (conversaciones.length === 0) {
                        converNueva(criterioConver, mensaje, req, res);
                    } else {
                        conversacionId = {"conversacion": gestorBD.mongo.ObjectID(conversaciones[0]._id)}

                        insertarMensajeNuevo(mensaje, conversacionId, res);
                    }
                });
            }
        });
    });

    //Funcion que inserta en la base de datos un mensaje nuevo.
    function insertarMensajeNuevo(mensaje, conversacionId, res) {
        let mensajeNuevo = Object.assign(mensaje, conversacionId);
        gestorBD.insertarMensaje(mensajeNuevo, function (id) {
            if (id == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
                logger.info("No se ha insertado el nuevo mensaje.");
            } else {
                res.status(200);
                logger.info("Se ha insertado un nuevo mensaje.");
                res.send(JSON.stringify(mensajeNuevo));
            }
        })
    };

    //Funcion que crea una conversacion nueva en la base de datos.
    function converNueva(criterio, mensaje, req, res) {
                let conversacion = {
                    "vendedor": criterio.oferta.usuario,
                    "interesado": criterio.interesado,
                    "oferta": criterio.oferta
                }
                gestorBD.insertarConversacion(conversacion, function (result) {
                    if (result === null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                        logger.info("No se ha creado la conversacion.");
                    } else {
                        logger.info("Se ha creado una nueva conversacion.");
                        conversacionId = {"conversacion": result}
                        let mensajeNuevo = Object.assign(mensaje, conversacionId);
                        gestorBD.insertarMensaje(mensajeNuevo, function (id) {
                            if (id == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                                logger.info("No se ha insertado el nuevo mensaje.");
                            } else {
                                res.status(200);
                                logger.info("Se ha insertado el nuevo mensaje.");
                                res.send(JSON.stringify(mensajeNuevo));
                            }
                        })
                    }
                })

            };

    //Metodo que recupera los mensajes de una conversacion e indica
    //si estos han sido leidos.
    app.get("/api/mensajes/:id", function (req, res) {
                let criterioOferta = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
                gestorBD.obtenerOferta(criterioOferta,function (ofertas){
                    if (ofertas == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    }
                    else{
                        gestorBD.obtenerConversacion(esVendedor(ofertas[0],req), function (conversaciones) {
                            if (conversaciones == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            } else if (conversaciones.length === 0) {
                                res.status(200);
                                res.send(JSON.stringify([]));
                            } else {
                                let criterioMensajes = {"conversacion": gestorBD.mongo.ObjectID(conversaciones[0]._id)};
                                gestorBD.obtenerMensajes(criterioMensajes, function (mensajes) {
                                    if (mensajes == null) {
                                        res.status(500);
                                        res.json({
                                            error: "se ha producido un error"
                                        })
                                    } else {
                                        mensajeALeido(conversaciones[0]._id,req,res);
                                    }
                                });
                            }
                        });
                    }
                });
            });

    //Funcion que indica si el usuario activo es el vendedor o el interesado en
    //funcion a una oferta.
    function esVendedor(oferta,req) {
        let criterio;
        if (req.session.usuario === oferta.usuario ) {
            criterio = {"oferta": oferta, "vendedor": req.session.usuario};
        } else {
            criterio = {"oferta": oferta, "interesado": req.session.usuario};
        }
        return criterio;
    };

    //Funcion que indica si un mensaje ha sido leido.
    function mensajeALeido(idConversacion, req, res) {
        let mensajeLeido = {"leer": true}
        let criterioSinLeer = {$and: [{"leer": false}, {"conversacion": gestorBD.mongo.ObjectID(idConversacion)}, {"emisor": {$ne: req.session.usuario}}]};
        gestorBD.modificarMensaje(criterioSinLeer, mensajeLeido, function (mensaje) {
            if (mensaje == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            }
            else {
                let criterio = {"conversacion": gestorBD.mongo.ObjectID(idConversacion)}
                gestorBD.obtenerMensajes(criterio, function (mensajes) {
                    if (mensajes == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        res.status(200);
                        logger.info("El mensaje ha sido leido.");
                        res.send(JSON.stringify(mensajes));
                    }
                });
            }
        });
    };

    //Metodo que modifica un mensaje poniendo su propiedad de leido a true.
    app.get("/api/mensaje/:id/leer", function (req, res) {
                let criterio = {
                    "_id": gestorBD.mongo.ObjectID(req.params.id)
                };
                gestorBD.obtenerMensajes(criterio, function (mensajes) {
                    if (mensajes == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        let mensaje = mensajes[0];
                        mensaje.leer = true;
                        gestorBD.modificarMensaje(criterio, mensaje, function (msg) {
                            if (mensajes == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            } else {
                                res.status(200);
                                res.send(JSON.stringify(msg));
                            }
                        })
                    }
                })
            });

    //Metodo que nos devuelve una lista con las conversaciones del usuario en sesion
    //ya sea como vendedor o como interesado.
    app.get("/api/conversaciones", function (req, res) {
                let criterio = {interesado: req.session.usuario};
                let criterio2 = {vendedor: req.session.usuario};

                gestorBD.obtenerConversacion(criterio, function (conversaciones) {
                    if (conversaciones == null) {
                        res.send("Error");
                    } else {
                        gestorBD.obtenerConversacion(criterio2, function (conversaciones2) {
                            if (conversaciones2 == null) {
                                res.send("Error");
                            } else {
                                let total = conversaciones2.concat(conversaciones);
                                res.status(200);
                                logger.info("Se ha accedido a la lista de conversaciones.");
                                res.send(JSON.stringify(total));
                            }
                        })
                    }
                });
            });

    //Metodo que borra una conversacion cuyo id es introducido en la url.
    app.delete("/api/conversacion/:id", function (req, res) {
                let criterio = {
                    "_id": gestorBD.mongo.ObjectID(req.params.id)
                };
                gestorBD.obtenerConversacion(criterio, function (conversaciones) {
                    if (conversaciones == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else {
                        let criterio2 = {
                            "conversacion": conversaciones[0]._id
                        }
                        gestorBD.eliminarMensajes(criterio2, function (mensajes) {
                            if (mensajes == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            } else {
                                gestorBD.eliminarConversacion(criterio, function (result) {
                                    if (result == null) {
                                        res.status(500);
                                        res.json({
                                            error: "se ha producido un error"
                                        })
                                    } else {
                                        res.status(201);
                                        logger.info("La conversacion ha sido eliminada.");
                                        res.send("Conversación eliminada");
                                    }
                                })
                            }
                        })
                    }
                })
            });

    //Funcion que sirve para comprobar que la fecha esta en el formato correcto, retorna una cadena
    //correspondiente a la fecha.
    function fechaFormatoCorrecto(date) {
        let f = new Date(date);
        console.log(date);
        let cadena =  f.getDate() + "/" +
            (f.getMonth()+1) + "/" +
            f.getFullYear()+ " - "
            +f.getHours()+":";
        if(f.getMinutes()<10){
            return cadena + "0" + f.getMinutes();
        }
        else{
            return cadena + f.getMinutes();
        }
    };
}