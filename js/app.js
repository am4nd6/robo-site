const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)],
  clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)),
  lerp = (a, b, t) => a + (b - a) * t,
  sm = (a, b, x) => {
    x = clamp((x - a) / (b - a));
    return x * x * (3 - 2 * x);
  };
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches,
  fine = matchMedia("(pointer:fine)").matches && !reduce;
gsap.registerPlugin(ScrollTrigger);
let W = innerWidth,
  H = innerHeight,
  tops = [0, 0, 0, 0, 0];
const M = { x: 0, y: 0 };
const calc = () => {
  W = innerWidth;
  H = innerHeight;
  tops = ["#story", "#cat", "#conf", "#ai", "#end"].map((s) => $(s).offsetTop);
};
/* ---------- scroll timeline (story) ---------- */
const S = { p: 0, d: 0, th: 0.5, di: 6.4, cy: 1.45, sx: 0.24 },
  C = { f: 0.5 };
const keys = [
  [0, 0.5, 6.4, 1.45, 0.24],
  [0.12, 0.2, 5.6, 1.4, 0.24],
  [0.2, -0.1, 5.5, 1.4, 0.1],
  [0.3, 0.2, 7, 1.35, 0],
  [0.5, 0.9, 8.6, 1.3, 0],
  [0.62, 2, 8.8, 1.6, 0],
  [0.75, 3.4, 8.4, 1.2, 0],
  [0.9, 6, 7.2, 1.4, 0],
  [1, 6.283, 7.4, 1.5, 0],
];
const tl = gsap.timeline({ paused: true });
keys.slice(0, -1).forEach((a, i) => {
  const b = keys[i + 1];
  tl.fromTo(
    S,
    { th: a[1], di: a[2], cy: a[3], sx: a[4] },
    {
      th: b[1],
      di: b[2],
      cy: b[3],
      sx: b[4],
      duration: b[0] - a[0],
      ease: "none",
      immediateRender: i == 0,
    },
    a[0],
  );
});
tl.fromTo(
  S,
  { d: 0 },
  { d: 1, duration: 0.3, ease: "power2.inOut", immediateRender: false },
  0.2,
)
  .fromTo(
    S,
    { d: 1 },
    {
      d: 0,
      duration: 0.25,
      ease: "power2.inOut",
      immediateRender: false,
    },
    0.75,
  )
  .fromTo(S, { p: 0 }, { p: 1, duration: 1, ease: "none" }, 0);
// Um scrub menor mantém a animação ligada ao scroll sem deixar as setas
// atrasarem perceptivelmente o movimento do usuário.
const scr = reduce ? true : 0.35;
ScrollTrigger.create({
  animation: tl,
  trigger: "#story",
  start: "top top",
  end: "bottom bottom",
  scrub: scr,
});
ScrollTrigger.create({
  trigger: "#cat",
  start: "top top",
  end: "bottom bottom",
  onUpdate: (s) => (C.f = s.progress * 3),
});
ScrollTrigger.create({
  trigger: "#ai",
  start: "top 60%",
  once: true,
  onEnter: () =>
    $$("[data-n]").forEach((el) => {
      const o = { v: 0 },
        n = +el.dataset.n;
      gsap.to(o, {
        v: n,
        duration: 2,
        ease: "power3.out",
        onUpdate: () =>
          (el.textContent = n % 1 ? o.v.toFixed(1) : Math.round(o.v)),
      });
    }),
});
/* ---------- intro ---------- */
const I = {
  light: reduce ? 1 : 0,
  dolly: reduce ? 0 : 3.2,
  eye: reduce ? 1 : 0,
  head: 0,
};
if (!reduce)
  gsap
    .timeline({ delay: 0.3 })
    .to(I, { light: 1, duration: 2.2, ease: "power2.inOut" })
    .to(I, { dolly: 0, duration: 3.2, ease: "power3.out" }, 0)
    .to(I, { head: 0.55, duration: 0.9, ease: "sine.inOut" }, 1.4)
    .to(I, { head: -0.45, duration: 1, ease: "sine.inOut" })
    .to(I, { head: 0, duration: 0.8, ease: "sine.inOut" })
    .to(I, { eye: 1, duration: 0.8 }, 2.2)
    .from(
      ".hero .ln>span",
      { yPercent: 110, duration: 1.2, stagger: 0.12, ease: "power4.out" },
      2.4,
    )
    .from(
      ".hero p,.hero .btn",
      { opacity: 0, y: 20, stagger: 0.15, duration: 1 },
      3,
    )
    .from("header", { opacity: 0, y: -20, duration: 1.2 }, 3.2);
