import Sugerencia from "../models/Sugerencia.js";
import usuarioService from "../services/UsuarioService.js";
import { actualizarCorreoElectronico } from "../services/UsuarioService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

async function registrar(req, res) {
    try {
        const usuario = await usuarioService.registrar(
            req.body.dni,
            req.body.nombre,
            req.body.email,
            req.body.telefono,
            //para claves foraneas deben ver en el modelo como se llama ese campo: 
            req.body.rol
        );
        res.status(201).json(usuario);
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
        const { dni } = req.params;
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
        const { dni } = req.params;
        const usuario = await usuarioService.cambioDeEstado(dni, req.body.estado);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

async function buscarPorId(req, res) {
    try {
        const { dni } = req.params;
        const usuario = await usuarioService.buscarPorId(dni);
        res.status(200).json(usuario);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

export async function editarCorreo(req, res) {
    try {
        const { dni } = req.params;
        const { nuevoEmail } = req.body;

        const usuarioActualizado = await actualizarCorreoElectronico(dni, nuevoEmail);

        return res.status(200).json({
            message: "Correo electrónico actualizado exitosamente",
            usuario: {
                dni: usuarioActualizado.dni,
                nombre: usuarioActualizado.nombre,
                email: usuarioActualizado.email,
            },
        });

    } catch (error) {
        if (error.name === "BadRequestError") {
            return res.status(400).json({ message: error.message });
        }

        if (error.name === "NotFoundError") {
            return res.status(404).json({ message: error.message });
        }

        return res.status(500).json({ message: "Error al actualizar el correo" + error.message });
    }
}

async function crearContrasena(req, res) {
    try {
        const { token } = req.params;
        const { contrasena } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { dni } = decoded;

        const contraseñaHasheada = await bcrypt.hash(contrasena, 10);
        await usuarioService.actualizarContraseña(dni, contraseñaHasheada);

        res.json({ message: "Contraseña creada exitosamente" });
    } catch (error) {
        console.error("Error al crear contraseña:", error.message);
        res.status(400).json({ message: error.message });
    }
}

async function validarEmail(req, res) {
    try {
        const { email, dni } = req.body;
        const resultado = await usuarioService.validarCorreoExistente(email, dni);
        res.status(200).json(resultado);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message || "Error interno del servidor"
        });
    }
}

export default { registrar, listar, editar, cambioDeEstado, buscarPorId, crearContrasena, validarEmail }