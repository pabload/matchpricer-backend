import sgMail from "@sendgrid/mail"
import config from '../config'
sgMail.setApiKey(config.EMAILKEY);
export const sendEmailMessage = async (productName: string, toEmail: String, urlProduct: string) => {
    const contentHTML:string = `
    <h1>Tu producto:${productName} a cumplido tu condicion</h1>
    <p>visita la tienda ahora mismo</p>
    <a href="${urlProduct}">${productName}</a>
    `;
    const msg:any= {
        to: toEmail, // Change to your recipient
        from: config.EMAIL.toString(), // Change to your verified sender
        subject: 'Tu producto rastreado a cumplido tu condicion',
        text: 'hola de parte de match-pricer',
        html:contentHTML,
    }
    sgMail
        .send(msg)
        .then(() => {
            console.log('Email sent to user')
        })
        .catch((error) => {
            console.error(error)
        })
}