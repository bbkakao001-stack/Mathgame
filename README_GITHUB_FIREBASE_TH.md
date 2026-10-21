# M.1 Algebra Adventure V4.13 — GitHub Pages + Cloud Save

ไฟล์ที่วางใน repository เดียวกัน: `index.html`, `firebase-config.js`
ไฟล์ `firestore.rules` เป็นไฟล์สำหรับคัดลอกไปวางใน Firebase Console ไม่ต้องวางบนเว็บก็ได้

## ตั้งค่า Firebase
1. เข้า https://console.firebase.google.com สร้าง Firebase project และเพิ่ม Web app (`</>`).
2. ไป Project settings > Your apps คัดลอกค่าจาก `firebaseConfig` มาใส่ใน `firebase-config.js` ได้แก่ `apiKey`, `authDomain`, `projectId`, `appId`. **อย่าใส่ service account หรือ private key ลง GitHub**.
3. ไป Authentication > Sign-in method เปิด Google provider.
4. ไป Authentication > Settings > Authorized domains เพิ่มโดเมน GitHub Pages ของคุณ เช่น `your-username.github.io` (ใส่เฉพาะ host ไม่มี https:// หรือ path).
5. ไป Build > Firestore Database สร้างฐานข้อมูล. ในแท็บ Rules แทนที่ด้วยเนื้อหา `firestore.rules` แล้ว Publish. อย่าใช้ allow read,write:true.
6. อัปโหลด `index.html` และ `firebase-config.js` ลง branch ที่ใช้ GitHub Pages แล้วเปิดหน้าเว็บใหม่.
7. ที่เมนูมุมขวาบน กด **เข้าสู่ระบบ Google**. ทดลองตอบ 1 ข้อ รอขึ้นคำว่า **บันทึกออนไลน์แล้ว** แล้วเปิดหน้า GitHub Pages เดิมในอุปกรณ์อื่นด้วยบัญชี Google เดียวกัน ความคืบหน้าต้องกลับมา.

**ข้อจำกัด:** ก่อนตั้งค่า Firebase เว็บจะบันทึกเฉพาะเครื่องตามเดิม ไม่ใช่การซิงก์ออนไลน์; การทดสอบกับ Firebase จริงต้องมี Project config และเปิดบริการ/กฎข้างต้น. หนึ่งบัญชี Google เก็บความคืบหน้าของหนึ่งผู้เรียน ไม่ควรใช้บัญชีร่วมกันหลายคน. การแก้ไขออฟไลน์และออนไลน์พร้อมกันในหลายแท็บจะใช้การผสานแบบ best-effort; ไม่ใช่ transactional multiplayer. Firebase อาจมีค่าบริการตามแพ็กเกจ/ปริมาณใช้งาน.

## โจทย์โจมตีธรรมดา
- ใช้เฉพาะหัวข้อของข้อที่ผู้เรียนทำถูกแล้ว
- สร้างโจทย์แบบฝึกจากรูปแบบที่เรียนมา (เปลี่ยนตัวเลข) และไม่เพิ่มจำนวนขั้นตอน
- โจทย์ **ไม้ตาย** ยังคงใช้ชุดยากแยกต่างหาก
- ภารกิจรุ่นเดิม (poolVersion 3) จะถูกปรับโจทย์ที่ยังไม่ตอบเป็นชุดใหม่โดยรักษาจำนวนข้อที่ทำไปแล้ว
