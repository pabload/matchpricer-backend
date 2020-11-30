import User from '../models/users.model'
import nodemailer from 'nodemailer'
//import * as mailer from '../nodemailer/nodemailer'
import * as mailer from '../sendgrid/sendgrind'
import config from '../config';
export const UserNameFound = async (userName: String) => {
    const number = await User.find({ username: userName }).countDocuments();
    return number == 1 ? true : false;
}
export const emailFound = async (email: String) => {
    const number = await User.find({ email: email }).countDocuments();
    return number == 1 ? true : false;
}
export const produtTrackedUser = async (userId: String, productId: string) => {
    const user: any = await User.findById(userId);
    let productFound: boolean = false;
    user.productsontrack.forEach((product: any) => {
        if (product.productid === productId) {
            return productFound = true;
        }
    });
    return productFound;
}
export const productPriceMatch = async (productId: string, newPrice: number,productName:string,urlProduct:string) => {
    const users:any = await User.find(
         { productsontrack: { $elemMatch: { productid: productId } } }
    )
    for (const user of users) {
        for (const { productid, condition, match } of user.productsontrack) {
            if ((productId === productid) && (!match)) {
                const decodedCondition = condition.substr(0, condition.indexOf(','));
                const decodedNumber = parseFloat(condition.split(',')[1])
                switch (decodedCondition) {
                    case "<":
                        if (newPrice < decodedNumber) {
                            await updateTrackedProductMatch(user.id, productId,user.email,productName,urlProduct);
                        }
                        break;
                    case "<=":
                        if (newPrice <= decodedNumber) {
                            await updateTrackedProductMatch(user.id, productId,user.email,productName,urlProduct);
                        }
                        break;
                }
            }
        }
    }
}
export const updateTrackedProductMatch = async (userId: string, productId: string,userEmail:string,productName:string,urlProduct:string) => {
    const infoUpdated = await User.updateOne(
        {
            _id: userId, productsontrack: {
                $elemMatch: {
                    productid: productId
                }
            }
        },
        { "$set": { "productsontrack.$.match": true } },
        async (err, user) => {
            mailer.sendEmailMessage(productName,userEmail,urlProduct);
            console.log("user product matched the condition");
        });
}