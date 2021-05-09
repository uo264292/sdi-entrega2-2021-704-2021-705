module.exports = function(app, gestorBD) {

    app.post("/api/autenticar/", function (req, res) {
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave')).update(req.body.password).digest('hex');
        let criterio = {
            email: req.body.email,
            password: seguro
        }

        gestorBD.obtenerUsuarios(criterio, function (usuarios) {
            if (usuarios == null || usuarios.length == 0) {
                res.status(401); //No autorizado
                res.json({
                    autenticado: false,
                    mensaje: 'Usuario no registrado.'
                });
            } else {
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
                    error : "se ha producido un error"
                })
            } else {
                for (let i=0; i<ofertas.length;i++){
                    if (ofertas[i].usuario==res.usuario){
                        let pos = ofertas.indexOf("ofertas[i]");
                        ofertas.splice(pos,1);
                    }
                }
                res.status(200);
                res.send( JSON.stringify(ofertas));
            }
        });
    });

}