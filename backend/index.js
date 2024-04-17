const port = 4000;
//imports
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const jwt = require('jsonwebtoken');


const app = express();
//express and nodejs

const path = require('path');
const cors = require('cors');

const corsOptions = {
  origin: "http://localhost:3000",
};

app.use(express.json());

app.use(cors());

//Database with MongoDB

async function createConnection(){
    const ret = await mongoose.connect('mongodb+srv://alihannashtaj:S7Nprs72gmNw4OOo@cluster0.jdf9zkf.mongodb.net/qozha');
    return ret;
}

createConnection()
//API Creation
//Secure Cluster Password: S7Nprs72gmNw4OOo

app.get("/",(req,res)=>{
    res.send("Express App is running!");
})

const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req,file, cb)=>{
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({storage:storage});

app.use('/images', express.static('upload/images'));


app.post('/upload',upload.single('product'),(req,res)=>{
    console.log(req.file);
    res.json({
        success:1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
})

//Schema for product creating
const productFields = {
    id:{
        type: Number
    },
    name: {
        type: String
    },
    image_url:{
        type: String
    },
    category: {
        type: String
    },
    new_price: {
        type: Number
    },
    old_price: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    },
}
//Adding required property for required fields
const requiredProductFields = ["id","name","image_url","category","new_price","old_price"];
for (const requiredField of requiredProductFields){
    productFields[requiredField].required = true;
}

const Product = mongoose.model("Product", productFields);

app.post('/addproduct',async (req,res)=>{
    const products = await Product.find({});

    let id;
    if (products.length>0){
        let last_product = products[products.length-1];
        id = last_product.id+1;
    }else{
        id = 1;
    }
    
    const product = new Product({
        id: id,
        name: req.body.name,
        image_url: req.body.image,
        category: req.body.category,
        old_price: req.body.old_price,
        new_price: req.body.new_price
    })
    
    await product.save();
    console.log('New Product added!');
    res.json({
        success: true, 
        name: req.body.name
    })
})

//Creating API for uploading product

app.post('/updateproduct',async (req,res)=>{
    const productId = req.body.productId;
    const {name, category, old_price, new_price} = req.body;

    await Product.findOneAndUpdate({id:productId},{name, category, old_price, new_price});
    res.send({success:1, message: "Updated the product data!"});

})

//Creating API for removing product

app.post('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id})

    console.log('Removed');
    res.json({
        success: true, 
        name: req.body.name
    })
})
//Creating API for getting all products
app.get('/allproducts',async (req,res)=>{
    const products = await Product.find({});
    console.log('All Products Fetched');
    res.send(products);
})

//Creating User schema

const userFields = {
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cartData: {
        type: Object
    },
    date: {
        type: Date,
        default: Date.now
    }
}

const User = mongoose.model('User', userFields);

//Creating endpoint for user registration

app.post('/signup', async (req,res)=>{
    const email = req.body.email;
    let user = await User.findOne({email});
    if (user){
        return res.status(400).json({success:false, message: 'Existing user with the same email was found'});
    }
    let cart = {};
    for (let i=0;i<300;i++){
        cart[i] = 0;
    }

    user = new User({
        name: req.body.username,
        email: req.body.email,
        password: req.body.password,
        cartData: cart
    });

    await user.save();

    const userData = {
        user:{
            id: user.id
        }
    }

    const token = jwt.sign(userData, 'secret_key');

    res.json({success:true, token});


});

//Creating endpoint for user login

app.post('/login', async (req,res)=>{
    const email = req.body.email;
    let user = await User.findOne({email});
    if (!user){
        return res.status(400).json({success: false, message: 'No user with such email was registered!'});
    }
    console.log(req.body.password, user.password);
    
    if (req.body.password===user.password){
        const userData = {
            user: {id:user.id}
        }
        const token = jwt.sign(userData, 'secret_key');

        res.json({success:true, token});
    }else{
        res.json({success:false, message: 'Wrong password baby!'})
    }
    
})
//Creating endpoint for new collections

app.get('/newcollections', async (req,res)=>{
    let products = await Product.find({});
    console.log(products)
    let newCollections = products.slice(-8);
    console.log("New Collections");

    res.send(newCollections);
})

//Creating endpoint for popular in women section

app.get('/popularinwomen', async (req,res)=>{
    let products = await Product.find({category: 'women'});
    let populars = products.slice(0,4);
    res.send(populars);
});

//Creating endpoint to add product to cartData

app.post('/addtocart', async (req,res,next)=>{
    const token = req.header('auth-token');
    console.log('added')
    if (!token){
        res.status(401).send({errors:"Please authenticate first."})
    }else{
        
        try{
            const data = jwt.verify(token, 'secret_key');
            req.user = data.user;
            next();
        }catch (error){
            res.status(401).send({errors: "Please authenticate first."})
        }
    }
},async (req,res)=>{
    const userId = req.user.id;
    let userData = await User.find({_id:userId});
    
    const cartData = userData[0].cartData;
    cartData[req.body.itemId] += 1;
    await User.findOneAndUpdate({_id:userId}, {cartData:cartData});
    res.send({success: true, message: 'Added'});
})

app.post('/removefromcart', (req,res,next)=>{
    const token = req.header('auth-token');
    console.log('removed')
    if (!token){
        res.status(401).send({errors:"Please authenticate first."});
    }else{
        try{
            const data = jwt.verify(token, 'secret_key');
            req.user = data.user;
            next();
        }catch (error){
            res.status(401).send({errors: "Please authenticate first."})
        }
    }
}, async (req,res)=>{
    const userId = req.user.id;
    const productId = req.body.itemId;

    const userData = await User.find({_id:userId});
    const cartData = userData[0].cartData;
    cartData[productId] = 0;

    await User.findOneAndUpdate({_id:userId}, {cartData:cartData});
    res.send({success: true, message: 'Removed'});
});

app.post('/decreasefromcart', (req,res,next)=>{
    const token = req.header('auth-token');
    console.log('decrease');
    
    if (!token){
        res.status(401).send({errors:"Please authenticate first."});
    }else{
        try{
            const data = jwt.verify(token, 'secret_key');
            req.user = data.user;
            next();
        }catch (error){
            res.status(401).send({errors: "Please authenticate first."})
        }
    }
}, async (req,res)=>{
    const productId = req.body.itemId;
    const userId = req.user.id;

    const userData = await User.find({_id:userId});
    const cartData = userData[0].cartData;
    cartData[productId] -= 1;
    await User.findOneAndUpdate({_id:userId}, {cartData:cartData});
    res.send({success:true, message: 'Decreased'});
});

//Creating endpoint to get cart data for the user

app.get('/getcart', (req,res,next)=>{
    const token = req.header('auth-token');

    if (!token){
        res.status(401).send("Please login first");
    }else{
        try{
            const data = jwt.verify(token, 'secret_key');
            req.user = data.user;
            next();
        }catch (error){
            res.status(401).send("Please login first");
        }
    }
}, async (req,res)=>{
    const userId = req.user.id;

    const userData = await User.find({_id:userId});
    const cartData = userData[0].cartData;

    res.send(cartData);
});

app.listen(port, (error)=>{
    if (!error){
        console.log('Server is running!');
    }else{
        console.log("Error "+ error);
    }
});



