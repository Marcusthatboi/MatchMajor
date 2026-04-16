# Frontend-Backend Integration Guide

## ✅ What Has Been Completed

### 1. GlobalUserContext (User State Management)
- **File**: `src/context/UserContext.js`
- **Features**:
  - Manages user authentication state globally
  - Auto-loads user from backend on app initialization  
  - Provides `useUser()` hook for accessing user data in any component
  - Handles login, logout, registration, and profile updates
  - All user data persists via JWT tokens in cookies

### 2. Updated App.js
- Wraps app with `UserProvider` for global state management
- Uses `useUser()` hook instead of props
- Protected routes automatically redirect unauthenticated users to login
- Supports all features: Home, Survey, Matches, Posts, Chat, Products, Cart, Orders

### 3. Authentication Pages
- **Login.js**: Uses UserContext, validates credentials, redirects to survey
- **Register.js**: Creates new account, validates password, redirects to survey  
- **Navbar.js**: Updated to use UserContext, shows cart link, reflects authentication state

### 4. Survey Integration
- **File**: `src/pages/Survey.js`
- **Features**:
  - Loads existing survey data from backend via `getSurvey()`
  - Saves survey data to backend via `saveSurvey()`
  - Three sections: Basic/Academic, Roommate, Study
  - Updates UserContext after successful save
  - Navigates to appropriate page after save

### 5. Comprehensive API Services
All API files have been created/updated with proper error handling:

#### Authentication (`src/api/auth.js`)
- `login(email, password)` - User login
- `register(username, email, password)` - User registration
- `logout()` - User logout
- `getCurrentUser()` - Get authenticated user

#### Survey (`src/api/surveys.js`)
- `saveSurvey(surveyData)` - Create/update survey
- `getSurvey()` - Get current user's survey
- `getUserSurvey(userId)` - Get specific user's survey
- `deleteSurvey()` - Delete user's survey
- `getAllSurveys()` - Get all surveys (admin)

#### Products (`src/api/products.js`)
- `getProducts(category)` - Get all products with optional filtering
- `getProduct(productId)` - Get single product
- `refreshProducts()` - Refresh product list

#### Cart (`src/api/cart.js`)
- `getCart()` - Get user's cart
- `addToCart(productId, quantity)` - Add item to cart
- `updateCartItem(productId, quantity)` - Update item quantity
- `removeFromCart(productId)` - Remove item from cart
- `clearCart()` - Clear entire cart

#### Orders (`src/api/orders.js`)
- `createOrder(shippingAddress, paymentMethod)` - Create order from cart
- `getUserOrders()` - Get user's order history
- `getOrderById(orderId)` - Get specific order details

#### Matches (`src/api/matches.js`)
- `getMatches()` - Get match recommendations
- `getUserProfile(userId)` - Get specific user's profile
- `updateUserProfile(profileData)` - Update user's profile

#### Chatrooms (`src/api/chatrooms.js`)
- `getAllChatrooms()` - Get all chatrooms
- `getChatroom(chatroomId)` - Get specific chatroom
- `createChatroom(name, description, color)` - Create custom chatroom
- `joinChatroom(chatroomId)` - Join chatroom
- `leaveChatroom(chatroomId)` - Leave chatroom

#### Messages (`src/api/messages.js`)
- `getMessages(chatroomId, limit)` - Get chatroom messages
- `sendMessage(chatroomId, text)` - Send message to chatroom
- `deleteMessage(messageId)` - Delete a message

#### Posts (`src/api/chatroomPosts.js`)
- `getPosts(chatroomId, limit)` - Get posts in chatroom
- `createPost(chatroomId, content)` - Create new post
- `likePost(postId)` - Like/unlike post
- `addComment(postId, text)` - Add comment to post
- `deletePost(postId)` - Delete post

## 🔧 How to Use the Integration

### For Components Using User Data

```javascript
import { useUser } from '../context/UserContext';

const MyComponent = () => {
  const { user, loading, isAuthenticated, logout } = useUser();
  
  if (loading) return <div>Loading...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  
  return <div>Welcome, {user.username}!</div>;
};
```

### For Components Using API Data

```javascript
import { getMatches } from '../api/matches';
import { useUser } from '../context/UserContext';

const MatchesPage = () => {
  const { user } = useUser();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        const response = await getMatches();
        if (response.success) {
          setMatches(response.matches);
        }
      } catch (error) {
        console.error('Error loading matches:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadMatches();
  }, [user]);

  return (
    // Render matches...
  );
};
```

## 📋 Components That Still Need Updates

