import React, { useState, useEffect } from 'react';
import { getProducts } from '../api/products';
import ProductCard from '../components/Products/ProductCard';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await getProducts();
        setProducts(data);
      } catch (err) { 
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="page products-page">
      <h2>Products</h2>
      {loading ? <p>Loading...</p> : <div className="product-grid">{products.map((p) => <ProductCard key={p._id} product={p} />)}</div>}
    </div>
  );
};

export default Products;
