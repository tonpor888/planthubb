# 🌿 Product Category System

## Overview
The home page now includes a **category filter system** to help users easily browse different types of plants. Products are automatically categorized based on their names using keyword matching.

## 📂 Available Categories

### 1. **ทั้งหมด (All)** 🛍️
- Shows all products
- Icon: Shopping Bag
- Color: Gray/Slate

### 2. **ต้นไม้ในร่ม (Indoor Plants)** 🌱
- Plants suitable for indoor environments
- Keywords: มอนสเตอร่า, พลูด่าง, เฟิร์น, สันเสวียร, ในร่ม, indoor
- Icon: Sprout
- Color: Emerald Green
- Examples: Monstera, Pothos, Ferns, Snake Plants

### 3. **ต้นไม้กลางแจ้ง (Outdoor Plants)** 🌳
- Plants for outdoor gardens
- Keywords: ต้นไม้, ปาล์ม, ไผ่, บอนไซ, กลางแจ้ง, outdoor
- Icon: Trees
- Color: Teal
- Examples: Palm trees, Bamboo, Bonsai

### 4. **ดอกไม้ (Flowers)** 🌸
- Flowering plants
- Keywords: กุหลาบ, ดอก, ดาวเรือง, ลิลลี่, ออคิด, กล้วยไม้
- Icon: Flower
- Color: Pink
- Examples: Roses, Orchids, Lilies, Marigolds

### 5. **ผักสวนครัว (Herbs & Vegetables)** 🍃
- Edible plants and herbs
- Keywords: โหระพา, ผักชี, มะนาว, พริก, ผัก, สมุนไพร
- Icon: Leaf
- Color: Lime Green
- Examples: Basil, Cilantro, Chilies, Lemon

### 6. **ไม้อวบน้ำ (Succulents)** 🌵
- Succulent plants and cacti
- Keywords: กระบองเพชร, แคคตัส, หินนอน, อวบน้ำ, succulent, cactus
- Icon: Sprout
- Color: Green
- Examples: Cacti, Jade plants, Aloe vera

## 🎨 Design Features

### Category Pills
- **Horizontal scrollable row** - Swipe on mobile to see all categories
- **Color-coded** - Each category has unique colors
- **Icons** - Visual icons for quick recognition
- **Product count badges** - Shows number of products in each category
- **Active state** - Selected category is highlighted with:
  - Colored background
  - Border accent
  - Scale animation (105%)
  - Shadow effect

### Responsive Design
- **Desktop**: All categories visible in one row
- **Mobile**: Horizontal scroll with touch support
- **Touch-friendly**: Large tap targets (minimum 44x44px)

## 🔍 How It Works

### Auto-Categorization
Products are automatically assigned categories based on their names using the `getCategoryFromName()` function:

```typescript
// Example: Product named "มอนสเตอร่า" → Category: "indoor"
// Example: Product named "กุหลาบแดง" → Category: "flowers"
// Example: Product named "กระบองเพชร" → Category: "succulents"
```

### Filtering Logic
1. User clicks a category pill
2. `selectedCategory` state updates
3. `filteredProducts` recalculates to show only products in that category
4. Product count updates in real-time
5. Search and sort still work within selected category

### Default Category
- If a product name doesn't match any keywords: **"indoor"** (default)
- Sellers can override by adding `category` field to product data

## 📊 Product Count Display

Each category pill shows:
- **Total products available** in that category
- Updates in real-time as products are added/removed
- Shows "0" if no products in category
- "ทั้งหมด" shows total of all active products

## 🎯 User Experience

### Filter Flow
1. User lands on home page
2. Sees "ทั้งหมด" selected by default
3. Scrolls category pills to explore
4. Clicks "ดอกไม้" to see only flowers
5. Can search within flowers: "กุหลาบ"
6. Can sort: "ราคา: ต่ำ-สูง"
7. Clicks "ทั้งหมด" to reset

### Combined Filters
- **Category + Search**: Filter by category, then search within it
- **Category + Sort**: Filter by category, then sort by price/popularity
- **All three**: Category → Search → Sort

## 🔧 Technical Implementation

### State Management
```typescript
const [selectedCategory, setSelectedCategory] = useState<string>("all");
```

### Product Type Extended
```typescript
type Product = {
  // ... existing fields
  category?: string; // Optional: can be set by seller
};
```

### Category Counts Memoization
```typescript
const categoryCounts = useMemo(() => {
  // Counts products per category efficiently
  // Only recalculates when products change
}, [products]);
```

### Performance
- **Memoized calculations** - Prevents unnecessary re-renders
- **Efficient filtering** - O(n) complexity
- **Lazy loading** - Categories load with products
- **Smooth animations** - Hardware-accelerated CSS

## 📝 Future Enhancements

### Possible Additions
1. **Sub-categories** - "ต้นไม้ในร่ม" → "ต้นไม้ใบสวย", "ต้นไม้ปรับอากาศ"
2. **Filter combinations** - Multiple categories at once
3. **Save preferences** - Remember user's favorite category
4. **Category pages** - Dedicated page per category with more info
5. **Admin category management** - Let sellers choose/create categories
6. **Category images** - Hero images for each category
7. **Trending badges** - "🔥 มาแรง" on popular categories
8. **Seasonal categories** - "🎄 ต้นคริสต์มาส", "🌸 ดอกไม้วาเลนไทน์"

## 💡 Tips for Sellers

### How to Ensure Correct Category
1. **Use Thai keywords** in product names:
   - "มอนสเตอร่าใบด่าง" → Indoor
   - "กุหลาบสีแดง" → Flowers
   - "กระบองเพชรทรงกลม" → Succulents

2. **Add category field** to product (optional):
   ```typescript
   {
     name: "ต้นไม้พิเศษ",
     category: "indoor" // Override auto-detection
   }
   ```

3. **Test your products**:
   - Add product
   - Check which category it appears in
   - Adjust name if needed

## 📱 Mobile Optimization

- **Swipe gesture** - Natural horizontal scrolling
- **Momentum scrolling** - iOS-style smooth scroll
- **No scrollbar** - Clean look on mobile
- **Touch feedback** - Visual response on tap
- **Safe tap areas** - No accidental clicks

## ✅ Benefits

### For Users
- ✨ **Easy navigation** - Find desired plant type quickly
- 🎯 **Focused browsing** - See only relevant products
- 📊 **Product counts** - Know how many options available
- 🎨 **Visual categorization** - Colors and icons help recognition
- 🔍 **Better search** - Combine with category for precise results

### For Business
- 📈 **Increased engagement** - Users browse more categories
- 🎯 **Better conversion** - Users find what they need faster
- 📊 **Analytics ready** - Track popular categories
- 🛍️ **Cross-selling** - Users explore related categories
- 💼 **Professional look** - Modern e-commerce standard

---

**Status:** ✅ Fully Implemented and Working!

**How to Use:** Click any category pill on the home page to filter products.

**Need Help?** Contact support or check the main README.md
