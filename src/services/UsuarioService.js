import usuarioEntidad from "../models/Usuario.js";
import { NotFoundError, BadRequestError, Conflict, InternalServerError } from "../errors/Errores.js";
import rolEntidad from "../models/Rol.js";
import rol from "../models/Rol.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import { enviarCorreo } from "../services/EmailService.js";
import PreferenciaNotiService from "./PreferenciaNotificacionService.js";
import PreferenciaNotificacion from "../models/PreferenciaNotificacion.js";

//registrar un Usuario 
async function registrar(dni, nombre, email, telefono, rol) {
    if (!dni || !nombre || !email || !telefono || !rol) {
        throw new BadRequestError("Los datos no pueder esta vacios");
    }

    try {
        //busco si existe el usuario
        const usuarioNuevo = await usuarioEntidad.findByPk(dni);
        if (usuarioNuevo) {
            throw new Conflict("El usuario ya existe");
        }
        //busco si existe el correo
        const existe = await existeCorreo(email);
        if (existe) {
            throw new Conflict("El correo ya existe");
        }
        //busco si existe el rol
        const rolBuscado = await rolEntidad.findByPk(rol);
        if (!rolBuscado) {
            throw new NotFoundError("No se encontró el rol");
        };
        /*creo el usuario con los datos que necesito, 
        debo mirar que las propiedades que le pase se llamen igual a las del modelo, 
        en caso de que la llave primaria sea incremental no es necesario pasarla, 
        hay datos que tienen valor por defecto, en este caso el estado no es necesario pasarlo como parametro*/
        const usuario = await usuarioEntidad.create({
            dni: dni,
            nombre: nombre,
            email: email,
            telefono: telefono,
            //para claves foraneas deben ver en el modelo como se llama ese campo: 
            id_rol: rol
        });

        //Verifico que ya esté creado
        if (!usuario?.dni) {
                throw new InternalServerError ('Error al crear notificación de stock general');
        };
        //Creo de una la preferencia de notificacion
        if(rolBuscado.id === "Administrador"){
            await crearPreferencia(dni, 2);
        }
        else if(rolBuscado.id === "Gestor de ventas"){
            console.log("entro en el if de gestor");
           await crearPreferencia(dni, 1);
            await crearPreferencia(dni, 2);
        }
        //Envio de correo
        const token = jwt.sign({ dni }, process.env.JWT_SECRET, { expiresIn: "48h" });
        console.log(token);
        const link = `${process.env.FRONTEND_URL}/establecer-contraseña/${token}`;
        await enviarCorreo(
            email,
            "Crea tu contraseña",
            `
        <div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: auto;
    padding: 24px;
    border: 1px solid #e0e0e0;
    border-radius: 12px;
    background: linear-gradient(to bottom right, #ffe4f0, #e0f0ff);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  ">
    <h2 style="color: #444; text-align: center;">Hola ${nombre},</h2>
    <p style="font-size: 16px; color: #555;">
      Bienvenido(a) a <strong>SIGESCAM - Variedades Carmencita</strong>. Para crear tu contraseña, haz clic en el siguiente botón:
    </p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${link}" style="
        background-color: #ff6fa1;
        color: white;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        font-size: 16px;
        display: inline-block;
        transition: background-color 0.3s ease;
      " onmouseover="this.style.backgroundColor='#ff4d85'" onmouseout="this.style.backgroundColor='#ff6fa1'">
        Crear contraseña
      </a>
    </div>

    <p style="font-size: 14px; color: #666;">
      Si el botón no funciona, también puedes copiar y pegar el siguiente enlace en tu navegador:
    </p>
    <p style="word-break: break-all; font-size: 14px; color: #0077cc;">
      ${link}
    </p>

    <p style="font-size: 14px; color: #888;">
      Este enlace expirará en 2 días.
    </p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="font-size: 12px; color: #aaa; text-align: center;">
      © ${new Date().getFullYear()} Variedades Carmencita. Todos los derechos reservados.
      `
        );
        return usuario;
    } catch (error) {
        console.log(error);
        throw error;
    };
};

//mirar si el correo ya existe
async function existeCorreo(email) {
    return await usuarioEntidad.findOne({
        where: { email: email }
    });
}

//Listar usuarios
async function listar() {
    const usuarios = await usuarioEntidad.findAll({
        include: [{
            model: rol
        }
        ]
    });
    if (!usuarios) {
        throw new NotFoundError("No se encontraron usuarios");
    }
    //aca se puede solo retornar el objeto, pero esto me traería todos los datos, y yo para este endpont solo necesito algunos. 
    return usuarios.map((usuario) => {
        const estado = calcularEstado(usuario.estado);
        return {
            dni: usuario.dni,
            nombre: usuario.nombre,
            rol: usuario.rol.id,
            estado
        }
    });
}

