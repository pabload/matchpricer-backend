import { Response, Request, NextFunction } from 'express'
import Product from '../models/product.models'
import * as scrapper from '../scrapping/scrapping'
import Jwt from 'jsonwebtoken'
import * as userValidator from '../validations/user.validations'
import * as dbValidator from '../validations/database.validations'
import User from '../models/users.model'
import config from '../config'
export const searchProduct = async (req: any, res: Response) => {
    try {
        const { url, type } = req.body;
        let result: any;
        switch (type) {
            case 'bestbuy':
                result = await scrapper.scrapNewProductBestBuy(url);
                break;
            case 'mercado-libre':
                result = await scrapper.scrapNewProductMercadoLibre(url);
                break;
            case 'ebay':
                result = await scrapper.scrapNewProductEbay(url);
                break;
        }
        if (result.price !== NaN) {
            return res.status(200).json({
                message: 'Product found',
                imgurl: result.imgurl,
                productname: result.productname,
                actualprice: result.price,
            });
        }
        return res.status(401).json({
            status: 'error',
            message: 'error on URL'
        })
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'error on URL'
        })
    }
}
export const trackProduct = async (req: any, res: Response) => {
    try {
        const { url, type, condition, token } = req.body;
        const userInfoToken: any = Jwt.verify(token, config.SECRETTOKEN);
        const existedProduct: any = await Product.find({ mainurl: url });
        if (existedProduct.length === 0) {
            let result: any;
            switch (type) {
                case 'bestbuy':
                    result = await scrapper.scrapNewProductBestBuy(url);
                    break;
                case 'mercado-libre':
                    result = await scrapper.scrapNewProductMercadoLibre(url);
                    break;
                case 'ebay':
                    result = await scrapper.scrapNewProductEbay(url);
                    break;
            }
            const newProduct = new Product({
                websiteName: type,
                mainurl: url,
                imgurl: result.imgurl,
                productname: result.productname,
                actualprice: result.price,
                olderprices: []
            })
            await newProduct.save();
            console.log('new product tracked on DB')
            await User.findByIdAndUpdate(userInfoToken.id, {
                $push:
                    { "productsontrack": { productid: newProduct.id, condition, match: false } }
            })
            return res.status(200).json({
                status: 'sucess',
                message: 'product tracked on your account'
            });
        }
        if (await userValidator.produtTrackedUser(userInfoToken.id, existedProduct[0].id) == false) {
            await User.findByIdAndUpdate(userInfoToken.id, {
                $push:
                    { "productsontrack": { productid: existedProduct[0].id, condition, match: false } }
            })
            return res.status(200).json({
                status: 'success',
                message: 'product tracked on your account'
            });
        }
        res.status(404).json({
            status: 'error',
            message: 'product already tracked on your account'
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: 'error on server'
        });
    }
}


export const gettrackedProducts = async (req: Request, res: Response) => {
    try {
        const { token } = req.body;
        const userInfoToken: any = Jwt.verify(token, config.SECRETTOKEN);
        const { productsontrack }: any = await User.findById(userInfoToken.id);
        let infoPfroducts: Array<any> = [];
        for (const { productid } of productsontrack) {
            let product: any = await Product.findById(productid);
            infoPfroducts.push({
                productid: product.id,
                productname: product.productname,
                imgurl: product.imgurl,
                actualprice: product.actualprice,
            });
        }
        return res.status(200).json({
            status: 'success',
            infoPfroducts
        })

    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: 'error on server'
        });
    }
}
export const gettrackedProductById = async (req: Request, res: Response) => {
    try {
        const { token, id } = req.body
        const userInfoToken: any = Jwt.verify(token, config.SECRETTOKEN);
        const { productsontrack }: any = await User.findById(userInfoToken.id);
        const userInfo = productsontrack.filter((pro: any) => {
            return pro.productid === id
        })
        const product: any = await Product.findById(id);
        const infoProduct = {
            mainurl: product.mainurl,
            productname: product.productname,
            actualprice: product.actualprice,
            imgurl: product.imgurl,
            olderprices: product.olderprices,
            condition: userInfo[0].condition,
            match: userInfo[0].match,
        }
        res.status(200).json({
            status: 'success',
            infoproduct: infoProduct,
        });
    } catch (error) {
        res.status(404).json({
            status: 'error',
            message: 'error on server'
        });
    }
}

export const updateTrackedInfoById = async (req: Request, res: Response) => {
    try {
        const { token, id, condition } = req.body
        const userInfoToken: any = Jwt.verify(token, config.SECRETTOKEN);
        const { productsontrack }: any = await User.findById(userInfoToken.id);
        const infoUpdated = await User.updateOne(
            {
                _id: userInfoToken.id, productsontrack: {
                    $elemMatch: {
                        productid: id
                    }
                }
            },
            {
                "$set": {
                    "productsontrack.$.condition": condition,
                    "productsontrack.$.match":false,
                }
            },
            (err, user) => {
                if (err) {
                    return res.status(404).json({
                        status: 'error',
                        message: err
                    });
                }
                res.status(200).json({
                    status: 'success',
                    message: 'info updated'
                });
                console.log(user);
            });
    } catch (error) {
        res.status(404).json('SERVER ERROR:' + error);
    }
}
export const deleteTrackedProductById = async (req: Request, res: Response) => {
    try {

        const { token, id } = req.body
        const userInfoToken: any = Jwt.verify(token, config.SECRETTOKEN);
        const { productsontrack }: any = await User.findById(userInfoToken.id);
        User.updateOne(
            { _id: userInfoToken.id },
            { $pull: { productsontrack: { productid: id } } },
            (err, user) => {
                if (err) {
                    return res.status(404).json({
                        status: 'error',
                        message: "ERROR ON SERVER"
                    })
                }
                dbValidator.isproductNeeded(id);
                return res.status(200).json({
                    status: 'success',
                    message: 'product deleted'
                });
            });
    } catch (error) {

    }
}