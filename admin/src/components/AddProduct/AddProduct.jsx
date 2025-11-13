import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {
  const [image, setImage] = useState(false);
  const [productDetails, setProductDetails] = useState({
    name: "",
    category: "women",
    new_price: "",
    old_price: ""
  });

  // ✅ Get API base URL from environment variable
  const API_URL = process.env.REACT_APP_API_URL;

  // Handle image change
  const imageHandler = (e) => {
    setImage(e.target.files[0]);
  };

  // Handle input change
  const changeHandler = (e) => {
    setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
  };

  // Add product
  const Add_Product = async () => {
    if (!image) {
      alert("Please select an image");
      return;
    }

    try {
      // Step 1: Upload image
      const formData = new FormData();
      formData.append("image", image);

      const uploadRes = await fetch(`${API_URL}upload`, {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (!uploadData.success) {
        alert("Image upload failed");
        return;
      }

      // Step 2: Save product with returned image_url
      const productRes = await fetch(`${API_URL}addproduct`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: productDetails.name,
          old_price: productDetails.old_price,
          new_price: productDetails.new_price,
          category: productDetails.category,
          image: uploadData.image_url,
        }),
      });

      const productData = await productRes.json();

      if (productData.success) {
        alert("✅ Product added successfully!");
        setProductDetails({
          name: "",
          category: "women",
          new_price: "",
          old_price: ""
        });
        setImage(false);
      } else {
        alert("❌ Failed to add product");
      }

    } catch (error) {
      console.error("Error adding product:", error);
      alert("Something went wrong while adding the product");
    }
  };

  return (
    <div className='add-Product'>
      <div className='addproduct-itemfield'>
        <p>Product title</p>
        <input 
          value={productDetails.name} 
          onChange={changeHandler} 
          type="text" 
          name='name' 
          placeholder='Type here' 
        />
      </div>

      <div className='addproduct-price'>
        <div className='addproduct-itemfield'>
          <p>Price</p>
          <input 
            value={productDetails.old_price} 
            onChange={changeHandler} 
            type="text" 
            name='old_price' 
            placeholder='Type here' 
          />
        </div>
        <div className='addproduct-itemfield'>
          <p>Offer Price</p>
          <input 
            value={productDetails.new_price} 
            onChange={changeHandler} 
            type="text" 
            name='new_price' 
            placeholder='Type here' 
          />
        </div>
      </div>

      <div className='addproduct-itemfield'>
        <p>Product Category</p>
        <select 
          value={productDetails.category} 
          onChange={changeHandler} 
          name="category" 
          className='add-product-selector'
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kid">Kid</option>
        </select>
      </div>

      <div className='addproduct-itemfield'>
        <label htmlFor="file-input">
          <img 
            src={image ? URL.createObjectURL(image) : upload_area} 
            className='addproduct-thumnail-img' 
            alt="upload preview" 
          />
        </label>
        <input 
          onChange={imageHandler} 
          type="file" 
          name="image" 
          id="file-input" 
          hidden 
        />
      </div>

      <button onClick={Add_Product} className='addproduct-btn'>ADD</button>
    </div>
  );
};

export default AddProduct;