/* ---------- config logic ---------- */
function setSel(k) {
  if (!R) return;
  cfg.sel = k;
  $$("[data-grp]").forEach((b) =>
    b.classList.toggle("on", b.dataset.grp == (k || "ALL")),
  );
  selSet = new Set(k ? GRP[k] : []);
  // O modelo GLB mantém os materiais originais do arquivo.
  if (k) {
    const a = GRP[k].map((n) => parts[n].userData.home);
    foc.set(
      a.reduce((s, v) => s + v.x, 0) / a.length,
      a.reduce((s, v) => s + v.y, 0) / a.length,
    );
  } else foc.set(0, 1.15);
  cfg.zoom = k ? 2.8 : 5.4;
  $("#zoom").value = 9.8 - cfg.zoom;
  $("#info").textContent = INFO[k || "ALL"];
}
function setModel(i) {
  cfg.model = i;
  cfg.fin = null;
  $$("[data-model]").forEach((b) =>
    b.classList.toggle("on", +b.dataset.model == i),
  );
  $$("[data-fin]").forEach((b) => b.classList.remove("on"));
}
$$("[data-model]").forEach(
  (b) => (b.onclick = () => setModel(+b.dataset.model)),
);
$$("[data-fin]").forEach(
  (b) =>
    (b.onclick = () => {
      cfg.fin = b.dataset.fin;
      $$("[data-fin]").forEach((x) => x.classList.toggle("on", x == b));
    }),
);
$$("[data-grp]").forEach(
  (b) =>
    (b.onclick = () => setSel(b.dataset.grp == "ALL" ? null : b.dataset.grp)),
);
$("#zoom").oninput = (e) => (cfg.zoom = 9.8 - +e.target.value);
$("#info").textContent = INFO.ALL;
$$("[data-m]").forEach(
  (b) =>
    (b.onclick = () => {
      setModel(+b.dataset.m);
      go(2);
    }),
);
const aiT = [
    "Perceber: milhares de pontos de sensores se espalham pela sala, e o robô mapeia o que está ao redor.",
    "Planejar: pontos relacionados formam um gráfico, permitindo avaliar rotas e objetos simultaneamente.",
    "Agir: o campo converge para uma decisão, e o corpo se move.",
  ],
  SW = [0.08, 0.3, 1],
  CD = [0, 1.1, 1.5];
