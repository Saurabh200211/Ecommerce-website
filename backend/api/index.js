// ✅ index.js (Ready for Vercel/Render/Railway)
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ✅ Test route
app.get("/", (req, res) => {
  res.send("🚀 E-commerce Backend is running...");
});

// ✅ Image storage engine (local)
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
  },
});
const upload = multer({ storage });

// ✅ Serve static images
app.use("/images", express.static("upload/images"));

// ✅ Upload route
app.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });

  // Use your deployed URL instead of localhost when on Vercel
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;
  res.json({
    success: true,
    image_url: `${baseUrl}/images/${req.file.filename}`,
  });
});

// ✅ Product Schema
const Product = mongoose.model("Product", {
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
app.post("/addproduct", async (req, res) => {
  try {
    const products = await Product.find({});
    const id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
      id,
      name: req.body.name,
      image: req.body.image,
      category: req.body.category,
      new_price: req.body.new_price,
      old_price: req.body.old_price,
    });

    await product.save();
    res.json({ success: true, product });
  } catch (err) {
    console.error("❌ Error saving product:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Remove Product
app.post("/removeproduct", async (req, res) => {
  await Product.findOneAndDelete({ id: req.body.id });
  res.json({ success: true });
});

// ✅ Get All Products
app.get("/allproducts", async (req, res) => {
  const products = await Product.find({});
  res.send(products);
});

// ✅ User Schema
const Users = mongoose.model("Users", {
  name: String,
  email: String,
  password: String,
  cartData: Object,
  date: { type: Date, default: Date.now },
});

// ✅ Signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const check = await Users.findOne({ email: req.body.email });
    if (check) return res.status(400).json({ success: false, errors: "User already exists" });

    let cart = {};
    for (let i = 0; i < 300; i++) cart[i] = 0;

    const user = new Users({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      cartData: cart,
    });

    await user.save();
    const data = { user: { id: user.id } };
    const token = jwt.sign(data, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (err) {
    console.error("❌ Signup error:", err);
    res.status(500).json({ success: false });
  }
});

// ✅ Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const user = await Users.findOne({ email: req.body.email });
    if (user && req.body.password === user.password) {
      const data = { user: { id: user.id } };
      const token = jwt.sign(data, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, errors: "Invalid credentials" });
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false });
  }
});

// ✅ Middleware to fetch user
const fetchUser = async (req, res, next) => {
  const token = req.header("auth-token");
  if (!token) return res.status(401).send({ errors: "Please authenticate" });
  try {
    const data = jwt.verify(token, process.env.JWT_SECRET);
    req.user = data.user;
    next();
  } catch {
    res.status(401).send({ errors: "Invalid token" });
  }
};

// ✅ Cart endpoints
app.post("/addtocart", fetchUser, async (req, res) => {
  const userData = await Users.findById(req.user.id);
  userData.cartData[req.body.itemId] += 1;
  await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
  res.send("Added");
});

app.post("/removefromcart", fetchUser, async (req, res) => {
  const userData = await Users.findById(req.user.id);
  if (userData.cartData[req.body.itemId] > 0)
    userData.cartData[req.body.itemId] -= 1;
  await Users.findByIdAndUpdate(req.user.id, { cartData: userData.cartData });
  res.send("Removed");
});

app.post("/getcart", fetchUser, async (req, res) => {
  const userData = await Users.findById(req.user.id);
  res.json(userData.cartData);
});

// ✅ Collections
app.get("/newcollections", async (req, res) => {
  const products = await Product.find({});
  const newcollection = products.slice(-8);
  res.send(newcollection);
});

app.get("/populariwomen", async (req, res) => {
  const products = await Product.find({ category: "women" });
  res.send(products.slice(0, 4));
});

// ✅ Start Server (for local testing)
const port = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
}

export default app; // ✅ required for Vercel
