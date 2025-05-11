import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function enviarCorreo(destinatario, asunto, mensaje) {
  try {
    const mailOptions = {
      from: `"Soporte Variedades Carmencita" <sigescam.variedadescarmencita@gmail.com>`,
      to: destinatario,
      subject: asunto,
      html: mensaje,
    };

    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    console.error("Error al enviar el correo:", error);
    throw error;
  }
}
