const Menu = require('../models/menu');

function addMenu(req, res) { 
    const { title, url, order, active } = req.body
    const menu = new Menu();
    menu.title = title;
    menu.url = url;
    menu.order = order;
    menu.active = active;

    menu.save((err, createdMenu) => {
        if(err){
            res.status(500).send({ message: "Error de servidor" });
        }else{
            if (!createdMenu) {
                res.status(404).send({ message: "Error al crear el menu" });
            }else{
                res.status(200).send({ message: "Menú creado correctamente" });
            }
        }
    });

}

function getMenus(req, res) {
    Menu.find().sort({order: "asc"}).exec((err, menusStored) => {
        if(err){
            res.status(500).send({ message: "Error de servidor" });
        }else{
            if(!menusStored){
                res.status(404).send({ message: "No se han encontrado menús" });
            }else{
                res.status(200).send({ menusStored });
            }
        }
    });
}

function updateMenu(req, res) {
    let menuData = req.body;
    const params = req.params;

    Menu.findByIdAndUpdate(params.id, menuData, (err, menuUpdate) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor" } );
        }else{
            if (!menuUpdate) {
                res.status(404).send({ message: "No se ha encontrado ningún menú" });
            }else{
                res.status(200).send({ message: "Menú actualizado correctamente!" });
            }
        }
    });
}

function activateMenu(req, res) {
    const { id } = req.params;
    const { active } = req.body;

    Menu.findByIdAndUpdate(id, {active}, (err, menuUpdate) => {
        if (err) {
            res.status(500).send({ message: "Error del servidor" } );
        }else{
            if (!menuUpdate) {
                res.status(404).send({ message: "No se ha encontrado ningún menú" });
            }else{
                if(active === true){
                    res.status(200).send({ message: "Menú actualizado correctamente!" });
                }else{
                    res.status(200).send({ message: "Menú desactivado correctamente!" });
                }
            }
        }
    });
}


module.exports = {
    addMenu,
    getMenus,
    updateMenu,
    activateMenu
}