import usuarioEntidad from "../models/Usuario.js";
import { NotFoundError, BadRequestError, Conflict, InternalServerError } from "../errors/Errores.js";
import rolEntidad from "../models/Rol.js";
import rol from "../models/Rol.js";

//registrar un Usuario 
async function registrar(dni, nombre, email, contrasena, telefono, rol) {
    if (!dni || !nombre || !email || !contrasena || !telefono || !rol) {
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
            throw new Conflict("El correo ya existe"); s
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
            contrasena: contrasena,
            telefono: telefono,
            //para claves foraneas deben ver en el modelo como se llama ese campo: 
            id_rol: rol
        });
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
            nombre: usuario.nombre,
            rol: usuario.rol.descripcion,
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

export async function buscarPorDNI(dni) {
    const usuario = await usuarioEntidad.findByPk(dni);
    if (!usuario) {
        throw new NotFoundError("Usuario no encontrado.");
    }
    return usuario;
}

export async function actualizarCorreoElectronico(dni, nuevoEmail) {
    if (!nuevoEmail || nuevoEmail.trim() === "") {
        throw new BadRequestError("El correo electrónico no puede estar vacío.");
    }
    const usuario = await buscarPorDNI(dni);

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

export default { registrar, listar, editar, cambioDeEstado, buscarPorId };