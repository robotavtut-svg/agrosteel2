/* ===== Налаштування ===== */
const PHONE = "093 234-85-11 (Денис) / 096 614-34-55 (Роман)";
// Скрипти приймання заявок (PHP) лежать у папці api/ поруч із index.html.
const FORM_ENDPOINT = "api/lead.php";

// Прайс 2026–2027, арочні: ширина -> { довжина: грн за м² }. Редагуйте тільки тут.
const RATES = {
  12: { 20: 3500, 25: 3400, 30: 3200, 35: 3000, 40: 2950 },
  15: { 30: 2950, 35: 2900, 40: 2850, 45: 2850 },
  18: { 30: 2850, 35: 2800, 40: 2750, 45: 2750, 50: 2750, 55: 2700, 60: 2650, 65: 2650, 70: 2650, 75: 2650, 80: 2600 }
};
const RECT_RATE = 4000;                // прямокутні ангари, грн/м²
// Розпашні ворота входять у ціну ангара. Відкатні оплачуються окремо (за штуку).
const SLIDE_PRICE = 50000;
const SLIDES = { none: 0, side1: 1, side2: 2, end1: 1 };
// Довжина за бажанням (кратна 2,5 м: такий крок арок). Ціна за м² береться з прайсу
// для найближчої меншої довжини (так ціна не занижується); коротше за прайс: як для найкоротшої.
function rateFor(w, l) {
  const ls = Object.keys(RATES[w]).map(Number).sort((a, b) => a - b);
  let r = RATES[w][ls[0]];
  for (const k of ls) if (k <= l) r = RATES[w][k];
  return r;
}

const fmt = n => I18N.num(n);
const fmt1 = n => { const s = String(Math.round(n * 10) / 10); return I18N.lang === "en" ? s : s.replace(".", ","); };
const T = (k, v) => I18N.t(k, v);
const $ = id => document.getElementById(id);
let kind = "arch";

/* ===== Таблиця прайсу ===== */
function renderTable() {
  const body = $("priceBody");
  let html = "";
  for (const w in RATES) {
    html += `<tr class="group"><td colspan="5">${T("grp", { w })}</td></tr>`;
    for (const l in RATES[w]) {
      const r = RATES[w][l], a = w * l;
      html += `<tr data-w="${w}" data-l="${l}">
        <td>${w}×${l}</td><td>${a}</td><td>${fmt(r)}</td><td>${fmt(a * r)}</td>
        <td><button type="button" class="pick" data-w="${w}" data-l="${l}">${T("pick")}</button></td></tr>`;
    }
  }
  body.innerHTML = html;
  if (!body.dataset.bound) { body.dataset.bound = "1"; body.addEventListener("click", e => {
    const b = e.target.closest(".pick");
    if (!b) return;
    setKind("arch");
    setCalc(b.dataset.w, b.dataset.l);
    document.querySelector(".configurator").scrollIntoView({ behavior: "smooth", block: "start" });
  }); }
}

/* ===== Калькулятор ===== */
// 3D-модель оновлюємо не частіше за кадр (повзунок довжини)
let viewPending = null;
function pushView(args) {
  const idle = !viewPending; viewPending = args;
  if (idle) requestAnimationFrame(() => { const a = viewPending; viewPending = null; if (window.HangarViewer) HangarViewer.update(...a); });
}

function updateCalc() {
  if (kind === "arch") {
    const w = +$("calcW").value, l = +$("calcL").value, area = w * l, slide = $("calcGate").value, n = SLIDES[slide];
    const rate = rateFor(w, l), total = area * rate + n * SLIDE_PRICE, exact = RATES[w][l] !== undefined;
    $("calcLv").textContent = fmt1(l);
    $("calcPrice").textContent = fmt(total) + " " + T("uah");
    $("calcMeta").textContent = `${w}×${fmt1(l)} ${T("m")} · ${fmt1(area)} ${T("m2")} · ${fmt(rate)} ${T("perm2")}` + (n ? " · " + T("gates") : "") + (exact ? "" : " · " + T("approx"));
    pushView([w, l, undefined, slide]);
    document.querySelectorAll("#priceBody tr").forEach(tr =>
      tr.classList.toggle("is-active", +tr.dataset.w === w && +tr.dataset.l === l));
  } else {
    const w = +$("rectW").value, l = +$("rectL").value, h = +$("rectH").value, area = w * l;
    $("rectWv").textContent = w; $("rectLv").textContent = l; $("rectHv").textContent = fmt1(h);
    $("calcPrice").textContent = fmt(area * RECT_RATE) + " " + T("uah");
    $("calcMeta").textContent = `${w}×${l} ${T("m")} · ${T("walls")} ${fmt1(h)} ${T("m")} · ${area} ${T("m2")} · ${fmt(RECT_RATE)} ${T("perm2")}`;
    pushView([w, l, h, "none"]);
    document.querySelectorAll("#priceBody tr").forEach(tr => tr.classList.remove("is-active"));
  }
}

