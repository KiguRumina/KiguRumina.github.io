// 写真の並び順とキャプションはここで編集できます。
// pos は四角い枠に収めるときの見せたい位置（object-position）です。
const PHOTOS = [
  { file: "01", caption: "鏡の前でこっそり自撮り" },
  { file: "02", caption: "ピース！" },
  { file: "03", caption: "おうちでまったり", pos: "50% 30%" },
  { file: "04", caption: "イベントにおでかけ" },
  { file: "05", caption: "窓の外は夏の空" },
  { file: "06", caption: "灯りのそばで" },
  { file: "07", caption: "カーテンのかげから、こんにちは！" },
  { file: "08", caption: "浴衣もにあうかな？" },
  { file: "09", caption: "ソファでひとやすみ", pos: "36% 50%" },
  { file: "10", caption: "おはよ！一緒にお茶でもどう？" },
  { file: "11", caption: "手つないだだけで照れてるの？かわいいっ！" },
  { file: "12", caption: "ちょっと照れてる" },
  { file: "13", caption: "いつもの衣装で！", pos: "50% 25%" },
  { file: "14", caption: "撮影会、、、！緊張した～" },
  { file: "15", caption: "みんなお仕事お疲れ様〜♡" },
  { file: "16", caption: "ベールの向こうからピース" },
  { file: "17", caption: "みんごめ！" },
  { file: "18", caption: "実家にただいまっ！" },
];

const INTERVAL = 5000;
const photoSrc = (p) => `images/photos/${p.file}.webp`;
const thumbSrc = (p) => `images/thumbs/${p.file}.webp`;
const pad = (n) => String(n).padStart(2, "0");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Slideshow ---------- */
const show = document.querySelector(".slideshow");
const slidesEl = show.querySelector(".slides");
const captionEl = show.querySelector(".caption");
const counterEl = show.querySelector(".counter");
const progressEl = show.querySelector(".progress span");
const playBtn = show.querySelector(".play-btn");
const thumbsEl = document.querySelector(".thumbs");

const slides = PHOTOS.map((p, i) => {
  const fig = document.createElement("figure");
  fig.className = "slide";
  fig.setAttribute("aria-roledescription", "slide");
  fig.setAttribute("aria-label", `${i + 1} / ${PHOTOS.length}`);
  const img = document.createElement("img");
  img.alt = p.caption;
  img.decoding = "async";
  if (p.pos) img.style.objectPosition = p.pos;
  img.dataset.src = photoSrc(p);
  fig.append(img);
  slidesEl.append(fig);
  return fig;
});

const thumbs = PHOTOS.map((p, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "thumb";
  b.setAttribute("aria-label", `${i + 1}枚目：${p.caption}`);
  b.innerHTML = `<img src="${thumbSrc(p)}" alt="" loading="lazy">`;
  b.addEventListener("click", () => { go(i); restart(); });
  thumbsEl.append(b);
  return b;
});

// 表示中と前後の写真だけ読み込む
function ensureLoaded(i) {
  const img = slides[(i + PHOTOS.length) % PHOTOS.length].querySelector("img");
  if (img.dataset.src) { img.src = img.dataset.src; delete img.dataset.src; }
}

let current = -1;
let timer = null;
let paused = reduceMotion;
let hovering = false;

function go(i) {
  i = (i + PHOTOS.length) % PHOTOS.length;
  if (i === current) return;
  ensureLoaded(i); ensureLoaded(i + 1); ensureLoaded(i - 1);
  slides[current]?.classList.remove("is-active");
  thumbs[current]?.classList.remove("is-active");
  current = i;
  slides[i].classList.add("is-active");
  thumbs[i].classList.add("is-active");
  // サムネイル列だけを横スクロール（ページ自体は動かさない）
  const t = thumbs[i];
  thumbsEl.scrollTo({
    left: t.offsetLeft - thumbsEl.offsetLeft - (thumbsEl.clientWidth - t.clientWidth) / 2,
    behavior: reduceMotion ? "auto" : "smooth",
  });
  captionEl.textContent = PHOTOS[i].caption;
  counterEl.textContent = `${pad(i + 1)} / ${pad(PHOTOS.length)}`;
}

