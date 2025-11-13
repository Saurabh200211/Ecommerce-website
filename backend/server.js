const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');

app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(
  "mongodb+srv://satputesaurabh169_db_user:satsaurabh1234@cluster0.2j1l1ok.mongodb.net/e-commerce?retryWrites=true&w=majority",
  { useNewUrlParser: true, useUnifiedTopology: true }
).then(() => {
  console.log("✅ MongoDB Connected");
}).catch(err => {
  console.error("❌ MongoDB connection error:", err.message);
});

// API Test
app.get('/', (req, res) => {
  res.send('Express App is running');
});

// ✅ Image Storage Engine
const storage = multer.diskStorage({
  destination: './upload/images',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

// ✅ Serve images statically
app.use('/images', express.static('upload/images'));

// ✅ Upload Endpoint (field name must match frontend: "image")
app.post("/upload", upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  res.json({
    success: true,
    image_url: `http://localhost:${port}/images/${req.file.filename}`
  });
});

// ✅ Product Schema
const Product = mongoose.model('Product', {
  id: { type: Number, required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  category: { type: String, required: true },
  new_price: { type: Number, required: true },
  old_price: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  available: { type: Boolean, default: true },
});

// ✅ Add Product
app.post('/addproduct', async (req, res) => {
  try {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image, // image URL must be sent from frontend after /upload
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    console.log("✅ Product saved:", product.name);

    res.json({ success: true, product });
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Remove Product
app.post('/removeproduct', async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  console.log("Removed");
  res.json({ success: true, name: req.body.name });
});

// ✅ Get All Products
app.get('/allproducts', async (req, res) => {
  let products = await Product.find({});
  console.log("All Products Fetched");
  res.send(products);
});

// ✅ User Schema
const Users = mongoose.model('Users', {
  name: { type: String },
  email: { type: String },
  password: { type: String },
  cartData: { type: Object },
  date: { type: Date, default: Date.now },
});

// ✅ Signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    let check = await Users.findOne({ email: req.body.email });
    if (check) {
      return res.status(400).json({ success: false, errors: "User already exists with this email" });
    }

    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const user = new Users({
      name: req.body.name, // ✅ changed from username
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });

    await user.save();

    const data = { user: { id: user.id } };
    const token = jwt.sign(data, 'secret_ecom');
    res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// ✅ Login
app.post('/api/auth/login', async (req, res) => {
  try {
    let user = await Users.findOne({ email: req.body.email });
    if (user) {
      const passCompare = req.body.password === user.password;
      if (passCompare) {
        const data = { user: { id: user.id } };
        const token = jwt.sign(data, 'secret_ecom');
        return res.json({ success: true, token });
      } else {
        return res.json({ success: false, errors: "Wrong Password" });
      }
    } else {
      return res.json({ success: false, errors: "Wrong Email Id" });
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, errors: "Server error" });
  }
});

// creating endpoint for newcollection data
app.get('/newcollections',async(req,res)=>{
  let products = await Product.find({});
  let newcollection = products.slice(1).slice(-8);
  console.log("Newcollection Fetched")
  res.send(newcollection);
})

//creating endpoint fro popular in women  section
app.get('/populariwomen',async (req,res)=>{
  let products = await Product.find({category:"women"});
  let popular_in_women = products.slice(0,4);
  console.log("Popular in women fetched");
  res.send(popular_in_women);
})

// creating middleware to fetch user
const fetchUser = async (req,res,next)=>{
  const token = req.header('auth-token');
  if(!token){
    res.status(401).send({errors:"Please authenticate using valid token"})
  }
  else{
    try{
        const data = jwt.verify(token,'secret_ecom');
        req.user = data.user;
        next();
    }catch(error){
     res.status(401).send({errors:"please authenticate using valid token"})
    }
  }
}

// creating endpoint for adding products in cartdata
app.post('/addtocart',fetchUser,async (req,res)=>{
 console.log("Added",req.body.itemId);
let userData = await Users.findOne({_id:req.user.id});
userData.cartData[req.body.itemId] += 1;
await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
res.send("Added")
})

// creating endpoint for remove products in cartdata
app.post('/removefromcart',fetchUser,async (req,res)=>{
console.log("Removed",req.body.itemId);
let userData = await Users.findOne({_id:req.user.id});
if(userData.cartData[req.body.itemId]>0)
userData.cartData[req.body.itemId] -= 1;
await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
res.send("Removed")
})

// creating endpoint to get cart data
app.post('/getcart',fetchUser,async (req,res)=>{
  console.log("GetCart");
  let userData = await Users.findOne({_id:req.user.id});
  res.json(userData.cartData);
})



// ✅ Start server
app.listen(port, (error) => {
  if (!error) {
    console.log(`🚀 Server Running on Port ${port}`);
  } else {
    console.log("❌ Error :" + error);
  }
});
