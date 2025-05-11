import categoriaEntidad from "../models/Categoria.js";
import { NotFoundError, BadRequestError, Conflict, InternalServerError } from "../errors/Errores.js";
import e from "express";

//Mirar si la categoria ya existe
export async function existeCategoria(nombre) {
    return await categoriaEntidad.findOne({
        where: { nombre: nombre }
    });
}