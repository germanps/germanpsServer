const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const User = require("../models/user");

function singUp(req, res) {
    //Nueva instancia del modelo User
    const user = new User();
   
    const {name, lastname, email, password, repeatPassword} = req.body;
    user.name = name;
    user.lastname = lastname;
    user.email = email.toLowerCase();
    user.role = "admin",
    user.active = false;

    //console.log(req.body, user);

    if(!password || !repeatPassword){
        //Error campos vacios
        res.status(404).send({message: "Las contraseñas son obligatorias"});  
    }else{
        if(password !== repeatPassword){
            //Error contraseñas diferentes
            res.status(404).send({ message: "Las contraseñas no coinciden" });
        }else{
            //Todo correcto
            //Encriptar contraseña
            bcrypt.hash(password, null, null, function(err, hash){
                if(err){
                    res.status(500).send({ message: "Error al encriptar la contraseña" });
                }else{
                    //asignar password hasheado al objeto user
                    user.password = hash;
                    //enviar a mongo
                    user.save((err, userStored) => {
                        if(err){
                            res.status(500).send({ message: "El usuario ya existe" })
                        }else{
                            if(!userStored){
                                res.status(404).send({ message: "Error al crear usuario" })
                            }else{
                                res.status(200).send({ user: userStored })
                            }
                        }
                    })
                }
            });
            //res.status(200).send({ message: "Usuario creado" });
        }
    }
}

function singIn(req, res){
    const params = req.body;
    const email = params.email.toLowerCase();
    const password = params.password;

    User.findOne({email}, (err, userStoraged) => {
        // Lo que está dentro del send() es lo que se le va a enviar al front
        
        if(err){
            res.status(500).send({message: "Error de servidor"});
        }else{
            if(!userStoraged){
                res.status(404).send({message: "Usuario no encontrado"});
            }else{
                //bcrypt.compare(password, )
                bcrypt.compare(password, userStoraged.password, (err, check) => {
                    console.log(password, err, userStoraged);
                         
                    if(err){
                        res.status(500).send({ message: "Error del servidor" });
                    } else if(!check){
                        //La contraseña no es la misma
                        res.status(404).send({message: "La contraseña es incorrecta"});
                    }else{
                        if(!userStoraged.active){
                            res.status(200).send({code: 200, message: "El usuario está inactivo"});
                        }else{
                            res.status(200).send({
                                accessToken: jwt.createAccessToken(userStoraged),
                                refreshToken: jwt.createRefreshToken(userStoraged)
                            });
                        }
                    }
                });
                
            }
        }
    })
    
}

module.exports = {
    singUp,
    singIn
}