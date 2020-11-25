import {Schema,model} from 'mongoose'

const productSchema =new Schema({
    websiteName:String,
    mainurl:String,
    imgurl:String,
    productname:String,
    actualprice:Number,
    olderprices:Array

},{
    timestamps:true,
    versionKey:false
})

export default model('product',productSchema);