$$("[data-st]").forEach(
  (b) =>
    (b.onclick = () => {
      st = +b.dataset.st;
      $$("[data-st]").forEach((x) => x.classList.toggle("on", x == b));
      $("#aiTxt").textContent = aiT[st];
    }),
);
$("#cfgBtn").onclick = () => {
  $("#sum").textContent =
    `Nexus ${NAMES[cfg.model]}.`;
  $("#req").style.display = "";
  $("#dlg").classList.add("on");
};
$("#req").onclick = () => {
  $("#sum").textContent =
    "Solicitação enviada. Um especialista da Nexus entrará em contato em até um dia útil.";
  $("#req").style.display = "none";
};
$("#cls").onclick = () => $("#dlg").classList.remove("on");
$("#dlg").addEventListener("click", (event) => {
  if (event.target === $("#dlg")) $("#dlg").classList.remove("on");
});
function go(i) {
  scrollTo({ top: tops[i], behavior: reduce ? "auto" : "smooth" });
}
$$("[data-go]").forEach((b) =>
  b.addEventListener("click", (e) => {
    e.preventDefault();
    go(+b.dataset.go);
  }),
);
const heroExplore = $("#heroExplore");
if (heroExplore) {
  heroExplore.style.pointerEvents = "auto";
  heroExplore.addEventListener("pointerenter", () => {
    window.overHeroButton = true;
    heroExplore.classList.add("hero-hover");
  });
  heroExplore.addEventListener("pointerleave", () => {
    window.overHeroButton = false;
    heroExplore.classList.remove("hero-hover");
  });
  heroExplore.addEventListener("click", (event) => {
    event.preventDefault();
    go(1);
  });
}
$$(".prod").forEach((p) => {
  p.onpointerenter = () => (hvT = 1);
  p.onpointerleave = () => (hvT = 0);
});
/* drag + pick on configurator */
let drag = null;
const cf = $("#conf");
cf.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".panel")) return;
  drag = { x: e.clientX, th: cfg.th, mv: 0 };
});
addEventListener("pointermove", (e) => {
  M.x = (e.clientX / W) * 2 - 1;
  M.y = -((e.clientY / H) * 2 - 1);
  if (drag) {
    drag.mv = Math.max(drag.mv, Math.abs(e.clientX - drag.x));
    cfg.th = drag.th - (e.clientX - drag.x) * 0.008;
  }
});
addEventListener("pointerup", (e) => {
  if (!drag || !R) return;
  if (drag.mv < 5) {
    RC.setFromCamera(
      { x: (e.clientX / W) * 2 - 1, y: -((e.clientY / H) * 2 - 1) },
      cam,
    );
    const h = RC.intersectObjects(robot.children, true)[0];
    if (h) {
      let o = h.object;
      while (o && !o.userData.name) o = o.parent;
      const n = o && o.userData.name,
        k = Object.keys(GRP).find((g) => GRP[g].includes(n));
      if (k) setSel(k);
    } else setSel(null);
  }
  drag = null;
});
/* ---------- cursor + magnetic ---------- */
if (fine) {
  document.body.classList.add("fine");
  const c = $("#cur"),
    qx = gsap.quickTo(c, "x", { duration: 0.25 }),
    qy = gsap.quickTo(c, "y", { duration: 0.25 });
  addEventListener("pointermove", (e) => {
    qx(e.clientX);
    qy(e.clientY);
    const t = e.target.closest("[data-cur]");
    $("#cur b").textContent = t ? t.dataset.cur : "";
    c.classList.toggle(
      "hot",
      !!e.target.closest("a,button,.chip") && !e.target.closest("#dots"),
    );
  });
  $$(".mag").forEach((b) => {
    b.addEventListener("pointermove", (e) => {
      const r = b.getBoundingClientRect();
      gsap.to(b, {
        x: (e.clientX - r.left - r.width / 2) * 0.3,
        y: (e.clientY - r.top - r.height / 2) * 0.3,
        duration: 0.4,
      });
    });
    b.addEventListener("pointerleave", () =>
      gsap.to(b, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1,.4)",
      }),
    );
  });
}
/* ---------- frame ---------- */
const cur = {
    th: 0.5,
    di: 6.4,
    cy: 1.45,
    sx: 0.24,
    my: 0.22,
    fx: 0,
    fy: 1.15,
    vis: 1,
    ai: 0,
    d: 0,
  },
  cs = { s: 0.96, w: 1, pk: 0 },
  tc = new THREE.Color(),
  v3 = new THREE.Vector3(),
  mp = new THREE.Vector3();
let last = performance.now(),
  mx = 0,
  my = 0;
