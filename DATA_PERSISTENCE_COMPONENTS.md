# 🔧 Data Persistence - Component Refactoring Examples

## Current Issues & Fixes

This document shows the current implementations and how to improve them for better data persistence and real-time reflection.

---

## Issue 1: Survey.js - Navigation Before Verification

### Current Code
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  // ... validation
  
  setLoading(true);
  setError(null);

  try {
    console.log('📤 Saving survey data...');
    const response = await saveSurvey(formData);
    
    if (response.success) {
      console.log('✅ Survey saved successfully');
      updateProfile(response.survey);
      
      // Navigate immediately - what if something fails?
      if (isRoommateSection || isStudySection) {
        navigate('/profile');
      } else {
        navigate('/matches');
      }
    } else {
      setError(response.message || 'Failed to save survey');
    }
  } catch (error) {
    console.error('Survey error:', error);
    setError(error.response?.data?.message || 'Failed to save. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

### ✅ Improved Code
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validation based on section
  if (isRoommateSection) {
    if (!formData.sleepSchedule || !formData.cleanliness || /* ... */) {
      setError('Please fill in all roommate preference fields');
      return;
    }
  } else if (isStudySection) {
    if (!formData.currentClasses || !formData.studyGoals || /* ... */) {
      setError('Please fill in all study preference fields');
      return;
    }
  } else {
    if (!formData.major || !formData.year || !formData.experience) {
      setError('Please fill in all required fields');
      return;
    }
    if (formData.interests.length === 0) {
      setError('Please select at least one area of interest');
      return;
    }
  }

  try {
    setLoading(true);
    setError(null);
    console.log('📤 Saving survey data...');
    
    const response = await saveSurvey(formData);
    
    // ✅ Verify success BEFORE navigation
    if (response.success && response.survey) {
      console.log('✅ Survey saved successfully:', response.survey);
      
      // ✅ Update context with server response
      updateProfile(response.survey);
      
      // ✅ Only navigate after confirmed save
      setTimeout(() => {
        if (isRoommateSection || isStudySection) {
          navigate('/profile');
        } else {
          navigate('/matches');
        }
      }, 500);  // Brief delay to show success message
      
    } else {
      // ❌ Save failed - stay on page and show error
      setError(response.message || 'Failed to save survey. Please try again.');
    }
  } catch (error) {
    console.error('Survey save error:', error);
    
    // ✅ Show user-friendly error
    const errorMsg = error.response?.data?.message 
      || error.message 
      || 'Failed to save survey. Please check your connection and try again.';
    setError(errorMsg);
    
    // ✅ Attempt to restore state from server
    try {
      console.log('Attempting to restore survey data...');
      const response = await getSurvey();
      if (response.success && response.survey) {
        setFormData(prev => ({
          ...prev,
          ...response.survey
        }));
        console.log('✅ Survey restored from server');
      }
    } catch (restoreError) {
      console.error('Could not restore survey:', restoreError);
    }
  } finally {
    setLoading(false);
  }
};
```

**Key Improvements:**
- ✅ Verify success before navigation
- ✅ Show error and stay on page if save fails
- ✅ Attempt to restore data from server if save fails
- ✅ Better error messages for users
- ✅ Proper loading state management

---

## Issue 2: Cart.js - Missing Error Recovery

### Current Code
```javascript
const handleQuantityChange = async (productId, quantity) => {
  try {
    const response = await updateCartItem(productId, quantity);
    setCart(response.data);  // What if response doesn't have data?
  } catch (error) {
    setError('Failed to update cart');  // Silent failure if setCart errors
  }
};

const handleRemoveItem = async (productId) => {
  try {
    const response = await removeFromCart(productId);
    setCart(response.data);
  } catch (error) {
    setError('Failed to remove item from cart');
  }
};
```

### ✅ Improved Code
```javascript
const [cart, setCart] = useState(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);
const [message, setMessage] = useState(null);

// Load cart on mount
useEffect(() => {
  const fetchCart = async () => {
    try {
      setError(null);
      console.log('📦 Loading cart...');
      const response = await getCart();
      
      if (response.success && response.data) {
        setCart(response.data);
        console.log('✅ Cart loaded');
      } else {
        setError(response.message || 'Failed to load cart');
      }
    } catch (error) {
      console.error('Cart load error:', error);
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  fetchCart();
}, []);

// ✅ Improved quantity change with error recovery
const handleQuantityChange = async (productId, quantity) => {
  // Validate quantity
  if (quantity < 0) {
    setError('Quantity cannot be negative');
    return;
  }

  const previousCart = cart;  // For rollback
  
  try {
    setError(null);
    console.log(`📝 Updating cart item - product: ${productId}, qty: ${quantity}`);
    
    const response = await updateCartItem(productId, quantity);
    
    if (response.success && response.data) {
      setCart(response.data);
      setMessage('Cart updated');
      setTimeout(() => setMessage(null), 2000);
      console.log('✅ Cart item updated');
    } else {
      // ❌ Update failed - restore previous state
      setCart(previousCart);
      setError(response.message || 'Failed to update cart');
    }
  } catch (error) {
    console.error('Update cart error:', error);
    
    // ❌ Error occurred - restore previous state
    setCart(previousCart);
    setError(error.response?.data?.message || 'Failed to update cart');
    
    // ✅ Attempt to recover by refetching
    try {
      console.log('Refetching cart to restore consistency...');
      const response = await getCart();
      if (response.success && response.data) {
        setCart(response.data);
        setError('Cart updated. Please try again.');
      }
    } catch (refetchError) {
      console.error('Could not refetch cart:', refetchError);
      setError('Connection lost. Please refresh the page.');
    }
  }
};

// ✅ Improved remove with confirmation and recovery
const handleRemoveItem = async (productId) => {
  // Show confirmation
  if (!window.confirm('Remove this item from your cart?')) {
    return;
  }

  const previousCart = cart;  // For rollback
  
  try {
    setError(null);
    console.log(`🗑️  Removing item from cart - product: ${productId}`);
    
    const response = await removeFromCart(productId);
    
    if (response.success && response.data) {
      setCart(response.data);
      setMessage('Item removed from cart');
      setTimeout(() => setMessage(null), 2000);
      console.log('✅ Item removed from cart');
    } else {
      // ❌ Remove failed
      setCart(previousCart);
      setError(response.message || 'Failed to remove item');
    }
  } catch (error) {
    console.error('Remove from cart error:', error);
    
    // ❌ Error occurred
    setCart(previousCart);
    setError(error.response?.data?.message || 'Failed to remove item');
    
    // ✅ Attempt to recover
    try {
      console.log('Refetching cart to restore consistency...');
      const response = await getCart();
      if (response.success && response.data) {
        setCart(response.data);
        setError('Item still in cart. Please try again.');
      }
    } catch (refetchError) {
      console.error('Could not refetch cart:', refetchError);
      setError('Connection lost. Please refresh the page.');
    }
  }
};

// Add to cart function
const handleAddToCart = async (productId, quantity = 1) => {
  try {
    setError(null);
    console.log(`➕ Adding to cart - product: ${productId}, qty: ${quantity}`);
    
    const response = await addToCart(productId, quantity);
    
    if (response.success && response.data) {
      setCart(response.data);
      setMessage('Added to cart!');
      setTimeout(() => setMessage(null), 2000);
      console.log('✅ Added to cart');
    } else {
      setError(response.message || 'Failed to add to cart');
    }
  } catch (error) {
    console.error('Add to cart error:', error);
    setError(error.response?.data?.message || 'Failed to add to cart');
  }
};
```

**Key Improvements:**
- ✅ Validate input before API call
- ✅ Store previous state for rollback
- ✅ Show confirmation for destructive actions
- ✅ Update state with response data
- ✅ Rollback on error
- ✅ Refetch to restore consistency
- ✅ Show user-friendly messages
- ✅ Proper error messages

---

## Issue 3: Matches.js - No Data Update Handling

### Current Code
```javascript
const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const response = await getMatches();
        if (response.success) {
          setMatches(response.data);
        } else {
          setError('Failed to load matches');
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError('An error occurred while loading matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // No action handlers - just displays data
  
  return (/* render */);
};
```

### ✅ Improved Code
```javascript
const Matches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // ✅ Load matches on component mount
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setError(null);
        console.log('👥 Fetching matches...');
        setLoading(true);
        
        const response = await getMatches();
        
        if (response.success && response.data) {
          setMatches(response.data);
          console.log('✅ Matches loaded:', response.data.length);
        } else {
          setError(response.message || 'Failed to load matches');
        }
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(err.response?.data?.message || 'Failed to load matches');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

  // ✅ Refresh matches
  const handleRefresh = async () => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await getMatches();
      if (response.success && response.data) {
        setMatches(response.data);
        setMessage('Matches refreshed');
        setTimeout(() => setMessage(null), 2000);
      } else {
        setError(response.message || 'Failed to refresh');
      }
    } catch (err) {
      setError('Failed to refresh matches');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Accept match (example action)
  const handleAcceptMatch = async (matchId) => {
    try {
      setActionLoading(true);
      setError(null);
      console.log(`✅ Accepting match: ${matchId}`);
      
      // Call API to accept match
      const response = await acceptMatch(matchId);
      
      if (response.success) {
        // ✅ Remove from matches list
        setMatches(prev => prev.filter(m => m._id !== matchId));
        setMessage('Match accepted!');
        setTimeout(() => setMessage(null), 2000);
      } else {
        setError(response.message || 'Failed to accept match');
      }
    } catch (error) {
      console.error('Accept match error:', error);
      setError('Failed to accept match');
    } finally {
      setActionLoading(false);
    }
  };

  // ✅ Skip match (example action)
  const handleSkipMatch = async (matchId) => {
    try {
      setActionLoading(true);
      setError(null);
      console.log(`⏭️  Skipping match: ${matchId}`);
      
      // Call API to skip match
      const response = await skipMatch(matchId);
      
      if (response.success) {
        // ✅ Remove from matches list
        setMatches(prev => prev.filter(m => m._id !== matchId));
        setMessage('Match skipped');
        setTimeout(() => setMessage(null), 2000);
      } else {
        setError(response.message || 'Failed to skip match');
      }
    } catch (error) {
      console.error('Skip match error:', error);
      setError('Failed to skip match');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="matches-page">
      <h1>Your Matches</h1>
      
      {error && (
        <div className="error">
          {error}
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      )}
      
      {message && <div className="message">{message}</div>}
      
      {loading ? (
        <div className="loading">Loading matches...</div>
      ) : matches.length === 0 ? (
        <div className="no-matches">
          <p>No matches found.</p>
          <button onClick={handleRefresh}>Refresh</button>
        </div>
      ) : (
        <>
          <div className="matches-grid">
            {matches.map(match => (
              <div key={match._id} className="match-card">
                <h3>{match.username}</h3>
                <p>{match.major} - Year {match.year}</p>
                <p className="compatibility">
                  Compatibility: {Math.round(match.compatibilityScore)}%
                </p>
                
                <div className="actions">
                  <button 
                    onClick={() => handleSkipMatch(match._id)}
                    disabled={actionLoading}
                  >
                    Skip
                  </button>
                  <button 
                    onClick={() => handleAcceptMatch(match._id)}
                    disabled={actionLoading}
                    className="accept"
                  >
                    {actionLoading ? 'Processing...' : 'Connect'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <button onClick={handleRefresh} className="refresh-btn">
            Load More Matches
          </button>
        </>
      )}
    </div>
  );
};

// ✅ Add these API functions to src/api/matches.js
export const acceptMatch = async (matchId) => {
  try {
    console.log('API: Accepting match', matchId);
    const response = await axios.post(`${API_URL}/accept/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Accept match error:', error);
    throw createErrorResponse(error);
  }
};

export const skipMatch = async (matchId) => {
  try {
    console.log('API: Skipping match', matchId);
    const response = await axios.post(`${API_URL}/skip/${matchId}`);
    return response.data;
  } catch (error) {
    console.error('Skip match error:', error);
    throw createErrorResponse(error);
  }
};
```

**Key Improvements:**
- ✅ Proper error handling with recovery options
- ✅ Action handlers for user interactions
- ✅ Update state based on actions
- ✅ User feedback (messages)
- ✅ Refresh functionality
- ✅ Prevent duplicate actions (actionLoading)
- ✅ Remove items from list when action succeeds

---

## General Patterns Applied

### 1. Error Boundaries
```javascript
const [error, setError] = useState(null);
const [message, setMessage] = useState(null);

// Clear error on component mount
useEffect(() => {
  setError(null);
}, []);
```

### 2. Loading States
```javascript
const [loading, setLoading] = useState(false);
const [actionLoading, setActionLoading] = useState(false);

// Always clear in finally block
try {
  setLoading(true);
  // ... API call
} finally {
  setLoading(false);
}
```

### 3. State Recovery
```javascript
const previousState = state;

try {
  // ... operation
} catch (error) {
  setState(previousState);  // Rollback
}
```

### 4. User Feedback
```javascript
const showMessage = (text) => {
  setMessage(text);
  setTimeout(() => setMessage(null), 2000);
};
```

### 5. Verification
```javascript
if (response.success && response.data) {
  updateState(response.data);
} else {
  showError(response.message);
}
```

---

## Summary

To ensure data persistence and real-time reflection:

1. **Always verify API success** before updating UI
2. **Use server response as source of truth**
3. **Provide error recovery** mechanisms
4. **Show loading/success/error states**
5. **Validate before API calls**
6. **Rollback on errors**
7. **Refetch if consistency is questioned**
8. **Set timeouts to clear messages**

These patterns ensure your frontend correctly persists and reflects all data changes from the backend.
