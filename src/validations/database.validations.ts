import User from '../models/users.model'
import Product from '../models/product.models'
export const isproductNeeded = async (id: String) => {
    let deletedFromDB:boolean=false;
    const number= await User.find(
        {productsontrack :{ $elemMatch: { productid:id} } }
    ).countDocuments()
    if(number==0){
        await Product.deleteOne({ _id:id}).then(()=>{
            console.log('product deleted from collection')
            return deletedFromDB=true;
        })
    }
  
}

