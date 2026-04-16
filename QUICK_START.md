# Quick Start: Using the Frontend-Backend Sync

## 🚀 What's Already Done for You

✅ UserContext - Global user state management  
✅ Authentication - Login/Register with backend validation  
✅ All API Services - Ready to use in components  
✅ Survey Form - Connected to backend  
✅ Protected Routes - Automatic redirects  
✅ JWT Token Management - Automatic with Axios  

## 📖 How to Access User Data

### Step 1: Import the Hook
```javascript
import { useUser } from '../context/UserContext';
```

### Step 2: Use in Your Component
```javascript
const MyComponent = () => {
  const { user, loading, isAuthenticated } = useUser();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <div>Not logged in</div>;
  
  return <div>Hello, {user.username}!</div>;
};
```

### Step 3: Available Properties from useUser()
```javascript
const {
  user,              // { _id, username, email, role }
  loading,           // boolean - true while initializing
  error,             // string - error message if any
  login,             // function - set user after login
  register,          // function - set user after register
  logout,            // async function - logout user
  updateProfile,     // function - update user data
  isAuthenticated    // boolean - true if user is logged in
} = useUser();
```

## 📡 How to Fetch Data from Backend

### Example 1: Fetch Matches
```javascript
import { getMatches } from '../api/matches';

useEffect(() => {
  const loadMatches = async () => {
    try {
      const response = await getMatches();
      if (response.success) {
        setMatches(response.matches);  // or response.data
      }
    } catch (error) {
      setError(error.message);
    }
  };
  
  loadMatches();
}, []);
```

### Example 2: Save Survey Data
```javascript
import { saveSurvey } from '../api/surveys';
import { useUser } from '../context/UserContext';

const handleSubmit = async (surveyData) => {
  try {
    const response = await saveSurvey(surveyData);
    if (response.success) {
      updateProfile(response.survey); // Update global state
      navigate('/matches');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Example 3: Add Item to Cart
```javascript
import { addToCart } from '../api/cart';

const handleAddToCart = async (productId, quantity) => {
  try {
    const response = await addToCart(productId, quantity);
    if (response.success) {
      setCart(response.data); // Update local cart state
      showSuccess('Added to cart!');
    }
  } catch (error) {
    setError('Failed to add to cart');
  }
};
```

## 🔌 All Available API Endpoints

### Authentication
```javascript
import { login, register, logout, getCurrentUser } from '../api/auth';

await login('email@example.com', 'password');
await register('username', 'email@example.com', 'password');
await logout();
await getCurrentUser();  // Called automatically on app load
```

### Survey/Profile
```javascript
import { saveSurvey, getSurvey, getUserSurvey, deleteSurvey } from '../api/surveys';

await saveSurvey({ major: 'CS', year: 'Senior', ... });
await getSurvey();  // Get current user's survey
await getUserSurvey(userId);  // Get specific user's survey
await deleteSurvey();
```

### Products & Shopping
```javascript
import { getProducts, getProduct } from '../api/products';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../api/cart';
import { createOrder, getUserOrders, getOrderById } from '../api/orders';

await getProducts('category');
await getProduct(productId);

await getCart();
await addToCart(productId, quantity);
await updateCartItem(productId, newQuantity);
await removeFromCart(productId);
await clearCart();

await createOrder({ street: '123 Main St', ... }, 'creditCard');
await getUserOrders();
await getOrderById(orderId);
```

### Matching & Profiles
```javascript
import { getMatches, getUserProfile, updateUserProfile } from '../api/matches';

await getMatches();  // Get match recommendations
await getUserProfile(userId);  // Get specific user profile
await updateUserProfile({ major: 'CS', ... });
```

### Chatrooms
```javascript
import { getAllChatrooms, getChatroom, createChatroom, joinChatroom, leaveChatroom } from '../api/chatrooms';

await getAllChatrooms();
await getChatroom(chatroomId);
await createChatroom('Room Name', 'Description', '#09A6AD');
await joinChatroom(chatroomId);
await leaveChatroom(chatroomId);
```

### Messages
```javascript
import { getMessages, sendMessage, deleteMessage } from '../api/messages';

