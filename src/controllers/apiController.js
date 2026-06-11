import Accesorio from "../models/accesorios.js";
import Alimento from "../models/alimentos.js";

const getAccesorios = (req, res) => Accesorio.findAll()
    .then(accesorios => res.json(accesorios));

const getAlimentos = (req, res) => Alimento.findAll()
    .then(alimentos => res.json(alimentos));

export default { getAccesorios, getAlimentos };