### 1. **Home.js** - READY TO UPDATE
Current needs:
- Use `useUser()` to get user data
- Fetch matches preview using `getMatches()`
- Fetch posts preview using `getPosts()` from chatroomPosts
- Fetch messages using chatroom logic

### 2. **Matches.js** - READY TO UPDATE
Current needs:
- Use `useUser()` hook
- Call `getMatches()` to fetch matches from backend
- Display match compatibility scores
- Allow profile viewing

### 3. **Posts.js** - READY TO UPDATE
Current needs:
- Fetch chatrooms with `getAllChatrooms()`
- Fetch posts for each chatroom with `getPosts(chatroomId)`
- Create posts with `createPost(chatroomId, content)`
- Like/comment functionality

### 4. **ChatRoom.js** - READY TO UPDATE
Current needs:
- List all chatrooms with `getAllChatrooms()`
- Show messages for selected chatroom with `getMessages(chatroomId)`
- Send messages with `sendMessage(chatroomId, text)`
- Join/leave chatrooms

### 5. **Products.js** - READY TO UPDATE
Current needs:
- Fetch products with `getProducts()`
- Filter by category
- Link to ProductDetail page

### 6. **ProductDetail.js** - READY TO UPDATE
Current needs:
- Fetch single product with `getProduct(productId)`
- Add to cart with `addToCart(productId, quantity)`
- Show success notification

### 7. **Cart.js** - READY TO UPDATE
Current needs:
- Load cart with `getCart()`
- Update quantities with `updateCartItem()`
- Remove items with `removeFromCart()`
- Calculate totals
- Link to checkout

### 8. **Checkout.js** - READY TO UPDATE
Current needs:
- Show cart summary
- Collect shipping address and payment method
- Create order with `createOrder(shippingAddress, paymentMethod)`
- Redirect to order success page

### 9. **OrderSuccess.js** - READY TO UPDATE
Current needs:
- Get order details with `getOrderById(orderId)`
- Display order confirmation
- Show order status

### 10. **Profile.js** - READY TO UPDATE
Current needs:
- Load user profile from UserContext
- Show survey data
- Display order history with `getUserOrders()`
- Allow editing of profile sections

## 🔗 Data Flow Diagram

```
User Login/Register
      ↓
API: authentication → JWT Token → Cookies
      ↓
UserContext.login() → Stores user state globally
      ↓
Components use useUser() hook for user data
      ↓
Protected components fetch data from APIs
      ↓
API calls automatically send JWT token from cookies
      ↓
Backend validates token & returns user-specific data
      ↓
Components update and display data
```

## ✨ Key Features Implemented

✅ **JWT-based Authentication**
- Credentials stored securely in HTTP-only cookies
- Automatically sent with all API requests
- Token included in `axios` defaults

✅ **Global User State Management**
- Single source of truth with UserContext
- Persists across page refreshes (loads from backend)
- Available everywhere with `useUser()` hook

✅ **Error Handling**
- All API calls wrapped in try-catch
- Console logging for debugging
- User-friendly error messages

✅ **Protected Routes**
- ProtectedRoute component prevents unauthorized access
- Automatically redirects to login if not authenticated
- Shows loading state while checking authentication

✅ **Automatic User Initialization**
- App loads current user from `/api/auth/me` on startup
- No need for manual login refresh
- Maintains session across browser restarts

✅ **Complete API Integration**
- All backend endpoints have corresponding frontend functions
- Proper request/response handling
- Logging for debugging

## 🧪 Testing Checklist

- [ ] User can register new account
- [ ] User can login with credentials
- [ ] User data persists after page refresh  
- [ ] User can complete survey
- [ ] Survey data saves to database
- [ ] User can see matches
- [ ] User can join chatrooms
- [ ] User can send messages
- [ ] User can create posts
- [ ] User can manage cart
- [ ] User can create orders
- [ ] User can logout
- [ ] Unauthenticated users cannot access protected pages

## 📝 Next Steps

1. **Update all component files** to use the new API services and UserContext
2. **Test all user flows** end-to-end
3. **Verify database persistence** of all user data
4. **Add loading states** and error boundaries
5. **Implement real-time features** with websockets if needed

## 🐛 Debugging Tips

### Check User is Authenticated
```javascript
const { user, isAuthenticated, loading } = useUser();
console.log('User:', user);
console.log('Authenticated:', isAuthenticated);
console.log('Loading:', loading);
```

### Check API Responses
```javascript
const response = await getMatches();
console.log('Response:', response);
console.log('Success:', response.success);
console.log('Data:', response.data || response.matches);
```

### Check Cookies
Open browser DevTools → Application → Cookies → Look for `token` cookie

### Check Network Requests
Open browser DevTools → Network tab → Check Authorization header on API calls
