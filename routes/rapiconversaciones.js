module.exports = function (app, gestorBD) {


    app.post("/api/mensajes/:id/nuevo", function (req, res) {
        let mensaje = {
            "mensaje": req.body.mensaje,
            "leido": false,
            "fecha": new Date(Date.now()).toTimeString(),
            "emisor": req.session.usuario
        }
        let criterioOferta = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        gestorBD.obtenerOferta(criterioOferta, function (ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "se ha producido un error"
                })
            } else {
                let criterioConversacion = {"oferta": ofertas, "interesado": req.session.usuario}
                gestorBD.obtenerConversacion(criterioConversacion, function (conversaciones) {
                    if (conversaciones == null) {
                        res.status(500);
                        res.json({
                            error: "se ha producido un error"
                        })
                    } else if (conversaciones.length == 0) {
                        converNueva(criterioConversacion, mensaje, req, res);
                    } else {
                        conversacionId = {"conversacion": gestorBD.mongo.ObjectID(conversaciones[0]._id)}
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
                });
            }
        });


    });

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
                        let criterioConversacion ={"oferta": ofertas[0], "interesado": req.session.usuario};
                        gestorBD.obtenerConversacion(criterioConversacion, function (conversaciones) {
                            if (conversaciones == null) {
                                res.status(500);
                                res.json({
                                    error: "se ha producido un error"
                                })
                            } else if (conversaciones.length == 0) {
                                res.status(200);
                                res.send(JSON.stringify(new Array())); //Le pasamos una conversación vacía.
                            } else {
                                let criterioMensajes = {"conversacion": gestorBD.mongo.ObjectID(conversaciones[0]._id)};
                                gestorBD.obtenerMensajes(criterioMensajes, function (mensajes) {
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
                });
            });

            app.get("/api/mensaje/:id/leido", function (req, res) {
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
                        mensaje.leido = true;
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
                                let todas = conversaciones2.concat(conversaciones);
                                res.status(200);
                                res.send(JSON.stringify(todas));
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

}