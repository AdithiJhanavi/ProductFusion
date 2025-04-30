

import React, { useState, useEffect } from 'react';

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Fetch products
  useEffect(() => {
    setIsLoading(true);
    fetch('https://fakestoreapi.com/products')
      .then(response => response.json())
      .then(data => {
        setProducts(data);
        setFilteredProducts(data);
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(product => product.category))];
        setCategories(uniqueCategories);
        setIsLoading(false);
      })
      .catch(err => {
        setError('Failed to load products');
        setIsLoading(false);
        console.error(err);
      });
  }, []);
  
  // Filter products when category or search term changes
  useEffect(() => {
    let result = products;
    
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    if (searchTerm) {
      result = result.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchTerm, products]);
  
  // Add to cart
  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      const updatedCart = cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      );
      setCart(updatedCart);
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };
  
  // Remove from cart
  const removeFromCart = (productId) => {
    const updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
  };
  
  // Calculate total price
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };
  
  // Render product cards
  const renderProducts = () => {
    return filteredProducts.map(product => (
      <div key={product.id} className="product-card">
        <img src={product.image} alt={product.title} />
        <h3>{product.title}</h3>
        <p>${product.price}</p>
        <button onClick={() => addToCart(product)}>Add to Cart</button>
      </div>
    ));
  };
  
  // Render cart items
  const renderCartItems = () => {
    return cart.map(item => (
      <div key={item.id} className="cart-item">
        <span>{item.title} x {item.quantity}</span>
        <span>${(item.price * item.quantity).toFixed(2)}</span>
        <button onClick={() => removeFromCart(item.id)}>Remove</button>
      </div>
    ));
  };

  return (
    <div className="product-page">
      <div className="filters">
        <input 
          type="text" 
          placeholder="Search products..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      
      {isLoading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}
      
      <div className="product-grid">
        {!isLoading && renderProducts()}
      </div>
      
      <div className="cart">
        <h2>Shopping Cart</h2>
        {cart.length === 0 ? (
          <p>Your cart is empty</p>
        ) : (
          <>
            {renderCartItems()}
            <div className="cart-total">
              <strong>Total: ${calculateTotal()}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPage;