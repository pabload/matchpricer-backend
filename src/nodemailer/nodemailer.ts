import nodemailer from 'nodemailer'
import config from '../config'
const transporter = nodemailer.createTransport({
    host: 'smtp.live.com',
    port: 587,
    auth: {
        user: config.EMAIL,
        pass: config.PASS
    }
});
export const sendEmail = (productName:string,toEmail: String, urlProduct: string) => {
    const contentHTML = `
    <h1>Tu producto:${productName} a cumplido tu condicion</h1>
    <p>visita la tienda ahora mismo</p>
    <a href="${urlProduct}">${productName}</a>
    `;
    const mailOptions = {
        from: `"Match pricer" <${config.EMAIL}>`, // sender address (who sends)
        to: toEmail.toString(), // list of receivers (who receives)
        subject: 'Tu producto rastreado a cumplido tu condicion', // Subject line
        html: contentHTML // html body
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
}