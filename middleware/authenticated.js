const jwt = require('jwt-simple');
const moment = require('moment');
const SECRET_KEY = "gN22kdJc89lmcNd21EEsc9k2kl00Ls6pKaSeCi348rhtD";

exports.ensureAuth = (req, res, next) => {
    if(!req.headers.authorization){
        //si no se ha enviado el token
        return res.status(403).send({ message: "La petición no tiene cabecera de autenticación." })
    }

    const token = req.headers.authorization.replace(/['"']+/g, "");
    let payload = null;
    try {
        payload = jwt.decode(token, SECRET_KEY);

        if (payload.exp <= moment.unix()) {
            //token expirado
            return res.status(404).send({ message: "El token ha expirado." });
        }

    } catch (ex) {
        // console.log(ex);
        return res.status(404).send({ message: "Token inválido." });
    }

    //todo correcto
    req.user = payload;
    next();
}