function calcularEstado(estado) {
    return estado == true ? "Habilitado" : "Deshabilitado";
}

//editar devuelve un 0 si no actualizó, y si sí actualizó devuelve un numero >0
async function editar(dni, nombre, rol, correo, telefono) {
    if (!dni || !nombre || !rol || !correo || !telefono) {
        throw new BadRequestError("Los datos no pueden ser vacios");
    }

    try {
        //busco si existe el usuario
        const usuario = await usuarioEntidad.findByPk(dni);
        if (!usuario) {
            throw new NotFoundError("El usuario no existe");
        };

        //busco si el rol existe
        const rolBuscado = await rolEntidad.findByPk(rol);
        if (!rolBuscado) {
            throw new NotFoundError("No se encontró el rol");
        };

        //actualizo
        const usuarioActualizado = await usuarioEntidad.update({
            nombre: nombre,
            email: correo,
            telefono: telefono,
            id_rol: rolBuscado.id
        }, {
            where: { dni: dni }
        });
        if (!usuarioActualizado) {
            throw new InternalServerError("Error al actualizar el usuario");
        }
        return usuarioActualizado;
    } catch (error) {
        throw error;
    };
};

//deshabilitar o habilitar un usuario
async function cambioDeEstado(dni, estado) {
    try {
        const usuario = await usuarioEntidad.findByPk(dni);
        if (!usuario) {
            throw new NotFoundError("No se encontró al usuario");
        }
        usuario.estado = estado;
        await usuario.save({ fields: ['estado'] });
        return usuario;
    } catch (error) {
        throw error;
    }
};

//buscar por id
async function buscarPorId(dni) {
    if (!dni) {
        throw new BadRequestError("dni vacio")
    };
    const usuario = await usuarioEntidad.findByPk(dni);
    if (!usuario) {
        throw new NotFoundError("No se encontró el usuario");
    }
    return usuario;
}

export async function actualizarCorreoElectronico(dni, nuevoEmail) {
    if (!nuevoEmail || nuevoEmail.trim() === "") {
        throw new BadRequestError("El correo electrónico no puede estar vacío.");
    }
    const usuario = await buscarPorId(dni);

    if (usuario.email === nuevoEmail) {
        throw new BadRequestError("El nuevo correo electrónico es igual al actual.");
    }

    const emailExistente = await usuarioEntidad.findOne({ where: { email: nuevoEmail } });
    if (emailExistente && emailExistente.dni !== dni) {
        throw new BadRequestError("El correo electrónico ya está en uso.");
    }

    usuario.email = nuevoEmail;
    await usuario.save();

    return usuario;
}

async function actualizarContraseña(dni, contraseñaHasheada) {
    const clienteExistente = await usuarioEntidad.findByPk(dni);
    if (!clienteExistente) {
        throw new Error("Cliente no encontrado");
    }

    clienteExistente.contrasena = contraseñaHasheada;
    await clienteExistente.save();
    return clienteExistente;
};

async function listarGestoras() {
    const usuarios = await usuarioEntidad.findAll({
        include: [
            {
                model: rol,
                where: { id: 'Gestor de ventas' },
                required: true
            },
            {
                model: PreferenciaNotificacion,
                required: true 
            }
        ]
    });
    if (!usuarios) {
        throw new NotFoundError("No se encontraron usuarios");
    }
    return usuarios;
};

async function listarAdministradoras() {
    const usuarios = await usuarioEntidad.findAll({
        include: [{
                model: rol,
                where: { id: 'Administrador' },
                required: true
            },
            {
                model: PreferenciaNotificacion,
                required: true 
            }]
    });
    if (!usuarios) {
        throw new NotFoundError("No se encontraron usuarios");
    }
    return usuarios;
};

async function validarCorreoExistente(email, dniActual) {
    if (!email || email.trim() === "") {
        throw new BadRequestError("El correo electrónico no puede estar vacío.");
    }

    const emailExistente = await usuarioEntidad.findOne({ 
        where: { email: email }
    });

    if (emailExistente && emailExistente.dni !== dniActual) {
        throw new BadRequestError("El correo electrónico ya está en uso por otro usuario.");
    }

    return { valido: true, mensaje: "El correo electrónico está disponible." };
}

//preferencia Notifi
async function crearPreferencia(dni, tipo) {
    try {
        const preferencia = await PreferenciaNotiService.registrar(dni, tipo);
        if(!preferencia){
        throw new InternalServerError("Error al crear la preferencia");
    }
    return preferencia;
    } catch (error) {
        throw error;
    }
};

export default { registrar, listar, editar, cambioDeEstado, buscarPorId, actualizarContraseña, listarGestoras, listarAdministradoras, validarCorreoExistente, crearPreferencia  };

