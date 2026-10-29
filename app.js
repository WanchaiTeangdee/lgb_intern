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

  const replyBox = () =>
    REPLY
      ? `<section class="reply reveal">
           <h2>💌 ส่งข้อความกลับมาหาน้องๆ</h2>
           <p class="reply-hint">Feedback ความในใจ หรืออะไรก็ได้ที่อยากบอก<br>ส่งถึง ${esc(SITE.from)} เท่านั้น คนอื่นไม่เห็นนะ</p>
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
    const KEY = "reply-draft:" + p.id;

    // เก็บข้อความที่พิมพ์ค้างไว้ในเครื่อง กลับมาแล้วไม่หาย
    try { ta.value = localStorage.getItem(KEY) || ""; } catch {}
    ta.addEventListener("input", () => { try { localStorage.setItem(KEY, ta.value); } catch {} });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const text = ta.value.trim();
      if (!text) { status.textContent = "พิมพ์ข้อความก่อนนะ"; return; }
      btn.disabled = true;
      status.textContent = "กำลังส่ง…";
      try {
        const body = new URLSearchParams();
        if (REPLY.nameField) body.set(REPLY.nameField, p.name);
        body.set(REPLY.messageField, text);
        // Google Form ไม่ส่ง CORS กลับ (no-cors) จึงตรวจผลไม่ได้ ถือว่าส่งถึงถ้าไม่มี network error
        await fetch(REPLY.action, { method: "POST", mode: "no-cors", body });
        ta.value = "";
        try { localStorage.removeItem(KEY); } catch {}
        status.textContent = "ส่งแล้ว ขอบคุณมากๆ นะ 💛";
      } catch {
        status.textContent = "ส่งไม่สำเร็จ ลองใหม่อีกครั้งนะ";
      }
      btn.disabled = false;
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

        ${replyBox()}

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

        <section class="closing reveal">
          <a class="btn" href="#/">กลับหน้าแรก</a>
        </section>

        <footer class="foot">ด้วยรัก จาก ${esc(SITE.from)}</footer>
      </main>`;

    bindMedia(app.querySelector(".person"));
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
