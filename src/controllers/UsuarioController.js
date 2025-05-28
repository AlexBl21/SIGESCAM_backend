import Sugerencia from "../models/Sugerencia.js";
import usuarioService from "../services/UsuarioService.js";
import { actualizarCorreoElectronico } from "../services/UsuarioService.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cloudinary from "../services/CloudinaryService.js";
import multer from "multer";

// Configuración de multer para recibir archivos
const storage = multer.memoryStorage();
export const upload = multer({ storage });

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

// Subir imagen de perfil
export async function subirImagenPerfil(req, res) {
    try {
        const { dni } = req.params;
        if (!req.file) {
            return res.status(400).json({ message: "No se envió ninguna imagen" });
        }
        // Subir a Cloudinary
        const resultado = await cloudinary.uploader.upload_stream({
            folder: "userImages",
            upload_preset: "perfil_usuario"
        }, async (error, result) => {
            if (error) {
                return res.status(500).json({ message: "Error al subir la imagen a Cloudinary", error });
            }
            // Actualizar la url en la base de datos
            const usuarioActualizado = await usuarioService.actualizarImagenPerfil(dni, result.secure_url);
            return res.status(200).json({
                message: "Imagen de perfil actualizada",
                url_imagen: result.secure_url,
                usuario: usuarioActualizado
            });
        });
        // Escribir el buffer de la imagen
        resultado.end(req.file.buffer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export default { registrar, listar, editar, cambioDeEstado, buscarPorId, crearContrasena, validarEmail }