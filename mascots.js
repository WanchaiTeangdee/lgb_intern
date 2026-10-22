/* ตัวการ์ตูนน้องตี๋ (ซ้าย) & น้องหมวย (ขวา)
   หน้าแรก: เริ่มที่หัวหน้าเว็บ แล้วเลื่อนลงมาอยู่ติดขอบซ้าย/ขวาของจอ · หน้าอื่น: ติดขอบซ้าย/ขวาเลย
   ตั้งชื่อ/คำพูดที่ SITE.mascots ใน data.js (ใส่ mascots: null เพื่อซ่อน) */
(() => {
  const mc = typeof SITE !== "undefined" ? SITE.mascots : null;
  if (!mc) return;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const SVG_BOY = `<svg class="m-svg" viewBox="0 0 120 150" aria-hidden="true">
        <ellipse class="m-shadow" cx="60" cy="145" rx="30" ry="5" fill="rgba(59,50,44,.13)"/>
        <g class="m-bob">
          <rect x="44" y="118" width="12" height="22" rx="6" fill="#52617f"/>
          <rect x="64" y="118" width="12" height="22" rx="6" fill="#52617f"/>
          <ellipse cx="49" cy="141" rx="10" ry="5" fill="#fff" stroke="#e1d6c8"/>
          <ellipse cx="71" cy="141" rx="10" ry="5" fill="#fff" stroke="#e1d6c8"/>
          <path d="M34 130 Q32 95 60 93 Q88 95 86 130 Z" fill="#7fb4d8"/>
          <path d="M52 94 Q60 102 68 94" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
          <path d="M36 104 Q24 114 28 125" stroke="#7fb4d8" stroke-width="11" stroke-linecap="round" fill="none"/>
          <circle cx="28" cy="127" r="5.5" fill="#fbdcc0"/>
          <g class="m-arm">
            <path d="M84 104 Q98 96 102 82" stroke="#7fb4d8" stroke-width="11" stroke-linecap="round" fill="none"/>
            <circle cx="102" cy="77" r="6.2" fill="#fbdcc0"/>
          </g>
          <g class="m-head">
            <circle cx="26" cy="64" r="6" fill="#fbdcc0"/><circle cx="94" cy="64" r="6" fill="#fbdcc0"/>
            <circle cx="60" cy="60" r="34" fill="#fbdcc0"/>
            <path d="M25 58 Q21 20 60 21 Q99 20 95 58 Q90 42 79 40 Q67 47 53 38 Q36 40 25 58Z" fill="#2b2430"/>
            <path d="M52 22 Q56 10 66 14 Q60 16 62 24Z" fill="#2b2430"/>
            <g class="m-eyes">
              <ellipse cx="46" cy="64" rx="3.6" ry="4.8" fill="#2b2430"/><circle cx="47.3" cy="62.3" r="1.4" fill="#fff"/>
              <ellipse cx="74" cy="64" rx="3.6" ry="4.8" fill="#2b2430"/><circle cx="75.3" cy="62.3" r="1.4" fill="#fff"/>
            </g>
            <ellipse cx="38" cy="75" rx="6.5" ry="3.8" fill="#f7a1a1" opacity=".7"/>
            <ellipse cx="82" cy="75" rx="6.5" ry="3.8" fill="#f7a1a1" opacity=".7"/>
            <path d="M52 74 Q60 84 68 74 Z" fill="#c4574f" stroke="#b5524f" stroke-width="1.5" stroke-linejoin="round"/>
          </g>
        </g>
      </svg>`;

  const SVG_GIRL = `<svg class="m-svg" viewBox="0 0 120 150" aria-hidden="true">
        <ellipse class="m-shadow" cx="60" cy="145" rx="30" ry="5" fill="rgba(59,50,44,.13)"/>
        <g class="m-bob">
          <rect x="46" y="120" width="10" height="20" rx="5" fill="#fbdcc0"/>
          <rect x="64" y="120" width="10" height="20" rx="5" fill="#fbdcc0"/>
          <ellipse cx="50" cy="141" rx="10" ry="5" fill="#e8566b"/>
          <ellipse cx="70" cy="141" rx="10" ry="5" fill="#e8566b"/>
          <path d="M30 132 Q34 95 60 93 Q86 95 90 132 Z" fill="#f4a6b8"/>
          <path d="M50 94 Q60 104 70 94" fill="#fff" stroke="#fff" stroke-width="2" stroke-linejoin="round"/>
          <path d="M84 104 Q96 114 92 125" stroke="#f4a6b8" stroke-width="11" stroke-linecap="round" fill="none"/>
          <circle cx="92" cy="127" r="5.5" fill="#fbdcc0"/>
          <g class="m-arm m-arm-l">
            <path d="M36 104 Q22 96 18 82" stroke="#f4a6b8" stroke-width="11" stroke-linecap="round" fill="none"/>
            <circle cx="18" cy="77" r="6.2" fill="#fbdcc0"/>
          </g>
          <g class="m-head">
            <circle cx="28" cy="26" r="13" fill="#2b2430"/><circle cx="92" cy="26" r="13" fill="#2b2430"/>
            <path d="M23 62 Q19 18 60 18 Q101 18 97 62 L97 84 Q97 93 88 91 L32 91 Q23 93 23 84 Z" fill="#2b2430"/>
            <circle cx="26" cy="64" r="6" fill="#fbdcc0"/><circle cx="94" cy="64" r="6" fill="#fbdcc0"/>
            <circle cx="60" cy="61" r="33" fill="#fbdcc0"/>
            <path d="M27 60 Q25 27 60 26 Q95 27 93 60 Q90 44 76 43 Q67 52 57 42 Q40 44 27 60Z" fill="#2b2430"/>
            <ellipse cx="36" cy="34" rx="8" ry="4" fill="#e8566b" transform="rotate(-35 36 34)"/>
            <ellipse cx="84" cy="34" rx="8" ry="4" fill="#e8566b" transform="rotate(35 84 34)"/>
            <g class="m-eyes">
              <ellipse cx="46" cy="65" rx="3.6" ry="4.8" fill="#2b2430"/><circle cx="47.3" cy="63.3" r="1.4" fill="#fff"/>
              <ellipse cx="74" cy="65" rx="3.6" ry="4.8" fill="#2b2430"/><circle cx="75.3" cy="63.3" r="1.4" fill="#fff"/>
            </g>
            <ellipse cx="38" cy="76" rx="6.5" ry="3.8" fill="#f7a1a1" opacity=".75"/>
            <ellipse cx="82" cy="76" rx="6.5" ry="3.8" fill="#f7a1a1" opacity=".75"/>
            <path d="M52 75 Q60 85 68 75 Z" fill="#c4574f" stroke="#b5524f" stroke-width="1.5" stroke-linejoin="round"/>
          </g>
        </g>
      </svg>`;

  const side = (pos, key, svg) => {
    if (!mc[key]) return "";
    // หัวใจ/ประกายลอยขึ้นเหนือหัวเบาๆ
    const fx = [18, 50, 80]
      .map((x, i) => `<i style="left:${x}%;animation-delay:${(i * 1.7 + (key === "girl" ? 0.8 : 0)).toFixed(1)}s">${(i + (key === "girl" ? 1 : 0)) % 2 ? "✦" : "♥"}</i>`)
      .join("");
    return `
      <div class="dock-side ${pos}">
        <div class="floaties" aria-hidden="true">${fx}</div>
        <button class="mascot ${key}" type="button" aria-label="${esc(mc[key].name)}">
          <span class="bubble">${esc(mc[key].say)}</span>
          ${svg}
          <span class="m-name">${esc(mc[key].name)}</span>
        </button>
      </div>`;
  };

  const dock = document.createElement("div");
  dock.className = "mascot-dock";
  dock.innerHTML = side("left", "boy", SVG_BOY) + side("right", "girl", SVG_GIRL);
  document.body.appendChild(dock);

  // กดตัวการ์ตูน → กระโดดดึ๋ง + หัวใจพุ่ง
  dock.addEventListener("click", (e) => {
    const m = e.target.closest(".mascot");
    if (!m) return;
    m.classList.remove("hop");
    void m.offsetWidth;
    m.classList.add("hop");
    for (let i = 0; i < 6; i++) {
      const h = document.createElement("span");
      h.className = "burst";
      h.textContent = ["💖", "✨", "💕", "⭐"][i % 4];
      h.style.setProperty("--dx", `${(Math.random() - 0.5) * 120}px`);
      h.style.setProperty("--dy", `${-50 - Math.random() * 70}px`);
      h.addEventListener("animationend", () => h.remove());
      m.appendChild(h);
    }
  });

  /* ---------------- คำพูดในป้าย: หน้าของพี่ ต่อท้ายด้วยชื่อพี่ เช่น "ขอบคุณครับ พี่นัตโตะ!" ---------------- */
  const nameFor = () => {
    const m = location.hash.match(/^#\/to\/([^/?#]+)/);
    if (!m || typeof PEOPLE === "undefined") return "";
    const p = PEOPLE.find((x) => x.id === decodeURIComponent(m[1]));
    return p ? p.name : "";
  };
  const withName = (say, name) => (!name ? say : /[!！]$/.test(say) ? `${say.slice(0, -1)} ${name}!` : `${say} ${name}`);
  const setBubbles = () => {
    const name = nameFor();
    ["boy", "girl"].forEach((k) => {
      const b = dock.querySelector(`.mascot.${k} .bubble`);
      if (!b || !mc[k]) return;
      const t = withName(mc[k].say, name);
      b.textContent = t;
      b.dataset.orig = t;   // cute.js ใช้ค่านี้คืนคำพูดหลังเลิกชี้การ์ด
    });
  };
  addEventListener("hashchange", setBubbles);
  setBubbles();

  /* ---------------- เลื่อนหน้า → ตัวการ์ตูนไหลลงไปติดขอบซ้าย/ขวา ----------------
     p = 0 : อยู่ที่ช่อง .mascot-slot ใต้หัวเว็บ (มีเฉพาะหน้าแรก)
     p = 1 : ติดขอบล่างซ้าย/ขวาของจอ (หน้าที่ไม่มีช่อง = p = 1 ตลอด) */
  const sides = [...dock.querySelectorAll(".dock-side")];
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => t * t * (3 - 2 * t);
  // ความกว้างของตัวการ์ตูนตอนอยู่บนหัวเว็บ: ไม่เกิน 150px, ไม่ล้นช่อง และช่องสูงไม่เกิน 240px
  const homeWidth = (slotW, ms, H) => Math.min(150, slotW / 2 - 12, (240 * ms) / H);
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let cur = null;   // ความคืบหน้าที่แสดงอยู่ (เลื่อนเข้าหา target แบบนุ่มๆ)
  let raf = 0;
  let timer = 0;

  const update = () => {
    const slot = document.querySelector(".mascot-slot");
    const vw = innerWidth;
    const vh = innerHeight;
    const small = vw < 1100;   // จอไม่กว้าง: ตัวเล็กลง หลบเข้าขอบครึ่งตัว ซ่อนป้ายคำพูด/ชื่อตอนติดขอบ
    const first = cur === null;

    let target = 1;
    if (slot) target = ease(Math.min(1, Math.max(0, scrollY / (slot.offsetHeight + 60))));
    cur = first || reduce ? target : cur + (target - cur) * 0.2;
    if (Math.abs(target - cur) < 0.002) cur = target;
    dock.classList.toggle("at-home", !!slot && cur < 0.5);

    let slotRect = null;
    if (slot && sides[0]) {
      // ปรับความสูงช่องให้พอดีกับตัวการ์ตูนขนาดบนหัวเว็บ
      const ms0 = sides[0].offsetWidth;
      const H0 = sides[0].offsetHeight;
      const sc0 = homeWidth(slot.getBoundingClientRect().width, ms0, H0) / ms0;
      const wantH = Math.round(H0 * sc0) + 6;
      if (Math.abs(slot.offsetHeight - wantH) > 1) slot.style.height = wantH + "px";
      slotRect = slot.getBoundingClientRect();
    }

    sides.forEach((el) => {
      const left = el.classList.contains("left");
      const ms = el.offsetWidth;
      const H = el.offsetHeight;
      const nm = el.querySelector(".m-name");
      const feet = nm.offsetTop - (parseFloat(getComputedStyle(nm).marginTop) || 0);   // ปลายเท้าอยู่ลึกลงมาจากบนสุดของกล่องเท่าไร (= ขอบบนของป้ายชื่อ)
      const tuck = small ? ms * 0.24 : 0;
      const dockX = left ? -tuck : vw - ms + tuck;
      const dockY = vh - (small ? feet : H);

      let x = dockX, y = dockY, sc = 1;
      if (slotRect) {
        const homeW = homeWidth(slotRect.width, ms, H);
        const s0 = homeW / ms;
        const homeX = left ? slotRect.left + slotRect.width / 2 - homeW - 6 : slotRect.left + slotRect.width / 2 + 6;
        x = lerp(homeX, dockX, cur);
        y = lerp(slotRect.top, dockY, cur);
        sc = lerp(s0, 1, cur);
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) scale(${sc.toFixed(3)})`;
    });

    dock.classList.add("ready");
    if (cur !== target) kick();   // ยังเลื่อนไม่ถึงที่หมาย → วาดเฟรมต่อ
  };

  // วาดเฟรมถัดไป: ใช้ rAF เป็นหลัก มีตัวจับเวลาสำรองเผื่อเบราว์เซอร์หน่วงเฟรม (เช่น แท็บอยู่เบื้องหลัง)
  const run = () => {
    cancelAnimationFrame(raf);
    clearTimeout(timer);
    raf = timer = 0;
    update();
  };
  const kick = () => {
    if (raf || timer) return;
    raf = requestAnimationFrame(run);
    timer = setTimeout(run, 80);
  };

  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", kick);
  // เปลี่ยนหน้า (hash) → ช่องอาจเพิ่ง/หายไป ให้ตัวการ์ตูนไหลไปที่ใหม่
  addEventListener("hashchange", () => { kick(); setTimeout(kick, 60); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(kick);   // ฟอนต์โหลดเสร็จแล้วตำแหน่งช่องเปลี่ยน
  kick();
})();
