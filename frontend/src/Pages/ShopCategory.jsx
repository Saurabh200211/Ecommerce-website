import React, { useContext } from 'react'
import './CSS/ShopCategory.css'
import { ShopContext } from '../Context/ShopContext'
import nav_dropdown from '../Components/Assets/nav_dropdown.png'
import Item from '../Components/Item/Item'

const ShopCategory = (props) => {
  const {all_product} = useContext(ShopContext);
  return (
    <div className='shop-category'>
      <img src={props.banner} alt="" />
    <div className='shopcategory-indexSort'>
    <p>
      <span>Showing 1-12</span> out of 36 products
    </p>
    <div className='shopcategory-sort'>
   Sort by <img src={nav_dropdown} alt="" />
    </div>
    </div>
    <div className="shopcategory-products">
      {all_product.map((item,i)=>{
        // Check if the category matches exactly or if it's a kids/kid match
        if (props.category === item.category || (props.category === 'kids' && item.category === 'kid') || (props.category === 'kid' && item.category === 'kids')) {
         return <Item key={i} id={item.id} name={item.name} image={item.image} new_price={item.new_price} old_price={item.old_price} />
        }
        else{
          return null;
        }
      })}
    </div>
    </div>
  )
}

export default ShopCategory