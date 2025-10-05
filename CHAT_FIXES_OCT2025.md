# Chat Panel Fixes - October 2025

## Issues Fixed

### 1. ✅ Unread Count Not Disappearing When Clicking Chat
**Problem:** When clicking on a chat room in the list, the unread count badge (red number) didn't disappear immediately.

**Root Cause:** Messages were only marked as read when the messages loaded, not when the user clicked on the chat room.

**Solution:** 
- Added immediate call to `markMessagesAsRead()` when clicking a chat room button
- This marks messages as read right when the user clicks, not waiting for messages to load
- Also reload chat rooms to update the unread count immediately

**Code Changes:**
```typescript
// In ChatPanel.tsx - onClick handler for chat room buttons
onClick={() => {
  setSelectedChat(room);
  // Mark messages as read immediately when clicking
  if (firebaseUser && room.id) {
    markMessagesAsRead(room.id, firebaseUser.uid).then(() => {
      // Reload chat rooms to update unread count
      loadChatRooms();
    });
  }
}}
```

### 2. ✅ Unable to Search and Chat with Shops
**Problem:** Users could search within existing chats, but couldn't search for NEW shops to start a conversation with.

**Root Cause:** The search only filtered existing chat rooms. There was no way to search the sellers database and start new chats.

**Solution:**
- Added seller search functionality that queries the Firestore `users` collection
- When user types in search box, it now searches both:
  1. Existing chat rooms (as before)
  2. All sellers in the database (new feature)
- Search results show two sections:
  - Existing chats (if any match)
  - "ร้านค้าที่พบ" (Found Shops) - clickable list of sellers
- Clicking a seller from search results:
  - Creates a new chat room with that seller
  - Opens the chat immediately
  - Clears the search

**Code Changes:**

1. **New State Variables:**
```typescript
const [searchedSellers, setSearchedSellers] = useState<Seller[]>([]);
const [isSearchingSellers, setIsSearchingSellers] = useState(false);
```

2. **New Type Definition:**
```typescript
type Seller = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  shopName?: string;
  role: string;
};
```

3. **New Functions:**
```typescript
// Search sellers in Firestore
const searchSellers = async (searchText: string) => {
  // Query users collection where role === 'seller'
  // Filter by shopName, firstName, lastName, email
  // Update searchedSellers state
};

// Start chat with a seller
const handleStartChatWithSeller = async (seller: Seller) => {
  // Create new chat room with seller
  // Select the chat
  // Clear search
};
```

4. **Auto-Search with Debounce:**
```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    if (searchQuery.trim()) {
      searchSellers(searchQuery);
    } else {
      setSearchedSellers([]);
    }
  }, 300); // 300ms debounce
  
  return () => clearTimeout(timer);
}, [searchQuery]);
```

5. **Updated UI:**
- Chat list now shows both existing chats AND searched sellers
- Sellers appear with green shop icon
- Clear visual separation with "ร้านค้าที่พบ" header
- Highlighted search terms in shop names

## How to Use

### Fix 1: Unread Count
1. Open chat panel (click floating chat button)
2. See red badges with unread count on some chats
3. Click on a chat with unread count
4. ✅ Badge disappears immediately
5. ✅ Counter on floating button updates

### Fix 2: Shop Search
1. Open chat panel (click floating chat button)
2. Type shop name in search box (e.g., "ร้านต้นไม้")
3. See results appear:
   - Your existing chats matching the search (top section)
   - "ร้านค้าที่พบ" section with clickable shops (bottom section)
4. Click on any shop from the "ร้านค้าที่พบ" section
5. ✅ New chat opens immediately
6. ✅ You can start messaging the shop

## Technical Details

### Files Modified
- `src/app/components/ChatPanel.tsx`

### Dependencies Used
- Firestore: `collection`, `query`, `where`, `getDocs`
- Existing chat service functions: `createChatRoom`, `markMessagesAsRead`

### Performance Considerations
- **Debouncing**: Seller search has 300ms debounce to avoid excessive queries
- **Lazy Loading**: Sellers are only loaded when user searches
- **Caching**: Results stay until search query changes

### Security
- Uses existing Firestore rules
- Only queries sellers (role === 'seller')
- Respects user permissions for chat creation

## Testing Checklist

- [x] Unread badge disappears when clicking chat
- [x] Unread count updates on floating button
- [x] Can search for existing chats
- [x] Can search for new shops
- [x] Shop results show with green icon
- [x] Clicking shop starts new chat
- [x] Search highlights matching text
- [x] Debounce prevents excessive queries
- [x] No TypeScript errors
- [x] Works on mobile and desktop

## Future Enhancements
1. Add shop profile pictures/avatars
2. Show shop rating in search results
3. Cache seller list to reduce database queries
4. Add filters (by category, location, etc.)
5. Show shop online status
