import {
    enviarCodigoSMS,
    validarCodigo,
    enviarTokenRecuperacionEmail,
    verificarDni, actualizarContrasena
} from "../services/RecuperarContrasenaService.js";
import { BadRequestError, NotFoundError } from '../errors/Errores.js';

export async function verificarDniUsuario(req, res) {
    try {
        const { dni } = req.body;
        const usuario = await verificarDni(dni);
        res.status(200).json({ mensaje: "DNI verificado correctamente", usuario });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

//Envia el codigo al telefono del usuario por un SMS

export async function enviarCodigoSMSRecuperacion(req, res) {
    try {
        const { dni } = req.body;
        await enviarCodigoSMS(dni);
        res.status(200).json({ mensaje: "Código enviado por SMS correctamente." });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

// Envía el código al correo del usuario
export async function enviarCodigoAEmail(req, res) {
    try {
        const { dni } = req.body;
        await enviarTokenRecuperacionEmail(dni);
        res.status(200).json({ mensaje: "Código enviado por correo electrónico correctamente." });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}

// Valida que el código ingresado sea correcto y no esté vencido
export async function comprobarCodigo(req, res) {
    try {
        const { dni, codigo } = req.body;
        await validarCodigo(dni, codigo);
        res.status(200).json({ mensaje: "Código validado correctamente." });
    } catch (error) {
        res.status(error.statusCode || 500).json({ error: error.message });
    }
}


// Este es para cuando ya se va a cambiar la contraseña
export async function restablecerContrasena(req, res) {
    const { dni, nuevaContrasena, confirmarContrasena } = req.body;

    try {
        if (!dni || !nuevaContrasena || !confirmarContrasena) {
            throw new BadRequestError('Todos los campos son obligatorios');
        }

        if (nuevaContrasena !== confirmarContrasena) {
            throw new BadRequestError('Las contraseñas no coinciden');
        }

        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!regex.test(nuevaContrasena)) {
            throw new BadRequestError(
                'La contraseña debe tener mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo'
            );
        }

        const actualizado = await actualizarContrasena(dni, nuevaContrasena);
        if (!actualizado) {
            throw new NotFoundError('Usuario no encontrado');
        }

        res.status(200).json({ mensaje: 'Contraseña actualizada correctamente' });

    } catch (error) {
        const status = error.statusCode || 500;
        const mensaje = error.message || 'Error interno del servidor';
        res.status(status).json({ error: mensaje });
    }
}