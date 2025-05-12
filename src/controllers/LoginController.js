import { autenticarUsuario } from "../services/LoginService.js";

export async function login(req, res) {
    try {
        const { dni, contrasena } = req.body;

        if (!dni || !contrasena) {
            return res
                .status(400)
                .json({ message: "Todos los campos son obligatorios" });
        }

        const { usuario, role } = await autenticarUsuario(dni, contrasena);

        return res.status(200).json({
            message: "Inicio de sesión exitoso",
            usuario: {
                dni: usuario.dni,
                nombre: usuario.nombre,
                rol: role,
                email: usuario.email,
            }
        });
    } catch (error) {
        const status = error.statusCode || 500;
        return res.status(status).json({ message: error.message });
    }
}