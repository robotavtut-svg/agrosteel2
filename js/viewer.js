/* 3D-модель арочного ангара (three.js r128).
   HangarViewer.update(ширина, длина) — размеры в метрах.
   Все текстуры рисуются кодом, внешних картинок не нужно. */
(function () {
  "use strict";

  // Полная высота = ширина × коэффициент (ОРИЕНТОВОЧНО — подставьте реальное значение).
  const HEIGHT_RATIO = 0.55;
  const RECT_ROOF = 0.07; // підйом даху прямокутного ангара: ширина × коефіцієнт
  const FOUNDATION_H = 0.5; // высота бетонного цоколя, м
  const ARCH_STEP = 2.5;    // шаг между арками, м

  // Цвета покрытия: оцинковка, графит, зелёный
  const PRESETS = {
    zinc:     { color: 0xdfe5e9, metalness: 0.8,  roughness: 0.34 },
    graphite: { color: 0x424c55, metalness: 0.45, roughness: 0.42 },
    green:    { color: 0x2f6b45, metalness: 0.45, roughness: 0.45 }
  };

  const box = document.getElementById("viewer");
  window.HangarViewer = { update() {} };
  if (!box) return;

  const host = box.querySelector(".viewer__canvas");
  const labelsEl = box.querySelector(".viewer__labels");
  const legend = box.querySelector(".viewer__legend");
  const skinBtn = document.getElementById("viewerSkin");
  const resetBtn = document.getElementById("viewerReset");
  const colorBtns = box.querySelectorAll("[data-color]");
  const fmt1 = n => { const s = String(Math.round(n * 10) / 10); return I18N.lang === "en" ? s : s.replace(".", ","); };
  const legendText = (w, l, h) => {
    legend.textContent = h != null
      ? I18N.t("lgR", { w, l: fmt1(l), h: fmt1(h), r: fmt1(h + w * RECT_ROOF), a: fmt1(w * l) })
      : I18N.t("lgA", { w, l: fmt1(l), h: fmt1(w * HEIGHT_RATIO), a: fmt1(w * l) });
  };
  const fail = () => {
    host.innerHTML = '<p class="viewer__fail">' + I18N.t("fail2") + '</p>';
    window.HangarViewer = { update: legendText };
  };

  if (typeof THREE === "undefined") return fail();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return fail(); }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 2000);
  const aniso = renderer.capabilities.getMaxAnisotropy();

  /* ---------- небо для отражений на металле ---------- */
  (function setupEnv() {
    const c = document.createElement("canvas");
    c.width = 16; c.height = 256;
    const g = c.getContext("2d"), grd = g.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, "#7fa9d6"); grd.addColorStop(0.45, "#e9f0f5"); grd.addColorStop(0.5, "#cfd6da");
    grd.addColorStop(0.55, "#6f6a5e"); grd.addColorStop(1, "#4a463e");
    g.fillStyle = grd; g.fillRect(0, 0, 16, 256);
    const tex = new THREE.CanvasTexture(c);
    tex.encoding = THREE.sRGBEncoding;
    const env = new THREE.Scene();
    env.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide })));
    const sunDisc = new THREE.Mesh(new THREE.SphereGeometry(7, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    sunDisc.position.set(30, 38, 24);
    env.add(sunDisc);
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(env, 0.03).texture;
    pm.dispose();
  })();

  scene.add(new THREE.HemisphereLight(0xffffff, 0x8a8478, 0.35));
  const sun = new THREE.DirectionalLight(0xfff3e0, 1.35);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0004;
  sun.shadow.normalBias = 0.05;
  scene.add(sun, sun.target);

  /* ---------- текстуры (создаются один раз) ---------- */
  // Профнастил: 4 ребра на 1 м. Нормаль-карта + светлая карта цвета.
  const sheetNormal = (function () {
    const cw = 512, ch = 8, c = document.createElement("canvas");
    c.width = cw; c.height = ch;
    const g = c.getContext("2d"), img = g.createImageData(cw, ch);
    const h = p => { p = ((p % 1) + 1) % 1; return p < 0.14 ? p / 0.14 : p < 0.44 ? 1 : p < 0.58 ? 1 - (p - 0.44) / 0.14 : 0; };
    for (let x = 0; x < cw; x++) {
      const p = (x * 4) / cw, d = h(p + 1 / 256) - h(p - 1 / 256);
      let nx = -d * 1.6; const len = Math.hypot(nx, 1); nx /= len;
      for (let y = 0; y < ch; y++) {
        const i = (y * cw + x) * 4;
        img.data[i] = (nx * 0.5 + 0.5) * 255; img.data[i + 1] = 128; img.data[i + 2] = (1 / len * 0.5 + 0.5) * 255; img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    return c;
  })();
  const sheetColor = (function () {
    const cw = 512, ch = 8, c = document.createElement("canvas");
    c.width = cw; c.height = ch;
    const g = c.getContext("2d");
    for (let k = 0; k < 4; k++) {
      const x0 = k * cw / 4, grd = g.createLinearGradient(x0, 0, x0 + cw / 4, 0);
      grd.addColorStop(0, "#d9d9d9"); grd.addColorStop(0.14, "#ffffff"); grd.addColorStop(0.44, "#ffffff"); grd.addColorStop(0.58, "#e4e4e4"); grd.addColorStop(1, "#cfcfcf");
      g.fillStyle = grd;
      g.fillRect(x0, 0, cw / 4, ch);
    }
    return c;
  })();
  function tileTex(canvas, srgb) {
    const t = new THREE.CanvasTexture(canvas);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.anisotropy = aniso;
    if (srgb) t.encoding = THREE.sRGBEncoding;
    return t;
  }
  const sheetNormalTex = tileTex(sheetNormal, false);
  const sheetColorTex = tileTex(sheetColor, true);

  function noiseCanvas(base, spots) {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = base; g.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2600; i++) {
      g.fillStyle = spots[(Math.random() * spots.length) | 0];
      g.globalAlpha = 0.25 + Math.random() * 0.5;
      const s = 1 + Math.random() * 3;
      g.fillRect(Math.random() * 256, Math.random() * 256, s, s);
    }
    return c;
  }
  const groundTex = tileTex(noiseCanvas("#8b7e69", ["#6e6350", "#a39683", "#5d5444"]), true);
  const gravelTex = tileTex(noiseCanvas("#a7a49d", ["#8b8881", "#c4c1ba", "#77746d"]), true);
  const concreteTex = tileTex(noiseCanvas("#b5b3ac", ["#a09e97", "#c8c6bf"]), true);

  function scaleUV(geo, su, sv) {
    const uv = geo.attributes.uv;
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv);
    uv.needsUpdate = true;
  }

  /* ---------- состояние ---------- */
  let model = new THREE.Group();
  scene.add(model);
  const state = { w: 18, l: 40, Ht: 0, slide: "none", preset: "zinc", skeleton: false, theta: 0.65, phi: 0.38, zoom: 1, labels: [], skinMats: [], shells: [], fitR: 30 };
  const DEF = { theta: 0.65, phi: 0.38, zoom: 1 };

  function disposeModel() {
    model.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => m.dispose());
    });
    scene.remove(model);
  }
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  function line(points, color) {
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), new THREE.LineBasicMaterial({ color }));
  }
  function addLabel(text, pos) {
    const el = document.createElement("span");
    el.className = "viewer__label";
    el.textContent = text;
    labelsEl.appendChild(el);
    state.labels.push({ el, pos });
  }
  const std = o => new THREE.MeshStandardMaterial(o);

  function build(w, l, hWall) {
    disposeModel();
    labelsEl.innerHTML = "";
    Object.assign(state, { labels: [], skinMats: [], shells: [] });
    model = new THREE.Group();
    scene.add(model);

    const rect = hWall != null, fh = FOUNDATION_H, Ht = rect ? hWall + w * RECT_ROOF : w * HEIGHT_RATIO, rise = Ht - fh, a = w / 2, hl = l / 2, N = rect ? 4 : 48;
    Object.assign(state, { w, l, Ht, h: hWall });

    const pr = PRESETS[state.preset];
    const sheetMat = std({
      color: pr.color, metalness: pr.metalness, roughness: pr.roughness,
      map: sheetColorTex, normalMap: sheetNormalTex, normalScale: new THREE.Vector2(1.1, 1.1), side: THREE.DoubleSide
    });
    const rustMat = std({ color: 0x8e2d19, metalness: 0.35, roughness: 0.6 });
    const darkMat = std({ color: 0x20282e, metalness: 0.1, roughness: 0.9, side: THREE.DoubleSide });
    const woodMat = std({ color: 0xd9a441, metalness: 0, roughness: 0.8 });
    const concMat = std({ color: 0xffffff, map: concreteTex, roughness: 0.95, metalness: 0 });
    state.skinMats.push(sheetMat, darkMat);

    // профиль арки (полуэллипс), цоколь снизу
    const prof = [], arc = [0];
    for (let i = 0; i <= N; i++) {
      const t = Math.PI * i / N;
      prof.push(rect ? [[a, fh], [a, hWall], [0, Ht], [-a, hWall], [-a, fh]][i] : [a * Math.cos(t), fh + rise * Math.sin(t)]);
      if (i) arc.push(arc[i - 1] + Math.hypot(prof[i][0] - prof[i - 1][0], prof[i][1] - prof[i - 1][1]));
    }

    // обшивка: рёбра профнастила идут вдоль арки, UV в метрах
    const pos = [], uvs = [], idx = [];
    if (rect) {
      for (let i = 0; i < N; i++) {
        const [x0, y0] = prof[i], [x1, y1] = prof[i + 1], k = pos.length / 3;
        pos.push(x0, y0, -hl, x0, y0, hl, x1, y1, -hl, x1, y1, hl);
        uvs.push(0, arc[i], l, arc[i], 0, arc[i + 1], l, arc[i + 1]);
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    } else {
      prof.forEach(([x, y], i) => { pos.push(x, y, -hl, x, y, hl); uvs.push(0, arc[i], l, arc[i]); });
      for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    sg.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
    sg.setIndex(idx);
    sg.computeVertexNormals();
    const shell = new THREE.Mesh(sg, sheetMat);
    model.add(shell);
    state.shells.push(shell);

    // торцы: вертикальные рёбра
    const shape = new THREE.Shape();
    prof.forEach(([x, y], i) => (i ? shape.lineTo(x, y) : shape.moveTo(x, y)));
    shape.closePath();
    const back = new THREE.Mesh(new THREE.ShapeGeometry(shape), sheetMat);
    back.position.z = -hl;
    const front = new THREE.Mesh(new THREE.ShapeGeometry(shape), sheetMat);
    front.position.z = hl;
    model.add(back, front);
    state.shells.push(back, front);

    // цоколь и пол
    [-a, a].forEach(x => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.5, fh, l + 0.5), concMat);
      b.position.set(x, fh / 2, 0);
      model.add(b);
    });
    [-hl, hl].forEach(z => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(w + 0.5, fh, 0.5), concMat);
      b.position.set(0, fh / 2, z);
      model.add(b);
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(w, l), std({ color: 0x8e9194, roughness: 0.95 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = 0.05;
    model.add(floor);

    // ворота: рамка, два полотна, калитка
    const gw = Math.min(w * 0.5, 8), gh = rect ? Math.max(2, Math.min(hWall - fh - 0.4, 5)) : Math.min(rise * 0.72, 5.5), zf = hl + 0.12, bt = 0.22;
    const beam = (bw, bh, x, y, z) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bt), rustMat);
      m.position.set(x, y, z);
      model.add(m);
    };
    beam(gw + bt, bt, 0, fh + gh, zf);
    beam(bt, gh, -gw / 2, fh + gh / 2, zf);
    beam(bt, gh, gw / 2, fh + gh / 2, zf);
    beam(bt, gh, 0, fh + gh / 2, zf);
    const lw = gw / 2 - bt, lh = gh - bt / 2;
    [-gw / 4, gw / 4].forEach(x => {
      const g = new THREE.PlaneGeometry(lw, lh);
      scaleUV(g, lw, lh);
      const leaf = new THREE.Mesh(g, sheetMat);
      leaf.position.set(x, fh + lh / 2, hl + 0.06);
      model.add(leaf);
    });
    const door = new THREE.Mesh(new THREE.PlaneGeometry(0.95, 2.05), darkMat);
    door.position.set(gw / 4, fh + 1.03, hl + 0.09);
    model.add(door);
    const df = 0.07;
    [[1.05, df, 0, 1.06], [1.05, df, 0, -1.06], [df, 2.2, -0.5, 0], [df, 2.2, 0.5, 0]].forEach(([bw, bh, dx, dy]) => {
      const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.06), rustMat);
      m.position.set(gw / 4 + dx, fh + 1.03 + dy, hl + 0.1);
      model.add(m);
    });

    // вентиляционные жалюзи: над воротами и два на заднем торце
    function louver(x, y, z, dir) {
      const grp = new THREE.Group();
      const bk = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.75), darkMat);
      bk.position.z = 0.02 * dir;
      grp.add(bk);
      for (let k = 0; k < 5; k++) {
        const s = new THREE.Mesh(new THREE.BoxGeometry(1.04, 0.05, 0.1), rustMat);
        s.position.set(0, -0.3 + k * 0.15, 0.06 * dir);
        s.rotation.x = -0.5 * dir;
        grp.add(s);
      }
      grp.position.set(x, y, z);
      model.add(grp);
    }
    if (!rect) louver(0, fh + gh + 0.85, hl + 0.04, 1);

    // відкатні ворота (окремо від ціни): збоку, врізані в дугу, або в задньому торці
    if (!rect && state.slide !== "none") {
      const sw = 6, sh = Math.min(4.5, rise * 0.8);
      const leafMat = std({ color: 0x6d7a85, metalness: 0.55, roughness: 0.5, side: THREE.DoubleSide });
      state.skinMats.push(leafMat);
      const rb = (bw, bh, bd, x, y, z) => { const m = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, bd), rustMat); m.position.set(x, y, z); model.add(m); };
      if (state.slide === "end1") {
        const zb = -hl - 0.14;
        const leaf = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), leafMat);
        leaf.position.set(0, fh + sh / 2, zb + 0.06); model.add(leaf);
        rb(sw + 0.3, 0.18, 0.2, 0, fh + sh + 0.09, zb);
        rb(0.18, sh, 0.2, -sw / 2 - 0.06, fh + sh / 2, zb);
        rb(0.18, sh, 0.2, sw / 2 + 0.06, fh + sh / 2, zb);
        rb(sw * 2 + 0.3, 0.14, 0.16, sw / 2, fh + sh + 0.35, zb - 0.1); // напрямна
      } else {
        const t1 = Math.asin(Math.min(0.98, sh / rise));
        const sides = state.slide === "side2" ? [1, -1] : [1];
        sides.forEach(sg => {
          const M = 14, pts = [];
          for (let j = 0; j <= M; j++) { const t = t1 * j / M; pts.push([sg * a * Math.cos(t) * 1.006, fh + rise * Math.sin(t) * 1.004]); }
          const gp = [], gi = [];
          pts.forEach(([x, y]) => gp.push(x, y, -sw / 2, x, y, sw / 2));
          for (let j = 0; j < M; j++) { const k = j * 2; gi.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
          const gg2 = new THREE.BufferGeometry();
          gg2.setAttribute("position", new THREE.Float32BufferAttribute(gp, 3));
          gg2.setIndex(gi); gg2.computeVertexNormals();
          model.add(new THREE.Mesh(gg2, leafMat));
          [-sw / 2, sw / 2].forEach(z => {
            const curve = new THREE.CatmullRomCurve3(pts.map(([x, y]) => V(x * 1.004, y, z)));
            model.add(new THREE.Mesh(new THREE.TubeGeometry(curve, M, 0.08, 6, false), rustMat));
          });
          const top = pts[M];
          rb(0.16, 0.16, sw + 0.16, top[0] * 1.004, top[1], 0);
          rb(0.16, 0.16, sw * 2 + 0.16, sg * (a + 0.2), fh + 0.1, sw / 2); // напрямна
        });
      }
    }
    [-w * 0.17, w * 0.17].forEach(x => louver(x, fh + rise * 0.7, -hl - 0.04, -1));

    // прямокутний ангар: портальні рами кожні ~5 м, прогони даху, ригелі стін
    const rectFrame = () => {
      const steelMat = std({ color: 0x59636b, metalness: 0.75, roughness: 0.4 });
      const nb = Math.max(2, Math.round(l / 5)), dy = Ht - hWall, sl = Math.hypot(a, dy), ang = Math.atan2(dy, a), fm = new THREE.Group();
      for (let k = 0; k <= nb; k++) {
        const z = -hl + l * k / nb;
        for (const s of [-1, 1]) {
          const c = new THREE.Mesh(new THREE.BoxGeometry(0.28, hWall - fh, 0.16), steelMat);
          c.position.set(s * (a - 0.2), (hWall + fh) / 2, z);
          const r = new THREE.Mesh(new THREE.BoxGeometry(sl, 0.34, 0.14), steelMat);
          r.position.set(s * a / 2, (hWall + Ht) / 2 - 0.1, z); r.rotation.z = -s * ang;
          fm.add(c, r);
        }
      }
      for (let t = 0.08; t < 1; t += 1.5 / sl) for (const s of [-1, 1]) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, l + 0.4), steelMat);
        m.position.set(s * a * (1 - t), hWall + dy * t - 0.05, 0); fm.add(m);
      }
      for (let y = 1.5; y < hWall - 0.3; y += 1.5) for (const s of [-1, 1]) {
        const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, l), steelMat);
        m.position.set(s * (a - 0.1), y, 0); fm.add(m);
      }
      model.add(fm);
    };
    // каркас арки: фермы из двух поясов с раскосами + деревянные прогоны
    const frame = new THREE.Group();
    if (rect) rectFrame(); else {
    const kx = 1 - 0.5 / a, ky = 1 - 0.5 / rise, ribs = Math.max(2, Math.round(l / ARCH_STEP));
    const outer = prof.map(([x, y]) => V(x * 0.99, fh + (y - fh) * 0.99, 0));
    const inner = prof.map(([x, y]) => V(x * kx, fh + (y - fh) * ky, 0));
    const diag = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.022, 0.022, 1, 5), rustMat, (ribs + 1) * N);
    const dummy = new THREE.Object3D(), up = V(0, 1, 0);
    let n = 0;
    for (let k = 0; k <= ribs; k++) {
      const z = -hl + (l * k) / ribs;
      [outer, inner].forEach(ch => {
        const curve = new THREE.CatmullRomCurve3(ch.map(p => V(p.x, p.y, z)));
        frame.add(new THREE.Mesh(new THREE.TubeGeometry(curve, N, 0.045, 6, false), rustMat));
      });
      for (let i = 0; i < N; i++) {
        const p = i % 2 ? inner[i] : outer[i], q = i % 2 ? outer[i + 1] : inner[i + 1];
        const d = V(q.x - p.x, q.y - p.y, 0), len = d.length();
        dummy.position.set((p.x + q.x) / 2, (p.y + q.y) / 2, z);
        dummy.quaternion.setFromUnitVectors(up, d.normalize());
        dummy.scale.set(1, len, 1);
        dummy.updateMatrix();
        diag.setMatrixAt(n++, dummy.matrix);
      }
    }
    frame.add(diag);
    // арка з 3 частин: два стики (накладки) на третинах дуги
    const plateMat = std({ color: 0xaab4bb, metalness: 0.7, roughness: 0.4 });
    const spl = [Math.round(N / 3), Math.round(2 * N / 3)], plates = new THREE.InstancedMesh(new THREE.BoxGeometry(0.1, 1, 0.22), plateMat, (ribs + 1) * spl.length);
    let np = 0;
    for (let k = 0; k <= ribs; k++) {
      const z = -hl + (l * k) / ribs;
      spl.forEach(i => {
        const d = V(outer[i].x - inner[i].x, outer[i].y - inner[i].y, 0), len = d.length();
        dummy.position.set((outer[i].x + inner[i].x) / 2, (outer[i].y + inner[i].y) / 2, z);
        dummy.quaternion.setFromUnitVectors(up, d.normalize());
        dummy.scale.set(1, len + 0.3, 1);
        dummy.updateMatrix();
        plates.setMatrixAt(np++, dummy.matrix);
      });
    }
    frame.add(plates);
    // брус 50×50 уздовж ангара: кожен третій вузол дуги
    const bat = [];
    for (let i = 3; i < N; i += 3) bat.push(i);
    const battens = new THREE.InstancedMesh(new THREE.BoxGeometry(0.08, 0.12, 1), woodMat, bat.length);
    bat.forEach((i, j) => {
      dummy.position.set(outer[i].x * 1.003, outer[i].y, 0);
      dummy.quaternion.identity();
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, l);
      dummy.updateMatrix();
      battens.setMatrixAt(j, dummy.matrix);
    });
    frame.add(battens);
    model.add(frame);
    }

    // земля и щебёночная площадка у ворот
    const gr = Math.hypot(w, l) * 0.9 + 12;
    const gg = new THREE.CircleGeometry(gr, 80);
    scaleUV(gg, gr * 2 / 5, gr * 2 / 5);
    const ground = new THREE.Mesh(gg, std({ color: 0xffffff, map: groundTex, roughness: 1, metalness: 0 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -0.02;
    ground.receiveShadow = true;
    model.add(ground);
    const pg = new THREE.PlaneGeometry(w + 6, 12);
    scaleUV(pg, (w + 6) / 5, 12 / 5);
    const apron = new THREE.Mesh(pg, std({ color: 0xffffff, map: gravelTex, roughness: 1, metalness: 0 }));
    apron.rotation.x = -Math.PI / 2; apron.position.set(0, 0.0, hl + 6);
    apron.receiveShadow = true;
    model.add(apron);

    // человек 1,8 м для масштаба
    const pm = std({ color: 0xe0a526, roughness: 0.8, metalness: 0 });
    const person = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.2, 1.45, 12), pm);
    body.position.y = 0.725;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 14, 12), pm);
    head.position.y = 1.63;
    person.add(body, head);
    person.position.set(gw / 2 + 1.3, 0, hl + 1.2);
    model.add(person);

    // размерные линии и подписи
    const ink = 0x1c242b, off = Math.max(2.2, w * 0.14), tk = 0.5, y0 = 0.08;
    const zW = hl + off, xL = a + off, xH = -a - off * 0.6;
    const dim = (p1, p2, t1, t2) => { model.add(line([p1, p2], ink), line(t1, ink), line(t2, ink)); };
    dim(V(-a, y0, zW), V(a, y0, zW), [V(-a, y0, zW - tk), V(-a, y0, zW + tk)], [V(a, y0, zW - tk), V(a, y0, zW + tk)]);
    dim(V(xL, y0, -hl), V(xL, y0, hl), [V(xL - tk, y0, -hl), V(xL + tk, y0, -hl)], [V(xL - tk, y0, hl), V(xL + tk, y0, hl)]);
    dim(V(xH, 0, hl), V(xH, Ht, hl), [V(xH - tk, 0, hl), V(xH + tk, 0, hl)], [V(xH - tk, Ht, hl), V(xH + tk, Ht, hl)]);
    const mu = I18N.t("m");
    addLabel(`${w} ${mu}`, V(0, 0.4, zW));
    addLabel(`${fmt1(l)} ${mu}`, V(xL, 0.4, 0));
    addLabel(`≈ ${fmt1(Ht)} ${mu}`, V(xH, Ht / 2, hl));

    // тени
    model.traverse(o => {
      if (o.isMesh && o !== ground && o !== apron && o !== floor) { o.castShadow = true; o.receiveShadow = true; }
    });
    const R = Math.hypot(w, l) * 0.75 + 8, sc = sun.shadow.camera;
    sc.left = -R; sc.right = R; sc.top = R; sc.bottom = -R; sc.near = 1; sc.far = R * 6;
    sc.updateProjectionMatrix();
    sun.position.set(R * 0.9, R * 1.6, R * 1.1);

    state.fitR = Math.hypot(w + off * 2, l + off * 2, Ht) / 2;
    applySkin();
    legendText(w, l, hWall);
    fit();
  }

  function applySkin() {
    state.skinMats.forEach(m => {
      m.transparent = state.skeleton;
      m.opacity = state.skeleton ? 0.13 : 1;
      m.depthWrite = !state.skeleton;
      m.needsUpdate = true;
    });
    state.shells.forEach(s => { s.castShadow = !state.skeleton; });
    if (skinBtn) {
      skinBtn.textContent = I18N.t(state.skeleton ? "showSkin" : "showFrame");
      skinBtn.setAttribute("aria-pressed", String(state.skeleton));
    }
    colorBtns.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.color === state.preset)));
  }

  /* ---------- камера ---------- */
  let W = 1, Hpx = 1, dist = 50;
  function fit() {
    const vf = camera.fov * Math.PI / 180, hf = 2 * Math.atan(Math.tan(vf / 2) * camera.aspect);
    dist = state.fitR / Math.sin(Math.min(vf, hf) / 2);
    queue();
  }
  function placeCamera() {
    const d = dist * state.zoom, c = Math.cos(state.phi), ty = state.Ht * 0.3;
    camera.position.set(d * c * Math.sin(state.theta), ty + d * Math.sin(state.phi), d * c * Math.cos(state.theta));
    camera.lookAt(0, ty, 0);
  }
  function resize() {
    W = host.clientWidth || 1; Hpx = host.clientHeight || 1;
    renderer.setSize(W, Hpx, false);
    camera.aspect = W / Hpx;
    camera.updateProjectionMatrix();
    fit();
  }
  let pending = false;
  function queue() { if (!pending) { pending = true; requestAnimationFrame(render); } }
  function render() {
    pending = false;
    placeCamera();
    camera.updateMatrixWorld();
    renderer.render(scene, camera);
    state.labels.forEach(({ el, pos }) => {
      const v = pos.clone().project(camera);
      el.style.display = v.z > 1 ? "none" : "";
      el.style.transform = `translate(-50%,-50%) translate(${(v.x * 0.5 + 0.5) * W}px,${(-v.y * 0.5 + 0.5) * Hpx}px)`;
    });
  }

  /* ---------- управление ---------- */
  const ptrs = new Map();
  let pinch = 0;
  const clampZoom = z => Math.min(2.2, Math.max(0.45, z));
  const cv = renderer.domElement;
  cv.addEventListener("pointerdown", e => { cv.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, e); pinch = 0; });
  cv.addEventListener("pointermove", e => {
    const prev = ptrs.get(e.pointerId);
    if (!prev) return;
    if (ptrs.size === 1) {
      state.theta -= (e.clientX - prev.clientX) * 0.008;
      if (e.pointerType !== "touch") state.phi = Math.min(1.35, Math.max(0.05, state.phi + (e.clientY - prev.clientY) * 0.006));
    }
    ptrs.set(e.pointerId, e);
    if (ptrs.size === 2) {
      const [p, q] = [...ptrs.values()], d = Math.hypot(p.clientX - q.clientX, p.clientY - q.clientY);
      if (pinch) state.zoom = clampZoom(state.zoom * pinch / d);
      pinch = d;
    }
    queue();
  });
  const up = e => { ptrs.delete(e.pointerId); pinch = 0; };
  cv.addEventListener("pointerup", up);
  cv.addEventListener("pointercancel", up);
  cv.addEventListener("wheel", e => { e.preventDefault(); state.zoom = clampZoom(state.zoom * (1 + Math.sign(e.deltaY) * 0.08)); queue(); }, { passive: false });
  cv.addEventListener("keydown", e => {
    const k = { ArrowLeft: [0.12, 0], ArrowRight: [-0.12, 0], ArrowUp: [0, -0.08], ArrowDown: [0, 0.08] }[e.key];
    if (!k) return;
    e.preventDefault();
    state.theta += k[0];
    state.phi = Math.min(1.35, Math.max(0.05, state.phi + k[1]));
    queue();
  });
  cv.tabIndex = 0;
  const setAria = () => cv.setAttribute("aria-label", I18N.t("cvAria"));
  setAria(); addEventListener("langchange", setAria);

  skinBtn && skinBtn.addEventListener("click", () => { state.skeleton = !state.skeleton; applySkin(); queue(); });
  resetBtn && resetBtn.addEventListener("click", () => { Object.assign(state, DEF); queue(); });
  colorBtns.forEach(b => b.addEventListener("click", () => { state.preset = b.dataset.color; build(state.w, state.l, state.h); }));

  if (window.ResizeObserver) new ResizeObserver(resize).observe(host); else addEventListener("resize", resize);

  window.HangarViewer = { update(w, l, h, slide) { state.slide = slide || "none"; build(w, l, h); } };
  resize();
})();
