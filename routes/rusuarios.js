module.exports = function(app, swig, gestorBD) {

    app.get("/usuarios",function(req,res) {

        let criterio = {};
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null) {
                res.send("Error al listar ");
            } else {
                let respuesta = swig.renderFile('views/usuarios.html',
                    {
                        usuarios : usuarios
                    });
                res.send(respuesta);
            }
        });
    });

    app.get("/registrarse", function(req, res) {
        let respuesta = swig.renderFile('views/bregistro.html', {});
        res.send(respuesta);
    });

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
        gestorBD.insertarUsuario(usuario, function(id) {
            if (id == null){
                res.redirect("/registrarse?mensaje=Error al registrar usuario");
            }
            if (req.body.password!=req.body.repeatPassword){
                res.redirect("/registrarse?mensaje=La contraseña no coincide.");
            }
            else {
                req.session.usuario = usuario.email;
                res.redirect("/usuarios");
            }
        });
    });

    app.get("/identificarse", function(req, res) {
        let respuesta = swig.renderFile('views/bidentificacion.html', {});
        res.send(respuesta);
    });

    app.post("/identificarse", function(req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');
        let criterio = {
            email : req.body.email,
            password : seguro
        }
        gestorBD.obtenerUsuarios(criterio, function(usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                req.session.usuario = null;
                res.redirect("/identificarse" +
                    "?mensaje=Email o password incorrecto"+
                    "&tipoMensaje=alert-danger ");

            } else {
                req.session.usuario = usuarios[0].email;
                req.session.dinero = usuarios[0].dinero;
                res.redirect("/usuarios");
            }
        });
    });

    app.get('/desconectarse', function (req, res) {
        req.session.usuario = null;
        res.redirect("/identificarse");
    });

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
                                res.redirect("/usuarios?mensaje=Error al eliminar usuario");
                            } else {
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
                                        res.redirect("/usuarios?mensaje=Error al eliminar usuario");
                                    } else {
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

};