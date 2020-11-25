import mongoose from 'mongoose'
import * as scrapper from './scrapping/scrapping'
import cron from 'node-cron'
import config from './config'
mongoose.connect(config.DBCON,({
    useNewUrlParser:true,
    useUnifiedTopology:true,
    keepAlive: true,
    useCreateIndex: true,
    useFindAndModify: false
}))
.then(async (db)=>{
    console.log('database connected');
    cron.schedule("* 5 * * *",async()=>{
        console.log('Cheking new prices on websites.......')
        await scrapper.checkUptadePrices();
        console.log('all sites checked');
    });
})
.catch((error)=>console.log(error));