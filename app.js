(() => {
  const app = document.getElementById("app");
  const LETTER_BOOK = typeof LETTERS !== "undefined" ? LETTERS : {};
  const MEMORY_LIST = (typeof MEMORIES !== "undefined" ? MEMORIES : []).filter((m) => m && String(m.title || "").trim());

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const findPerson = (id) => PEOPLE.find((p) => p.id === id);

  // จดหมายของพี่คนหนึ่ง → [{ author, text, media }, ...] เฉพาะฉบับที่เขียนแล้ว
  // แต่ละฉบับเขียนเป็น `ข้อความ` ล้วน หรือ { text: `ข้อความ`, media: [รูป/คลิป] } ก็ได้
  const lettersFor = (p) => {
    const raw = LETTER_BOOK[p.id] || p.letter;
    if (!raw) return [];
    const list = typeof raw === "string" ? [[SITE.from, raw]] : Object.entries(raw);
    return list
      .map(([author, v]) => {
        const o = typeof v === "string" ? { text: v } : v || {};
        const text = String(o.text || "").trim();
        const media = (Array.isArray(o.media) ? o.media : []).map((it) => toMedia(it, { title: `จดหมายจาก ${SITE.from}` })).filter(Boolean);
        return { author, text, media };
      })
      .filter((l) => l.text || l.media.length);
  };

  const paragraphs = (text) =>
    String(text || "")
      .trim()
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.split("\n").map((l) => esc(l.trim())).join("<br>")}</p>`)
      .join("");

  // ตรวจข้อมูลที่พิมพ์ผิดบ่อยๆ แล้วเตือนใน Console (กด F12)
  (() => {
    const ids = new Set();
    PEOPLE.forEach((p) => (ids.has(p.id) ? console.warn(`[data.js] id ซ้ำ: "${p.id}"`) : ids.add(p.id)));
    Object.keys(LETTER_BOOK).forEach((id) => ids.has(id) || console.warn(`[letters.js] ไม่มีพี่ id "${id}" ใน data.js`));
  })();

  // รูป/คลิปที่โหลดไม่ขึ้นจะถูกซ่อน แล้วแสดง emoji/สีพื้นแทน
  window.__mediaFail = (el) => {
    el.closest("[data-ok]")?.removeAttribute("data-ok");
    el.remove();
  };

  const avatar = (p, cls = "") => `
    <span class="avatar ${cls}" style="--c:${esc(p.color || "#f1d3b3")}" ${p.avatar ? "data-ok" : ""}>
      <span class="avatar-fallback" aria-hidden="true">${esc(p.emoji || "🌼")}</span>
      ${p.avatar ? `<img src="${esc(p.avatar)}" alt="" loading="lazy" onerror="__mediaFail(this)">` : ""}
    </span>`;

  /* ------------------------------ รูป / คลิป ------------------------------ */
  const VIDEO_EXT = /\.(mp4|webm|mov|m4v|ogv)(?:[?#]|$)/i;
  const youtubeId = (url) =>
    (url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/) || [])[1];

  // รับได้ทั้ง "media/a.jpg" หรือ { src: "media/a.jpg", caption: "..." }
  const toMedia = (item, m) => {
    const o = typeof item === "string" ? { src: item } : item || {};
    const src = String(o.src || "").trim();
    if (!src) return null;
    const yt = youtubeId(src);
    return { type: yt ? "youtube" : VIDEO_EXT.test(src) ? "video" : "image", src, yt, caption: o.caption || m.title };
  };

  /* ------------------------------ หน้าแรก ------------------------------ */
  function renderHome() {
    document.title = SITE.title;
    lastPerson = null;
    app.innerHTML = `
      <main class="home">
        <header class="home-head">
          ${SITE.mascots ? `<div class="mascot-slot" aria-hidden="true"></div>` : ""}
          <p class="eyebrow">${esc(SITE.period)}</p>
          <h1>${esc(SITE.title)}</h1>
          <p class="lead">${esc(SITE.subtitle)}</p>
        </header>

        <section class="pick">
          <h2>พี่คือใครเอ่ย? <span>กดเลือกชื่อของตัวเองได้เลย</span></h2>
          ${PEOPLE.length > 8 ? `<input class="search" type="search" placeholder="ค้นหาชื่อพี่..." aria-label="ค้นหาชื่อ">` : ""}
          <ul class="people-grid">
            ${PEOPLE.map(
              (p, i) => `
              <li style="--i:${i}" data-q="${esc(`${p.name} ${p.role || ""} ${p.id}`.toLowerCase())}">
                <a class="person-card" href="#/to/${encodeURIComponent(p.id)}" style="--c:${esc(p.color || "#f1d3b3")}">
                  ${avatar(p)}
                  <span class="pc-name">${esc(p.name)}</span>
                  ${p.role ? `<span class="pc-role">${esc(p.role)}</span>` : ""}
                </a>
              </li>`
            ).join("")}
          </ul>
          <p class="empty" hidden>ไม่เจอชื่อนี้เลย ลองพิมพ์ใหม่อีกทีนะ</p>
        </section>

        <section class="memories-cta">
          <p>หรืออยากดูความทรงจำรวมของทุกคน</p>
          <a class="btn btn-big" href="#/memories">📸 ดูความทรงจำของน้องฝึกงาน<br>กับพี่ๆ LGB ทุกคน</a>
        </section>

        <footer class="foot">ด้วยรัก จาก ${esc(SITE.from)}</footer>
      </main>`;

    const search = app.querySelector(".search");
    if (search) {
      search.addEventListener("input", () => {
        const q = search.value.trim().toLowerCase();
        let shown = 0;
        app.querySelectorAll(".people-grid li").forEach((li) => {
          li.hidden = q && !li.dataset.q.includes(q);
          if (!li.hidden) shown++;
        });
        app.querySelector(".empty").hidden = shown > 0;
      });
    }
  }

  /* ---------------------------- หน้าของพี่แต่ละคน ---------------------------- */
  let gallery = []; // รูป/คลิปทั้งหมดในหน้า ใช้กับ lightbox
  let lastPerson = null;
  const visited = new Set();

  function tile(md, cls, emoji) {
    const i = gallery.push(md) - 1;
    const fallback = `<span class="shot-fallback" aria-hidden="true">${esc(emoji)}</span>`;
    const play = md.type === "image" ? "" : `<span class="play" aria-hidden="true">▶</span>`;
    const inner =
      md.type === "video"
        ? `<video src="${esc(md.src)}#t=0.1" muted playsinline preload="metadata" onerror="__mediaFail(this)"></video>`
        : `<img src="${esc(md.type === "youtube" ? `https://i.ytimg.com/vi/${md.yt}/hqdefault.jpg` : md.src)}" alt="" loading="lazy" onerror="__mediaFail(this)">`;
    return `
      <button class="shot ${cls}${md.type === "youtube" ? " yt" : ""}" data-media="${i}" data-ok aria-label="${md.type === "image" ? "ดูรูปขนาดใหญ่" : "เล่นคลิป"}">
        ${fallback}${inner}${play}
      </button>`;
  }

  function memoryCard(m, idx) {
    const list = (m.media || m.photos || []).map((it) => toMedia(it, m)).filter(Boolean);
    const emoji = m.emoji || "📸";

    const media = list.length
      ? `<div class="polaroid">
           ${tile(list[0], "shot-main", emoji)}
           ${list.length > 1 ? `<div class="thumbs">${list.slice(1).map((md) => tile(md, "shot-thumb", emoji)).join("")}</div>` : ""}
         </div>`
      : `<div class="polaroid"><div class="shot shot-main"><span class="shot-fallback">${esc(emoji)}</span></div></div>`;

    return `
      <li class="memory reveal" style="--tilt:${idx % 2 ? 1.2 : -1.4}deg">
        <span class="dot" aria-hidden="true"></span>
        <article>
          ${media}
          <div class="memory-text">
            ${m.place ? `<p class="meta"><span class="place">${esc(m.place)}</span></p>` : ""}
            <h3>${esc(m.title)}</h3>
            ${m.description ? `<div class="desc">${paragraphs(m.description)}</div>` : ""}
          </div>
        </article>
      </li>`;
  }

  /* ------------------------------ กล่องตอบกลับ ------------------------------ */
  // ใช้ได้เมื่อตั้ง SITE.reply ใน data.js แล้วเท่านั้น (ยังไม่ตั้ง = ไม่แสดงกล่อง)
  const REPLY = SITE.reply && SITE.reply.action && SITE.reply.messageField ? SITE.reply : null;
  let cleanupReply = () => {};

  const replyBox = (p) =>
    REPLY
      ? `<section class="reply reveal">
           <h2>💌 ส่งข้อความกลับมาหาน้องๆ</h2>
           <p class="reply-hint">Feedback ความในใจ หรืออะไรก็ได้ที่อยากบอก<br>ส่งถึง ${esc(SITE.from)} เท่านั้น คนอื่นไม่เห็นนะ</p>
           <div class="reply-scene" role="group" aria-label="ส่งจดหมายจาก ${esc(p.name)} ไปหาน้องตี๋และน้องหมวย">
             <div class="reply-sender reply-cast">
               <span class="reply-character" aria-hidden="true">${typeof window.ReplyCharacters !== "undefined" ? window.ReplyCharacters.person(p) : esc(p.emoji || "😊")}</span>
               <span class="reply-name">${esc(p.name)}</span>
             </div>
             <div class="reply-airmail" aria-hidden="true">
               <span class="reply-route"></span>
               <span class="reply-envelope">
                 <svg viewBox="0 0 40 32" aria-hidden="true">
                   <rect x="1" y="3" width="38" height="26" rx="4" fill="#fff8ed" stroke="#d0704f" stroke-width="1.5"/>
                   <path d="M2 27 L16 15 M38 27 L24 15" fill="none" stroke="#e6bd9f" stroke-width="1.5"/>
                   <path d="M2 5 L18 18 Q20 20 22 18 L38 5" fill="#f6dfce" stroke="#d0704f" stroke-width="1.5" stroke-linejoin="round"/>
                   <path d="M20 12 C14 7 12 15 20 20 C28 15 26 7 20 12Z" fill="#dc8290"/>
                 </svg>
               </span>
             </div>
             <div class="reply-recipients reply-cast">
               <div class="reply-interns" aria-hidden="true">
                 <span class="reply-character reply-tee">👦🏻</span>
                 <span class="reply-character reply-muay">👧🏻</span>
               </div>
               <span class="reply-name">น้องตี๋ &amp; น้องหมวย</span>
             </div>
           </div>
           <p class="reply-delivery">ฝากความในใจมากับจดหมายได้เลย 💛</p>
           <form class="reply-form" novalidate>
             <textarea name="message" rows="5" maxlength="3000" placeholder="พิมพ์ถึงน้องๆ ได้เลย..." aria-label="ข้อความถึง ${esc(SITE.from)}"></textarea>
             <button class="btn btn-accent" type="submit">ส่งข้อความ 💌</button>
             <p class="reply-status" role="status" aria-live="polite"></p>
           </form>
         </section>`
      : "";

  function bindReply(root, p) {
    const form = root.querySelector(".reply-form");
    if (!form) return;
    const ta = form.elements.message;
    const btn = form.querySelector("button");
    const status = form.querySelector(".reply-status");
    const box = form.closest(".reply");
    const scene = box.querySelector(".reply-scene");
    const envelope = box.querySelector(".reply-envelope");
    const delivery = box.querySelector(".reply-delivery");
    const KEY = "reply-draft:" + p.id;
    const reducedMotion = window.matchMedia ? matchMedia("(prefers-reduced-motion: reduce)") : null;
    let active = true;
    let animation = null;
    let flightDone = null;
    let observer = null;

    // ใช้รูปน้องๆ ชุดเดียวกับตัวการ์ตูนติดขอบจอ รอไฟล์ mascots.js ถ้าเปิดลิงก์พี่โดยตรง
    const fillInterns = () => {
      if (!active || typeof window.MascotArt === "undefined") return;
      if (window.MascotArt.boy) box.querySelector(".reply-tee").innerHTML = window.MascotArt.boy;
      if (window.MascotArt.girl) box.querySelector(".reply-muay").innerHTML = window.MascotArt.girl;
    };
    fillInterns();
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fillInterns, { once: true });

    const stopFlight = () => {
      if (animation) animation.cancel();
      animation = null;
      const done = flightDone;
      flightDone = null;
      if (done) done();
    };
    const updateMotion = () => {
      const noMotion = !!reducedMotion?.matches || SITE.cute === false;
      box.classList.toggle("no-motion", noMotion);
      if (noMotion) stopFlight();
    };
    updateMotion();
    if (reducedMotion?.addEventListener) reducedMotion.addEventListener("change", updateMotion);
    else if (reducedMotion?.addListener) reducedMotion.addListener(updateMotion);

    // หลบตัวการ์ตูนติดขอบจอเมื่อมองเห็นฉากส่งจดหมาย เพื่อไม่ให้บังช่องพิมพ์
    const updateVisibility = () => {
      const rect = scene.getBoundingClientRect();
      document.body.classList.toggle("reply-in-view", active && rect.width > 0 && rect.top < innerHeight && rect.bottom > 0);
    };
    if ("IntersectionObserver" in window) {
      observer = new IntersectionObserver((entries) => {
        if (active) document.body.classList.toggle("reply-in-view", entries.some((entry) => entry.isIntersecting));
      });
      observer.observe(box);
    } else {
      addEventListener("scroll", updateVisibility, { passive: true });
      addEventListener("resize", updateVisibility);
      updateVisibility();
    }

    const flyLetter = () => {
      stopFlight();
      updateMotion();
      if (box.classList.contains("no-motion") || typeof envelope.animate !== "function") return Promise.resolve();
      const stage = scene.getBoundingClientRect();
      const from = box.querySelector(".reply-sender .reply-character").getBoundingClientRect();
      const to = box.querySelector(".reply-interns").getBoundingClientRect();
      const startX = from.left - stage.left + from.width * 0.85 - 20;
      const startY = from.top - stage.top + from.height * 0.69 - 16;
      const endX = to.left - stage.left + to.width * 0.45 - 20;
      const endY = to.top - stage.top + to.height * 0.58 - 16;
      const middleX = (startX + endX) / 2;
      const middleY = Math.min(startY, endY) - Math.min(48, Math.max(20, (endX - startX) * 0.28));
      return new Promise((resolve) => {
        flightDone = resolve;
        try {
          animation = envelope.animate([
            { transform: `translate(${startX}px, ${startY}px) scale(0.65) rotate(-15deg)`, opacity: 0 },
            { offset: 0.12, opacity: 1 },
            { offset: 0.5, transform: `translate(${middleX}px, ${middleY}px) scale(1.12) rotate(7deg)`, opacity: 1 },
            { offset: 0.88, opacity: 1 },
            { transform: `translate(${endX}px, ${endY}px) scale(0.65) rotate(-8deg)`, opacity: 0 },
          ], { duration: 1200, easing: "ease-in-out", fill: "both" });
          animation.onfinish = stopFlight;
        } catch {
          stopFlight();
        }
      });
    };

    cleanupReply = () => {
      active = false;
      stopFlight();
      observer?.disconnect();
      document.removeEventListener("DOMContentLoaded", fillInterns);
      removeEventListener("scroll", updateVisibility);
      removeEventListener("resize", updateVisibility);
      if (reducedMotion?.removeEventListener) reducedMotion.removeEventListener("change", updateMotion);
      else if (reducedMotion?.removeListener) reducedMotion.removeListener(updateMotion);
      document.body.classList.remove("reply-in-view");
    };

    // เก็บข้อความที่พิมพ์ค้างไว้ในเครื่อง กลับมาแล้วไม่หาย
    try { ta.value = localStorage.getItem(KEY) || ""; } catch {}
    ta.addEventListener("input", () => {
      try { localStorage.setItem(KEY, ta.value); } catch {}
      if (!btn.disabled) {
        box.classList.remove("is-delivered");
        delivery.textContent = "ฝากความในใจมากับจดหมายได้เลย 💛";
        status.textContent = "";
      }
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (btn.disabled || !active) return;
      const text = ta.value.trim();
      if (!text) { status.textContent = "พิมพ์ข้อความก่อนนะ"; ta.focus(); return; }
      btn.disabled = true;
      ta.readOnly = true;
      form.setAttribute("aria-busy", "true");
      box.classList.remove("is-delivered");
      box.classList.add("is-sending");
      delivery.textContent = "จดหมายกำลังเดินทางไปหาน้องๆ 💌";
      btn.textContent = "กำลังส่งจดหมาย…";
      status.textContent = "กำลังส่ง…";
      const flight = flyLetter();
      try {
        const body = new URLSearchParams();
        if (REPLY.nameField) body.set(REPLY.nameField, p.name);
        body.set(REPLY.messageField, text);
        // Google Form ไม่ส่ง CORS กลับ (no-cors) จึงตรวจผลไม่ได้ ถือว่าส่งถึงถ้าไม่มี network error
        await fetch(REPLY.action, { method: "POST", mode: "no-cors", body });
        // ลบร่างเมื่อส่งสำเร็จ แม้พี่จะเปลี่ยนหน้าไประหว่างรอ แต่ไม่ลบร่างใหม่ที่เขียนเพิ่ม
        try {
          if ((localStorage.getItem(KEY) || "").trim() === text) localStorage.removeItem(KEY);
        } catch {}
        await flight;
        if (!active) return;
        ta.value = "";
        box.classList.add("is-delivered");
        delivery.textContent = "ขอบคุณสำหรับจดหมายนะ " + p.name + " 💛";
        status.textContent = "ส่งแล้ว ขอบคุณมากๆ นะ 💛";
      } catch {
        stopFlight();
        if (!active) return;
        delivery.textContent = "จดหมายยังอยู่ ลองส่งให้น้องๆ อีกทีนะ 💌";
        status.textContent = "ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะ";
      } finally {
        if (active) {
          box.classList.remove("is-sending");
          form.removeAttribute("aria-busy");
          ta.readOnly = false;
          btn.disabled = false;
          btn.textContent = "ส่งข้อความ 💌";
        }
      }
    });
  }

  function renderPerson(p) {
    const letters = lettersFor(p);
    const seen = visited.has(p.id); // เคยเปิดซองแล้ว (เช่น กลับมาจากหน้าแกลเลอรี) ไม่ต้องเปิดซ้ำ
    lastPerson = p;
    gallery = [];
    document.title = `ถึง ${p.name} · ${SITE.title}`;

    app.innerHTML = `
      ${
        seen
          ? ""
          : `<div class="envelope-screen" style="--c:${esc(p.color || "#f1d3b3")}">
               <button class="envelope" aria-label="เปิดจดหมาย">
                 <span class="env-back"></span>
                 <span class="env-letter"><span>ถึง ${esc(p.name)}</span></span>
                 <span class="env-front"></span>
                 <span class="env-flap"></span>
                 <span class="env-seal">💌</span>
               </button>
               <p class="env-hint">มีจดหมายถึง <b>${esc(p.name)}</b><small>แตะที่ซองเพื่อเปิด</small></p>
             </div>`
      }

      <main class="person" style="--c:${esc(p.color || "#f1d3b3")}" ${seen ? "" : "hidden"}>
        <a class="back" href="#/">← กลับไปเลือกชื่อ</a>

        <header class="p-hero">
          ${avatar(p, "avatar-lg")}
          <p class="eyebrow">ถึง</p>
          <h1>${esc(p.name)}</h1>
          ${p.role ? `<p class="role">${esc(p.role)}</p>` : ""}
        </header>

        ${letters
          .map(
            (l) => `
          <article class="letter reveal">
            ${paragraphs(l.text)}
            ${
              l.media.length
                ? `<div class="letter-media">${l.media.map((md, i) => tile(md, "shot-letter", "📸")).join("")}</div>`
                : ""
            }
            <p class="sign">${esc(SITE.signOff)}<br><b>${esc(SITE.from)}</b></p>
          </article>`
          )
          .join("")}

        ${replyBox(p)}

        <section class="closing reveal">
          <p class="thanks">ขอบคุณ ${esc(p.name)} <span aria-hidden="true">♥</span></p>
          <div class="closing-actions">
            <a class="btn btn-accent" href="#/memories">📸 ดูความทรงจำรวม</a>
            <a class="btn" href="#/">กลับหน้าแรก</a>
          </div>
        </section>

        <footer class="foot">ด้วยรัก จาก ${esc(SITE.from)}</footer>
      </main>`;

    const main = app.querySelector(".person");
    bindMedia(main);
    bindReply(main, p);
    if (seen) return observeReveals();

    const screen = app.querySelector(".envelope-screen");
    const env = app.querySelector(".envelope");
    let opened = false;

    const open = () => {
      if (opened) return;
      opened = true;
      visited.add(p.id);
      env.classList.add("open");
      setTimeout(() => screen.classList.add("leave"), 1100);
      setTimeout(() => {
        screen.remove();
        main.hidden = false;
        window.scrollTo(0, 0);
        observeReveals();
      }, 1600);
    };
    screen.addEventListener("click", open);
  }

  // กดรูป/คลิปในหน้าไหนก็ได้ → เปิด lightbox
  function bindMedia(root) {
    root.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-media]");
      if (btn && btn.hasAttribute("data-ok")) openLightbox(+btn.dataset.media);
    });
  }

  // คลิปตัดต่อแยกจากเรื่องเล่า อยู่ก่อนปุ่มกลับหน้าแรก
  function memoryVideoSection() {
    const config = (typeof MEMORY_VIDEO !== "undefined" ? MEMORY_VIDEO : null) || {};
    const src = String(config.src || "").trim();
    const poster = String(config.poster || "").trim();
    return `
      <section class="memory-film reveal" aria-labelledby="memory-film-title">
        <h2 id="memory-film-title">คลิปความทรงจำของเรา</h2>
        <p class="memory-film-intro">รวมช่วงเวลาดีๆ ของน้องๆ กับพี่ๆ LGB ไว้ด้วยกัน</p>
        <div class="memory-film-frame">
          ${src ? `<video class="memory-film-player" src="${esc(src)}"${poster ? ` poster="${esc(poster)}"` : ""} controls playsinline preload="metadata" aria-label="คลิปความทรงจำของเรา"></video>` : ""}
          <div class="memory-film-placeholder"${src ? " hidden" : ""}>
            <span class="memory-film-icon" aria-hidden="true">🎬</span>
            <p class="memory-film-message">คลิปความทรงจำกำลังมาแล้ว</p>
            <p>แล้วกลับมาดูด้วยกันนะ 💛</p>
          </div>
        </div>
      </section>`;
  }

  function pauseMemoryVideo() {
    app.querySelector(".memory-film-player")?.pause();
  }

  function bindMemoryVideo() {
    const video = app.querySelector(".memory-film-player");
    if (!video) return;
    const restore = () => {
      const current = app.querySelector(".memory-film-player");
      // เหตุการณ์พักคลิปอาจมาหลังเปิด lightbox หรือเปลี่ยนหน้าแล้ว
      if (lb.hidden && (!current || current.paused)) window.Music?.restore();
    };
    video.addEventListener("play", () => window.Music?.duck());
    video.addEventListener("pause", restore);
    video.addEventListener("ended", restore);
    video.addEventListener("error", () => {
      const placeholder = video.parentElement?.querySelector(".memory-film-placeholder");
      video.pause();
      video.remove();
      if (placeholder) {
        placeholder.hidden = false;
        placeholder.querySelector(".memory-film-message").textContent = "ตอนนี้ยังเปิดคลิปไม่ได้";
      }
      restore();
    });
  }

  // ฉากส่งน้องท้ายหน้า ตัวการ์ตูนและหัวใจลอยเติมโดย farewell.js
  function farewellSection() {
    return `
      <section class="farewell reveal" aria-labelledby="farewell-title">
        <h2 id="farewell-title">ส่งน้องๆ ด้วยรอยยิ้ม</h2>
        <p class="farewell-intro">กดส่งหัวใจจากพี่ๆ ไปให้น้องตี๋กับน้องหมวยกัน 💛</p>
        <div class="farewell-stage">
          <div class="farewell-group farewell-colleagues">
            <p class="farewell-speech" aria-hidden="true">โชคดีน้าา<span>น้องตี๋</span> <span>น้องหมวย</span></p>
            <div class="farewell-cast" aria-hidden="true"></div>
            <p class="farewell-label">พี่ๆ LGB</p>
          </div>
          <div class="farewell-path" aria-hidden="true"></div>
          <div class="farewell-group farewell-interns">
            <p class="farewell-speech" aria-hidden="true">ขอบคุณน้าาพี่ๆ บ๊ายบายย</p>
            <div class="farewell-cast" aria-hidden="true"></div>
            <p class="farewell-label">น้องตี๋ &amp; น้องหมวย</p>
          </div>
          <div class="farewell-particles" aria-hidden="true"></div>
        </div>
        <button class="btn btn-accent farewell-send" type="button">ส่งน้องตี๋กับน้องหมวย</button>
        <p class="farewell-status" role="status" aria-live="polite" aria-atomic="true"></p>
      </section>`;
  }

  // ใช้เฉพาะลิงก์เว็บแบบเต็มสำหรับไอคอนโซเชียล
  const contactWebUrl = (value) => {
    try {
      const url = new URL(String(value || "").trim());
      return ["https:", "http:"].includes(url.protocol) && url.hostname ? url.href : "";
    } catch { return ""; }
  };

  function contactSection() {
    const config = (typeof INTERN_CONTACTS !== "undefined" ? INTERN_CONTACTS : null) || {};
    const people = [
      { key: "tee", name: "น้องตี๋", shortName: "ตี๋", color: "#7fb4d8" },
      { key: "muay", name: "น้องหมวย", shortName: "หมวย", color: "#e8a0b3" },
    ];
    const icons = {
      facebook: `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M14 8h3V4h-3c-3 0-5 2-5 5v2H6v4h3v7h4v-7h3l1-4h-4V9c0-.7.3-1 1-1Z"/></svg>`,
      instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
    };
    const row = (label, value, href) => !value ? "" : `
      <li>${href ? `<a class="contact-link" href="${esc(href)}">` : `<div class="contact-link">`}
        <span class="contact-channel">${esc(label)}</span>
        <span class="contact-detail">${esc(value)}</span>
        ${href ? `<small aria-hidden="true">↗</small></a>` : "</div>"}
      </li>`;
    const cards = people.map((person) => {
      const profile = config[person.key] || {};
      const text = (key) => String(profile[key] || "").trim();
      const fullName = text("fullName");
      const nickname = text("nickname") || person.shortName;
      const photo = text("photo");
      const socials = [["facebook", "เฟซบุ๊ก"], ["instagram", "อินสตาแกรม"]].map(([key, label]) => {
        const url = contactWebUrl(text(key));
        const name = text(`${key}Name`);
        if (!name && !url) return "";
        const description = `${label}ของ${person.name}${name ? `: ${name}` : ""}`;
        return `${url ? `<a class="contact-social" href="${esc(url)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(description)}" title="${esc(description)}">` : `<div class="contact-social">`}
          ${icons[key]}<span class="contact-social-name">${esc(name || label)}</span>
          ${url ? `<small aria-hidden="true">↗</small></a>` : "</div>"}`;
      }).join("");
      const phone = text("phone");
      const email = text("email");
      const phoneHref = /^\+?[\d\s().-]+$/.test(phone) && !/[\u0000-\u001f\u007f]/.test(phone) && phone.replace(/\D/g, "").length >= 3
        ? `tel:${phone.replace(/[^\d+]/g, "")}` : "";
      const emailHref = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && !/[\u0000-\u001f\u007f]/.test(email)
        ? `mailto:${encodeURIComponent(email).replace(/%40/gi, "@")}` : "";
      const details = row("โทรศัพท์", phone, phoneHref) + row("อีเมล", email, emailHref);
      return `
        <article class="contact-card" style="--contact-accent:${esc(person.color)}">
          <header class="contact-head">
            <span class="contact-avatar" aria-hidden="true"${photo ? " data-ok" : ""}>
              <span class="contact-avatar-fallback">${esc(person.shortName)}</span>
              ${photo ? `<img src="${esc(photo)}" alt="" loading="lazy" onerror="__mediaFail(this)">` : ""}
            </span>
            <h3>${esc(person.name)}</h3>
            <span class="contact-mascot" data-contact-mascot="${person.key === "tee" ? "boy" : "girl"}" aria-hidden="true"></span>
          </header>
          <p class="contact-fullname">${fullName ? esc(`${fullName} (${nickname})`) : "ชื่อ–นามสกุล: —"}</p>
          ${socials ? `<div class="contact-socials">${socials}</div>` : ""}
          ${details ? `<ul class="contact-links">${details}</ul>` : ""}
          ${!socials && !details ? `<p class="contact-empty">เดี๋ยวน้องมาแปะช่องทางติดต่อไว้นะ 💛</p>` : ""}
        </article>`;
    }).join("");
    return `
      <section class="intern-contacts reveal" aria-labelledby="contacts-title">
        <h2 id="contacts-title">ยังทักหากันได้เสมอนะ</h2>
        <p class="contacts-intro">ช่องทางติดต่อของน้องตี๋กับน้องหมวย</p>
        <div class="contact-grid">${cards}</div>
      </section>`;
  }

  /* ------------------------- หน้าความทรงจำรวม ------------------------- */
  function renderGallery() {
    const mems = MEMORY_LIST;
    gallery = [];
    document.title = `ความทรงจำของเรา · ${SITE.title}`;
    const back = lastPerson
      ? `<a class="back" href="#/to/${encodeURIComponent(lastPerson.id)}">← กลับไปที่จดหมาย</a>`
      : "";

    app.innerHTML = `
      <main class="person gallery" style="--c:${esc(lastPerson?.color || "#e8cfa8")}">
        ${back}
        <section class="memories">
          <h2 class="reveal">ความทรงจำของน้องฝึกงาน<br>กับพี่ๆ LGB ทุกคน</h2>
          <p class="count reveal">${mems.length ? `${mems.length} เรื่องที่อยากเก็บไว้` : ""}</p>
          ${
            mems.length
              ? `<ol class="timeline">${mems.map((m, i) => memoryCard(m, i)).join("")}</ol>`
              : `<p class="soon reveal">📸<br>กำลังรวบรวมภาพและคลิปอยู่<br>เร็วๆ นี้จะมาให้ดูกันนะ</p>`
          }
        </section>

        ${memoryVideoSection()}

        <section class="closing reveal">
          <a class="btn" href="#/">กลับหน้าแรก</a>
        </section>

        ${farewellSection()}

        ${contactSection()}

        <footer class="foot">ด้วยรัก จาก ${esc(SITE.from)}</footer>
      </main>`;

    bindMedia(app.querySelector(".person"));
    bindMemoryVideo();
    observeReveals();
  }

  function renderNotFound() {
    document.title = SITE.title;
    app.innerHTML = `
      <main class="home notfound">
        <p class="big">🤔</p>
        <h1>ไม่พบชื่อนี้</h1>
        <a class="btn" href="#/">กลับไปเลือกชื่อ</a>
      </main>`;
  }

  /* ------------------------------ เอฟเฟกต์ ------------------------------ */
  function observeReveals() {
    const els = app.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window)) return els.forEach((el) => el.classList.add("in"));
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("in");
            io.unobserve(en.target);
          }
        }),
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => io.observe(el));
  }

  /* ------------------------------ Lightbox ------------------------------ */
  const lb = document.getElementById("lightbox");
  const lbStage = lb.querySelector(".lb-stage");
  const lbCap = lb.querySelector("figcaption");
  let lbIdx = 0;

  // ข้ามรูป/คลิปที่โหลดไม่ขึ้น
  const validMedia = () => [...app.querySelectorAll("[data-media][data-ok]")].map((b) => +b.dataset.media);

  function openLightbox(i) {
    pauseMemoryVideo();
    lbIdx = i;
    showLightbox();
    lb.hidden = false;
    document.body.style.overflow = "hidden";
  }
  function showLightbox() {
    const md = gallery[lbIdx];
    lbStage.innerHTML =
      md.type === "video"
        ? `<video src="${esc(md.src)}" controls autoplay playsinline></video>`
        : md.type === "youtube"
        ? `<iframe src="https://www.youtube.com/embed/${md.yt}?autoplay=1&rel=0" title="${esc(md.caption)}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`
        : `<img src="${esc(md.src)}" alt="">`;
    lbCap.textContent = md.caption;
    if (md.type === "image") window.Music?.restore();
    else window.Music?.duck();
    const many = validMedia().length > 1;
    lb.querySelectorAll(".lb-nav").forEach((b) => (b.hidden = !many));
  }
  function stepLightbox(dir) {
    const list = validMedia();
    if (list.length < 2) return;
    const pos = list.indexOf(lbIdx);
    lbIdx = list[(pos + dir + list.length) % list.length];
    showLightbox();
  }
  function closeLightbox() {
    lb.hidden = true;
    lbStage.innerHTML = ""; // หยุดคลิปที่กำลังเล่น
    window.Music?.restore();
    document.body.style.overflow = "";
  }

  lb.addEventListener("click", (e) => {
    if (e.target.closest(".lb-prev")) return stepLightbox(-1);
    if (e.target.closest(".lb-next")) return stepLightbox(1);
    if (e.target === lb || e.target.closest(".lb-close")) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") stepLightbox(-1);
    if (e.key === "ArrowRight") stepLightbox(1);
  });

  /* ------------------------------ Router ------------------------------ */
  function route() {
    cleanupReply();
    cleanupReply = () => {};
    pauseMemoryVideo();
    closeLightbox();
    const m = location.hash.match(/^#\/to\/([^/?#]+)/);
    if (location.hash.startsWith("#/memories")) renderGallery();
    else if (!m) renderHome();
    else {
      const p = findPerson(decodeURIComponent(m[1]));
      p ? renderPerson(p) : renderNotFound();
    }
    window.scrollTo(0, 0);
  }

  window.addEventListener("hashchange", route);
  route();
})();
