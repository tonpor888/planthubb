// Hardcoded admin accounts - ไม่ต้องบันทึกใน Firebase
export const HARDCODED_ADMINS = [
  {
    email: 'admin@planthub.dev',
    password: 'Admin888',
    displayName: 'PlantHub Admin',
    role: 'admin'
  }
];

// ตรวจสอบว่าเป็น hardcoded admin หรือไม่
export const isHardcodedAdmin = (email: string, password: string): boolean => {
  return HARDCODED_ADMINS.some(
    admin => admin.email === email && admin.password === password
  );
};

// ดึงข้อมูล hardcoded admin
export const getHardcodedAdmin = (email: string) => {
  return HARDCODED_ADMINS.find(admin => admin.email === email);
};

// ตรวจสอบว่าเป็น admin หรือไม่
export const isAdmin = (email: string): boolean => {
  return HARDCODED_ADMINS.some(admin => admin.email === email);
};
