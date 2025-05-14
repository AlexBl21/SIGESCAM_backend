import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function enviarSms(telefono, codigo) {
    const mensaje = `Tu código de recuperación para SIGESCAM es: ${codigo}. Este código es válido por 5 minutos.`;
    const telefonoConCodigo = telefono.startsWith('+') ? telefono : `+57${telefono}`;

    try {
        await client.messages.create({
            body: mensaje,
            from: '+19785793071',
            to: '+573507736705'
        });
        console.log(`Código enviado a ${telefono}`);
        return true;
    } catch (error) {
        console.error('Error al enviar SMS:', error);
        throw new Error('No se pudo enviar el SMS');
    }
}
