/* ตัวการ์ตูนพี่ๆ ในกล่องตอบกลับ
   หน้าตาผูกกับ id จึงไม่เปลี่ยนเมื่อสลับรายชื่อ · เพศตั้งใน PEOPLE.gender
   ใช้ SVG ชุดเดียวกันทั้งตอนเปิดจากไฟล์และบนเว็บ โดยไม่ต้องโหลดรูปเพิ่ม */
(() => {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  // แต่ละคนมีทรงผม ชุด และเครื่องประดับของตัวเอง ไม่อิงลำดับใน PEOPLE
  const looks = {
    natto:    { hair: "sidepart",  ink: "#3a2b29", shirt: "#bd916b", outfit: "polo",     skin: "#f2cbae", accessory: "round" },
    mangpong: { hair: "messy",     ink: "#302634", shirt: "#c9858d", outfit: "jacket",   skin: "#eac09e", accessory: "earring" },
    boom:     { hair: "quiff",     ink: "#50352b", shirt: "#dfa46d", outfit: "tee",      skin: "#f9d8bc", accessory: "band" },
    non:      { hair: "bowl",      ink: "#2b2934", shirt: "#93b695", outfit: "stripe",   skin: "#f3d1b4", accessory: "square" },
    guitar:   { hair: "long",      ink: "#44313c", shirt: "#ad96c7", outfit: "cardigan", skin: "#f8d7be", accessory: "star" },
    aom:      { hair: "bob",       ink: "#5c3d33", shirt: "#db9bb4", outfit: "polo",     skin: "#f5d3b7", accessory: "bow" },
    man:      { hair: "crop",      ink: "#3d302b", shirt: "#79aebd", outfit: "polo",     skin: "#e7b895", accessory: "none" },
    benz:     { hair: "wavy",      ink: "#493731", shirt: "#aaa48e", outfit: "cardigan", skin: "#f4ccb0", accessory: "round" },
    bass:     { hair: "middle",    ink: "#2f2b3b", shirt: "#8e9fc9", outfit: "hoodie",   skin: "#f5cfb2", accessory: "headphones" },
    tik:      { hair: "ponytail",  ink: "#392c32", shirt: "#d7b564", outfit: "stripe",   skin: "#ecc2a3", accessory: "square" },
    q:        { hair: "spikes",    ink: "#302e31", shirt: "#8aa986", outfit: "tee",      skin: "#f0c5a4", accessory: "earring" },
    foam:     { hair: "curly",     ink: "#5b4032", shirt: "#8db8c5", outfit: "stripe",   skin: "#f9d8bd", accessory: "none" },
    pert:     { hair: "swept",     ink: "#40303b", shirt: "#d3b56f", outfit: "jacket",   skin: "#e9bd9c", accessory: "square" },
    march:    { hair: "undercut",  ink: "#56392d", shirt: "#d48e89", outfit: "hoodie",   skin: "#f2ccaf", accessory: "none" },
    baimon:   { hair: "braid",     ink: "#51392e", shirt: "#96b786", outfit: "overall",  skin: "#f4d0b2", accessory: "leaf" },
    jai:      { hair: "highbun",   ink: "#392c33", shirt: "#d9bc69", outfit: "cardigan", skin: "#efc2a2", accessory: "ribbon" },
    kaew:     { hair: "lob",       ink: "#4d3b38", shirt: "#92a9cf", outfit: "polo",     skin: "#f8d9c2", accessory: "round" },
    dream:    { hair: "waves",     ink: "#644336", shirt: "#ad98ce", outfit: "stripe",   skin: "#f3c9aa", accessory: "headband" },
    pim:      { hair: "halfup",    ink: "#332b36", shirt: "#dc9ab1", outfit: "cardigan", skin: "#f9d9c1", accessory: "flower" },
    per:      { hair: "cap",       ink: "#46352d", shirt: "#bfa17b", outfit: "overall",  skin: "#eac1a0", accessory: "none" },
    bua:      { hair: "twinbraid", ink: "#4d342e", shirt: "#d99ca6", outfit: "overall",  skin: "#f5ceb0", accessory: "ribbons" },
    da:       { hair: "hijab",     ink: "#9bafa2", shirt: "#d0ac61", outfit: "jacket",   skin: "#edc2a4", accessory: "none" },
    june:     { hair: "combed",    ink: "#4d3833", shirt: "#83adb6", outfit: "cardigan", skin: "#f6d5ba", accessory: "earring" },
    big:      { hair: "fringe",    ink: "#302b30", shirt: "#a49e92", outfit: "jacket",   skin: "#edc3a2", accessory: "square" },
    nick:     { hair: "buzz",      ink: "#47312c", shirt: "#dca16c", outfit: "stripe",   skin: "#e8b895", accessory: "none" },
    james:    { hair: "slick",     ink: "#342b35", shirt: "#8c9ec5", outfit: "polo",     skin: "#f6d1b6", accessory: "sunglasses" },
    champ:    { hair: "quiff",     ink: "#3b2f2c", shirt: "#d8b05c", outfit: "hoodie",   skin: "#f3cdb0", accessory: "round" },
  };

  const shortHair = {
    sidepart: "M27 59 Q21 25 54 22 Q91 15 94 55 L85 44 Q69 46 56 34 Q43 46 27 49Z",
    messy: "M27 59 L22 40 L31 41 L28 27 L43 30 L49 17 L61 25 L76 19 L80 30 L94 29 L91 45 L97 52 L88 61 L81 42 L68 47 L53 37 L38 49Z",
    quiff: "M27 58 Q22 34 38 29 Q33 12 51 15 Q53 3 66 16 Q88 9 94 34 L92 58 L79 42 Q60 49 47 34 L34 47Z",
    bowl: "M25 59 Q20 20 60 19 Q100 20 95 59 L83 53 L81 46 L39 46 L37 54Z",
    crop: "M28 57 L27 39 Q30 23 60 23 Q89 22 93 39 L92 58 L84 42 Q60 37 36 42Z",
    wavy: "M26 60 Q16 49 25 39 Q21 24 37 24 Q44 12 58 20 Q75 10 82 23 Q101 23 95 40 Q103 53 92 61 L81 45 Q71 50 60 39 Q45 49 36 43Z",
    middle: "M26 59 Q20 23 53 21 L60 27 L67 21 Q100 23 94 59 L83 48 Q75 40 62 35 L60 46 L57 35 Q44 41 36 49Z",
    spikes: "M27 60 L22 40 L33 42 L29 24 L44 31 L50 13 L60 28 L76 17 L77 33 L94 28 L88 45 L97 47 L91 61 L79 43 L62 47 L45 39 L35 52Z",
    curly: "M26 62 Q15 55 22 43 Q13 31 27 27 Q26 13 41 18 Q47 6 59 18 Q71 7 81 21 Q96 15 96 31 Q108 39 96 49 Q103 62 91 64 L82 44 Q69 51 59 41 Q48 49 36 43Z",
    swept: "M26 59 Q18 28 45 23 Q73 8 94 29 Q103 49 91 60 L83 45 Q59 51 41 37 Q40 50 27 53Z",
    undercut: "M27 59 L25 38 Q29 22 60 23 Q89 23 94 39 L92 59 L85 56 L82 39 Q60 47 38 40 L35 56Z",
    cap: "M27 61 Q22 28 58 26 Q96 26 94 62 L83 47 Q64 55 37 46Z",
    combed: "M26 59 Q20 20 59 21 Q98 20 95 58 L85 44 Q78 35 65 34 Q49 48 34 45Z",
    fringe: "M26 60 Q20 21 60 20 Q100 21 94 61 L84 47 L73 53 L62 41 L52 51 L42 42 L34 57Z",
    buzz: "M28 57 Q25 27 60 25 Q95 27 92 57 L86 45 Q60 37 34 45Z",
    slick: "M27 59 Q18 32 36 22 Q47 14 62 22 Q87 12 96 34 L93 60 L84 43 Q61 45 40 35 L35 54Z",
  };

  const longHair = {
    long: "M24 61 Q16 18 60 18 Q104 18 96 61 L100 110 Q78 116 70 101 L49 101 Q32 113 20 106Z",
    bob: "M24 61 Q19 19 60 20 Q103 19 96 61 L98 85 Q96 96 81 91 L39 91 Q22 96 22 83Z",
    ponytail: "M84 33 Q110 23 109 55 Q112 87 98 100 Q103 72 88 63Z M25 63 Q18 20 60 19 Q101 19 95 64 L91 81 L28 81Z",
    braid: "M24 61 Q17 20 60 19 Q102 20 96 61 L91 88 L28 88Z M88 76 Q105 77 97 91 Q105 99 96 106 Q103 115 91 124 Q83 116 88 108 Q79 99 89 91Z",
    highbun: "M45 23 Q31 1 54 3 Q78 0 77 22Z M25 62 Q18 20 60 19 Q101 20 95 62 L91 85 L28 85Z",
    lob: "M24 62 Q18 18 60 19 Q103 19 96 62 L100 98 Q84 107 74 96 L44 96 Q33 104 21 97Z",
    waves: "M24 60 Q15 18 60 18 Q104 18 96 60 Q110 73 99 85 Q110 100 95 112 Q81 120 73 104 L45 104 Q32 119 20 106 Q8 95 21 83 Q10 72 24 60Z",
    halfup: "M23 61 Q17 19 60 18 Q103 19 97 61 L99 108 Q78 115 72 100 L47 100 Q34 115 21 106Z M42 23 Q45 8 61 12 Q78 9 80 24Z",
    twinbraid: "M24 61 Q18 19 60 19 Q103 19 96 61 L91 86 L29 86Z M27 78 Q15 83 24 94 Q15 102 25 111 Q17 121 30 127 Q39 118 32 109 Q40 100 30 92Z M92 78 Q105 83 96 94 Q105 102 95 111 Q103 121 90 127 Q81 118 88 109 Q80 100 90 92Z",
    sidebun: "M24 61 Q18 20 60 19 Q103 20 96 61 L91 86 L29 86Z M24 66 Q3 61 8 79 Q2 97 25 96 Q37 84 24 66Z",
  };

  const bangs = {
    long: "M27 58 Q24 25 60 24 Q96 25 93 58 L84 48 Q68 44 58 33 Q45 49 27 58Z",
    bob: "M27 58 Q22 24 60 25 Q98 24 93 58 L84 46 L37 46 L34 57Z",
    ponytail: "M27 59 Q21 23 60 23 Q98 23 93 58 L83 44 Q57 49 44 35 Q37 47 27 59Z",
    braid: "M27 59 Q24 25 60 24 Q95 25 93 59 L80 43 Q68 45 60 33 Q48 45 37 43Z",
    highbun: "M27 59 Q23 25 60 24 Q97 25 93 59 L82 44 Q64 46 56 35 Q43 43 27 59Z",
    lob: "M27 59 Q24 25 59 24 Q97 24 93 59 L84 44 L67 43 L56 33 Q48 48 27 59Z",
    waves: "M27 60 Q22 25 60 24 Q98 25 93 60 L84 46 Q73 51 61 35 Q47 53 36 46Z",
    halfup: "M27 59 Q24 26 60 24 Q95 26 93 59 L82 45 L72 50 L60 39 L48 50 L37 44Z",
    twinbraid: "M27 59 Q24 24 60 24 Q97 24 93 59 L83 45 L68 47 L60 36 L52 47 L37 45Z",
    sidebun: "M27 59 Q22 24 60 24 Q97 25 93 59 L83 44 Q56 53 43 34 L34 52Z",
  };

  const accessories = (kind, color) => {
    if (kind === "round") return `<g fill="none" stroke="#76677b" stroke-width="2"><circle cx="46" cy="64" r="10"/><circle cx="74" cy="64" r="10"/><path d="M56 63 H64 M27 59 L36 61 M84 61 L93 59"/></g>`;
    if (kind === "square") return `<g fill="none" stroke="#5d566e" stroke-width="2"><rect x="35" y="55" width="22" height="17" rx="4"/><rect x="63" y="55" width="22" height="17" rx="4"/><path d="M57 61 H63 M27 58 L35 60 M85 60 L93 58"/></g>`;
    if (kind === "sunglasses") return `<g fill="#55536b" stroke="#3e3547" stroke-width="2"><path d="M34 55 H57 L55 68 Q44 76 37 66Z M63 55 H86 L83 66 Q76 76 65 68Z"/><path d="M57 59 H63 M28 53 L35 57 M85 57 L92 53" fill="none"/><path d="M40 57 L47 65 M69 57 L75 64" stroke="#c2ced9" stroke-width="2"/></g>`;
    if (kind === "earring") return `<circle cx="27" cy="71" r="3" fill="#d6b76a" stroke="#fff4cf"/>`;
    if (kind === "pearls") return `<circle cx="27" cy="72" r="3.5" fill="#fff8ee"/><circle cx="93" cy="72" r="3.5" fill="#fff8ee"/>`;
    if (kind === "headphones") return `<path d="M24 57 Q15 14 60 14 Q105 14 96 57" fill="none" stroke="#7786a9" stroke-width="6"/><rect x="20" y="48" width="11" height="25" rx="5" fill="#8da1c1"/><rect x="89" y="48" width="11" height="25" rx="5" fill="#8da1c1"/>`;
    if (kind === "star") return `<path d="M86 29 L89 35 L96 36 L91 41 L92 48 L86 44 L80 48 L81 41 L76 36 L83 35Z" fill="#e8c778" stroke="#fff6ce"/>`;
    if (kind === "bow" || kind === "ribbon") return `<path d="M80 28 Q67 17 68 31 Q68 43 80 34 Q94 43 93 29 Q92 17 80 28Z" fill="${color}" stroke="#fff5ee" stroke-width="1.5"/><circle cx="80" cy="31" r="3" fill="#fff5ee"/>`;
    if (kind === "leaf") return `<path d="M83 30 Q85 18 97 23 Q96 35 83 35 Q73 28 77 20 Q86 21 83 30Z" fill="#a4c88b" stroke="#e8f0d7" stroke-width="1.5"/>`;
    if (kind === "headband") return `<path d="M28 40 Q35 13 60 17 Q85 13 93 40" fill="none" stroke="${color}" stroke-width="5"/><path d="M78 21 L83 17 L86 23 L91 21" fill="none" stroke="#f6e8b6" stroke-width="3" stroke-linecap="round"/>`;
    if (kind === "flower") return `<g fill="#f4cbd7" stroke="#fff5ef"><circle cx="86" cy="26" r="5"/><circle cx="92" cy="31" r="5"/><circle cx="89" cy="38" r="5"/><circle cx="81" cy="38" r="5"/><circle cx="79" cy="30" r="5"/></g><circle cx="85" cy="32" r="4" fill="#e4ba64"/>`;
    if (kind === "ribbons") return `<path d="M27 108 L17 103 L18 115Z M28 108 L37 103 L37 115Z M93 108 L83 103 L84 115Z M94 108 L103 103 L103 115Z" fill="${color}" stroke="#fff0ed"/>`;
    if (kind === "band") return `<path d="M28 45 Q60 37 92 45" fill="none" stroke="#f7e3af" stroke-width="5"/>`;
    return "";
  };

  const clothes = (outfit, shirt) => {
    if (outfit === "stripe") return `<path d="M35 108 H85 M34 118 H86" stroke="#fff8f0" stroke-width="4" opacity=".75"/>`;
    if (outfit === "polo") return `<path d="M48 95 L60 103 L51 108 L44 97 M72 95 L60 103 L69 108 L76 97" fill="#fffcf5"/><path d="M60 104 V120" stroke="#fff7ec" stroke-width="2"/><circle cx="63" cy="110" r="1.3" fill="#fff7ec"/>`;
    if (outfit === "cardigan") return `<path d="M48 95 L60 105 L72 95 L77 130 H43Z" fill="#fff8ed"/><path d="M48 95 L60 130 M72 95 L60 130" fill="none" stroke="${shirt}" stroke-width="7"/><circle cx="60" cy="119" r="2" fill="#c8a57e"/>`;
    if (outfit === "overall") return `<path d="M40 97 L44 114 M80 97 L76 114" stroke="#566982" stroke-width="6"/><path d="M41 111 H79 V130 H41Z" fill="#667b96"/><path d="M52 116 H68 V124 H52Z" fill="none" stroke="#ccd5dc" stroke-width="1.5"/><circle cx="44" cy="111" r="2" fill="#f4d596"/><circle cx="76" cy="111" r="2" fill="#f4d596"/>`;
    if (outfit === "hoodie") return `<path d="M43 97 Q60 113 77 97" fill="none" stroke="#fff0e6" stroke-width="4"/><path d="M54 105 V116 M66 105 V116 M47 124 Q60 115 73 124" fill="none" stroke="#fff0e6" stroke-width="2" stroke-linecap="round"/>`;
    if (outfit === "jacket") return `<path d="M50 95 L60 104 L70 95 L72 130 H48Z" fill="#fff8ed"/><path d="M49 95 L43 105 L52 113 L60 130 M71 95 L77 105 L68 113 L60 130" fill="none" stroke="#fff8ed" stroke-width="2"/><path d="M37 119 H46 M74 119 H83" stroke="#fff8ed" stroke-width="2"/>`;
    return `<path d="M50 95 Q60 104 70 95" fill="none" stroke="#fff8ef" stroke-width="3"/><path d="M69 114 L71 118 L75 119 L72 122 L72 126 L69 124 L65 126 L66 122 L63 119 L67 118Z" fill="#fff5df"/>`;
  };

  const person = (p = {}) => {
    const female = p.gender === "female";
    const profile = looks[p.id] || looks[female ? "guitar" : "natto"];
    const hair = esc(profile.ink);
    const skin = esc(profile.skin);
    const shirt = esc(profile.shirt);
    const hijab = profile.hair === "hijab";
    const style = female ? (longHair[profile.hair] ? profile.hair : "long") : (shortHair[profile.hair] ? profile.hair : "sidepart");
    return `<svg class="reply-character-svg" viewBox="0 0 120 150" aria-hidden="true" focusable="false">
      <ellipse cx="60" cy="145" rx="31" ry="4" fill="rgba(59,50,44,.12)"/>
      <path d="M48 124 V139 M72 124 V139" stroke="#596881" stroke-width="11" stroke-linecap="round"/>
      <ellipse cx="46" cy="141" rx="11" ry="5" fill="#fffaf2" stroke="#dfd2c2"/><ellipse cx="74" cy="141" rx="11" ry="5" fill="#fffaf2" stroke="#dfd2c2"/>
      ${female && !hijab ? `<path d="${esc(longHair[style])}" fill="${hair}"/>` : ""}
      <path d="M32 130 Q31 95 60 93 Q89 95 88 130Z" fill="${shirt}"/>
      ${clothes(profile.outfit, shirt)}
      <path d="M36 104 Q24 113 29 124" fill="none" stroke="${shirt}" stroke-width="11" stroke-linecap="round"/><circle cx="29" cy="126" r="5" fill="${skin}"/>
      <g class="reply-character-head">
        ${hijab ? `
          <g class="reply-hijab">
            <path d="M22 62 Q17 16 60 16 Q103 16 98 62 L104 105 Q84 117 60 121 Q36 117 16 105Z" fill="${hair}" stroke="#82978a" stroke-width="1.5" stroke-linejoin="round"/>
            <path d="M30 80 Q41 99 90 106 Q78 116 60 120 Q39 114 23 105Z" fill="#879f90"/>
            <path d="M90 78 Q88 99 44 114 M27 70 Q25 88 22 100" fill="none" stroke="#bdcdc1" stroke-width="2" stroke-linecap="round"/>
            <circle cx="80" cy="102" r="3" fill="#fff2d4" stroke="#c7a565"/>
          </g>
          <path d="M31 57 Q31 35 60 30 Q89 35 89 57 L89 64 Q88 88 60 94 Q32 88 31 64Z" fill="${skin}"/>
        ` : `
          <circle cx="27" cy="64" r="6" fill="${skin}"/><circle cx="93" cy="64" r="6" fill="${skin}"/>
          <circle cx="60" cy="60" r="33" fill="${skin}"/>
          <path d="${esc(female ? bangs[style] : shortHair[style])}" fill="${hair}"/>
        `}
        ${style === "cap" ? `<path d="M25 40 Q27 16 59 16 Q89 16 94 41Z" fill="#91ab91"/><path d="M18 43 Q59 33 100 43 Q85 51 60 46 Q35 51 18 43Z" fill="#759378"/><path d="M61 18 V36" stroke="#b8cbb0" stroke-width="2"/>` : ""}
        ${style === "buzz" ? `<path d="M34 38 L36 34 M45 33 L46 29 M58 32 V28 M71 34 L70 29 M83 38 L81 34" stroke="#79614f" stroke-width="2" stroke-linecap="round"/>` : ""}
        ${style === "slick" || style === "combed" ? `<path d="M39 29 Q55 35 78 27 M37 34 Q55 40 81 32" fill="none" stroke="#776052" stroke-width="1.8" stroke-linecap="round"/>` : ""}
        <ellipse cx="46" cy="64" rx="3.5" ry="4.5" fill="#332a32"/><circle cx="47" cy="62.5" r="1.3" fill="#fff"/>
        <ellipse cx="74" cy="64" rx="3.5" ry="4.5" fill="#332a32"/><circle cx="75" cy="62.5" r="1.3" fill="#fff"/>
        <ellipse cx="${hijab ? "40" : "37"}" cy="75" rx="${hijab ? "5" : "6.5"}" ry="3.5" fill="#ef9b9d" opacity=".65"/><ellipse cx="${hijab ? "80" : "83"}" cy="75" rx="${hijab ? "5" : "6.5"}" ry="3.5" fill="#ef9b9d" opacity=".65"/>
        <path d="M53 75 Q60 84 67 75Z" fill="#c45f57"/>
        ${accessories(profile.accessory, shirt)}
      </g>
      <g class="reply-character-arm">
        <path d="M84 104 Q94 116 100 107" fill="none" stroke="${shirt}" stroke-width="11" stroke-linecap="round"/>
        <g class="reply-held-letter" transform="rotate(-9 101 103)">
          <rect x="86" y="92" width="29" height="21" rx="3" fill="#fff9ee" stroke="#d4ac90" stroke-width="1.3"/>
          <path d="M87 94 L100 104 L114 94 M87 112 L96 103 M114 112 L105 103" fill="none" stroke="#dfbdab" stroke-width="1.2"/>
          <path d="M98 100 Q95 96 93 99 Q91 102 98 106 Q105 102 103 99 Q101 96 98 100Z" fill="#d88c93"/>
        </g>
        <circle cx="100" cy="113" r="4.5" fill="${skin}"/>
      </g>
    </svg>`;
  };

  window.ReplyCharacters = { person };
})();
