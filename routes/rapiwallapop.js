module.exports = function(app, gestorBD) {

    app.post("/api/autenticar", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401);
                res.json({
                    autenticado: false,
                    mensaje: 'Usuario no registrado.'
                });
            } else {
                req.session.usuario = criterio.email;
                let token = app.get('jwt').sign({usuario: criterio.email, tiempo: Date.now() / 1000}, "secreto");
                res.status(200);
                res.json({
                    autenticado: true,
                    token: token
                });
            }
        });
    });

    app.get("/api/ofertas/ajenas", function (req, res){

        let criterio= {};

        gestorBD.obtenerOferta(criterio , function(ofertas) {
            if (ofertas == null) {
                res.status(500);
                res.json({
                    error: "Se ha producido un error cargando las ofertas"
                })
            } else {
                let user = req.session.usuario;
                let listWithoutUser = ofertas.filter((oferta) => oferta.usuario !== user);
                res.status(200);
                res.send(JSON.stringify(listWithoutUser));
            }
        });
    });

}