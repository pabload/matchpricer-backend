import express from 'express'
import morgan from 'morgan'
import * as dotenv from 'dotenv'
import cors from 'cors'

///enviroment variables
dotenv.config();


///import routes
import productRoutes from './routes/products.routes'
import userRoutes from './routes/auth.routes'

const app = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

app.get('/',(req,res)=>{
    res.json('server is running');
})


app.use('/products',productRoutes);
app.use('/users',userRoutes);

export default app;
