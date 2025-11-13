import React, { useEffect, useState } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
  const [allproducts, setAllProducts] = useState([]);

  // ✅ Get API base URL from .env
  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch all products
  const fetchInfo = async () => {
    try {
      const res = await fetch(`${API_URL}allproducts`);
      const data = await res.json();
      setAllProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  // Remove a product
  const remove_product = async (id) => {
    try {
      await fetch(`${API_URL}removeproduct`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });
      await fetchInfo();
    } catch (error) {
      console.error("Error removing product:", error);
    }
  };

  return (
    <div className='list-product'>
      <h1>All Products List</h1>

      <div className='listproduct-format-main'>
        <p>Image</p>
        <p>Title</p>
        <p>Old Price</p>
        <p>New Price</p>
        <p>Category</p>
        <p>Remove</p>
      </div>

      <div className='listproduct-allproducts'>
        <hr />
        {allproducts.map((product, index) => (
          <React.Fragment key={index}>
            <div className='listproduct-format-main listproduct-format'>
              <img 
                src={product.image} 
                alt={product.name} 
                className="listproduct-product-icon" 
              />
              <p>{product.name}</p>
              <p>${product.old_price}</p>
              <p>${product.new_price}</p>
              <p>{product.category}</p>
              <img
                onClick={() => remove_product(product.id || product._id)}
                src={cross_icon}
                alt="remove"
                className="listproduct-remove-icon"
              />
            </div>
            <hr />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ListProduct;