function setCalc(w, l) {
  $("calcW").value = w;
  $("calcL").value = l;
  updateCalc();
}

function setKind(k) {
  kind = k;
  $("calcArch").hidden = k !== "arch";
  $("calcRect").hidden = k !== "rect";
  document.querySelectorAll(".calc__tabs [data-kind]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.kind === k)));
  updateCalc();
}

function fillWidths() {
  $("calcW").innerHTML = Object.keys(RATES).map(w => `<option value="${w}">${w} ${T("m")}</option>`).join("");
}

function initCalc() {
  fillWidths();
  $("calcW").addEventListener("change", updateCalc);
  $("calcL").addEventListener("input", updateCalc);
  $("calcGate").addEventListener("change", updateCalc);
  ["rectW", "rectL", "rectH"].forEach(id => $(id).addEventListener("input", updateCalc));
  document.querySelectorAll(".calc__tabs [data-kind]").forEach(b => b.addEventListener("click", () => setKind(b.dataset.kind)));
  setCalc("18", "40");
  addEventListener("langchange", () => {
    const w = $("calcW").value;
    renderTable(); fillWidths(); $("calcW").value = w; updateCalc();
  });
}

/* ===== Мобільне меню ===== */
function initMenu() {
  const burger = $("burger"), nav = $("nav");
  const close = () => { nav.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false"); };
  burger.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    burger.setAttribute("aria-expanded", String(open));
  });
  nav.addEventListener("click", e => { if (e.target.tagName === "A") close(); });
  addEventListener("resize", () => { if (innerWidth > 1100) close(); });
}

/* ===== Швидкий перехід ===== */
function initQuickNav() {
  const btn = $("qnBtn"), panel = $("qnPanel"), box = $("qn");
  const set = o => { panel.hidden = !o; btn.setAttribute("aria-expanded", String(o)); };
  btn.addEventListener("click", () => set(panel.hidden));
  panel.addEventListener("click", e => { if (e.target.closest("a")) set(false); });
  document.addEventListener("click", e => { if (!box.contains(e.target)) set(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
}

/* ===== Форма (відправка в Telegram через api/lead.php) ===== */
function initForm() {
  const form = $("form"), status = $("formStatus"), btn = $("formBtn");
  if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    const name = form.name, phone = form.phone;
    const phoneOk = phone.value.replace(/\D/g, "").length >= 10;
    name.classList.toggle("is-bad", !name.value.trim());
    phone.classList.toggle("is-bad", !phoneOk);
    if (!name.value.trim() || !phoneOk) { status.textContent = "Вкажіть ім'я та телефон (мінімум 10 цифр)."; return; }
    status.textContent = "Надсилаємо…"; btn.disabled = true;
    try {
      const r = await fetch(FORM_ENDPOINT, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: name.value, phone: phone.value, message: form.message.value, website: form.website.value })
      });
      if (r.status === 429) { status.textContent = "Забагато спроб. Спробуйте трохи пізніше."; }
      else if (!r.ok) throw new Error(r.status);
      else { form.reset(); status.textContent = "Заявку надіслано. Ми зателефонуємо вам."; }
    } catch { status.textContent = "Заявку не надіслано. Спробуйте ще раз."; }
    btn.disabled = false;
  });
}

function initLightbox() {
  const lb = $("lb"), big = lb.querySelector("img"), vid = lb.querySelector("video");
  document.querySelectorAll(".m__btn").forEach(b => b.addEventListener("click", () => {
    const src = b.dataset.video;
    big.hidden = !!src; vid.hidden = !src;
    if (src) { vid.src = src; vid.play().catch(() => {}); }
    else { const img = b.querySelector("img"); big.src = img.src; big.alt = img.alt; }
    lb.showModal();
  }));
  lb.addEventListener("click", e => { if (e.target !== vid) lb.close(); });
  lb.addEventListener("close", () => { vid.pause(); vid.removeAttribute("src"); vid.load(); });

  // відео в історії грають без звуку, поки видно на екрані
  const vids = document.querySelectorAll(".m video");
  if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      if (en.isIntersecting) en.target.play().catch(() => {}); else en.target.pause();
    }), { threshold: 0.35 });
    vids.forEach(v => io.observe(v));
  }
}

$("year").textContent = new Date().getFullYear();
renderTable();
initCalc();
initMenu();
initQuickNav();
initForm();
initLightbox();
