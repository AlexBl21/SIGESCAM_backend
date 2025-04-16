import express from "express";
import dotenv from "dotenv";
import db from "./db/db.js";
import Rol from "./models/Rol.js";
import UsuarioRol from "./models/UsuarioRol.js";
import Usuario from "./models/Usuario.js";
import Abono from "./models/Abono.js";
import Deudor from "./models/Deudor.js";
import Venta from "./models/Venta.js";
import DetalleVenta from "./models/DetalleVenta.js";
import Producto from "./models/Producto.js";
import Categoria from "./models/Categoria.js";
 
dotenv.config({
    path: "../.env"
});

const app = express();

//test conexion bd
db.authenticate()
  .then(() => console.log("Databse connection successful"))
  .catch((error) => console.log("Connection error: ", error));

//funcion para la creación de las tablas 
async function main(){
    try{
        await db.sync({alter: true});
        console.log("Tablas creadas exitosamente B)")
    }catch(error){
      console.log(error.message);
    }
  }

  main();

app.listen(process.env.PUERTO, () =>{
    console.log(`escuchando en http://localhost:${process.env.PUERTO}`);
});