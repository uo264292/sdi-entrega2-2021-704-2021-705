module.exports = function(app, swig, gestorBD, logger) {

    //Metodo que busca en la base de datos (usando el gestorDB) todos los usuarios y se los envia
    // a la vista usuarios.html ademas le pasa el user y el dinero.
    app.get("/usuarios",function(req,res) {

        let criterio = {};
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/usuarios.html',
                    {
                        usuarios : usuarios,
                        user: req.session.usuario,
                        dinero: req.session.dinero
                    });
                logger.info("Se ha mostrado la lista de usuarios");
                res.send(respuesta);
            }
        });
    });

    //Metodo que carga la vista de registro.
    app.get("/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        logger.info("Se ha mostrado la pagina de registro");
        res.send(respuesta);
    });

    //Metodo que recupera del cuerpo de la vista de registro los datos necesarios para insertar un nuevo
    //usuario en la base de datos. Se comprueba que los datos introducidos cumplan los paramettros
    //establecidos. Ademas todos se inicializan como usuario estandar y con 100€ en el monedero.
    app.post('/registrarse', function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let usuario = {
            email : req.body.email,
            nombre: req.body.nombre,
            apellidos: req.body.apellidos,
            dinero: 100,
            rol : "estandar",
            password : seguro
        }

        let criterio = {email: usuario.email};
        gestorBD.obtenerUsuarios(criterio, function (usuarioObtenido){
           if (usuarioObtenido==null||usuarioObtenido.length!=0){
               res.redirect("/registrarse?mensaje=Ya existe un usuario con ese email.");
           }
           else if (req.body.password!=req.body.repeatPassword){
                res.redirect("/registrarse?mensaje=La contraseña no coincide.");
           } else {
               gestorBD.insertarUsuario(usuario, function(id) {
                   if (id == null){
                       logger.info("Ha dado un error al registrar el nuevo usuario.");
                       res.redirect("/registrarse?mensaje=Error al registrar usuario");
                   } else {
                       logger.info("Se ha registrado un nuevo usuario cuyo email es: " + usuario.email);
                       req.session.usuario = usuario.email;
                       req.session.dinero = usuario.dinero;
                       res.redirect("/usuarios");
                   }
               });
           }
        });


    });

    //Metodo que carga la vista de identificacion de usuario.
    app.get("/identificarse", function(req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        logger.info("Se ha accedido a la pagina de identificacion");
        res.send(respuesta);
    });

    //Metodo que recupera de la vista de identificacion el usuario y la contraseña, los compara con los de la base
    //de datos y si estos coinciden con algun usuario, se accede a la vista de usuarios en caso de ser admin
    //y a la vista de ofertas en caso de ser usuario con rol estandar. Tambien se añaden el dinero y el email
    //a la session.
    app.post("/identificarse", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                logger.info("Error durante la identificacion");
                req.session.usuario = null;
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");

            } else {
                logger.info("El usuario " + usuarios[0].email + " se ha identificado");
                req.session.usuario = usuarios[0].email;
                req.session.dinero = usuarios[0].dinero;
                res.redirect("/usuarios");
            }
        });
    });

    //Desconecta al usuario identificado y carga la vista de identificacion.
    app.get('/desconectarse', function (req, res) {
        logger.info("Usuario desconectado");
        req.session.usuario = null;
        req.session.dinero = null;
        res.redirect("/identificarse");
    });

    //Metodo que en funcion del id recibido recupera al usuario de la base de datos, si no coincide
    //no se puede borrar, si coincide se mira si tiene creadas ofertas, si no las tiene se elimina el usuario
    //y si las tiene, se eliminan primero las ofertas y luego el usuario.
    app.get('/usuario/eliminar/:id', function (req, res) {
        let criterio = {"_id" : gestorBD.mongo.ObjectID(req.params.id) };

        gestorBD.obtenerUsuarios(criterio, function(usuarioAEliminar){
            if (usuarioAEliminar==null){
                res.send("Algo salio mal");
            } else{
                let criterio2= {usuario:usuarioAEliminar[0].email}
                gestorBD.obtenerOferta(criterio2,function (ofertas){
                    if (ofertas == null|| ofertas.length<=0){
                        gestorBD.eliminarUsuario(criterio,function(usuarios){
                            if ( usuarios == null ){
                                logger.info("Usuario " + usuarios[0].email + " no se ha podido eliminar");
                                res.redirect("/usuarios?mensaje=Error al eliminar usuario");
                            } else {
                                logger.info("Usuario " + usuarios[0].email + " eliminado");
                                res.redirect("/usuarios");
                            }
                        });
                    } else{
                        gestorBD.eliminarOferta(criterio2, function (ofertasABorrar){
                            if (ofertasABorrar==null){
                                res.send("Paso algo raro");
                            } else{
                                gestorBD.eliminarUsuario(criterio,function(usuarios){
                                    if ( usuarios == null ){
                                        logger.info("Usuario " + usuarios[0].email + " no se ha eliminado");
                                        res.redirect("/usuarios?mensaje=Error al eliminar usuario");
                                    } else {
                                        logger.info("Se han eliminado las ofertas del usuario " + usuarios[0].email);
                                        logger.info("Usuario " + usuarios[0].email + " eliminado");
                                        res.redirect("/usuarios");
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });


    });

    //Metodo post para eliminar usuarios de forma multiple si tienen ofertas asignadas estas
    //son eliminadas tambien.
    app.post('/usuarios/eliminar', function (req, res) {
        let usuarios = req.body.usuarios;
        let criterio_usuario = {};
        let criterio_oferta = {};


        if (typeof usuarios !== 'undefined') {
            //Si solo hay un usuario
            if (typeof usuarios === "string") {
                criterio_usuario = {
                    email: usuarios
                };
                criterio_oferta = {
                    usuario: usuarios
                };
            }
            //Si hay más de un usuario seleccionado
            else if (typeof 'object') {
                criterio_usuario = {
                    email: {$in: usuarios}
                };
                criterio_oferta = {
                    usuario: {$in: usuarios}
                };
            }

            gestorBD.eliminarUsuario(criterio_usuario, function (usuarios) {
                if (usuarios == null) {
                    res.redirect("/usuarios?mensaje=Error al eliminar usuario");
                } else {
                    logger.info("Usuarios eliminados por el admin");
                    gestorBD.eliminarOferta(criterio_oferta, function (ofertasABorrar) {
                        if (ofertasABorrar == null) {
                            res.send("Paso algo raro");
                        } else {
                            logger.info("Ofertas de usuarios eliminados por el admin eliminadas");
                            res.redirect("/usuarios");
                        }
                    });
                }
            });
        }
    });

};