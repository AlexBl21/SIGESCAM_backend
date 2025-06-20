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
import CategoriaRoutes from "./routes/CategoriaRoutes.js";
import productoRoutes from "./routes/ProductoRoutes.js";
import recuperarContrasenaRoutes from "./routes/RecuperarContrasenaRoutes.js";
import cors from "cors";
import notifiUsuarioRoutes from "./routes/NotificacionUsuarioRoutes.js";
import preferenciaNotificacionRoutes from "./routes/PreferenciaNotiRoutes.js";
import ventaRoutes from "./routes/VentaRoutes.js";
import DeudorRoutes from "./routes/DeudorRoutes.js";
import os from "os";

dotenv.config({
  path: "../.env"
});

const app = express();
app.use(express.json());
//app.use(express.json());

app.use(
  cors({
    origin: "*",
  })
);

app.use("/categorias", CategoriaRoutes);

//test conexion de la bd
db.authenticate()
  .then(() => console.log("Databse connection successful"))
  .catch((error) => console.log("Connection error: ", error));
/*
app.listen(process.env.PUERTO, () => {
  console.log(`escuchando en http://localhost:${process.env.PUERTO}`);
});*/


/*
//funcion para la creación de las tablas 
async function main(){
    try{
        await db.sync({force: true});
        console.log("Tablas creadas exitosamente B)")
    }catch(error){
      console.log(error.message);
    }
  }

  main();
*/

app.use("/sugerencias", SugerenciaRoutes);
app.use("/usuarios", usuarioRoutes);
app.use("/login", loginRoutes);
app.use("/productos", productoRoutes);
app.use("/compras", compraRoutes);
app.use("/recuperar-contrasena", recuperarContrasenaRoutes);
app.use("/notificaciones", notifiUsuarioRoutes);
app.use("/preferenciaNotificacion", preferenciaNotificacionRoutes);
app.use("/ventas", ventaRoutes);
app.use("/deudores", DeudorRoutes);

//import UsuarioService from "./services/UsuarioService.js";
//UsuarioService.listarGestoras();
//VentaService.verificarStock();
//import UsuarioService from "./services/UsuarioService.js";
//const preferencia = await UsuarioService.crearPreferencia("0819", 1);
/*
try {
  const preferencia = await PreferenciaNotificacionService.saberPreferencia("333333", 1);
  if (preferencia != null) {
    console.log("Preferencia encontrada:", preferencia);
  } else {
    console.log("No se encontró preferencia."); // 
  }
} catch (error) {
  console.error("Ocurrió un error al obtener la preferencia:", error.message);
}*/
/*
import DeudorService from "./services/DeudorService.js";

const d= await DeudorService.listarDeudores();
if(d){
  console.log(d);
}else{
  console.log("No hay deudores");
}*/

const interfaces = os.networkInterfaces();
let localIP = 'localhost'; // fallback

for (let name in interfaces) {
  for (let iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal && iface.address.startsWith('192.168')) {
      localIP = iface.address;
    }
  }
}
const port = process.env.PUERTO;
app.listen(port, '0.0.0.0', () => {
  console.log(`API escuchando en:`);
  console.log(`Localhost: http://localhost:${port}`);
  console.log(`Red local: http://${localIP}:${port}`);})