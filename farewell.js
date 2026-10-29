/* ฉากส่งน้องท้ายหน้าความทรงจำ
   พี่ๆ ส่งหัวใจและดาวไปหาตี๋กับหมวย · กดซ้ำได้หลังส่งเสร็จ
   คำอวยพรขึ้นเมื่อกดส่ง แล้วน้องๆ ตอบเมื่อหัวใจลอยมาถึง
   SITE.cute = false หรือเปิดลดการเคลื่อนไหว → รับกำลังใจทันทีโดยไม่มีภาพเคลื่อนที่ */
(() => {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // เป็นตัวแทนกลุ่มพี่ๆ ไม่ได้ผูกกับชื่อหรือรูปของคนใดคนหนึ่ง
  const colleagueArt = (index) => {
    const shirts = ["#b8a4d4", "#98bfa2", "#8bb8d4", "#e4ae79", "#d99ba9"];
    const skins = ["#f6d7bc", "#e9bc99", "#fbdcc0", "#edc6a8", "#f6d7bc"];
    const shirt = esc(shirts[index % shirts.length]);
    const skin = esc(skins[index % skins.length]);
    const longHair = index === 1 || index === 4;
    return `<svg viewBox="0 0 100 140" aria-hidden="true">
      <ellipse cx="50" cy="134" rx="27" ry="4" fill="rgba(59,50,44,.13)"/>
      <path d="M39 110 V129 M61 110 V129" stroke="#52617f" stroke-width="11" stroke-linecap="round"/>
      <ellipse cx="37" cy="132" rx="10" ry="4" fill="#fff" stroke="#e1d6c8"/>
      <ellipse cx="63" cy="132" rx="10" ry="4" fill="#fff" stroke="#e1d6c8"/>
      <path d="M25 117 Q25 84 50 83 Q75 84 75 117Z" fill="${shirt}"/>
      <path d="M42 85 L50 93 L58 85" fill="none" stroke="#fff" stroke-width="3"/>
      <path d="M29 93 Q16 102 19 112" fill="none" stroke="${shirt}" stroke-width="9" stroke-linecap="round"/>
      <circle cx="19" cy="114" r="5" fill="${skin}"/>
      <g class="farewell-arm">
        <path d="M71 94 Q86 84 85 72" fill="none" stroke="${shirt}" stroke-width="9" stroke-linecap="round"/>
        <circle cx="85" cy="67" r="6" fill="${skin}"/>
      </g>
      ${longHair ? `<path d="M20 55 Q17 16 50 17 Q83 16 80 55 L83 85 L17 85Z" fill="#40303b"/>` : ""}
      <circle cx="22" cy="57" r="5" fill="${skin}"/><circle cx="78" cy="57" r="5" fill="${skin}"/>
      <circle cx="50" cy="53" r="29" fill="${skin}"/>
      <path d="${longHair ? "M21 51 Q18 19 50 19 Q82 19 79 51 Q70 33 59 39 Q44 29 21 51Z" : "M21 52 Q17 18 50 18 Q83 18 79 52 L69 37 Q55 44 42 34 Q28 36 21 52Z"}" fill="#40303b"/>
      <ellipse cx="39" cy="57" rx="3" ry="4" fill="#2b2430"/>
      <ellipse cx="62" cy="57" rx="3" ry="4" fill="#2b2430"/>
      ${index === 2 ? `<g fill="none" stroke="#61536a" stroke-width="2"><rect x="29" y="49" width="20" height="15" rx="5"/><rect x="53" y="49" width="20" height="15" rx="5"/><path d="M49 54 H53"/></g>` : ""}
      <ellipse cx="31" cy="67" rx="6" ry="3" fill="#ef9fa2" opacity=".7"/>
      <ellipse cx="70" cy="67" rx="6" ry="3" fill="#ef9fa2" opacity=".7"/>
      <path d="M43 67 Q50 77 58 67Z" fill="#c4574f"/>
    </svg>`;
  };

  let current = null;
  let timers = [];
  let animations = [];
  let observer = null;
  let visibilityCleanup = null;
  const reducedMotion = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;

  const setSpeaking = (group, speaking) => {
    group.classList.toggle("is-speaking", speaking);
    group.querySelector(".farewell-speech")?.setAttribute("aria-hidden", String(!speaking));
  };

  // เติมคำพูดในตัวจัดการปุ่มด้วย เผื่อหน้าเดิมยังไม่มีช่องคำพูด
  const ensureSpeech = (group, cast, text) => {
    let bubble = group.querySelector(".farewell-speech");
    if (!bubble) {
      bubble = document.createElement("p");
      bubble.className = "farewell-speech";
      bubble.textContent = text;
      cast.before(bubble);
    }
    setSpeaking(group, false);
  };

  const clearRun = () => {
    timers.forEach(clearTimeout);
    timers = [];
    animations.forEach((animation) => animation.cancel());
    animations = [];
    if (!current) return;
    current.particles.replaceChildren();
    current.scene.classList.remove("is-sending", "is-delivered", "no-motion");
    current.interns.classList.remove("is-receiving", "is-waving");
    setSpeaking(current.colleagueGroup, false);
    setSpeaking(current.interns, false);
    current.button.disabled = false;
    current.busy = false;
  };

  const cleanup = () => {
    clearRun();
    if (observer) observer.disconnect();
    observer = null;
    if (visibilityCleanup) visibilityCleanup();
    visibilityCleanup = null;
    document.body.classList.remove("farewell-in-view");
    current = null;
  };

  const mount = () => {
    cleanup();
    const scene = document.querySelector(".farewell");
    if (!scene) return;
    const colleagues = scene.querySelector(".farewell-colleagues .farewell-cast");
    const colleagueGroup = colleagues?.closest(".farewell-colleagues");
    const interns = scene.querySelector(".farewell-interns");
    const cast = interns?.querySelector(".farewell-cast");
    const stage = scene.querySelector(".farewell-stage");
    const particles = scene.querySelector(".farewell-particles");
    const button = scene.querySelector(".farewell-send");
    const status = scene.querySelector(".farewell-status");
    if (!colleagues || !colleagueGroup || !cast || !stage || !particles || !button || !status) return;

    ensureSpeech(colleagueGroup, colleagues, "โชคดีน้าาน้องตี๋ น้องหมวย");
    ensureSpeech(interns, cast, "ขอบคุณน้าาพี่ๆ บ๊ายบายย");

    const art = (typeof window.MascotArt !== "undefined" ? window.MascotArt : null) || {};
    colleagues.innerHTML = Array.from({ length: 5 }, (_, index) =>
      `<span class="farewell-person" aria-hidden="true">${colleagueArt(index)}</span>`
    ).join("");
    cast.innerHTML = `<span class="farewell-person farewell-tee" aria-hidden="true">${art.boy || colleagueArt(2)}</span>
      <span class="farewell-person farewell-muay" aria-hidden="true">${art.girl || colleagueArt(4)}</span>`;
    current = { scene, colleagues, colleagueGroup, interns, cast, stage, particles, button, status, busy: false };

    // ซ่อนตัวการ์ตูนติดขอบจอเฉพาะตอนที่มองเห็นฉากนี้ เพื่อไม่ให้ยืนซ้อนกัน
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        if (current?.scene !== scene) return;
        document.body.classList.toggle("farewell-in-view", entries.some((entry) => entry.isIntersecting));
      }, { threshold: 0.1 });
      observer.observe(scene);
    } else {
      const update = () => {
        const rect = scene.getBoundingClientRect();
        document.body.classList.toggle("farewell-in-view", rect.top < innerHeight && rect.bottom > 0);
      };
      addEventListener("scroll", update, { passive: true });
      addEventListener("resize", update);
      visibilityCleanup = () => {
        removeEventListener("scroll", update);
        removeEventListener("resize", update);
      };
      update();
    }
  };

  const allowMotion = () => {
    return !reducedMotion?.matches && !(typeof SITE !== "undefined" && SITE.cute === false);
  };

  const deliver = (scene, moving) => {
    if (current !== scene) return;
    setSpeaking(scene.colleagueGroup, true);
    setSpeaking(scene.interns, true);
    scene.scene.classList.remove("is-sending");
    scene.scene.classList.add("is-delivered");
    scene.status.textContent = "น้องตี๋กับน้องหมวยได้รับกำลังใจแล้ว ขอบคุณพี่ๆ นะ 💛";
    if (moving) scene.interns.classList.add("is-receiving", "is-waving");
  };

  const send = () => {
    if (!current || current.busy) return;
    clearRun();
    const scene = current;
    setSpeaking(scene.colleagueGroup, true);
    const moving = allowMotion() && typeof scene.stage.animate === "function";
    scene.scene.classList.toggle("no-motion", !moving);
    if (!moving) {
      deliver(scene, false);
      return;
    }

    scene.busy = true;
    scene.button.disabled = true;
    scene.scene.classList.add("is-sending");
    scene.status.textContent = "กำลังส่งกำลังใจจากพี่ๆ ไปหาน้องๆ…";
    const stage = scene.stage.getBoundingClientRect();
    const from = scene.colleagues.getBoundingClientRect();
    const to = scene.cast.getBoundingClientRect();
    const startX = from.left - stage.left + from.width * 0.75;
    const startY = from.top - stage.top + from.height * 0.36;
    const endX = to.left - stage.left + to.width * 0.45;
    const endY = to.top - stage.top + to.height * 0.4;
    const dx = endX - startX;
    const dy = endY - startY;
    const arc = Math.min(65, Math.max(25, dx * 0.24));
    const symbols = ["💌", "💛", "✦", "♥", "✧", "💖", "★", "♥"];
    symbols.forEach((symbol, index) => {
      const particle = document.createElement("span");
      particle.className = "farewell-particle" + (index === 0 ? " is-envelope" : "");
      particle.textContent = symbol;
      particle.style.left = startX + "px";
      particle.style.top = startY + (index % 3 - 1) * 8 + "px";
      scene.particles.appendChild(particle);
      const animation = particle.animate([
        { transform: "translate(-50%, -50%) scale(0.5) rotate(-12deg)", opacity: 0 },
        { offset: 0.12, opacity: 1 },
        { offset: 0.5, transform: `translate(calc(-50% + ${dx * 0.5}px), calc(-50% + ${dy * 0.5 - arc}px)) scale(1.15) rotate(8deg)`, opacity: 1 },
        { offset: 0.88, opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.65) rotate(0deg)`, opacity: 0 },
      ], { duration: 900, delay: index * 70, easing: "ease-in-out", fill: "both" });
      animation.onfinish = () => particle.remove();
      animations.push(animation);
    });
    timers.push(setTimeout(() => deliver(scene, true), 1450));
    timers.push(setTimeout(() => {
      if (current !== scene) return;
      scene.interns.classList.remove("is-receiving", "is-waving");
      scene.particles.replaceChildren();
      animations = [];
      timers = [];
      scene.button.disabled = false;
      scene.busy = false;
    }, 2900));
  };

  // ใช้ตัวจัดการเดียวทั้งเว็บ กดซ้ำหรือกลับมาหน้านี้จึงไม่เพิ่มเหตุการณ์ซ้อนกัน
  document.addEventListener("click", (event) => {
    const button = event.target.closest && event.target.closest(".farewell-send");
    if (button && button === current?.button) send();
  });
  // ถ้าเปิดลดการเคลื่อนไหวระหว่างส่ง ให้รับกำลังใจทันทีและหยุดภาพที่กำลังลอย
  const stopMotion = () => {
    if (!reducedMotion.matches || !current?.busy) return;
    const scene = current;
    clearRun();
    scene.scene.classList.add("no-motion");
    deliver(scene, false);
  };
  if (reducedMotion?.addEventListener) reducedMotion.addEventListener("change", stopMotion);
  else if (reducedMotion?.addListener) reducedMotion.addListener(stopMotion);
  addEventListener("hashchange", mount);
  addEventListener("pagehide", cleanup);
  addEventListener("pageshow", (event) => { if (event.persisted) mount(); });
  mount();
})();
