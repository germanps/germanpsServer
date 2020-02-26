const jwt = require("jwt-simple");
const moment = require("moment");

const SECRET_KEY = "gN22kdJc89lmcNd21EEsc9k2kl00Ls6pKaSeCi348rhtD";

exports.createAccessToken = function(user) {
    const payload = {
        id: user._id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        rol: user.rol,
        createToken: moment().unix(),
        exp: moment().add(3, "hours").unix()
    };

    return jwt.encode(payload, SECRET_KEY)
}

exports.createRefreshToken = function(user) {
    const payload = {
        id: user._id,
        exp: moment().add(30, "days").unix()
    };

    return jwt.encode(payload, SECRET_KEY);
}

exports.decodeToken = function(token) {
    return jwt.decode(token, SECRET_KEY, true);
}