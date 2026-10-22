/* =====================================================================
   data.js — ตั้งค่าเว็บ + รายชื่อพี่ๆ
   จดหมาย → letters.js   |   ความทรงจำ รูป คลิป → memories.js
   ===================================================================== */

const SITE = {
  title: "ขอบคุณสำหรับทุกความทรงจำ",
  subtitle: "ตลอดช่วงฝึกงานที่ผ่านมา ขอบคุณที่สอน ที่ดูแล และที่ทำให้ทุกวันมีเรื่องให้ยิ้ม",
  period: "มิถุนายน – ตุลาคม 2569",
  from: "น้องตี๋ & น้องหมวย",        // แสดงท้ายเว็บ
  signOff: "รักและขอบคุณมากๆ",       // คำลงท้ายจดหมาย ก่อนชื่อคนเขียน
  closing: "ถึงจะจบฝึกงานแล้ว แต่ยังอยากเจอพี่ๆ อีกนะ ถ้ามีโอกาสได้กลับมาทำงานด้วยกันอีก จะดีใจมากๆ เลย",  // ข้อความท้ายหน้าของพี่ทุกคน
  // ตัวการ์ตูนน้องตี๋ & น้องหมวย ที่หน้าแรก (เปลี่ยนคำพูดได้ / ใส่ mascots: null เพื่อซ่อน)
  cute: true,   // เอฟเฟกต์น่ารักๆ (หัวใจผุดตอนแตะ, คอนเฟตติตอนเปิดซอง, ดาวลอยพื้นหลัง) — ใส่ false เพื่อปิด
  mascots: {
    boy: { name: "น้องตี๋", say: "ขอบคุณครับ!" },
    girl: { name: "น้องหมวย", say: "ขอบคุณค่ะ!" },
  },
};

/* ---------------------------------------------------------------------
   PEOPLE — รายชื่อพี่ๆ ที่จะให้กดเลือกในหน้าแรก
   id      : ภาษาอังกฤษ ไม่มีเว้นวรรค (ใช้เป็นลิงก์ เช่น #/to/natto)
   name    : ชื่อที่แสดง
   avatar  : รูปโปรไฟล์ เช่น "images/people/natto.jpg" (ไม่มีรูป/หาไฟล์ไม่เจอ จะแสดง emoji แทน)
   emoji   : ใช้แทนรูปโปรไฟล์ตอนไม่มีรูป
   color   : สีประจำตัวของพี่คนนั้น
   --------------------------------------------------------------------- */
