import Usuario from "../models/Usuario.js";
import bcrypt from "bcrypt";
import { NotFoundError, BadRequestError } from "../errors/Errores.js";


export async function autenticarUsuario(dni, contrasena) {
    let usuario = await Usuario.findByPk(dni);

    if (!usuario) {
        throw new NotFoundError("Usuario no encontrado");
    }

    if (!usuario.estado) {
        throw new BadRequestError("Tu cuenta está desactivada. No puedes iniciar sesión.");
    }

    const isValid = bcrypt.compareSync(contrasena, usuario.contrasena);
    if (!isValid) throw new BadRequestError("Contraseña incorrecta");
    return {
        usuario,
        role: usuario.id_rol
    };
}