function restart() {
  clearTimeout(timer);
  progressEl.classList.remove("run");
  void progressEl.offsetWidth; // アニメーションをリセット
  if (paused || hovering || document.hidden) {
    show.classList.add("is-paused");
    return;
  }
  show.classList.remove("is-paused");
  progressEl.style.setProperty("--dur", `${INTERVAL}ms`);
  progressEl.classList.add("run");
  timer = setTimeout(() => { go(current + 1); restart(); }, INTERVAL);
}

function setPaused(v) {
  paused = v;
  playBtn.setAttribute("aria-label", paused ? "再生" : "一時停止");
  restart();
}

show.querySelector(".prev").addEventListener("click", () => { go(current - 1); restart(); });
show.querySelector(".next").addEventListener("click", () => { go(current + 1); restart(); });
playBtn.addEventListener("click", () => setPaused(!paused));

const frame = show.querySelector(".frame");
frame.addEventListener("mouseenter", () => { hovering = true; restart(); });
frame.addEventListener("mouseleave", () => { hovering = false; restart(); });
document.addEventListener("visibilitychange", restart);

show.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") { go(current - 1); restart(); }
  else if (e.key === "ArrowRight") { go(current + 1); restart(); }
  else if (e.key === " ") { e.preventDefault(); setPaused(!paused); }
});

// スワイプ（スワイプ直後のクリックは無視する）
let startX = null;
let swiped = false;
frame.addEventListener("pointerdown", (e) => { startX = e.clientX; });
frame.addEventListener("pointerup", (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  startX = null;
  swiped = Math.abs(dx) > 40;
  if (swiped) { go(current + (dx < 0 ? 1 : -1)); restart(); }
});
frame.addEventListener("pointercancel", () => { startX = null; });

// 写真をクリックすると拡大表示
slidesEl.addEventListener("click", () => {
  if (swiped) { swiped = false; return; }
  openLightbox(current);
});

/* ---------- Gallery ---------- */
const gallery = document.querySelector(".gallery");
PHOTOS.forEach((p, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.setAttribute("aria-label", `${p.caption}（拡大）`);
  b.innerHTML = `<img src="${thumbSrc(p)}" alt="${p.caption}" loading="lazy">`;
  b.addEventListener("click", () => openLightbox(i));
  gallery.append(b);
});

/* ---------- Lightbox ---------- */
const lb = document.querySelector(".lightbox");
const lbImg = lb.querySelector("img");
const lbCap = lb.querySelector("figcaption");
let lbIndex = 0;

function showLightbox(i) {
  lbIndex = (i + PHOTOS.length) % PHOTOS.length;
  const p = PHOTOS[lbIndex];
  lbImg.src = photoSrc(p);
  lbImg.alt = p.caption;
  lbCap.textContent = `${p.caption}　${pad(lbIndex + 1)} / ${pad(PHOTOS.length)}`;
}

function openLightbox(i) {
  showLightbox(i);
  lb.showModal();
  hovering = true;
  restart();
}

lb.addEventListener("close", () => { hovering = false; restart(); });
lb.querySelector(".lb-close").addEventListener("click", () => lb.close());
lb.querySelector(".lb-prev").addEventListener("click", () => showLightbox(lbIndex - 1));
lb.querySelector(".lb-next").addEventListener("click", () => showLightbox(lbIndex + 1));
lb.addEventListener("click", (e) => {
  if (lbSwiped) { lbSwiped = false; return; }
  if (e.target === lb || e.target.tagName === "FIGURE") lb.close();
});
lb.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
  else if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
});

let lbStartX = null;
let lbSwiped = false;
lb.addEventListener("pointerdown", (e) => { lbStartX = e.clientX; });
lb.addEventListener("pointerup", (e) => {
  if (lbStartX === null) return;
  const dx = e.clientX - lbStartX;
  lbStartX = null;
  lbSwiped = Math.abs(dx) > 40;
  if (lbSwiped) showLightbox(lbIndex + (dx < 0 ? 1 : -1));
});

/* ---------- Start ---------- */
go(0);
setPaused(paused);
