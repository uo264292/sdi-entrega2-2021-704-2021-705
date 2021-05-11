module.exports = function (app, gestorBD) {



    app.post("/api/mensajes/:id/nuevo", function (req, res) {
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

        function insertarMensajeNuevo(mensaje, conversacionId, res) {
        let mensajeNuevo = Object.assign(mensaje, conversacionId);
        gestorBD.insertarMensaje(mensajeNuevo, function (id) {
            if (id == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send(JSON.stringify(mensajeNuevo));
            }
        })
    }

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
                    } else {
                        conversacionId = {"conversacion": result}
                        let mensajeNuevo = Object.assign(mensaje, conversacionId);
                        gestorBD.insertarMensaje(mensajeNuevo, function (id) {
                            if (id == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            } else {
                                res.status(200);
                                res.send(JSON.stringify(mensajeNuevo));
                            }
                        })
                    }
                })

            }

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

    function esVendedor(oferta,req) {
        let criterio;
        if (req.session.usuario === oferta.usuario ) {
            criterio = {"oferta": oferta, "vendedor": req.session.usuario};
        } else {
            criterio = {"oferta": oferta, "interesado": req.session.usuario};
        }
        return criterio;
    }
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
                        res.send(JSON.stringify(mensajes));
                    }
                });
            }
        });
    }

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
                                res.send(JSON.stringify(total));
                            }
                        })
                    }
                });
            });
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
                                        res.send("Conversación eliminada");
                                    }
                                })
                            }
                        })
                    }
                })
            });
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
    }
}