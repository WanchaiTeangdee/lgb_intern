/* ความน่ารักเล็กๆ น้อยๆ ทั้งเว็บ
   • แตะที่ไหนก็มีหัวใจผุด · เปิดซองจดหมายมีคอนเฟตติ
   • เอาเมาส์ชี้การ์ดชื่อพี่ → ตัวการ์ตูนทักชื่อ และกระโดดดีใจตอนกดเลือก
   • ดาว/หัวใจสีพาสเทลลอยเบาๆ เป็นพื้นหลัง
   ปิดทั้งหมดได้ด้วย SITE.cute = false ใน data.js (คนที่ตั้งเครื่องไว้ "ลดการเคลื่อนไหว" จะไม่เห็นเอฟเฟกต์ที่ขยับ) */
(() => {
  if (typeof SITE !== "undefined" && SITE.cute === false) return;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const COLORS = ["#f4a6b8", "#f0c46a", "#8fc4e0", "#b8a4e3", "#a9cf8a"];

  /* ---------- พื้นหลัง: ดาว/หัวใจลอยขึ้นช้าๆ ---------- */
  if (!reduce) {
    const shapes = ["♥", "✦", "★", "♡", "✿", "✧"];
    const bg = document.createElement("div");
    bg.className = "bg-floaties";
    bg.setAttribute("aria-hidden", "true");
    bg.innerHTML = Array.from({ length: 14 }, (_, i) =>
      `<i style="left:${(i * 7.3 + 4) % 96}%;font-size:${0.9 + (i % 4) * 0.45}rem;color:${COLORS[i % 5]};animation-duration:${24 + (i % 5) * 6}s;animation-delay:${-(i * 3.3).toFixed(1)}s">${shapes[i % 6]}</i>`
    ).join("");
    document.body.prepend(bg);
  }

  /* ---------- ปล่อยหัวใจ/ประกายพุ่งออกจากจุดหนึ่ง ---------- */
  const pop = (x, y, chars, n, spread) => {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const el = document.createElement("span");
      el.className = "fx";
      el.textContent = chars[i % chars.length];
      el.style.left = x + "px";
      el.style.top = y + "px";
      el.style.color = COLORS[(Math.random() * COLORS.length) | 0];
      const ang = Math.random() * Math.PI * 2;
      const d = spread * (0.45 + Math.random() * 0.75);
      el.style.setProperty("--dx", `${Math.cos(ang) * d}px`);
      el.style.setProperty("--dy", `${Math.sin(ang) * d - 30}px`);
      el.style.setProperty("--r", `${Math.random() * 90 - 45}deg`);
      el.addEventListener("animationend", () => el.remove());
      document.body.appendChild(el);
    }
  };

  const hop = (m) => {
    m.classList.remove("hop");
    void m.offsetWidth;
    m.classList.add("hop");
  };

  // ใช้ capture เพื่อให้ทำงานก่อนตัวจัดการอื่น (เช่น ซองจดหมายที่เปลี่ยนสถานะเป็น "เปิด" ทันที)
  document.addEventListener(
    "click",
    (e) => {
      const t = e.target;
      if (!t.closest) return;

      // เปิดซองจดหมาย → คอนเฟตติจากกลางซอง
      const screen = t.closest(".envelope-screen");
      if (screen) {
        const env = screen.querySelector(".envelope");
        if (env && !env.classList.contains("open")) {
          const r = env.getBoundingClientRect();
          setTimeout(() => pop(r.left + r.width / 2, r.top + r.height / 2, ["💖", "✨", "💌", "🎀", "⭐", "🌸"], 24, 190), 420);
        }
        return;
      }

      // เลือกชื่อพี่ → ตัวการ์ตูนกระโดดดีใจ
      if (t.closest(".person-card")) document.querySelectorAll(".mascot").forEach(hop);

      // แตะที่ว่างๆ → หัวใจเล็กๆ ผุดตรงนิ้ว (ฉากส่งน้องมีเอฟเฟกต์ของตัวเอง)
      if (t.closest(".mascot, .music, .lightbox, .farewell, input, textarea")) return;
      pop(e.clientX, e.clientY, ["♥", "✦", "✿"], 4, 44);
    },
    true
  );

  /* ---------- ตัวการ์ตูนทักชื่อพี่ตอนชี้การ์ด ---------- */
  const say = (key, text) => {
    const b = document.querySelector(`.mascot.${key} .bubble`);
    if (!b) return;
    if (!b.dataset.orig) b.dataset.orig = b.textContent;
    b.textContent = text == null ? b.dataset.orig : text;
  };
  const reset = () => { say("boy"); say("girl"); };

  document.addEventListener("mouseover", (e) => {
    const c = e.target.closest && e.target.closest(".person-card");
    if (!c || c.contains(e.relatedTarget)) return;
    const name = (c.querySelector(".pc-name") || {}).textContent || "";
    say("boy", `สวัสดีครับ ${name}!`);
    say("girl", `สวัสดีค่ะ ${name}!`);
  });
  document.addEventListener("mouseout", (e) => {
    const c = e.target.closest && e.target.closest(".person-card");
    if (!c || c.contains(e.relatedTarget)) return;
    reset();
  });
  addEventListener("hashchange", reset);
})();
