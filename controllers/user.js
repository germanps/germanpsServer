const bcrypt = require("bcrypt-nodejs");
const User = require("../models/user");

function singUp(req, res) {
    //Nueva instancia del modelo User
    const user = new User();
   
    const {name, lastname, email, password, repeatPassword} = req.body;
    user.name = name;
    user.lastname = lastname;
    user.email = email;
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
                            res.status(500).send({ message: "Error user duplicado..." })
                        }else{
                            if(!userStored){
                                res.status(404).send({ message: "Error al crear usuario..." })
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

module.exports = {
    singUp
}