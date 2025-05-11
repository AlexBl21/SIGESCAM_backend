import express from "express";
import dotenv from "dotenv";
import db from "./db/db.js";

import Rol from "./models/Rol.js";
import Usuario from "./models/Usuario.js";
import Abono from "./models/Abono.js";
import Deudor from "./models/Deudor.js";
import Venta from "./models/Venta.js";
import DetalleVenta from "./models/DetalleVenta.js";
import Producto from "./models/Producto.js";
import Categoria from "./models/Categoria.js";
import Compra from "./models/Compra.js";
import Notificacion from "./models/Notificacion.js";
import TipoNotificacion from "./models/TipoNotificacion.js";
import PreferenciaNotificacion from "./models/PreferenciaNotificacion.js";
import Sugerencia from "./models/Sugerencia.js";
import NotificacionUsuario from "./models/NotificacionUsuario.js";

import SugerenciaRoutes from "./routes/SugerenciaRoutes.js"
import usuarioRoutes from "./routes/UsuarioRoutes.js";
import loginRoutes from "./routes/LoginRoutes.js";
import compraRoutes from "./routes/CompraRoutes.js";
import productoRoutes from "./routes/ProductoRoutes.js";
import recuperarContrasenaRoutes from "./routes/RecuperarContrasenaRoutes.js";
import cors from "cors";

dotenv.config({
  path: "../.env"
});

const app = express();
app.use(express.json());
app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

//test conexion de la bd
db.authenticate()
  .then(() => console.log("Databse connection successful"))
  .catch((error) => console.log("Connection error: ", error));

app.listen(process.env.PUERTO, () => {
  console.log(`escuchando en http://localhost:${process.env.PUERTO}`);
});

app.use("/sugerencias", SugerenciaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/productos", productoRoutes);
app.use("/compras", compraRoutes);
app.use("/recuperar-contrasena", recuperarContrasenaRoutes);
