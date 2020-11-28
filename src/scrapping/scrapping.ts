import cheerio = require('cheerio');
import { parse } from 'dotenv/types';
import request = require('request-promise');
import Product from '../models/product.models'
import * as userValidator from '../validations/user.validations'
export const scrapNewProductBestBuy = async (NewProductUrl: string) => {
    const $ = await request({
        uri: NewProductUrl,
        transform: body => cheerio.load(body),
    });
    var rawprice = $('.product-price').text();
    return {
        productname: $(".type-subhead-alt-regular").text(),
        imgurl: $(".primary-image").attr('src'),
        price: parseFloat(rawprice.replace("$", "").replace(",", ""))
    }

}
export const scrapNewProductMercadoLibre = async (NewProductUrl: string) => {
    const $ = await request({
        uri: NewProductUrl,
        transform: body => cheerio.load(body),
    });
    return {
        productname: $('.ui-pdp-title').text(),
        imgurl: $('.ui-pdp-gallery__figure').find($("img")).attr('src'),
        price: parseFloat($('.ui-pdp-price__second-line').find($('meta')).attr('content'))
    }

}
export const scrapNewProductEbay = async (NewProductUrl: string) => {
    const $ = await request({
        uri: NewProductUrl,
        transform: body => cheerio.load(body),
    });
    var productname = $('#itemTitle').text();
    var imgurl = $('#vi_main_img_fs').find($('#vi_main_img_fs_thImg0')).find($('img')).attr('src');
    return {
        productname: productname.replace('Detalles acerca de', "").replace('mostrar título original', "").trim(),
        imgurl: $('#vi_main_img_fs').find($('#vi_main_img_fs_thImg0')).find($('img')).attr('src'),
        price: parseFloat($('#vi-mskumap-none').find($('#prcIsum')).attr('content'))
    }

}
export const checkUptadePrices = async () => {
    try {
        Product.find({}, (err, products) => {
            if (err) { return console.log(err) }
            products.map(product => {
                checkProductPrice(product)
            })
        })
    } catch (error) {
        console.log('ERROR' + error);
    }
}
export const checkProductPrice = async (product: any) => {
    const $ = await request({
        uri: product.toObject().mainurl,
        transform: body => cheerio.load(body),
    });
    let price:number=0;
    switch (product.toObject().websiteName) {
        case 'bestbuy':
            price = parseFloat($('.product-price').text().replace("$", "").replace(",", "")) //+ 1;
            break;
        case 'mercado-libre':
            price = parseFloat($('.ui-pdp-price__second-line').find($('meta')).attr('content')) //-100//Math.floor(Math.random() * 10);
            break;
        case 'ebay':
            price = parseFloat($('#vi-mskumap-none').find($('#prcIsum')).attr('content')) //+ 3;
            break;
    }
    if (product.toObject().actualprice != price) {
        let newOlderPrices:Array<number>=product.toObject().olderprices;
        newOlderPrices.push(product.toObject().actualprice);
        if(newOlderPrices.length>=11){
            newOlderPrices.shift();
        }
        ///alert all users with product the change of price 
        await userValidator.productPriceMatch(product.toObject()._id.toString(),price,product.toObject().actualprice,product.toObject().productname,product.toObject().mainurl);
        ///updates de price from DB
        await Product.findByIdAndUpdate(
            product.toObject()._id,
            {
                actualprice: price,
                olderprices:newOlderPrices,
            },
            { new: true })
        
        return console.log('product price was updated');
    }

}