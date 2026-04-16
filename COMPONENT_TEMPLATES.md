// COMPONENT TEMPLATE EXAMPLES
// Use these templates to update frontend components for database synchronization

// ============================================================================
// TEMPLATE 1: Component with UserContext (most use this)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getSomeData } from '../api/someApiFile';

const MyComponent = () => {
  const { user, isAuthenticated } = useUser();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('📤 Loading data...');
        const response = await getSomeData();
        
        if (response.success) {
          console.log('✅ Data loaded');
          setData(response.data);
          setError(null);
        } else {
          console.error('❌ Error:', response.message);
          setError(response.message);
        }
      } catch (err) {
        console.error('❌ Exception:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;
  if (!isAuthenticated) return <div>Not authenticated</div>;

  return (
    <div>
      <p>Welcome, {user.username}!</p>
      {/* Render your data here */}
    </div>
  );
};

export default MyComponent;

// ============================================================================
// TEMPLATE 2: Component with API Call and Form Submit
// ============================================================================

import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import { createSomething } from '../api/someApiFile';

const FormComponent = () => {
  const { user, updateProfile } = useUser();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('📤 Submitting data...');
      const response = await createSomething(formData);
      
      if (response.success) {
        console.log('✅ Data saved');
        setSuccess(true);
        updateProfile(response.data); // Update global user state if needed
        setFormData({ name: '', email: '' }); // Reset form
      } else {
        setError(response.message);
      }
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={formData.name} onChange={handleChange} required />
      <input name="email" value={formData.email} onChange={handleChange} required />
      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : 'Submit'}
      </button>
      {error && <p style={{color: 'red'}}>{error}</p>}
      {success && <p style={{color: 'green'}}>Success!</p>}
    </form>
  );
};

export default FormComponent;

// ============================================================================
// TEMPLATE 3: List Component with Delete/Edit
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import { getItems, deleteItem, updateItem } from '../api/itemsApi';

const ItemsList = () => {
  const { isAuthenticated } = useUser();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await getItems();
        if (response.success) {
          setItems(response.data);
        } else {
          setError(response.message);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, [isAuthenticated]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;

    try {
      const response = await deleteItem(id);
      if (response.success) {
        setItems(items.filter(item => item._id !== id));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEdit = async (id, updatedData) => {
    try {
      const response = await updateItem(id, updatedData);
      if (response.success) {
        setItems(items.map(item => item._id === id ? response.data : item));
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div>
      {items.map(item => (
        <div key={item._id} className="item">
          <h3>{item.name}</h3>
          <button onClick={() => handleDelete(item._id)}>Delete</button>
          <button onClick={() => handleEdit(item._id, {...item, name: 'updated'})}>Edit</button>
        </div>
      ))}
    </div>
  );
};

export default ItemsList;

// ============================================================================
// TEMPLATE 4: Protected Route Component
// ============================================================================

import { Navigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useUser();

  if (loading) return <div className="loading-container">Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return children;
};

export default ProtectedRoute;

// ============================================================================
// COMMON API PATTERNS
// ============================================================================

// Pattern 1: GET data
// const response = await getData();
// if (response.success) { setData(response.data); }

// Pattern 2: POST/CREATE
// const response = await createData(formData);
// if (response.success) { setData([...data, response.data]); }

// Pattern 3: PUT/UPDATE
// const response = await updateData(id, updatedData);
// if (response.success) { setData(data.map(item => item._id === id ? response.data : item)); }

// Pattern 4: DELETE
// const response = await deleteData(id);
// if (response.success) { setData(data.filter(item => item._id !== id)); }

// ============================================================================
// DEBUGGING CHECKLIST
// ============================================================================

// Add to any component to debug:
// const { user, isAuthenticated, loading } = useUser();
// useEffect(() => {
//   console.log('User:', user);
//   console.log('Authenticated:', isAuthenticated);
//   console.log('Loading:', loading);
// }, [user, isAuthenticated, loading]);