const PEOPLE = [
  { id: "natto",    name: "พี่นัตโตะ",   avatar: "images/people/natto.jpg",    emoji: "🥢", color: "#e8cfa8" },
  { id: "mangpong", name: "พี่แมงป่อง",  avatar: "images/people/mangpong.jpg", emoji: "🦂", color: "#f2b8b5" },
  { id: "boom",     name: "พี่บูม",      avatar: "images/people/boom.jpg",     emoji: "💥", color: "#f6c99a" },
  { id: "non",      name: "พี่นน",       avatar: "images/people/non.jpg",      emoji: "🐑", color: "#c9d8b6" },
  { id: "guitar",   name: "พี่กีต้าร์",   avatar: "images/people/guitar.jpg",   emoji: "🎸", color: "#cfc3e8" },
  { id: "aom",      name: "พี่ออม",      avatar: "images/people/aom.jpg",      emoji: "🐷", color: "#f4c2d4" },
  { id: "man",      name: "พี่แมน",      avatar: "images/people/man.jpg",      emoji: "💪", color: "#b8d8e0" },
  { id: "benz",     name: "พี่เบ็นซ์",    avatar: "images/people/benz.jpg",     emoji: "🚗", color: "#d6d2c4" },
  { id: "bass",     name: "พี่เบส",      avatar: "images/people/bass.jpg",     emoji: "🎧", color: "#c3cfe8" },
  { id: "tik",      name: "พี่ติ๊ก",      avatar: "images/people/tik.jpg",      emoji: "⏰", color: "#f0d9a0" },
  { id: "q",        name: "พี่คิว",      avatar: "images/people/q.jpg",        emoji: "🎱", color: "#c9d8b6" },
  { id: "foam",     name: "พี่โฟม",      avatar: "images/people/foam.jpg",     emoji: "☁️", color: "#b8d8e0" },
  { id: "pert",     name: "พี่เพิร์ท",    avatar: "images/people/pert.jpg",     emoji: "🌟", color: "#f0d9a0" },
  { id: "march",    name: "พี่มาร์ช",     avatar: "images/people/march.jpg",    emoji: "🥁", color: "#f2b8b5" },
  { id: "baimon",   name: "พี่ใบหม่อน",  avatar: "images/people/baimon.jpg",   emoji: "🍃", color: "#c9d8b6" },
  { id: "jai",      name: "พี่ใจ๋",       avatar: "images/people/jai.jpg",      emoji: "💛", color: "#f6e2a0" },
  { id: "kaew",     name: "พี่แก้ว",      avatar: "images/people/kaew.jpg",     emoji: "🥛", color: "#c3cfe8" },
  { id: "dream",    name: "พี่ดรีม",      avatar: "images/people/dream.jpg",    emoji: "🌈", color: "#cfc3e8" },
  { id: "pim",      name: "พี่พิม",      avatar: "images/people/pim.jpg",      emoji: "🌸", color: "#f4c2d4" },
  { id: "per",      name: "พี่เปอร์",     avatar: "images/people/per.jpg",      emoji: "🐱", color: "#e8cfa8" },
  { id: "bua",      name: "พี่บัว",      avatar: "images/people/bua.jpg",      emoji: "🌷", color: "#f2c4c9" },
  { id: "da",       name: "พี่ดา",       avatar: "images/people/da.jpg",       emoji: "⭐", color: "#f0d9a0" },
  { id: "june",     name: "พี่จูน",      avatar: "images/people/june.jpg",     emoji: "🎵", color: "#b8d8e0" },
  { id: "big",      name: "พี่บิ๊ก",      avatar: "images/people/big.jpg",      emoji: "🐘", color: "#d6d2c4" },
  { id: "nick",     name: "พี่นิค",      avatar: "images/people/nick.jpg",     emoji: "🦊", color: "#f6c99a" },
  { id: "james",    name: "พี่เจมส์",     avatar: "images/people/james.jpg",    emoji: "🕶️", color: "#c3cfe8" },
];

/* ---------------------------------------------------------------------
   MUSIC — เพลงประกอบเว็บ เล่นต่อเนื่องตามลำดับ จบเพลงสุดท้ายแล้ววนกลับเพลงแรก
   เพลงหนึ่งเพลงเขียนได้ 2 แบบ
     1) YouTube        { id: "VqbbrekbL3s", title: "..." }
          id = รหัส 11 ตัวอักษรท้ายลิงก์ เช่น youtu.be/VqbbrekbL3s
          ⚠️ เจ้าของเพลงบางรายปิดการฝังบนเว็บอื่น → เพลงนั้นจะเล่นไม่ได้ และเว็บจะข้ามไปเพลงถัดไป
             (รายการเพลง 🎶 มุมล่างจะขึ้นป้าย "เจ้าของปิดการฝัง" ให้เห็น)
     2) ไฟล์เสียงของเรา { src: "media/music/ชื่อไฟล์.mp3", title: "..." }
          วางไฟล์ .mp3 ไว้ในโฟลเดอร์ media/music/ — เล่นได้แน่นอน ไม่ขึ้นกับ YouTube
   title : ชื่อที่แสดงในปุ่มเพลง
   อยากปิดเพลง: ใส่ MUSIC = [] ได้เลย
   --------------------------------------------------------------------- */
const MUSIC = [
  { id: "VqbbrekbL3s", title: "Nobody knows — STAMP & Christopher Chu" },
  { src: "media/music/cornboi-moon.mp3", title: "ก่อนที่ (Moon) — CORNBOI" },
  { src: "media/music/yew-lomleang.mp3", title: "ลมแล้ง | Summertime — YEW feat. LANDOKMAI" },
  { src: "media/music/tonyphee-konthisaendee.mp3", title: "คนที่แสนดี — TONY PHEE feat. Q flure" },
];
