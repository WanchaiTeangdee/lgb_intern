/* เพลงประกอบเว็บ — เล่นต่อเนื่องข้ามทุกหน้า วนรอบรายการ MUSIC ใน data.js
   เพลงแต่ละเพลงเป็นได้ 2 แบบ
     { id: "xxxxxxxxxxx", title }       ← YouTube (ถ้าเจ้าของเพลงปิดการฝัง จะเล่นไม่ได้ → ข้ามไปเพลงถัดไป)
     { src: "media/music/a.mp3", title } ← ไฟล์เสียงของเราเอง (เล่นได้แน่นอน) */
(() => {
  const LIST = typeof MUSIC !== "undefined" ? MUSIC.filter((m) => m && (m.id || m.src)) : [];
  if (!LIST.length) return;

  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const KEY = "lgb-music-off";
  const VOL_KEY = "lgb-music-vol";
  const store = {
    get: () => { try { return localStorage.getItem(KEY) === "1"; } catch { return false; } },
    set: (v) => { try { v ? localStorage.setItem(KEY, "1") : localStorage.removeItem(KEY); } catch {} },
    getVol: () => { try { const v = parseInt(localStorage.getItem(VOL_KEY), 10); return v >= 0 && v <= 100 ? v : null; } catch { return null; } },
    setVol: (v) => { try { localStorage.setItem(VOL_KEY, String(v)); } catch {} },
  };

  const ui = document.createElement("div");
  ui.className = "music";
  ui.innerHTML = `
    <div id="yt-music" class="yt-music" aria-hidden="true"></div>
    <button class="music-btn" type="button" aria-label="เปิดเพลง">
      <span class="music-icon" aria-hidden="true">♪</span>
    </button>
    <span class="music-title"></span>
    <button class="music-next" type="button" aria-label="เพลงถัดไป">⏭</button>
    <button class="music-listbtn" type="button" aria-label="รายการเพลง" aria-expanded="false">🎶</button>
    <button class="music-vol" type="button" aria-label="ปรับเสียง" aria-expanded="false">🔊</button>
    <div class="music-list" hidden></div>
    <div class="music-pop" hidden>
      <button class="vol-mute" type="button" aria-label="ปิดเสียง">🔊</button>
      <input class="vol-range" type="range" min="0" max="100" step="1" aria-label="ระดับเสียง">
      <span class="vol-num">45</span>
    </div>`;
  document.body.appendChild(ui);

  const $ = (sel) => ui.querySelector(sel);
  const btn = $(".music-btn");
  const nextBtn = $(".music-next");
  const titleEl = $(".music-title");
  const listBtn = $(".music-listbtn");
  const listEl = $(".music-list");
  const volBtn = $(".music-vol");
  const pop = $(".music-pop");
  const muteBtn = $(".vol-mute");
  const range = $(".vol-range");
  const volNum = $(".vol-num");

  let idx = 0;
  let playing = false;
  let wantPlay = false;     // อยากให้เล่น (รอตัวเล่นพร้อม)
  let started = false;      // เคยสั่งโหลดเพลงแล้ว
  let userPaused = store.get();
  let ducked = false;       // หยุดชั่วคราวเพราะกำลังดูคลิป
  const failed = {};        // index เพลงที่เล่นไม่ได้ → รหัสข้อผิดพลาด
  let vol = store.getVol() ?? 45;
  let lastVol = vol || 45;

  const cur = () => LIST[idx];
  const isYt = () => !!cur().id;

  /* ---------------- ตัวเล่น 2 แบบ ---------------- */
  let yt = null;
  let ytReady = false;
  let pendingLoad = false;
  let audio = null;

  const getAudio = () => {
    if (audio) return audio;
    audio = new Audio();
    audio.preload = "none";
    audio.addEventListener("playing", () => { if (!isYt()) { playing = true; paint(); } });
    audio.addEventListener("pause", () => { if (!isYt() && !audio.ended) { playing = false; paint(); } });
    audio.addEventListener("ended", () => { if (!isYt()) goNext(1); });
    audio.addEventListener("error", () => { if (!isYt()) trackFailed("ไฟล์เสียงเปิดไม่ได้"); });
    return audio;
  };

  const silenceAll = () => {
    if (audio) audio.pause();
    if (ytReady) yt.pauseVideo();
  };

  const load = (i) => {
    idx = (i + LIST.length) % LIST.length;
    started = true;
    playing = false;
    silenceAll();
    const t = cur();
    if (t.src) {
      const a = getAudio();
      a.src = t.src;
      a.volume = vol / 100;
      const mine = idx;
      a.play().catch((err) => {
        if (mine !== idx || isYt()) return;                     // ผู้ใช้ข้ามไปเพลงอื่นแล้ว
        if (err && err.name === "AbortError") return;           // ถูกคำสั่งโหลดเพลงใหม่แทรก (กดข้ามรัว) ไม่ใช่เพลงพัง
        if (err && err.name === "NotAllowedError") {            // เบราว์เซอร์ยังไม่อนุญาตให้เล่นเอง → รอให้แตะ
          wantPlay = false;
          playing = false;
          paint();
          return;
        }
        trackFailed("เล่นไม่ได้");
      });
    } else if (ytReady) {
      yt.loadVideoById(t.id);
    } else {
      pendingLoad = true;   // รอ YouTube โหลดเสร็จ
    }
    paint();
  };

  // หาเพลงถัดไปที่ยังเล่นได้ (ข้ามเพลงที่เคยพัง)
  const nextIndex = (from, dir = 1) => {
    for (let k = 1; k <= LIST.length; k++) {
      const j = (from + dir * k + LIST.length * 2) % LIST.length;
      if (!failed[j]) return j;
    }
    return -1;
  };

  const goNext = (dir = 1) => {
    const j = nextIndex(idx, dir);
    if (j < 0) return allFailed();
    load(j);
  };

  const allFailed = () => {
    wantPlay = false;
    playing = false;
    paint(location.protocol === "file:" ? "เปิดเพลงไม่ได้ (ต้องเปิดผ่านเว็บจริง)" : "เปิดเพลงไม่ได้ (ดูรายการเพลง 🎶)");
  };

  const trackFailed = (reason) => {
    failed[idx] = reason || "เล่นไม่ได้";
    playing = false;
    if (Object.keys(failed).length >= LIST.length) return allFailed();
    goNext(1);
  };

  const start = () => {
    wantPlay = true;
    if (!started) return load(idx);
    if (isYt() ? ytReady : true) (isYt() ? yt.playVideo() : getAudio().play().catch(() => {}));
  };
  const stop = () => {
    wantPlay = false;
    silenceAll();
  };

  /* ---------------- ส่วนแสดงผล ---------------- */
  const paint = (msg) => {
    ui.classList.toggle("on", playing);
    ui.classList.toggle("idle", !playing && !userPaused && !msg);
    ui.classList.toggle("fail", !!msg);
    btn.setAttribute("aria-label", playing ? "หยุดเพลง" : "เปิดเพลง");
    titleEl.textContent =
      msg || (playing ? `♪ ${idx + 1}/${LIST.length} ${cur().title || ""}` : userPaused ? "" : "แตะเพื่อเปิดเพลง");
    ui.classList.toggle("has-title", !!titleEl.textContent);
    renderList();
  };

  const renderList = () => {
    listEl.innerHTML =
      `<p class="list-head">เพลงประกอบ ${LIST.length} เพลง · เล่นวนไปเรื่อยๆ</p>` +
      LIST.map((t, i) => {
        const tag = failed[i] ? failed[i] : i === idx && playing ? "▶ กำลังเล่น" : "";
        return `<button class="track${i === idx ? " cur" : ""}${failed[i] ? " bad" : ""}" type="button" data-i="${i}">
          <span class="t-no">${i + 1}</span><span class="t-name">${esc(t.title || t.id || t.src)}</span><span class="t-tag">${esc(tag)}</span>
        </button>`;
      }).join("");
  };

  const volIcon = () => (vol === 0 ? "🔇" : vol < 50 ? "🔉" : "🔊");
  const paintVol = () => {
    range.value = vol;
    range.style.setProperty("--p", `${vol}%`);
    volNum.textContent = vol;
    volBtn.textContent = muteBtn.textContent = volIcon();
    muteBtn.setAttribute("aria-label", vol === 0 ? "เปิดเสียง" : "ปิดเสียง");
  };
  const setVol = (v) => {
    vol = Math.max(0, Math.min(100, Math.round(v)));
    if (vol > 0) lastVol = vol;
    if (ytReady) yt.setVolume(vol);
    if (audio) audio.volume = vol / 100;
    store.setVol(vol);
    paintVol();
  };

  /* ---------------- ปุ่มต่างๆ ---------------- */
  btn.addEventListener("click", () => {
    if (playing || wantPlay) {
      userPaused = true;
      store.set(true);
      stop();
    } else {
      userPaused = false;
      store.set(false);
      start();
    }
    paint();
  });

  nextBtn.addEventListener("click", () => {
    userPaused = false;
    store.set(false);
    wantPlay = true;
    goNext(1);
  });

  listEl.addEventListener("click", (e) => {
    const t = e.target.closest(".track");
    if (!t) return;
    const i = +t.dataset.i;
    userPaused = false;
    store.set(false);
    wantPlay = true;
    delete failed[i];   // ให้ลองเล่นอีกครั้ง
    load(i);
  });

  range.addEventListener("input", () => setVol(+range.value));
  muteBtn.addEventListener("click", () => setVol(vol === 0 ? lastVol : 0));

  const closePops = (except) => {
    if (except !== pop) { pop.hidden = true; volBtn.setAttribute("aria-expanded", "false"); }
    if (except !== listEl) { listEl.hidden = true; listBtn.setAttribute("aria-expanded", "false"); }
  };
  const togglePop = (el, trigger) => {
    closePops(el);
    el.hidden = !el.hidden;
    trigger.setAttribute("aria-expanded", String(!el.hidden));
  };
  volBtn.addEventListener("click", () => togglePop(pop, volBtn));
  listBtn.addEventListener("click", () => { renderList(); togglePop(listEl, listBtn); });
  document.addEventListener("click", (e) => { if (!ui.contains(e.target)) closePops(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closePops(); });

  // เบราว์เซอร์ไม่ให้เล่นเสียงเองก่อนที่คนจะแตะ → เริ่มเล่นตอนแตะครั้งแรกที่ไหนก็ได้ในหน้า
  document.addEventListener(
    "click",
    (e) => {
      if (ui.contains(e.target) || userPaused || playing || wantPlay) return;
      start();
    },
    { capture: true }
  );

  // ให้ส่วนอื่นเรียกหยุด/เล่นต่อ ตอนเปิดดูคลิปในแกลเลอรี
  window.Music = {
    state: () => ({ idx, playing, wantPlay, started, ytReady, failed: { ...failed } }),
    duck() {
      if (playing) { ducked = true; silenceAll(); }
    },
    restore() {
      if (ducked && !userPaused) { ducked = false; start(); }
      ducked = false;
    },
  };

  /* ---------------- YouTube ---------------- */
  if (LIST.some((t) => t.id)) {
    window.onYouTubeIframeAPIReady = () => {
      const vars = { playsinline: 1, controls: 0, disablekb: 1, rel: 0, fs: 0 };
      if (location.protocol.startsWith("http")) vars.origin = location.origin;
      yt = new YT.Player("yt-music", {
        width: 200,
        height: 200,
        videoId: LIST.find((t) => t.id).id,
        playerVars: vars,
        events: {
          onReady: () => {
            ytReady = true;
            yt.setVolume(vol);
            if (pendingLoad || (wantPlay && isYt())) { pendingLoad = false; load(idx); }
          },
          onStateChange: (e) => {
            if (!isYt()) return;   // เหตุการณ์ค้างจากเพลงก่อนหน้า (กำลังเล่นไฟล์เสียงอยู่)
            const S = YT.PlayerState;
            if (e.data === S.PLAYING) { playing = true; yt.setVolume(vol); paint(); }
            else if (e.data === S.PAUSED) { playing = false; paint(); }
            else if (e.data === S.ENDED) goNext(1);   // จบเพลง → เพลงถัดไป / วนกลับเพลงแรก
          },
          onError: (e) => {
            if (!isYt()) return;
            // 101/150/153 = เจ้าของเพลงปิดการฝัง · 100 = ถูกลบ/ส่วนตัว
            const embedOff = [101, 150, 153].includes(e.data);
            trackFailed(embedOff ? "เจ้าของปิดการฝัง" : "เล่นไม่ได้");
          },
        },
      });
    };

    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    tag.onerror = () => { if (LIST.every((t) => t.id)) paint("เปิดเพลงไม่ได้ (ไม่มีอินเทอร์เน็ต)"); };
    document.head.appendChild(tag);
  }

  paint();
  paintVol();
})();
