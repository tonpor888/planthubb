# Firebase Firestore Index Setup

## ปัญหา
ระบบ Log ต้องการ composite index ใน Firestore เพื่อให้ query ทำงานได้อย่างมีประสิทธิภาพ

## วิธีแก้ไข

### วิธีที่ 1: สร้าง Index ผ่าน Firebase Console (แนะนำ)

1. ไปที่ [Firebase Console](https://console.firebase.google.com/)
2. เลือกโปรเจกต์ `planthub-694cf`
3. ไปที่ **Firestore Database** > **Indexes**
4. คลิก **Create Index**
5. ตั้งค่าดังนี้:
   - **Collection ID**: `logs`
   - **Fields**:
     - `userId` (Ascending)
     - `timestamp` (Descending)
6. คลิก **Create**

### วิธีที่ 2: ใช้ Firebase CLI

```bash
# Login to Firebase
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

### วิธีที่ 3: ใช้ลิงก์ที่ Firebase ให้มา

คลิกลิงก์นี้เพื่อสร้าง index อัตโนมัติ:
https://console.firebase.google.com/v1/r/project/planthub-694cf/firestore/indexes?create_composite=Cktwcm9qZWN0cy9wbGFudGh1Yi02OTRjZi9kYXRhYmFzZXMvKGRlZmF1bHQpL2NvbGxlY3Rpb25Hcm91cHMvbG9ncy9pbmRleGVzL18QARoKCgZ1c2VySWQQARoNCgl0aW1lc3RhbXAQAhoMCghfX25hbWVfXxAC

## Index ที่ต้องการ

### 1. Composite Index สำหรับ logs collection
- **Collection**: `logs`
- **Fields**: 
  - `userId` (Ascending)
  - `timestamp` (Descending)

### 2. Single Field Index สำหรับ logs collection
- **Collection**: `logs`
- **Fields**:
  - `timestamp` (Descending)

## หมายเหตุ

- การสร้าง index อาจใช้เวลาสักครู่ (5-10 นาที)
- ระบบ Log จะทำงานได้ชั่วคราวโดยไม่ต้องมี index (ใช้ fallback method)
- หลังจากสร้าง index แล้ว ระบบจะทำงานได้เร็วขึ้น

## ไฟล์ที่เกี่ยวข้อง

- `firestore.indexes.json` - กำหนด index configuration
- `firebase.json` - Firebase project configuration
- `firestore.rules` - Firestore security rules
- `src/services/firebase/logs.service.ts` - Log service with fallback
