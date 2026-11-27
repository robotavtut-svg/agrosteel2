/* 3D-моделі ангарів (three.js r128): фермова арка, портальний каркас, сендвіч-панелі, навіс.
   Усе будується кодом: каркас, прогони, обшивка, ворота. Розміри в метрах. */
(function () {
  "use strict";
  const host = document.getElementById("typesStage");
  if (!host) return;
  const fail = () => { host.innerHTML = '<p class="viewer__fail">3D-модель недоступна у цьому браузері.</p>'; };
  if (typeof THREE === "undefined") return fail();
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); } catch (e) { return fail(); }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  host.insertBefore(renderer.domElement, host.firstChild);

  const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.1, 1000);
  renderer.toneMappingExposure = 1.05;
  scene.fog = new THREE.Fog(0xcfe0ee, 150, 320);
  scene.add(new THREE.HemisphereLight(0xdfeaf5, 0x8a8478, 0.45));
  const sun = new THREE.DirectionalLight(0xfff3e0, 1.4);
  sun.castShadow = true; sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.05;
  sun.position.set(40, 60, 30);
  const sc = sun.shadow.camera; sc.left = sc.bottom = -55; sc.right = sc.top = 55; sc.far = 220;
  scene.add(sun);

  const V = (x, y, z) => new THREE.Vector3(x, y, z), Z = V(0, 0, 1), X = V(1, 0, 0);
  const cv = (w, h, f) => { const c = document.createElement("canvas"); c.width = w; c.height = h; f(c.getContext("2d"), c); return c; };
  const tex = (c, s) => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; if (s) t.encoding = THREE.sRGBEncoding; return t; };
  // профнастил: 4 хвилі на 1 м (нормаль-карта); сендвіч: шов кожні 1 м
  const ribN = tex(cv(256, 4, (g, c) => { const d = g.createImageData(256, 4); for (let x = 0; x < 256; x++) { const nx = -Math.sin(x * 4 / 256 * 6.283) * 0.8, l = Math.hypot(nx, 1); for (let y = 0; y < 4; y++) { const i = (y * 256 + x) * 4; d.data.set([(nx / l * .5 + .5) * 255, 128, (1 / l * .5 + .5) * 255, 255], i); } } g.putImageData(d, 0, 0); }));
  const seamT = tex(cv(64, 8, g => { g.fillStyle = "#fff"; g.fillRect(0, 0, 64, 8); g.fillStyle = "#b8c0c6"; g.fillRect(0, 0, 3, 8); }), true);
  const noise = (b, sp) => tex(cv(256, 256, g => { g.fillStyle = b; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 2500; i++) { g.fillStyle = sp[i % sp.length]; g.globalAlpha = .2 + Math.random() * .5; g.fillRect(Math.random() * 256, Math.random() * 256, 2, 2); } }), true);
  const rnd = (() => { let a = 7; return () => (a = (a * 16807) % 2147483647) / 2147483647; })();
  // небо (фон) і карта відбиттів для металу
  const skyT = tex(cv(4, 256, g => { const k = g.createLinearGradient(0, 0, 0, 256); k.addColorStop(0, "#5b8cc2"); k.addColorStop(.7, "#b9d3e8"); k.addColorStop(1, "#dce8f1"); g.fillStyle = k; g.fillRect(0, 0, 4, 256); }), true); skyT.wrapS = skyT.wrapT = THREE.ClampToEdgeWrapping; scene.background = skyT;
  const envT = new THREE.CanvasTexture(cv(512, 256, g => { const k = g.createLinearGradient(0, 0, 0, 256); k.addColorStop(0, "#4f82bd"); k.addColorStop(.48, "#d6e5f1"); k.addColorStop(.5, "#7d7a68"); k.addColorStop(1, "#4a4a3f"); g.fillStyle = k; g.fillRect(0, 0, 512, 256); g.fillStyle = "#fff"; g.globalAlpha = .9; g.beginPath(); g.arc(380, 55, 20, 0, 7); g.fill(); for (let i = 0; i < 14; i++) { g.globalAlpha = .35; g.beginPath(); g.ellipse(rnd() * 512, 30 + rnd() * 70, 40 + rnd() * 50, 8 + rnd() * 8, 0, 0, 7); g.fill(); } }));
  envT.mapping = THREE.EquirectangularReflectionMapping; envT.encoding = THREE.sRGBEncoding;
  const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromEquirectangular(envT).texture; pm.dispose();
  // ґрунт із травою, бетон із опалубкою, щебінь
  const groundT = tex(cv(512, 512, g => { g.fillStyle = "#6f7d4b"; g.fillRect(0, 0, 512, 512); for (let i = 0; i < 9000; i++) { const t = rnd(); g.fillStyle = t < .3 ? "#5a6a3b" : t < .6 ? "#83925a" : t < .8 ? "#7a6f50" : "#98a468"; g.globalAlpha = .25 + rnd() * .5; g.fillRect(rnd() * 512, rnd() * 512, 1 + rnd() * 2, 2 + rnd() * 5); } for (let i = 0; i < 30; i++) { g.globalAlpha = .08; g.fillStyle = rnd() < .5 ? "#4f5a30" : "#a79a6a"; g.beginPath(); g.arc(rnd() * 512, rnd() * 512, 20 + rnd() * 50, 0, 7); g.fill(); } }), true);
  const concT = tex(cv(256, 256, g => { g.fillStyle = "#b5b3ac"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 4000; i++) { g.fillStyle = rnd() < .5 ? "#9f9d96" : "#cac8c1"; g.globalAlpha = .15 + rnd() * .4; g.fillRect(rnd() * 256, rnd() * 256, 1 + rnd() * 2, 1 + rnd() * 2); } g.globalAlpha = .5; g.fillStyle = "#8c8a84"; g.fillRect(0, 126, 256, 2); g.fillRect(0, 0, 256, 2); }), true);
  const gravT = tex(cv(256, 256, g => { g.fillStyle = "#9a958a"; g.fillRect(0, 0, 256, 256); for (let i = 0; i < 3500; i++) { const v = 110 + rnd() * 110 | 0; g.fillStyle = `rgb(${v},${v - 3},${v - 10})`; g.globalAlpha = .8; g.beginPath(); g.arc(rnd() * 256, rnd() * 256, .8 + rnd() * 2, 0, 7); g.fill(); } }), true);
  // профнастил: колір хвиль із потертістю
  const sheetT = tex(cv(256, 256, g => { for (let x = 0; x < 256; x++) { const v = .84 + .16 * Math.cos(x * 4 / 256 * 6.283 + 1); g.fillStyle = `rgb(${v * 255 | 0},${v * 255 | 0},${v * 255 | 0})`; g.fillRect(x, 0, 1, 256); } for (let i = 0; i < 60; i++) { g.fillStyle = rnd() < .5 ? "#000" : "#fff"; g.globalAlpha = .03 + rnd() * .04; g.fillRect(rnd() * 256, 0, 1 + rnd() * 2, 256); } }), true);
  const M = (c, o) => new THREE.MeshStandardMaterial(Object.assign({ color: c, roughness: .5, metalness: .3, side: THREE.DoubleSide }, o));
  const skins = [];
  const sheet = (c, o) => { const m = M(c, Object.assign({ metalness: .65, roughness: .38, map: sheetT, normalMap: ribN, normalScale: V(1, 1).setScalar(1.4), envMapIntensity: 1.2 }, o)); skins.push(m); return m; };
  const panel = c => { const m = M(c, { map: seamT, metalness: .2, roughness: .55 }); skins.push(m); return m; };
  const steel = M(0x59636b, { metalness: .75, roughness: .4 }), red = M(0x8e2d19, { metalness: .35 }), dark = M(0x20282e, { metalness: .1, roughness: .9 }), glass = M(0x1d2a36, { metalness: .8, roughness: .15 });
  const conc = M(0xffffff, { map: concT, roughness: .95, metalness: 0 });
  skins.push(dark);

  // плоска обшивка: u = метри поперек хвиль
  function plane(a, b, m, x, y, z, ry, rz) {
    const g = new THREE.PlaneGeometry(a, b), uv = g.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * a, uv.getY(i) * b);
    const o = new THREE.Mesh(g, m), p = new THREE.Group(); o.rotation.y = ry || 0; p.add(o); p.position.set(x, y, z); p.rotation.z = rz || 0; return p;
  }
  // усі елементи каркаса — в одній площині XY; список [a,b,товщина по Z,товщина в площині]
  function beams(list, m) {
    const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), m, list.length), o = new THREE.Object3D(), mx = new THREE.Matrix4(), d = V(0, 0, 0), y = V(0, 0, 0);
    list.forEach(([a, b, wz, wp], i) => { d.subVectors(b, a); const L = d.length(); d.normalize(); const R = Math.abs(d.z) > .99 ? X : Z; y.crossVectors(d, R); mx.makeBasis(R, y, d); o.quaternion.setFromRotationMatrix(mx); o.position.addVectors(a, b).multiplyScalar(.5); o.scale.set(wz, wp, L); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
    im.castShadow = true; return im;
  }
  const I = (a, b, h, f, t) => { const n = b.clone().sub(a).normalize().cross(Z).multiplyScalar(h / 2); return [[a.clone().add(n), b.clone().add(n), f, t], [a.clone().sub(n), b.clone().sub(n), f, t], [a, b, t, h]]; };
  const bx = (w, h, d, m, x, y, z) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };

  function site(g, w, l, fh, ex) {
    const gr = new THREE.CircleGeometry(220, 64), uv = gr.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * 44, uv.getY(i) * 44);
    const f = new THREE.Mesh(gr, M(0xffffff, { map: groundT, roughness: 1, metalness: 0 })); f.rotation.x = -Math.PI / 2; f.position.y = -.03; f.receiveShadow = true; g.add(f);
    g.add(bx(w + 1 + (ex || 0), fh, l + 1, conc, 0, fh / 2 - .02, 0));
  }
  // секційні ворота з горизонтальними панелями + хвіртка
  function gate(g, gw, gh, x, y, z, m, swing) {
    g.add(bx(gw + .3, gh + .15, .12, red, x, y + gh / 2, z));
    const l = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), m); l.position.set(x, y + gh / 2, z + .08); g.add(l);
    const pts = []; if (swing) pts.push(x, y, z + .09, x, y + gh, z + .09); else for (let k = 1; k < 6; k++) pts.push(x - gw / 2, y + gh * k / 6, z + .09, x + gw / 2, y + gh * k / 6, z + .09);
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); g.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x7d878e })));
  }
  const door = (g, x, y, z) => { g.add(bx(1.2, 2.2, .1, red, x, y + 1.1, z), bx(.95, 2.05, .12, dark, x, y + 1.05, z + .02)); };

  const BUILD = {
    // арочний: фермові арки кожні 3 м, дерев'яні прогони, профнастил уздовж дуги
    arch() {
      const g = new THREE.Group(), w = 18, l = 40, a = w / 2, fh = .5, rise = w * .55 - fh, N = 64, m = sheet(0xdfe5e9);
      site(g, w, l, fh);
      const P = [], arc = [0]; for (let i = 0; i <= N; i++) { const t = Math.PI * i / N; P.push(V(a * Math.cos(t), fh + rise * Math.sin(t), 0)); if (i) arc.push(arc[i - 1] + P[i].distanceTo(P[i - 1])); }
      const pos = [], uvs = [], idx = []; P.forEach((p, i) => { pos.push(p.x, p.y, -l / 2, p.x, p.y, l / 2); uvs.push(0, arc[i], l, arc[i]); });
      for (let i = 0; i < N; i++) { const k = i * 2; idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); }
      const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); sg.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2)); sg.setIndex(idx); sg.computeVertexNormals();
      const shell = new THREE.Mesh(sg, m); shell.castShadow = shell.receiveShadow = true; g.add(shell);
      const sh = new THREE.Shape(); P.forEach((p, i) => i ? sh.lineTo(p.x, p.y) : sh.moveTo(p.x, p.y));
      [-l / 2, l / 2].forEach(z => { const e = new THREE.Mesh(new THREE.ShapeGeometry(sh), m); e.position.z = z; e.castShadow = true; g.add(e); });
      const inn = P.map(p => V(p.x * (1 - .55 / a), fh + (p.y - fh) * (1 - .55 / rise), 0)), seg = [], n = Math.round(l / 2.5);
      for (let k = 0; k <= n; k++) { const z = -l / 2 + l * k / n; for (let i = 0; i < N; i++) {
        const s = x => x.clone().setZ(z), o0 = s(P[i]), o1 = s(P[i + 1]), i0 = s(inn[i]), i1 = s(inn[i + 1]);
        seg.push([o0, o1, .09, .09], [i0, i1, .09, .09], i % 2 ? [i0, o1, .05, .05] : [o0, i1, .05, .05]); } seg.push([s0(P[0], z), s0(inn[0], z), .09, .09], [s0(P[N], z), s0(inn[N], z), .09, .09]); }
      function s0(p, z) { return p.clone().setZ(z); }
      g.add(beams(seg, red));
      // арка з 3 частин: накладки-стики на третинах дуги; брус 50×50 уздовж ангара
      const sp = [Math.round(N / 3), Math.round(2 * N / 3)], pl = [], wd = [];
      for (let k = 0; k <= n; k++) { const z = -l / 2 + l * k / n; sp.forEach(i => pl.push([s0(P[i], z), s0(inn[i], z), .24, .1])); }
      g.add(beams(pl, M(0xaab4bb, { metalness: .7, roughness: .4 })));
      for (let i = 4; i < N; i += 4) { const p = P[i]; wd.push([V(p.x * .985, fh + (p.y - fh) * .985, -l / 2), V(p.x * .985, fh + (p.y - fh) * .985, l / 2), .07, .11]); }
      g.add(beams(wd, M(0xd9a441, { roughness: .8, metalness: 0 })));
      gate(g, 8, 5.5, 0, fh, l / 2 + .12, dark, true); door(g, 6.8, fh, l / 2 + .12);
      return g;
    },
    // прямостінний і утеплений: портальні рами з двотаврів, прогони, ригелі, обшивка
    straight(warm) {
      const g = new THREE.Group(), w = warm ? 16 : 20, l = warm ? 36 : 40, wh = warm ? 6 : 6.5, rh = wh + w * (warm ? .1 : .09), fh = .3, ov = warm ? .4 : .15;
      const cl = warm ? 0xeceff1 : 0x9aa4ac, wall = warm ? panel(cl) : sheet(cl), roof = warm ? panel(0x5d6f80) : sheet(0xdfe5e9);
      site(g, w, l, fh); const a = w / 2, bay = 5, nb = Math.round(l / bay), seg = [];
      for (let k = 0; k <= nb; k++) { const z = -l / 2 + l * k / nb;
        seg.push(...I(V(-a + .2, 0, z), V(-a + .2, wh, z), .5, .2, .02), ...I(V(a - .2, 0, z), V(a - .2, wh, z), .5, .2, .02),
          ...I(V(-a + .2, wh, z), V(0, rh, z), .45, .18, .02), ...I(V(a - .2, wh, z), V(0, rh, z), .45, .18, .02)); }
      const fr = beams(seg, steel); g.add(fr);
      const sl = Math.hypot(a, rh - wh), ph = Math.atan2(a, rh - wh), pur = [];
      for (let s = .5; s < sl; s += 1.5) for (const sg of [-1, 1]) { const t = s / sl; pur.push([V(sg * (a - a * t), wh + (rh - wh) * t + .2, -l / 2 - ov), V(sg * (a - a * t), wh + (rh - wh) * t + .2, l / 2 + ov), .08, .16]); }
      for (let y = 1.5; y < wh; y += 1.5) for (const sg of [-1, 1]) pur.push([V(sg * a, y, -l / 2), V(sg * a, y, l / 2), .08, .12]);
      g.add(beams(pur, steel));
      for (const sg of [-1, 1]) {
        const r = plane(l + ov * 2, sl + ov, roof, sg * (a / 2 + ov * .45), (wh + rh) / 2 - .02, 0, -Math.PI / 2, sg * ph); g.add(r);
        g.add(plane(l, wh - fh, wall, sg * (a + .02), (wh + fh) / 2, 0, sg * Math.PI / 2));
        g.add(bx(.2, .16, l + ov * 2, steel, sg * (a + ov * .8), wh - .05, 0));
        g.add(bx(.1, 3 * 0 + wh, .1, M(0x8a9298), sg * (a + .12), wh / 2, l / 2 - 1.2));
      }
      g.add(bx(.5, .12, l + ov * 2, M(0xb9c1c7, { metalness: .7 }), 0, rh + .15, 0));
      const sh = new THREE.Shape(); sh.moveTo(-a, fh); sh.lineTo(a, fh); sh.lineTo(a, wh); sh.lineTo(0, rh); sh.lineTo(-a, wh); sh.closePath();
      [-l / 2, l / 2].forEach(z => { const e = new THREE.Mesh(new THREE.ShapeGeometry(sh), wall); e.position.z = z; e.castShadow = true; g.add(e); });
      const zf = l / 2 + .02;
      if (warm) {
        const blue = M(0x24467a, { roughness: .6 });
        for (const sg of [-1, 1]) g.add(bx(.06, 1.2, l + .06, blue, sg * (a + .04), .9, 0));
        g.add(bx(w + .06, 1.2, .06, blue, 0, .9, zf + .02), bx(w + .06, 1.2, .06, blue, 0, .9, -zf - .02));
        for (let z = -l / 2 + 4; z < l / 2 - 3; z += 6) for (const sg of [-1, 1]) g.add(bx(.08, 1.1, 3, glass, sg * (a + .06), 3.6, z), bx(.1, .08, 3.2, steel, sg * (a + .06), 4.2, z), bx(.1, .08, 3.2, steel, sg * (a + .06), 3.0, z));
        gate(g, 4, 3.8, -3, fh, zf + .1, M(0xe6eaed)); door(g, 2, fh, zf + .1);
      } else { gate(g, 6, 5, 0, fh, zf + .1, dark); door(g, 5, fh, zf + .1); }
      return g;
    },
    warm() { return BUILD.straight(true); },
    // навіс: колони, односхилі ґратчасті ферми, прогони, профнастил, тюки під дахом
    canopy() {
      const g = new THREE.Group(), w = 15, l = 30, hH = 6.5, hL = 5, fh = .15, m = sheet(0xdfe5e9, { roughness: .45 });
      site(g, w, l, fh, 1); const a = w / 2, seg = [], nb = 5, tp = M(0x3a444c, { metalness: .6 });
      for (let k = 0; k <= nb; k++) { const z = -l / 2 + l * k / nb, T = [], B = [], n = 10;
        for (let i = 0; i <= n; i++) { const x = -a + w * i / n, y = hH + (hL - hH) * i / n; T.push(V(x, y, z)); B.push(V(x, y - .8, z)); }
        for (let i = 0; i < n; i++) seg.push([T[i], T[i + 1], .1, .1], [B[i], B[i + 1], .08, .08], i % 2 ? [B[i], T[i + 1], .05, .05] : [T[i], B[i + 1], .05, .05]);
        seg.push([T[0], B[0], .06, .06], [T[n], B[n], .06, .06], ...I(V(-a, 0, z), V(-a, hH - .8, z), .35, .16, .02), ...I(V(a, 0, z), V(a, hL - .8, z), .35, .16, .02)); }
      g.add(beams(seg, tp));
      const pur = []; for (let i = 0; i <= 10; i++) { const x = -a + w * i / 10, y = hH + (hL - hH) * i / 10 + .08; pur.push([V(x, y, -l / 2 - .6), V(x, y, l / 2 + .6), .07, .14]); }
      g.add(beams(pur, tp));
      const sl = Math.hypot(w + 1, hH - hL);
      const rf = plane(l + 1.2, sl, m, 0, (hH + hL) / 2 + .2, 0, -Math.PI / 2, Math.atan2(w, hH - hL)); g.add(rf);
      const bm = M(0xd9b44a, { roughness: .9, metalness: 0 });
      for (let r2 = 0; r2 < 3; r2++) for (let c = 0; c < 8 - r2; c++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 1.2, 18), bm); b.rotation.z = Math.PI / 2; b.position.set(-a + 1.4 + r2 * .6 + (r2 % 2 ? 0 : 0), fh + .6 + r2 * 1.05, -l / 2 + 2 + c * 1.35 + r2 * .65); b.rotation.set(0, 0, Math.PI / 2); b.castShadow = true; g.add(b); }
      return g;
    }
  };

  // щебеневий в'їзд, дерева, паркан, ринви: додається до будь-якої моделі
  const tmat = [M(0x5e3f26, { roughness: 1, metalness: 0 }), M(0x3f6b34, { roughness: .9, metalness: 0 }), M(0x557d3b, { roughness: .9, metalness: 0 })];
  function decorate(g, k) {
    const b = new THREE.Box3().setFromObject(g.children[1] || g), W = b.max.x - b.min.x, L = b.max.z - b.min.z;
    const ap = new THREE.Mesh(new THREE.PlaneGeometry(W + 10, 22), M(0xffffff, { map: gravT, roughness: 1, metalness: 0 })); ap.material.map = gravT.clone(); ap.material.map.repeat.set(5, 4); ap.material.map.needsUpdate = true;
    ap.rotation.x = -Math.PI / 2; ap.position.set(0, .01, b.max.z + 10); ap.receiveShadow = true; g.add(ap);
    const n = 46, tr = new THREE.InstancedMesh(new THREE.CylinderGeometry(.25, .4, 4, 7), tmat[0], n), c1 = new THREE.InstancedMesh(new THREE.ConeGeometry(2.6, 8, 9), tmat[1], n), c2 = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(2.8, 1), tmat[2], n), o = new THREE.Object3D();
    for (let i = 0; i < n; i++) { const an = rnd() * 6.283, r = 48 + rnd() * 45, sc = .8 + rnd() * .9, x = Math.cos(an) * r, z = Math.sin(an) * r, pine = rnd() < .5;
      o.position.set(x, 2 * sc, z); o.rotation.set(0, 0, 0); o.scale.setScalar(sc); o.updateMatrix(); tr.setMatrixAt(i, o.matrix);
      o.position.set(x, (pine ? 7.5 : -50) * sc, z); o.updateMatrix(); c1.setMatrixAt(i, o.matrix);
      o.position.set(x, (pine ? -50 : 6.2) * sc, z); o.updateMatrix(); c2.setMatrixAt(i, o.matrix); }
    [tr, c1, c2].forEach(m => { m.castShadow = true; g.add(m); });
    if (k === "straight" || k === "warm") { const dm = M(0x8a9298, { metalness: .7, roughness: .4 }), h = b.max.y; for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const d = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, 6, 10), dm); d.position.set(sx * (W / 2 - .2), 3, sz * (L / 2 - .3)); d.castShadow = true; g.add(d); } }
    // сітчастий паркан по периметру
    const fm = M(0x45505a, { metalness: .7, roughness: .5 }), fp = [], hw = W / 2 + 12, hl = L / 2 + 12;
    for (let t = -hw; t <= hw; t += 4) fp.push([t, -hl], [t, hl]); for (let t = -hl + 4; t < hl; t += 4) fp.push([-hw, t], [hw, t]);
    const im = new THREE.InstancedMesh(new THREE.CylinderGeometry(.05, .05, 2, 6), fm, fp.length); fp.forEach(([x, z], i) => { o.position.set(x, 1, z); o.scale.setScalar(1); o.updateMatrix(); im.setMatrixAt(i, o.matrix); }); g.add(im);
    const rl = [[-hw, -hl, hw, -hl], [-hw, hl, hw, hl], [-hw, -hl, -hw, hl], [hw, -hl, hw, hl]].map(([a, b2, c, d]) => { const r = new THREE.Mesh(new THREE.BoxGeometry(Math.hypot(c - a, d - b2), .05, .05), fm); r.position.set((a + c) / 2, 1.8, (b2 + d) / 2); r.rotation.y = -Math.atan2(d - b2, c - a); return r; }); rl.forEach(r => g.add(r));
  }
  function setInfo() { const i = I18N.info(key); $("typesTitle").textContent = i[0]; $("typesText").textContent = i[1]; $("typesSize").textContent = i[2]; }
  const $ = id => document.getElementById(id), tabs = document.querySelectorAll(".types__tabs [data-type]"), frameBtn = $("typesFrame");
  const target = V(0, 0, 0); let current = null, key = "arch", frame = false, base = 60, dist = 60, yaw = .7, pitch = .32, auto = !matchMedia("(prefers-reduced-motion: reduce)").matches, drag = null, visible = true;
  function applyFrame() { skins.forEach(m => { m.transparent = frame; m.opacity = frame ? .1 : 1; m.depthWrite = !frame; m.needsUpdate = true; }); if (frameBtn) { frameBtn.setAttribute("aria-pressed", String(frame)); frameBtn.textContent = I18N.t(frame ? "showSkin" : "showFrame"); } }
  function show(k) {
    key = k; if (current) { scene.remove(current); current.traverse(o => o.geometry && o.geometry.dispose()); }
    skins.length = 0; skins.push(dark);
    current = BUILD[k](); decorate(current, k); scene.add(current); current.traverse(o => { if (o.isMesh && o.geometry.type !== "CircleGeometry") o.castShadow = true; });
    const s = new THREE.Box3().setFromObject(current).getSize(V(0, 0, 0)); const sz = Math.max(s.y, 12) ;
    base = dist = Math.max(40, Math.min(s.x, 60), Math.min(s.z, 60)) * 1.75; target.set(0, sz * .35, 0); applyFrame();
    tabs.forEach(b => b.setAttribute("aria-pressed", String(b.dataset.type === k)));
    setInfo();
  }
  tabs.forEach(b => b.addEventListener("click", () => show(b.dataset.type)));
  frameBtn && frameBtn.addEventListener("click", () => { frame = !frame; applyFrame(); });
  const el = renderer.domElement;
  el.addEventListener("pointerdown", e => { drag = { x: e.clientX, y: e.clientY }; auto = false; el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove", e => { if (!drag) return; yaw -= (e.clientX - drag.x) * .008; pitch = Math.min(1.35, Math.max(.05, pitch + (e.clientY - drag.y) * .006)); drag = { x: e.clientX, y: e.clientY }; });
  ["pointerup", "pointercancel"].forEach(t => el.addEventListener(t, () => { drag = null; }));
  el.addEventListener("wheel", e => { e.preventDefault(); dist = Math.min(base * 2, Math.max(base * .4, dist * (1 + e.deltaY * .001))); }, { passive: false });
  const fit = () => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
  if (window.ResizeObserver) new ResizeObserver(fit).observe(host); else addEventListener("resize", fit);
  if (window.IntersectionObserver) new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(host);
  addEventListener("langchange", () => { setInfo(); applyFrame(); });
  show("arch"); fit();
  (function loop() {
    requestAnimationFrame(loop); if (!visible) return;
    if (auto && !drag) yaw += .004;
    camera.position.set(target.x + dist * Math.cos(pitch) * Math.sin(yaw), target.y + dist * Math.sin(pitch), target.z + dist * Math.cos(pitch) * Math.cos(yaw));
    camera.lookAt(target); renderer.render(scene, camera);
  })();
})();
