const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("../services/jwt");
const User = require("../models/user");

function signUp(req, res) {
    //Nueva instancia del modelo User
    const user = new User();
   
    const {name, lastname, email, password, repeatPassword} = req.body;
    user.name = name;
    user.lastname = lastname;
    user.email = email.toLowerCase();
    user.role = "admin";
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

function signIn(req, res){
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
                         console.log(password, userStoraged.password, err, check);
                         
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

function getUsers(req, res) {
    User.find().then(users => {
        if(!users){
            //users viene vacio
            res.status(404).send({ message:  "No se ha encontrado ningún usuario."});
        }else{
            res.status(200).send({ users });
        }
    })
    
}

function getUsersActive(req, res) {
    const query = req.query;
    User.find({ active: query.active }).then(users => {
        if(!users){
            //users viene vacio
            res.status(404).send({ message:  "No se ha encontrado ningún usuario."});
        }else{
            res.status(200).send({ users });
        }
    })
    
}

function uploadAvatar(req, res) {
    const params = req.params;
    User.findById({ _id: params.id }, (err, userData) => {
        if (err) {
            res.status(500).send({ message: "Error de servidor." });
        }else{
            if(!userData){
                res.status(404).send({ message: "Usuario desconocido" });
            }else{
                let user = userData;
                console.log(req.files);
                
                
                if(req.files){
                    let filePath = req.files.avatar.path;
                    let fileSplit = filePath.split("\\"); 
                    let fileName = fileSplit[2];
                    let extSplit = fileName.split(".");
                    let fileExt = extSplit[1];
                    
                    if(fileExt !== "png" && fileExt !== "jpg"){
                        res.status(400).send({ message: "La extensión de la imagen es inválida" })
                    }else{
                        user.avatar = fileName;
                        User.findByIdAndUpdate({ _id: params.id }, user, (err, userResult) => {
                            if(err){
                                res.status(500).send({ message: "Error del servidor." })
                            }else{
                                if (!userResult) {
                                    res.status(404).send({ message: "No se ha encontrado ningún usuario." })
                                }else{
                                    res.status(200).send({ avatarName: fileName })
                                }
                            }
                        })
                    }
                    
                }
                
            }
        }
    })
    
}

function getAvatar (req, res) {
    const avavarName = req.params.avatarName;
    const filePath = "./uploads/avatar/" + avavarName;

    fs.exists(filePath, exists => {
        if (!exists) {
            res.status(404).send({ message: "El avatar no existe." });
        }else{
            res.sendFile(path.resolve(filePath));
        }
    });
    
}

async function updateUser(req, res){
    let userData = req.body;
    userData.email = req.body.email.toLowerCase();
    const params = req.params;    

    if (userData.password) {
        //encriptar password
        await bcrypt.hash(userData.password, null, null,  function(err, hash) {
            if (err) {
                res.status(500).send({ message: "Error al encriptar la contraseña." });
            }else{
                userData.password = hash;
            }
        });
    };    

    User.findByIdAndUpdate({ _id: params.id }, userData, (err, userUpdate) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor." });
        }else{
            if (!userUpdate) {
                res.status(404).send({ message: "Usuario no encontrado" });
            }else{
                res.status(200).send({ message: "Usuario actualizado correctamente." })
            }
        }
    });
}

function activateUser(req, res) {
    const { id } = req.params;
    const { active } = req.body;
    
    User.findByIdAndUpdate(id, { active: active }, (err, userStored) => {
        if (err) {
            res.status(500).send({ message: "Error de servidor."});
        }else{
            if (!userStored) {
                res.status(404).send({ message: "Usuario no encontrado."});
            }else{
                if(active === true){
                    res.status(200).send({ message: "Usuario activado correctamente."});
                }else{
                    res.status(200).send({ message: "Usuario desactivado correctamente."});
                }
            }
        }
    });
}

function deleteUser(req, res) {
    const { id } = req.params;
    User.findByIdAndRemove(id, (err, userDeleted) => {
        if(err){
            res.status(500).send({ message: "Error de servidor" });
        }else{
            if(!userDeleted){
                res.status(404).send({ message: "Usuario no encontrado" });
            }else{
                res.status(200).send({ message: "Usuario borrado correctamente" });
            }
        }
    });
}




module.exports = {
    signUp,
    signIn,
    getUsers,
    getUsersActive,
    uploadAvatar,
    getAvatar,
    updateUser,
    activateUser,
    deleteUser
} 