# Shop Settings & Real-time Order Updates - October 2025

## Features Added

### 1. ✅ Shop Name & Description Editing
Sellers can now edit their shop name and description from the profile page!

**Changes Made:**
- Added `shopName` and `shopDescription` fields to profile edit form
- Fields are only visible to sellers and admins
- Shop name appears in search results and product pages
- Shop description helps customers learn about your business

**Location:** Profile Page (`/profile`)

### 2. ✅ Real-time Order Status Updates for Customers
Customer order page now updates in real-time when sellers change order status!

**Problem:** Previously, when a seller marked an order as "shipped", the customer had to refresh the page to see the update.

**Solution:** Converted customer orders page to use Firestore `onSnapshot` for real-time updates instead of one-time `getDocs`.

## How to Use

### Editing Shop Name:
1. Go to your **Profile** page (click your name in header)
2. Click **แก้ไข** (Edit) button
3. Scroll down to see **ชื่อร้านค้า** (Shop Name) field (green background)
4. Enter or update your shop name
5. Optionally add **คำอธิบายร้านค้า** (Shop Description)
6. Click **บันทึก** (Save)
7. ✅ Your shop is now searchable in chat!

### Finding Shops in Chat:
1. Open floating chat panel
2. Type shop name in search box
3. See "ร้านค้าที่พบ" (Found Shops) section
4. Click on any shop to start chatting
5. ✅ Works for all shops with `shopName` set!

### Real-time Order Updates:
**For Sellers:**
1. Go to `/my-shop/orders`
2. Change order status (pending → shipped → delivered)
3. Customer sees update immediately!

**For Customers:**
1. Go to `/orders` (รายการสั่งซื้อของฉัน)
2. Leave page open
3. When seller updates status, you see it instantly!
4. No refresh needed! 🎉

## Technical Details

### Files Modified:

#### 1. `src/app/profile/page.tsx`
**Added shop fields to sellers:**
```typescript
const [formData, setFormData] = useState({
  firstName: "",
  lastName: "",
  phone: "",
  address: "",
  shopName: "",        // NEW
  shopDescription: "", // NEW
});
```

**UI Changes:**
- Added Shop Name input field (only for sellers)
- Added Shop Description textarea (only for sellers)
- Fields have green background to distinguish from personal info
- Helper text explains purpose of each field
- Saves to Firestore `users` collection

#### 2. `src/app/orders/page.tsx`
**Converted to real-time updates:**

**Before:**
```typescript
// One-time fetch - no updates
const result = await fetchOrdersForUser(firebaseUser.uid);
setOrders(result);
```

**After:**
```typescript
// Real-time subscription
const unsubscribe = onSnapshot(q, (snapshot) => {
  const orderData = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    updatedAt: doc.data().updatedAt?.toDate() || new Date(),
  })) as Order[];
  
  setOrders(orderData);
});
```

**Added helper functions:**
- `statusToThai()` - Translate order status to Thai
- `paymentMethodToThai()` - Translate payment method to Thai
- `getStatusColor()` - Get color badge for status

**Updated status display:**
- Shows colored badge with Thai status
- Real-time updates when seller changes status
- No page refresh needed

#### 3. `src/app/components/SellerChatWindow.tsx`
**Made compatible with new Order type:**
- Made `status_th` and `paymentMethod_th` optional
- Added fallback to `statusToThai()` helper
- Works with both old and new order formats

## Benefits

### For Sellers:
✅ **Professional Branding** - Set custom shop name instead of "FirstName LastName"
✅ **Better Discovery** - Customers can find your shop by searching name
✅ **Shop Description** - Tell your story and specialties
✅ **Real-time Communication** - Customers can easily reach you

### For Customers:
✅ **Find Shops Easily** - Search by shop name in chat
✅ **Real-time Updates** - See order status changes instantly
✅ **Better UX** - No need to refresh page
✅ **Contact Sellers** - Start chat directly from search

## Database Schema

### User Document (Firestore)
```typescript
{
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'seller' | 'admin';
  phone?: string;
  address?: string;
  shopName?: string;        // NEW - Searchable shop name
  shopDescription?: string; // NEW - Shop bio/description
  profileImage?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Search Integration

The chat search already looks for `shopName` field:
```typescript
const filtered = allSellers.filter(seller => {
  const shopName = seller.shopName || `${seller.firstName} ${seller.lastName}`;
  return (
    shopName.toLowerCase().includes(searchLower) ||
    seller.email.toLowerCase().includes(searchLower) ||
    seller.firstName.toLowerCase().includes(searchLower) ||
    seller.lastName.toLowerCase().includes(searchLower)
  );
});
```

## Testing Checklist

**Shop Name Editing:**
- [x] Can edit shop name in profile page
- [x] Can edit shop description
- [x] Fields only show for sellers/admins
- [x] Saves to Firestore correctly
- [x] Shop name appears in search results
- [x] No TypeScript errors

**Order Real-time Updates:**
- [x] Customer sees order status updates instantly
- [x] No page refresh needed
- [x] Status badges show correct colors
- [x] Thai translations work
- [x] Works for all order statuses
- [x] No console errors

**Chat Shop Search:**
- [x] Can search shops by name
- [x] Shops with shopName appear in results
- [x] Shops without shopName show firstName + lastName
- [x] Can click to start chat
- [x] Chat opens correctly

## Future Enhancements

1. **Shop Logo Upload** - Add image upload for shop logo
2. **Shop Location** - Add location field with map
3. **Shop Categories** - Tag shops by product types
4. **Shop Rating** - Show seller rating in search
5. **Shop Hours** - Add business hours
6. **Shop Verification Badge** - Show verified sellers
7. **Shop Analytics** - Track views, searches, chats

## Migration Note

**Existing Sellers:**
- All existing sellers can now set their shop name
- Until they set it, system uses "FirstName LastName"
- Shop name field is optional but recommended
- No data migration needed - works with existing data

## Status Display Update

**Order Status Badges:**
- pending: Yellow (รอการยืนยัน)
- confirmed: Blue (ยืนยันแล้ว)
- shipped/shipping: Purple (กำลังจัดส่ง)
- delivered/completed: Green (จัดส่งสำเร็จ)
- cancelled: Gray (ยกเลิก)
- refunded: Purple (คืนเงินแล้ว)

All updates happen in real-time! 🚀
