export const users = [
  {
    id: "it66070126",
    password: "NLKctw25",
    name: "Phachara Pornanothai",
    major: "IT",
    email: "66070126@kmitl.ac.th"
  },
  {
    id: "dsba66010001",
    password: "Password123",
    name: "John Doe",
    major: "DSBA",
    email: "66010001@kmitl.ac.th"
  }
  // สามารถเพิ่มข้อมูลผู้ใช้คนอื่นๆ ได้ที่นี่
];

// ฟังก์ชันจำลองการค้นหาผู้ใช้ (คล้ายกับการเรียก API LDAP ในอนาคต)
export const authenticateUser = (id, password) => {
  const user = users.find(u => u.id === id);
  if (!user) {
    return { success: false, error: 'ไม่พบ Student ID นี้ในระบบ' };
  }
  if (user.password !== password) {
    return { success: false, error: 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง' };
  }
  return { success: true, user };
};