const jwt = require('../services/jwt');
const moment = require('moment');
const User = require('../models/user');

function willExpiredToken(token){//el token ha expirado?
    const {exp} = jwt.decodeToken(token);
    const currentDate = moment().unix();//fecha actual

    if(currentDate > exp){
        //ha caducado
        return true;
    }
    return false;
}

function refreshAccessToken(req, res){
    const { refreshToken } = req.body;
    const isTokenExpired = willExpiredToken(refreshToken);
    
    if(isTokenExpired){
        //token caducado
        res.status(404).send({message: "El refreshToken ha caducado"})
    } else {
       const { id } = jwt.decodeToken(refreshToken);
       User.findOne({_id: id}, (err, userStored) => {
           if (err) {
               res.status(500).send({ message: "Error del servidor"} );
           }else{
               if(!userStored){
                   res.status(404).send({message: "Usuario no encontrado"});
               }else{
                   res.status(200).send({
                        accessToken: jwt.createAccessToken(userStored),
                        refreshToken: refreshToken
                   });
               }
           }
       })
    }
    
}

module.exports = {
    refreshAccessToken
}