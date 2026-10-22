/* =====================================================================
   replies-apps-script.gs — ตัวส่งข้อความตอบกลับจาก Google Sheet ให้หน้า admin.html
   ไฟล์นี้เป็นแค่ต้นฉบับให้คัดลอกไปวางใน Google Apps Script (ไม่ได้ทำงานในเว็บ)

   วิธีใช้
   1) เปิด Google Sheet ที่รับคำตอบจากฟอร์ม → เมนู ส่วนขยาย → Apps Script
   2) ลบโค้ดเดิม วางโค้ดไฟล์นี้ทั้งหมด แล้วแก้ KEY เป็นรหัสลับของตัวเอง
      ⚠️ ใส่รหัสจริงใน Apps Script เท่านั้น ห้ามใส่ในไฟล์นี้ (ไฟล์นี้อยู่ในโฟลเดอร์เว็บ)
   3) กด ทำให้ใช้งานได้ (Deploy) → การทำให้ใช้งานได้รายการใหม่ → ประเภท "เว็บแอป"
        เรียกใช้ในฐานะ : ฉัน
        ผู้มีสิทธิ์เข้าถึง : ทุกคน
      กดอนุญาตสิทธิ์ตามที่ขอ แล้วคัดลอก URL ที่ลงท้ายด้วย /exec
   4) เอา URL ไปใส่ที่ NOTES_URL ใน admin.js
   5) เปิด admin.html แล้วพิมพ์รหัสลับ KEY เพื่อดูข้อความ

   ถ้าแก้โค้ดภายหลัง ต้อง Deploy → จัดการการทำให้ใช้งานได้ → แก้ไข → เวอร์ชันใหม่
   คอลัมน์ใน Sheet ต้องเรียง: ประทับเวลา | ชื่อพี่ | ข้อความ (ตามที่ฟอร์มสร้างให้)
   ===================================================================== */

const KEY = "ตั้งรหัสลับตรงนี้";

function doGet(e) {
  const given = e && e.parameter ? e.parameter.key : "";
  if (!given || given !== KEY) return out({ ok: false, error: "bad key" });

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const rows = sheet
    .getDataRange()
    .getValues()
    .slice(1) // ข้ามแถวหัวตาราง
    .filter((r) => String(r[2] || "").trim())
    .map((r) => ({
      time: r[0] instanceof Date ? r[0].toISOString() : String(r[0]),
      name: String(r[1] || ""),
      message: String(r[2]),
    }));

  return out({ ok: true, rows: rows });
}

function out(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
