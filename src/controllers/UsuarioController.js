import Sugerencia from "../models/Sugerencia.js";
import usuarioService from "../services/UsuarioService.js";

async function registrar(req, res) {
    try {
        const usuario = await usuarioService.registrar(
            req.body.dni, 
            req.body.nombre,
            req.body.email,
            req.body.contrasena,
            req.body.telefono,
            //para claves foraneas deben ver en el modelo como se llama ese campo: 
            req.body.id_rol
        );
        res.status(200).json(usuario);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
          });
    };
};

//listar 
async function listar(req, res) {
    try {
        const usuarios = await usuarioService.listar();
        res.status(200).json(usuarios);
    } catch (error) {
        console.log(error);
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
          });
    }
};


async function editar(req, res) {
    try {
        const {dni} = req.params;
        const usuario = await usuarioService.editar(
        dni,
        req.body.nombre,
        req.body.id_rol,
        req.body.email,
        req.body.telefono,
);
res.status(200).json(usuario);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
          });
    }
};

async function cambioDeEstado(req, res) {
    try {
        const {dni} = req.params;
        const usuario = await usuarioService.cambioDeEstado(dni, req.body.estado);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
          });
    }
}

async function buscarPorId(req, res) {
    try{
        const{dni} = req.params;
        const usuario = await usuarioService.buscarPorId(dni);
        res.status(200).json(usuario);
    }catch(error){
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
          });
    }
}

export default{registrar, listar, editar, cambioDeEstado, buscarPorId}