window.overHeroButton = false;
function frame() {
  requestAnimationFrame(frame);
  const now = performance.now(),
    dt = Math.min(0.05, (now - last) / 1000),
    t = now / 1000;
  last = now;
  const y = scrollY,
    m = tops.reduce((a, v, i) => (y + H * 0.5 >= v ? i : a), 0),
    md = Math.min(m, 3),
    asp = W / H;
  const catVisible = y >= tops[1];
  $("#cat").style.visibility = catVisible ? "visible" : "hidden";
  $("#cat").style.pointerEvents = catVisible ? "" : "none";
  $("#bar").style.transform =
    `scaleX(${clamp(y / (document.documentElement.scrollHeight - H))})`;
  $$("#dots a").forEach((a, i) => a.classList.toggle("on", i == m));
  mx += ((window.overHeroButton ? 0 : M.x) - mx) * 0.06;
  my += (M.y - my) * 0.06;
  hv += (hvT - hv) * 0.08;
  const p = S.p;
  if (md == 0) {
    const h = $("#hero");
    h.style.opacity = 1 - sm(0.06, 0.17, p);
    h.style.transform = `translateY(${-sm(0, 0.17, p) * 60}px)`;
    h.style.pointerEvents = "";
    $("#ghost").style.transform =
      `translate3d(${reduce ? 0 : -p * 62}vw,-50%,0)`;
    $("#final").style.opacity = sm(0.88, 0.96, p);
    $("#final").style.transform =
      `translateY(${(1 - sm(0.88, 0.96, p)) * 40}px)`;
    $("#phase").textContent =
      (p < 0.2
        ? "Montado"
        : p < 0.5
          ? "Desmontando"
          : p < 0.75
            ? "Análise"
            : "Remontando") +
      "  " +
      Math.round(p * 100) +
      "%";
  }
  if (!R) return;
  let T,
    vv = V[0],
    tg = F.white;
  if (md == 0)
    T = {
      th: S.th,
      di: S.di,
      cy: S.cy,
      sx: S.sx,
      my: S.sx * 0.9,
      d: S.d,
      vis: 1,
      ai: 0,
      fx: 0,
      fy: 1.15,
    };
  else if (md == 1) {
    const f = C.f,
      i = clamp(Math.round(f - 0.5), 0, 2);
    vv = tg = V[i];
    T = {
      th: 5.83 + f * 0.75 + hv * 0.35,
      di: asp < 0.9 ? 7.5 : 5.4,
      // Em telas estreitas, deixa mais espaço para o conteúdo acima do robô.
      cy: W < 625 ? 3.05 : asp < 0.9 ? 2.1 : 1.35,
      sx: 0.21,
      my: W < 625 ? 0.38 : 0.2,
      d: 0,
      vis: 1,
      ai: 0,
      fx: 0,
      fy: 1.15,
    };
    $$(".prod").forEach((e, j) => {
      const v = clamp(1.2 - Math.abs(f - (j + 0.5)) * 2.4);
      e.style.opacity = v;
      e.style.clipPath = `inset(0 0 ${(1 - v) * 100}% 0)`;
      e.style.transform = `translateY(${(1 - v) * 30}px)`;
      e.style.pointerEvents = v > 0.6 ? "" : "none";
    });
  } else if (md == 2) {
    vv = V[cfg.model];
    tg = cfg.fin ? F[cfg.fin] : vv;
    if (!drag && !cfg.sel) cfg.th += dt * 0.15;
    T = {
      th: cfg.th,
      di: cfg.zoom,
      // Em telas menores, reserva a área superior para os controles e leva
      // o modelo para baixo deles.
      cy: foc.y + (W < 750 ? 3 : 0.12),
      sx: 0.2,
      my: W < 750 ? 0.3 : -0.15,
      d: 0,
      vis: 1,
      ai: 0,
      fx: foc.x,
      fy: foc.y,
    };
  } else
    T = {
      th: 6.283 + mx * 0.4,
      di: 9.5,
      cy: 1.15 + my * 0.6,
      sx: 0,
      my: 0,
      d: 0,
      vis: 0,
      ai: 1,
      fx: 0,
      fy: 1.15,
    };
  const k = 1 - Math.exp(-dt * (reduce ? 30 : 3.2));
  ["th", "di", "cy", "sx", "my", "fx", "fy", "vis", "ai"].forEach(
    (n) => (cur[n] += (T[n] - cur[n]) * k),
  );
  cur.d = md == 0 ? T.d : cur.d + (0 - cur.d) * k;
  const r = (cur.di + I.dolly) * (asp < 1 ? 1 + (1 - asp) * 1.15 : 1),
    th = cur.th + (md < 2 && !window.overHeroButton ? mx * 0.06 : 0);
  cam.position.set(cur.fx + Math.sin(th) * r, cur.cy, Math.cos(th) * r);
  cam.lookAt(cur.fx, cur.fy, 0);
  cam.aspect = asp;
  const sx = asp < 0.9 ? 0 : cur.sx,
    sy = asp < 0.9 ? cur.my : 0;
  cam.setViewOffset(W, H, -sx * W, -sy * H, W, H);
  /* robot */
  const catModel = clamp(Math.round(C.f - 0.5), 0, 2);
  const selectedModel = md === 2 ? cfg.model : catModel;
  const showingPro =
    (md === 1 || md === 2) && selectedModel === 1 && proLoaded;
  const showingIndustrial =
    (md === 1 || md === 2) && selectedModel === 2 && industrialLoaded;
  if (
    (md === 1 || md === 2) &&
    selectedModel === 2 &&
    !industrialLoaded &&
    !industrialRequested
  )
    window.loadIndustrialModel();
  robot.visible =
    glbLoaded &&
    !showingPro &&
    !showingIndustrial &&
    (md !== 2 || selectedModel === 0) &&
    cur.vis > 0.01;
  if (proRobot) {
    proRobot.visible = showingPro && cur.vis > 0.01;
    proRobot.scale.set(
      proBase * cs.s * cs.w * cur.vis,
      proBase * cs.s * cur.vis,
      proBase * cs.s * cur.vis,
    );
  }
  if (industrialRobot) {
    industrialRobot.visible = showingIndustrial && cur.vis > 0.01;
    industrialRobot.scale.set(
      industrialBase * cs.s * cs.w * cur.vis,
      industrialBase * cs.s * cur.vis,
      industrialBase * cs.s * cur.vis,
    );
  }
  floor.visible = cur.vis > 0.01;
  cs.s += (vv.s - cs.s) * k;
  cs.w += (vv.w - cs.w) * k;
  cs.pk += (vv.pk - cs.pk) * k;
  robot.scale.set(
    glbBase * cs.s * cs.w * cur.vis,
    glbBase * cs.s * cur.vis,
    glbBase * cs.s * cur.vis,
  );
  floor.scale.setScalar(cs.s * cs.w * cur.vis);
  pack.scale.setScalar(Math.max(0.001, cs.pk));
  pack.visible = cs.pk > 0.02;
  const sh = M_.m.shell;
  tc.set(tg.c);
  sh.color.lerp(tc, k);
  sh.metalness += (tg.m - sh.metalness) * k;
  sh.roughness += (tg.r - sh.roughness) * k;
  const sl = M_.m.sel;
  sl.color.copy(sh.color);
  sl.metalness = sh.metalness;
  sl.roughness = sh.roughness;
  sl.emissiveIntensity = 0.35 + 0.15 * Math.sin(t * 4);
  robot.position.y = Math.sin(t * 0.8) * 0.012 + cur.d * 0.55;
  floor.position.y = -cur.d * 0.95;
  const ms = asp < 0.9 ? 0.62 : 1,
    e0 = cur.d * 1.45;
  for (const g of plist) {
    const u = g.userData,
      q = clamp(e0 - u.dl),
      e = q * q * q * (q * (q * 6 - 15) + 10);
    u.e = e;
    g.position.copy(u.home).addScaledVector(u.exp, e * ms);
    g.position.y += Math.sin(t * 1.1 + u.dl * 9) * 0.025 * e;
    g.position.z += Math.sin(e * Math.PI) * 0.15 * (u.exp.x >= 0 ? 1 : -1);
    g.rotation.set(u.rot.x * e, u.rot.y * e, u.rot.z * e);
  }
  ["head", "sensors"].forEach((n) => {
    const g = parts[n],
      f = 1 - g.userData.e;
    g.rotation.y += (mx * 0.4 + I.head) * f;
    g.rotation.x += -my * 0.2 * f;
  });
  M_.m.glow.emissiveIntensity = I.eye * (1.1 + 0.25 * Math.sin(t * 2.4));
  M_.m.core.emissiveIntensity =
    (1.3 + 0.5 * Math.sin(t * 3)) * (0.6 + cur.d * 0.6);
  M_.rim.intensity = 3 * (1 + hv * 1.5);
  M_.rim.color.lerp(tc.set(vv.rim), k);
  R.toneMappingExposure = 0.1 + 0.95 * I.light;
  /* tags */
  if (md == 0) {
    [
      ["t1", "core", 0.5],
      ["t2", "head", 0.58],
      ["t3", "handR", 0.66],
    ].forEach(([id, pn, s], i) => {
       // Cada tópico entra em sequência, mantendo uma curva reversível no
       // scroll para não criar atraso diferente ao subir e ao descer.
       const v = sm(s, s + 0.06, p) * (1 - sm(0.78, 0.85, p)),
        el = $("#" + id),
        ln = $("#l" + (i + 1)),
        ci = $("#c" + (i + 1));
      el.style.opacity = v;
      ln.style.opacity = ci.style.opacity = v;
      if (v > 0.01) {
        const b = el.getBoundingClientRect(),
          right = b.left + b.width / 2 < W / 2;
            if (glbLoaded) {
              const robotBounds = new THREE.Box3().setFromObject(robot);
              if (i === 1) robotBounds.getCenter(v3);
              else v3.copy(robotBounds.getCenter(new THREE.Vector3()));
              if (i === 1) v3.y = robotBounds.max.y;
            } else {
              parts[pn].getWorldPosition(v3);
            }
            v3.project(cam);
        const px = (v3.x * 0.5 + 0.5) * W,
          py = (-v3.y * 0.5 + 0.5) * H,
          ax =
            asp < 0.9
              ? b.left + b.width / 2
              : right
                ? b.right + 10
                : b.left - 10,
          ay = b.top + 16;
        ln.setAttribute("x1", ax);
        ln.setAttribute("y1", ay);
        ln.setAttribute("x2", px);
        ln.setAttribute("y2", py);
        ci.setAttribute("cx", px);
        ci.setAttribute("cy", py);
      }
    });
  }
  /* AI field */
  const a = M_.ai;
  aiG.visible = cur.ai > 0.01;
  if (aiG.visible) {
    a.dust.material.opacity = cur.ai * 0.7;
    a.nodes.material.opacity = cur.ai;
    a.lines.material.opacity = cur.ai * 0.5;
    dust_ = a.dust;
    a.dust.rotation.y += dt * 0.03;
    aiG.rotation.y += (mx * 0.2 - aiG.rotation.y) * 0.04;
    aiG.rotation.x += (-my * 0.1 - aiG.rotation.x) * 0.04;
    mp.set(mx * 4 * Math.cos(aiG.rotation.y), my * 2.6, 0);
    const np = a.np,
      nv = a.nv,
      sw = SW[st];
    for (let i = 0; i < a.NN; i++) {
      const j = i * 3;
      let x = np[j],
        yy = np[j + 1],
        z = np[j + 2];
      const an = dt * sw * (0.3 + 0.2 * Math.sin(i)),
        c = Math.cos(an),
        s = Math.sin(an),
        nx = x * c + z * s;
      z = -x * s + z * c;
      x = nx;
      const dx = x - mp.x,
        dy = yy - mp.y,
        dd = dx * dx + dy * dy;
      if (dd < 2.5) {
        const f = (2.5 - dd) * dt * 0.8;
        x += dx * f;
        yy += dy * f;
      }
      x += nv[j] * dt * 0.4;
      yy += nv[j + 1] * dt * 0.4;
      z += nv[j + 2] * dt * 0.4;
      const L = Math.hypot(x, yy, z);
      if (L > 3.5) {
        const f = 0.985;
        x *= f;
        yy *= f;
        z *= f;
        nv[j] *= -1;
        nv[j + 1] *= -1;
        nv[j + 2] *= -1;
      }
      if (st == 2) {
        x *= 1 - dt * 0.15;
        yy *= 1 - dt * 0.15;
        z *= 1 - dt * 0.15;
      }
      np[j] = x;
      np[j + 1] = yy;
      np[j + 2] = z;
    }
    a.nodes.geometry.attributes.position.needsUpdate = true;
    let n = 0;
    const cd = CD[st],
      c2 = cd * cd;
    if (cd > 0)
      for (let i = 0; i < a.NN && n < a.MS; i++)
        for (let j = i + 1; j < a.NN && n < a.MS; j++) {
          const dx = np[i * 3] - np[j * 3],
            dy = np[i * 3 + 1] - np[j * 3 + 1],
            dz = np[i * 3 + 2] - np[j * 3 + 2];
          if (dx * dx + dy * dy + dz * dz < c2) {
            a.lp.set(
              [
                np[i * 3],
                np[i * 3 + 1],
                np[i * 3 + 2],
                np[j * 3],
                np[j * 3 + 1],
                np[j * 3 + 2],
              ],
              n * 6,
            );
            n++;
          }
        }
    a.lg.setDrawRange(0, n * 2);
    a.lg.attributes.position.needsUpdate = true;
  }
  R.render(sc, cam);
}
let dust_;
addEventListener("resize", () => {
  calc();
  if (R) {
    R.setSize(W, H, false);
    cam.aspect = W / H;
  }
});
addEventListener("load", () => {
  calc();
  ScrollTrigger.refresh();
});
calc();
if (R) init3D();
if (R) R.setSize(W, H, false);
frame();
