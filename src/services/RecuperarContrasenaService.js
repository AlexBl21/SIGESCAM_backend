import CodigoRecuperacion from "../models/CodigoRecuperacion.js";
import Usuario from "../models/Usuario.js";
import { BadRequestError, NotFoundError } from "../errors/Errores.js";
import { generarCodigo } from "../utils/CodigoHelper.js";
import { enviarSms } from './SmsService.js';
import { enviarCorreo } from './EmailService.js';
import bcrypt from 'bcrypt';

export async function verificarDni(dni) {
    const usuario = await Usuario.findByPk(dni);
    if (!usuario) throw new NotFoundError("Usuario no encontrado.");
    return usuario;
}

async function verificarCodigoExistente(dni) {
    const registro = await CodigoRecuperacion.findByPk(dni);
    if (!registro) return null;

    const ahora = new Date();
    if (ahora < registro.expiracion) {
        const tiempoRestanteMs = registro.expiracion - ahora;
        const tiempoRestanteSegundos = Math.ceil(tiempoRestanteMs / 1000);

        let mensaje1;
        if (tiempoRestanteSegundos >= 60) {
            const minutos = Math.ceil(tiempoRestanteSegundos / 60);
            mensaje1 = `Ya existe un código activo. Espere ${minutos} ${minutos === 1 ? "minuto" : "minutos"}.`;
        } else {
            mensaje1 = `Ya existe un código activo. Espere ${tiempoRestanteSegundos} segundos.`;
        }

        throw new BadRequestError(mensaje1);
    }

    await CodigoRecuperacion.destroy({ where: { dni_usuario: dni } });
    return null;
}


export async function enviarCodigoSMS(dni) {
    const usuario = await verificarDni(dni);
    await verificarCodigoExistente(dni);
    if (!usuario.telefono) throw new BadRequestError("El usuario no tiene número registrado.");

    const codigo = generarCodigo(6);
    const expiracion = new Date(Date.now() + 5 * 60000);

    await CodigoRecuperacion.upsert({
        dni_usuario: dni,
        codigo,
        expiracion
    });

    await enviarSms(usuario.telefono, codigo);
    console.log(`Código para ${dni}: ${codigo}`);

    return true;
}

export async function enviarTokenRecuperacionEmail(dni) {
    const usuario = await verificarDni(dni);
    await verificarCodigoExistente(dni);
    if (!usuario.email) throw new BadRequestError("El usuario no tiene email registrado.");
    const destinatario = usuario.email;
    const codigo = generarCodigo(6);
    const expiracion = new Date(Date.now() + 5 * 60000);
    await CodigoRecuperacion.upsert({
        dni_usuario: dni,
        codigo,
        expiracion
    });
    const asunto = "Código de recuperación - SIGESCAM";
    const mensaje = `
  <div style="font-family: 'Segoe UI', Georgia, serif; color: #333;">
    <h1 style="color: #e91e63">VARIEDADES CARMENCITA</h1>
    <p>Hola,</p>
    <p>Su <strong>código de recuperación</strong> para SIGESCAM es:</p>
    <div style="
        background-color: #e1f5fe;
        padding: 15px;
        border: 2px solid #00bcd4;
        border-radius: 8px;
        text-align: center;
        vertical-align: middle;
        margin: 20px 0;">
      <h2 style="font-size: 32px; color: #e91e63; margin: 0;">${codigo}</h2>
    </div>
    <p>Este código es válido por <strong>5 minutos</strong>.</p>
    <p style="font-size: 14px; color: #999;">Si no solicitaste este código, puedes ignorar este mensaje.</p>
  </div>
`;

    return await enviarCorreo(destinatario, asunto, mensaje);
}

export async function validarCodigo(dni, codigoIngresado) {
    const registro = await CodigoRecuperacion.findByPk(dni);
    if (!registro) throw new NotFoundError("No se encontró un código de recuperación.");

    if (new Date() > registro.expiracion) {
        await CodigoRecuperacion.destroy({ where: { dni_usuario: dni } });
        throw new BadRequestError("El código ha expirado.");
    }

    if (registro.codigo !== codigoIngresado) {
        const nuevosIntentos = (registro.intentos || 0) + 1;

        if (nuevosIntentos >= 3) {
            await CodigoRecuperacion.destroy({ where: { dni_usuario: dni } });
            throw new BadRequestError("Demasiados intentos fallidos. El código ha sido invalidado.");
        }

        await CodigoRecuperacion.update(
            { intentos: nuevosIntentos },
            { where: { dni_usuario: dni } }
        );

        throw new BadRequestError("El código es incorrecto.");
    }

    await CodigoRecuperacion.destroy({ where: { dni_usuario: dni } });

    return true;
}

export async function actualizarContrasena(dni, nuevaContrasena) {
    const hash = await bcrypt.hash(nuevaContrasena, 10);
    const actualizado = await Usuario.update(
        { contrasena: hash },
        { where: { dni } }
    );
    return actualizado[0] > 0; 
}
