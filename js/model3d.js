/* ---------- 3D ---------- */
let R = null,
  sc,
  cam,
  robot,
  parts = {},
  plist = [],
  floor,
  aiG,
  M_ = {},
  cfg = { model: 1, fin: null, th: 6.683, zoom: 5.4, sel: null },
  foc = new THREE.Vector2(0, 1.15),
  selSet = new Set(),
  pack,
  hv = 0,
  hvT = 0,
  st = 0,
  GRP,
  RC;
let glbBase = 1.3,
  glbLoaded = false,
  proRobot = null,
  proLoaded = false,
  proBase = 1.3,
  industrialRobot = null,
  industrialLoaded = false,
  industrialRequested = false,
  industrialBase = 0.38;
try {
  R = new THREE.WebGLRenderer({
    canvas: document.querySelector("#gl"),
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
} catch (e) {
  document.body.classList.add("nogl");
}
const V = [
    {
      c: 0xf0f3f6,
      m: 0.55,
      r: 0.28,
      s: 0.94,
      w: 1,
      pk: 0,
      rim: 0x4b8dff,
    },
    { c: 0xc6cdd5, m: 1, r: 0.2, s: 1, w: 1.08, pk: 0.55, rim: 0xdfe8ff },
    {
      c: 0x232a32,
      m: 0.8,
      r: 0.32,
      s: 1.1,
      w: 1.28,
      pk: 1,
      rim: 0x4b8dff,
    },
  ],
  F = {
    white: { c: 0xf0f3f6, m: 0.55, r: 0.28 },
    graphite: { c: 0x1d242c, m: 0.8, r: 0.32 },
    silver: { c: 0xc6cdd5, m: 1, r: 0.2 },
  };
const INFO = {
  ALL: "Visão completa. Escolha um componente para aproximar e ver como ele &#233; construído.",
  HEAD: "Cabeça: profundidade estéreo, sensores térmicos e LiDAR integrados em um crânio de fibra de carbono de 38 g.",
    TORSO:
      "Tronco: placas sobrepostas em uma estrutura resistente, com compartimento traseiro para a bateria.",
  CORE: "Núcleo: m&#243;dulo selado que alimenta cada articulação e executa a IA integrada.",
  ARMS: "Braços: m&#243;dulos de ombro, bra&#231;o superior e antebra&#231;o com articula&#231;&#245;es que detectam torque.",
  HANDS:
    "Mãos: doze eixos por m&#227;o e pontas dos dedos com sensores de força para manipula&#231;&#227;o precisa.",
  LEGS: "Pernas: módulos de coxa, canela e pé que mantêm o equilíbrio em terrenos irregulares.",
};
const NAMES = ["ONE", "PRO", "INDUSTRIAL"],
  FD = ["white", "silver", "graphite"];
function init3D() {
  R.setPixelRatio(Math.min(devicePixelRatio, W < 800 ? 1.5 : 2));
  R.toneMapping = THREE.ACESFilmicToneMapping;
  R.outputEncoding = THREE.sRGBEncoding;
  sc = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(32, W / H, 0.1, 60);
  RC = new THREE.Raycaster();
  const es = new THREE.Scene();
  es.background = new THREE.Color(0x05070a);
  [
    [6, 6, 0, 8, 0, 0xffffff, 6],
    [3, 10, -9, 2, 3, 0xffffff, 4],
    [3, 10, 9, 1, -3, 0x4b8dff, 5],
    [8, 3, 0, -1, 9, 0xdde6f0, 2],
  ].forEach((a) => {
    const m = new THREE.Mesh(
      new THREE.PlaneGeometry(a[0], a[1]),
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(a[5]).multiplyScalar(a[6]),
        side: THREE.DoubleSide,
      }),
    );
    m.position.set(a[2], a[3], a[4]);
    m.lookAt(0, 1, 0);
    es.add(m);
  });
  sc.environment = new THREE.PMREMGenerator(R).fromScene(es, 0.04).texture;
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(3, 5, 4);
  const rim = new THREE.PointLight(0x4b8dff, 3, 20);
  rim.position.set(-3, 2.5, -3);
  sc.add(key, rim, new THREE.HemisphereLight(0xaabbd0, 0x05070a, 0.4));
  M_.rim = rim;
  const mk = (c, m, r) =>
    new THREE.MeshStandardMaterial({
      color: c,
      metalness: m,
      roughness: r,
    });
  const Mt = {
    shell: mk(0xf0f3f6, 0.55, 0.28),
    si: mk(0xc6cdd5, 1, 0.22),
    dk: mk(0x14191f, 0.7, 0.45),
    vis: mk(0x020304, 1, 0.08),
    glow: new THREE.MeshStandardMaterial({
      color: 0x0a1530,
      emissive: 0x4b8dff,
      emissiveIntensity: 0,
    }),
    core: new THREE.MeshStandardMaterial({
      color: 0x0a1530,
      emissive: 0x4b8dff,
      emissiveIntensity: 1.5,
    }),
    sel: new THREE.MeshStandardMaterial({
      color: 0xf0f3f6,
      metalness: 0.55,
      roughness: 0.28,
      emissive: 0x4b8dff,
      emissiveIntensity: 0.4,
    }),
  };
  M_.m = Mt;
  const SPH = new THREE.SphereGeometry(1, 28, 20);
  const G = (geo, m, x = 0, y = 0, z = 0, r = [0, 0, 0], sh) => {
    const o = new THREE.Mesh(geo, m);
    o.position.set(x, y, z);
    o.rotation.set(...r);
    if (sh) o.userData.shell = 1;
    return o;
  };
  const E = (sx, sy, sz, m, x, y, z, sh) => {
      const o = G(SPH, m, x, y, z, [0, 0, 0], sh);
      o.scale.set(sx, sy, sz);
      return o;
    },
    B = (w, h, d, m, x, y, z, sh) =>
      G(new THREE.BoxGeometry(w, h, d), m, x, y, z, [0, 0, 0], sh),
    Cy = (a, b, h, m, x, y, z, r, sh) =>
      G(new THREE.CylinderGeometry(a, b, h, 22), m, x, y, z, r, sh),
    Tr = (r, t, m, x, y, z, rx = Math.PI / 2) =>
      G(new THREE.TorusGeometry(r, t, 10, 36), m, x, y, z, [rx, 0, 0]);
  robot = new THREE.Group();
  sc.add(robot);
  new THREE.GLTFLoader().load(
    "model-3d/robot_character.glb",
    (gltf) => {
      sc.remove(robot);
      robot = gltf.scene;
      robot.scale.setScalar(glbBase);
      robot.position.y = -1;
      robot.rotation.y = -1.4;
      sc.add(robot);
      robot.traverse((part) => {
        if (!part.isBone) return;
        const name = part.name.toLowerCase();
        if (!/(shoulder|upper.?arm|arm)/.test(name)) return;
        const left = /(left|_l|\.l|l$)/.test(name);
        part.rotation.z += left ? -0.85 : 0.85;
      });
      glbLoaded = true;
    },
    undefined,
    (error) => console.error("Não foi possível carregar o robô 3D:", error),
  );
  window.loadIndustrialModel = function () {
    if (industrialRequested) return;
    industrialRequested = true;
    new THREE.GLTFLoader().load(
    "model-3d/robot.glb",
    (gltf) => {
      industrialRobot = gltf.scene;
      industrialRobot.scale.setScalar(industrialBase);
      industrialRobot.rotation.y = 0.8;
      const industrialBox = new THREE.Box3().setFromObject(industrialRobot);
      const industrialCenter = industrialBox.getCenter(new THREE.Vector3());
      industrialRobot.position.set(
        -industrialCenter.x,
        -industrialBox.min.y,
        -industrialCenter.z,
      );
      industrialRobot.visible = false;
      sc.add(industrialRobot);
      industrialLoaded = true;
    },
    undefined,
    (error) =>
      console.error("Não foi possível carregar o Nexus Industrial:", error),
    );
  };
  new THREE.GLTFLoader().load(
    "model-3d/security_robot.glb",
    (gltf) => {
      proRobot = gltf.scene;
      proBase = 0.17;
      proRobot.scale.setScalar(proBase);
      proRobot.rotation.y = 0;
      const proBox = new THREE.Box3().setFromObject(proRobot);
      const proCenter = proBox.getCenter(new THREE.Vector3());
      proRobot.position.set(-proCenter.x, -proBox.min.y, -proCenter.z);
      proRobot.visible = false;
      sc.add(proRobot);
      proLoaded = true;
    },
    undefined,
    (error) => console.error("Não foi possível carregar o Nexus Pro:", error),
  );
  const ord = {
    sensors: 0,
    head: 1,
    neck: 2,
    chest: 3,
    shoulder: 3,
    core: 4,
    torsoBack: 4,
    abdomen: 5,
    upperArm: 5,
    pelvis: 6,
    forearm: 7,
    thigh: 7,
    hand: 9,
    shin: 9,
    foot: 11,
  };
  const P = (n, pos, exp, rot, items) => {
    const g = new THREE.Group();
    items.forEach((o) => g.add(o));
    g.position.set(...pos);
    g.userData = {
      name: n,
      home: new THREE.Vector3(...pos),
      exp: new THREE.Vector3(...exp),
      rot: new THREE.Vector3(...rot),
      dl: ((ord[n.replace(/[LR]$/, "")] || 0) / 11) * 0.45,
      e: 0,
    };
    robot.add(g);
    parts[n] = g;
    plist.push(g);
  };
  const { shell, si, dk, vis, glow, core } = Mt,
    Z = 0;
  P(
    "sensors",
    [0, 2.1, 0],
    [0, 0.95, 0.9],
    [0.4, 0, 0],
    [
      B(0.16, 0.014, 0.02, glow, 0, 0.02, 0.238),
      Cy(0.045, 0.045, 0.035, glow, -0.2, 0, 0, [0, 0, Math.PI / 2]),
      Cy(0.045, 0.045, 0.035, glow, 0.2, 0, 0, [0, 0, Math.PI / 2]),
    ],
  );
  P(
    "head",
    [0, 2.1, 0],
    [0, 0.7, 0],
    [0, 0.6, 0],
    [
      E(0.19, 0.23, 0.21, shell, 0, 0, 0, 1),
      E(0.15, 0.075, 0.12, vis, 0, 0.02, 0.12),
      E(0.1, 0.06, 0.09, si, 0, -0.19, 0.05),
    ],
  );
  P(
    "neck",
    [0, 1.92, 0],
    [0, 0.5, -0.35],
    [-0.4, 0, 0],
    [
      Cy(0.06, 0.07, 0.16, dk, 0, 0, 0, [0, 0, 0]),
      Tr(0.07, 0.01, si, 0, 0.05, 0),
      Tr(0.07, 0.01, si, 0, -0.05, 0),
    ],
  );
  P(
    "chestL",
    [-0.15, 1.58, 0.13],
    [-0.5, 0.3, 0.95],
    [0, -0.5, 0.25],
    [
      E(0.17, 0.19, 0.1, shell, 0, 0, 0, 1),
      B(0.2, 0.012, 0.02, si, 0, -0.02, 0.095),
    ],
  );
  P(
    "chestR",
    [0.15, 1.58, 0.13],
    [0.5, 0.3, 0.95],
    [0, 0.5, -0.25],
    [
      E(0.17, 0.19, 0.1, shell, 0, 0, 0, 1),
      B(0.2, 0.012, 0.02, si, 0, -0.02, 0.095),
    ],
  );
  P(
    "core",
    [0, 1.52, 0],
    [0, 0.12, 0.25],
    [0, 0, 0],
    [
      Cy(0.17, 0.17, 0.5, dk, 0, 0, 0, [0, 0, 0]),
      E(0.075, 0.075, 0.075, core, 0, 0.05, 0.12),
      Tr(0.1, 0.012, si, 0, 0.05, 0.12, 0),
    ],
  );
  pack = new THREE.Group();
  pack.add(
    B(0.3, 0.34, 0.12, dk, 0, 0, -0.17),
    B(0.2, 0.014, 0.02, glow, 0, 0.05, -0.235),
  );
  P(
    "torsoBack",
    [0, 1.52, -0.07],
    [0, 0.1, -1],
    [0, 0.2, 0],
    [E(0.29, 0.3, 0.16, shell, 0, 0, 0, 1), pack],
  );
  P(
    "abdomen",
    [0, 1.17, 0],
    [0, -0.1, 0.4],
    [0.3, 0, 0],
    [-0.08, 0, 0.08].map((y, i) =>
      Cy(0.15, 0.15, 0.07, i == 1 ? si : dk, 0, y, 0, [0, 0, 0]),
    ),
  );
  P(
    "pelvis",
    [0, 0.97, 0],
    [0, -0.5, 0],
    [0, 0.5, 0],
    [
      E(0.26, 0.13, 0.16, shell, 0, 0, 0, 1),
      E(0.075, 0.075, 0.075, dk, -0.15, -0.06, 0),
      E(0.075, 0.075, 0.075, dk, 0.15, -0.06, 0),
    ],
  );
  [-1, 1].forEach((s) => {
    const n = s < 0 ? "L" : "R";
    P(
      "shoulder" + n,
      [0.4 * s, 1.74, 0],
      [0.95 * s, 0.45, 0.1],
      [0, 0, 0.6 * s],
      [
        E(0.115, 0.115, 0.115, shell, 0, 0, 0, 1),
        E(0.075, 0.075, 0.075, dk, 0, -0.07, 0),
      ],
    );
    P(
      "upperArm" + n,
      [0.46 * s, 1.5, 0],
      [1.25 * s, 0.15, -0.2],
      [0, 0, 0.5 * s],
      [
        Cy(0.058, 0.05, 0.36, shell, 0, 0, 0, [0, 0, 0], 1),
        Tr(0.06, 0.01, si, 0, 0.14, 0),
      ],
    );
    P(
      "forearm" + n,
      [0.47 * s, 1.12, 0],
      [1.6 * s, -0.3, 0.25],
      [0.3, 0, 0.35 * s],
      [
        E(0.055, 0.055, 0.055, dk, 0, 0.18, 0),
        Cy(0.05, 0.04, 0.34, shell, 0, 0, 0, [0, 0, 0], 1),
        Tr(0.05, 0.008, si, 0, -0.1, 0),
      ],
    );
    P(
      "hand" + n,
      [0.48 * s, 0.84, 0],
      [1.9 * s, -0.8, 0.4],
      [0.4, 0.6 * s, 0],
      [
        B(0.075, 0.1, 0.045, shell, 0, -0.03, 0, 1),
        ...[-0.025, 0, 0.025].map((x) =>
          Cy(0.012, 0.01, 0.09, dk, x, -0.12, 0, [0, 0, 0]),
        ),
      ],
    );
    P(
      "thigh" + n,
      [0.14 * s, 0.71, 0],
      [0.6 * s, -0.45, 0.25],
      [0.25, 0, -0.25 * s],
      [
        Cy(0.085, 0.07, 0.44, shell, 0, 0, 0, [0, 0, 0], 1),
        E(0.065, 0.065, 0.065, dk, 0, -0.23, 0),
      ],
    );
    P(
      "shin" + n,
      [0.14 * s, 0.28, 0],
      [0.75 * s, -1, 0.1],
      [0, 0, -0.2 * s],
      [
        Cy(0.07, 0.05, 0.42, shell, 0, 0, 0, [0, 0, 0], 1),
        Tr(0.065, 0.01, si, 0, 0.1, 0),
      ],
    );
    P(
      "foot" + n,
      [0.14 * s, 0.045, 0.05],
      [0.85 * s, -1.4, 0.45],
      [0, 0.6 * s, 0],
      [
        B(0.12, 0.07, 0.27, shell, 0, 0, 0, 1),
        B(0.125, 0.02, 0.28, dk, 0, -0.04, 0),
      ],
    );
  });
  GRP = {
    HEAD: ["head", "sensors", "neck"],
    TORSO: ["chestL", "chestR", "torsoBack", "abdomen", "pelvis"],
    CORE: ["core"],
    ARMS: [
      "shoulderL",
      "shoulderR",
      "upperArmL",
      "upperArmR",
      "forearmL",
      "forearmR",
    ],
    HANDS: ["handL", "handR"],
    LEGS: ["thighL", "thighR", "shinL", "shinR", "footL", "footR"],
  };
  /* floor */
  const cv = document.createElement("canvas");
  cv.width = cv.height = 128;
  const cx = cv.getContext("2d"),
    gr = cx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, "rgba(255,255,255,1)");
  gr.addColorStop(1, "rgba(255,255,255,0)");
  cx.fillStyle = gr;
  cx.fillRect(0, 0, 128, 128);
  const dot = new THREE.CanvasTexture(cv);
  floor = new THREE.Group();
  floor.add(
    G(
      new THREE.RingGeometry(1.25, 1.265, 96),
      new THREE.MeshBasicMaterial({
        color: 0x4b8dff,
        transparent: true,
        opacity: 0.55,
        side: 2,
      }),
      0,
      0,
      0,
      [-Math.PI / 2, 0, 0],
    ),
    G(
      new THREE.CircleGeometry(1.6, 48),
      new THREE.MeshBasicMaterial({
        map: dot,
        color: 0x4b8dff,
        transparent: true,
        opacity: 0.12,
        depthWrite: false,
      }),
      0,
      -0.005,
      0,
      [-Math.PI / 2, 0, 0],
    ),
  );
  sc.add(floor);
  /* AI field */
  aiG = new THREE.Group();
  aiG.position.y = 1.15;
  sc.add(aiG);
  const ND = W < 800 ? 500 : 1400,
    NN = W < 800 ? 70 : 130,
    rs = () => {
      const u = Math.random() * 2 - 1,
        a = Math.random() * 6.283,
        r = Math.cbrt(Math.random()),
        q = Math.sqrt(1 - u * u);
      return [q * Math.cos(a) * r, u * r, q * Math.sin(a) * r];
    };
  const dp = new Float32Array(ND * 3);
  for (let i = 0; i < ND; i++) {
    const v = rs(),
      k = 2 + Math.random() * 5;
    dp.set([v[0] * k, v[1] * k, v[2] * k], i * 3);
  }
  const pm = (s, c) =>
    new THREE.PointsMaterial({
      size: s,
      map: dot,
      color: c,
      transparent: true,
      depthWrite: false,
      opacity: 0,
      blending: THREE.AdditiveBlending,
    });
  const dust = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.BufferAttribute(dp, 3),
    ),
    pm(0.06, 0xc6cdd5),
  );
  const np = new Float32Array(NN * 3),
    nv = new Float32Array(NN * 3);
  for (let i = 0; i < NN; i++) {
    const v = rs();
    np.set([v[0] * 3, v[1] * 2.4, v[2] * 3], i * 3);
    nv.set(
      [Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5],
      i * 3,
    );
  }
  const nodes = new THREE.Points(
    new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.BufferAttribute(np, 3),
    ),
    pm(0.2, 0x4b8dff),
  );
  const MS = 1200,
    lp = new Float32Array(MS * 6),
    lg = new THREE.BufferGeometry().setAttribute(
      "position",
      new THREE.BufferAttribute(lp, 3),
    ),
    lines = new THREE.LineSegments(
      lg,
      new THREE.LineBasicMaterial({
        color: 0x4b8dff,
        transparent: true,
        opacity: 0,
      }),
    );
  aiG.add(dust, nodes, lines);
  aiG.visible = false;
  M_.ai = { dust, nodes, lines, np, nv, lp, lg, NN, MS };
}
