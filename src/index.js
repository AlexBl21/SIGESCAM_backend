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

dotenv.config({
    path: "../.env"
});

const app = express();
app.use(express.json());

//test conexion bd
db.authenticate()
  .then(() => console.log("Databse connection successful"))
  .catch((error) => console.log("Connection error: ", error));

//funcion para la creación de las tablas 
/*
async function main(){
    try{
        await db.sync({force: true});
        console.log("Tablas creadas exitosamente B)")
    }catch(error){
      console.log(error.message);
    }
  }

  main();*/

app.listen(process.env.PUERTO, () =>{
    console.log(`escuchando en http://localhost:${process.env.PUERTO}`);
});

app.use("/sugerencias", SugerenciaRoutes);
app.use("/usuarios", usuarioRoutes);