await getMessages(chatroomId, 50);
await sendMessage(chatroomId, 'Hello!');
await deleteMessage(messageId);
```

### Posts in Chatrooms
```javascript
import { getPosts, createPost, likePost, addComment, deletePost } from '../api/chatroomPosts';

await getPosts(chatroomId, 50);
await createPost(chatroomId, 'Post content');
await likePost(postId);
await addComment(postId, 'Comment text');
await deletePost(postId);
```

## ✅ Response Format

All API calls return responses like:
```javascript
{
  success: true,
  message: "Success message",
  data: { /* actual data */ },
  // OR specific keys like:
  user: { },
  matches: [ ],
  survey: { },
  cart: { },
  order: { },
  orders: [ ]
}
```

## 🔐 Authentication Flow

1. ✅ User logs in → `login(email, password)`
2. ✅ Backend validates → Returns user + JWT token
3. ✅ Frontend stores token in cookie (automatic)
4. ✅ UserContext stores user globally
5. ✅ All future API calls include JWT token (automatic)
6. ✅ Backend validates token on each request
7. ✅ User data associated with that token/user

## 🧪 Testing

### Test Authentication
```javascript
// Manual test in browser console:
localStorage.getItem('user');  // Won't show but token is in cookies
document.cookie;  // Should show 'token=...'

// Check Network tab in DevTools
// All requests should have Authorization header
```

### Test Data Persistence
1. Login as user
2. Complete survey
3. Refresh page - user should still be logged in
4. Go to matches - survey data should be there
5. Logout
6. Refresh page - should be redirected to login

## 🐛 Debugging

### Check User State
```javascript
const { user, isAuthenticated, loading } = useUser();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);
console.log('Loading:', loading);
```

### Check API Request/Response
```javascript
const response = await getMatches();
console.log('Full Response:', response);
console.log('Success:', response.success);
console.log('Data:', response.data || response.matches);
```

### Check Network
DevTools → Network → Check any API call → Headers tab
- Should see `Cookie: token=...` in request headers
- Response should have user data

## 📚 File Reference

| File | Purpose |
|------|---------|
| `src/context/UserContext.js` | Global user state |
| `src/App.js` | Wraps app with UserProvider |
| `src/pages/Login.js` | Login form |
| `src/pages/Register.js` | Registration form |
| `src/pages/Survey.js` | Survey form (connected) |
| `src/api/auth.js` | Authentication endpoints |
| `src/api/surveys.js` | Survey endpoints |
| `src/api/products.js` | Product endpoints |
| `src/api/cart.js` | Cart endpoints |
| `src/api/orders.js` | Order endpoints |
| `src/api/matches.js` | Matches endpoints |
| `src/api/chatrooms.js` | Chatroom endpoints |
| `src/api/messages.js` | Message endpoints |
| `src/api/chatroomPosts.js` | Post endpoints |

## 💡 Pro Tips

1. **Always wrap data fetching in useEffect with isAuthenticated check**
   ```javascript
   useEffect(() => {
     if (!isAuthenticated) return;  // Don't fetch if not logged in
     loadData();
   }, [isAuthenticated]);
   ```

2. **Always check response.success before using data**
   ```javascript
   const response = await getMatches();
   if (response.success) {
     setMatches(response.data);
   } else {
     setError(response.message);
   }
   ```

3. **Update UserContext when user data changes**
   ```javascript
   const { updateProfile } = useUser();
   // After successful save:
   updateProfile(responseData);  // This updates global state
   ```

4. **Use console logs for debugging**
   ```javascript
   console.log('✅ Success');     // Green checkmark
   console.log('❌ Error');        // Red X
   console.log('📤 Loading...');   // Arrow up
   console.log('📥 Response:', response);  // Arrow down
   ```

## 🎯 Next Component to Update

Pick any component from this list and update it following the templates:
- [ ] Home.js
- [ ] Matches.js
- [ ] Posts.js
- [ ] ChatRoom.js
- [ ] Products.js
- [ ] Cart.js

Need help? Check `COMPONENT_TEMPLATES.md` for ready-to-use templates!
