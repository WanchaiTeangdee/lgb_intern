/* กระดานโน้ตจากพี่ๆ — หน้าให้น้องตี๋ & น้องหมวยอ่านข้อความที่พี่ๆ พิมพ์ตอบกลับมา
   ดึงข้อความจาก Google Sheet ผ่าน Apps Script (ดูวิธีตั้งใน tools/replies-apps-script.gs)
   ต้องพิมพ์รหัสลับก่อนจึงจะเห็นข้อความ รหัสไม่ได้เก็บไว้ในไฟล์เว็บ */
(() => {
  // URL เว็บแอปของ Apps Script (ลงท้ายด้วย /exec) — ใส่หลัง Deploy
  const NOTES_URL = "https://script.google.com/macros/s/AKfycbywnlCoSbzHrNyyO5yB3GgKoy4583CnKLIauB7Kj5ccB50P1qCh0F9l2JgBqQUEmGgpNw/exec";

  const root = document.getElementById("admin");
  const KEY_STORE = "notes-key";
  const FAV_STORE = "notes-fav";

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // sessionStorage = จำรหัสแค่ในแท็บนี้ / localStorage = จำโน้ตที่กดหัวใจไว้ในเครื่องนี้ (ไม่ส่งไปไหน)
  const store = {
    get: () => { try { return sessionStorage.getItem(KEY_STORE) || ""; } catch { return ""; } },
    set: (v) => { try { v ? sessionStorage.setItem(KEY_STORE, v) : sessionStorage.removeItem(KEY_STORE); } catch {} },
  };
  const favStore = {
    get: () => { try { return new Set(JSON.parse(localStorage.getItem(FAV_STORE) || "[]")); } catch { return new Set(); } },
    set: (s) => { try { localStorage.setItem(FAV_STORE, JSON.stringify([...s])); } catch {} },
  };

  // หาพี่จากชื่อที่ส่งมา — รับชื่อปัจจุบัน หรือชื่อเก่าที่ใส่ไว้ใน aliases ของ data.js (เผื่อเคยเปลี่ยนชื่อหลังมีคนส่งข้อความแล้ว)
  const byName = (name) => {
    const s = String(name).trim();
    return PEOPLE.find((p) => p.name === s || (p.aliases || []).includes(s));
  };
  const fmtTime = (t) =>
    new Date(t).toLocaleString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  const paragraphs = (text) =>
    String(text || "")
      .trim()
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.split("\n").map((l) => esc(l.trim())).join("<br>")}</p>`)
      .join("");

  const STICKERS = ["🌸", "⭐", "🍀", "🎀", "✨", "🧸", "🍓", "☁️"];
  const TILTS = [-2, 1.4, -0.9, 2, -1.4, 0.8];
  // ธงราวหัวกระดาน ใช้สีประจำตัวของพี่ๆ
  const bunting = () =>
    `<div class="bunting" aria-hidden="true">${PEOPLE.slice(0, 14).map((p) => `<i style="--c:${esc(p.color)}"></i>`).join("")}</div>`;

  /* ------------------------------ หน้าใส่รหัส ------------------------------ */
  function renderLock(msg = "") {
    root.innerHTML = `
      <main class="lock">
        <div class="lock-card">
          <span class="tape" aria-hidden="true"></span>
          <div class="lock-emoji" aria-hidden="true">🔒</div>
          <h1>กระดานโน้ตจากพี่ๆ</h1>
          <p class="lock-sub">หน้านี้สำหรับ ${esc(SITE.from)} เท่านั้นนะ<br>ใส่รหัสลับเพื่อเปิดอ่านโน้ต</p>
          <form class="lock-form">
            <input type="password" name="key" placeholder="รหัสลับ" autocomplete="current-password" aria-label="รหัสลับ" autofocus>
            <button type="submit">เปิดอ่าน 💌</button>
          </form>
          <p class="lock-msg" role="status">${esc(msg)}</p>
        </div>
      </main>`;
    root.querySelector(".lock-form").addEventListener("submit", (e) => {
      e.preventDefault();
      const key = e.target.elements.key.value.trim();
      if (key) load(key);
    });
  }

  /* ------------------------------ โหลดข้อความ ------------------------------ */
  async function load(key) {
    if (!NOTES_URL) return renderLock("ยังไม่ได้ใส่ลิงก์ Apps Script ใน admin.js (NOTES_URL)");
    root.innerHTML = `<main class="lock"><p class="loading"><span class="bob">📌</span> กำลังเปิดกระดาน…</p></main>`;
    try {
      const res = await fetch(`${NOTES_URL}?key=${encodeURIComponent(key)}`);
      const data = await res.json();
      if (!data.ok) {
        store.set("");
        return renderLock("รหัสไม่ถูกต้อง ลองใหม่อีกครั้งนะ");
      }
      store.set(key);
      renderBoard(Array.isArray(data.rows) ? data.rows : [], key);
    } catch {
      renderLock("เชื่อมต่อไม่ได้ ตรวจอินเทอร์เน็ตหรือลิงก์ Apps Script แล้วลองใหม่นะ");
    }
  }

  /* ------------------------------ กระดานโน้ต ------------------------------ */
  function renderBoard(rows, key) {
    const notes = rows
      .map((r) => ({ ...r, person: byName(r.name), t: new Date(r.time).getTime() || 0 }))
      .filter((n) => String(n.message || "").trim())
      .map((n, i) => ({ ...n, id: `${n.time}|${n.name}`, sticker: STICKERS[i % STICKERS.length] }));

    const favs = favStore.get();
    let newestFirst = true;
    let who = "all"; // "all" | "__fav" | ชื่อพี่

    // ใช้ชื่อปัจจุบันของพี่เป็นหลัก ข้อความจากชื่อเก่าจะได้รวมอยู่คนเดียวกัน
    const nameOf = (n) => (n.person ? n.person.name : n.name.trim() || "ไม่ระบุชื่อ");
    const senders = [...new Set(notes.map(nameOf))];
    const total = notes.length;

    root.innerHTML = `
      <main class="board-page">
        ${bunting()}
        <header class="board-head">
          <h1><span class="spark" aria-hidden="true">✨</span> กระดานโน้ตจากพี่ๆ <span class="spark" aria-hidden="true">✨</span></h1>
          <p class="board-count">${
            total
              ? `ได้รับโน้ตแล้ว <b>${total}</b> ใบ จากพี่ <b>${senders.length}</b> คน 💛`
              : "ยังไม่มีใครส่งโน้ตมาเลย ใจเย็นๆ นะ 🌱"
          }</p>
          <div class="board-tools">
            <button class="chip" data-act="sort">⏳ ใหม่สุดก่อน</button>
            <button class="chip" data-act="refresh">🔄 รีเฟรช</button>
            <button class="chip" data-act="lock">🔒 ล็อก</button>
          </div>
          <div class="chips" aria-label="กรองโน้ต"></div>
        </header>
        <div class="cork">
          <section class="board" aria-live="polite"></section>
        </div>
        <p class="board-foot">ด้วยรัก จาก ${esc(SITE.from)} <span aria-hidden="true">♥</span></p>
      </main>`;

    const page = root.querySelector(".board-page");
    const board = root.querySelector(".board");
    const chipBox = root.querySelector(".chips");
    const sortBtn = root.querySelector('[data-act="sort"]');

    const personInfo = (n) => n.person || { name: nameOf(n), emoji: "🌼", color: "#f1d3b3" };

    function draw() {
      const list = notes
        .filter((n) => (who === "all" ? true : who === "__fav" ? favs.has(n.id) : nameOf(n) === who))
        .sort((a, b) => (newestFirst ? b.t - a.t : a.t - b.t));

      board.innerHTML = list.length
        ? list
            .map((n, i) => {
              const p = personInfo(n);
              const fav = favs.has(n.id);
              return `
          <article class="note ${i % 2 ? "pin" : "taped"}" style="--c:${esc(p.color)}; --tilt:${TILTS[i % TILTS.length]}deg; --d:${Math.min(i, 12) * 60}ms">
            <span class="hold" aria-hidden="true"></span>
            <header class="note-from">
              <span class="note-avatar" aria-hidden="true">${esc(p.emoji)}</span>
              <b>${esc(p.name)}</b>
            </header>
            <div class="note-body">${paragraphs(n.message)}</div>
            <footer class="note-foot">
              <span class="note-sticker" aria-hidden="true">${n.sticker}</span>
              <time>${n.t ? esc(fmtTime(n.t)) : ""}</time>
              <button class="heart ${fav ? "on" : ""}" data-fav="${esc(n.id)}" aria-pressed="${fav}" aria-label="ชอบโน้ตนี้">♥</button>
            </footer>
          </article>`;
            })
            .join("")
        : `<p class="board-empty">${who === "__fav" ? "ยังไม่ได้กดหัวใจโน้ตใบไหนเลย กด ♥ ที่โน้ตที่ชอบได้นะ" : "ยังไม่มีโน้ตตรงนี้ 🍃"}</p>`;
    }

    function drawChips() {
      if (!total) { chipBox.innerHTML = ""; return; }
      const favCount = notes.filter((n) => favs.has(n.id)).length;
      const items = [
        { v: "all", label: "🌈 ทั้งหมด" },
        { v: "__fav", label: `♥ ที่ชอบ${favCount ? ` (${favCount})` : ""}` },
        ...(senders.length > 1
          ? senders.map((s) => ({ v: s, label: `${byName(s) ? byName(s).emoji + " " : ""}${s}` }))
          : []),
      ];
      chipBox.innerHTML = items
        .map((it) => `<button class="chip ${it.v === who ? "on" : ""}" data-who="${esc(it.v)}">${esc(it.label)}</button>`)
        .join("");
    }

    // ผูกกับ .board-page ที่สร้างใหม่ทุกครั้ง (ผูกกับ root จะซ้อนกันเมื่อกดรีเฟรช)
    page.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      if (b.dataset.who) { who = b.dataset.who; drawChips(); draw(); }
      else if (b.dataset.fav) {
        const id = b.dataset.fav;
        favs.has(id) ? favs.delete(id) : favs.add(id);
        favStore.set(favs);
        b.classList.toggle("on", favs.has(id));
        b.setAttribute("aria-pressed", String(favs.has(id)));
        drawChips();
        if (who === "__fav") draw();
      } else if (b.dataset.act === "sort") {
        newestFirst = !newestFirst;
        sortBtn.textContent = newestFirst ? "⏳ ใหม่สุดก่อน" : "⌛ เก่าสุดก่อน";
        draw();
      } else if (b.dataset.act === "refresh") load(key);
      else if (b.dataset.act === "lock") { store.set(""); renderLock(); }
    });

    drawChips();
    draw();
  }

  const saved = store.get();
  if (saved) load(saved);
  else renderLock();
})();
