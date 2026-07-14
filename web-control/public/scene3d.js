import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

let basePivot, shoulderPivot, elbowPivot;
let leftFinger, rightFinger;

export function initScene3D(containerId) {
  const container = document.getElementById(containerId);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(4, 2.5, 5);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  container.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();

  const ambient = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambient);

  const mainLight = new THREE.DirectionalLight(0xffffff, 2);
  mainLight.position.set(4, 8, 6);
  mainLight.castShadow = true;
  scene.add(mainLight);

  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.4);
  fillLight.position.set(-3, 1, -4);
  scene.add(fillLight);

  const rimLight = new THREE.DirectionalLight(0xff8844, 0.3);
  rimLight.position.set(-2, 3, 5);
  scene.add(rimLight);

  const groundGeom = new THREE.PlaneGeometry(8, 8);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.3 });
  const ground = new THREE.Mesh(groundGeom, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  scene.add(ground);

  const gridHelper = new THREE.GridHelper(6, 12, 0x333333, 0x222222);
  gridHelper.position.y = 0;
  scene.add(gridHelper);

  buildArm(scene);

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  const onResize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  };
  window.addEventListener('resize', onResize);
}

function buildArm(scene) {
  const group = new THREE.Group();
  scene.add(group);

  // Base (static cylinder on ground)
  const baseMat = new THREE.MeshStandardMaterial({ color: 0x444444, metalness: 0.4, roughness: 0.5 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 0.12, 32), baseMat);
  base.position.y = 0.06;
  base.receiveShadow = true;
  base.castShadow = true;
  group.add(base);

  // Base ring
  const ringMat = new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.6, roughness: 0.3 });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.4, 0.04, 16, 32), ringMat);
  ring.position.y = 0.12;
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Base pivot (Y rotation)
  basePivot = new THREE.Group();
  basePivot.position.y = 0.12;
  group.add(basePivot);

  // Turret
  const turretMat = new THREE.MeshStandardMaterial({ color: 0x666666, metalness: 0.5, roughness: 0.3 });
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.3, 0.35, 32), turretMat);
  turret.position.y = 0.175;
  turret.castShadow = true;
  basePivot.add(turret);

  // Turret top plate
  const plateMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.7, roughness: 0.2 });
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.25, 0.06, 32), plateMat);
  plate.position.y = 0.35;
  basePivot.add(plate);

  // Shoulder pivot (rotation around X - tilt forward/backward)
  shoulderPivot = new THREE.Group();
  shoulderPivot.position.y = 0.38;
  basePivot.add(shoulderPivot);

  // Shoulder joint sphere
  const jointMat = new THREE.MeshStandardMaterial({ color: 0x777777, metalness: 0.8, roughness: 0.15, emissive: 0x222222, emissiveIntensity: 0.1 });
  const shoulderSphere = new THREE.Mesh(new THREE.SphereGeometry(0.12, 20, 20), jointMat);
  shoulderPivot.add(shoulderSphere);

  // Upper arm (extends upward along +Y)
  const armMat = new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.5, roughness: 0.4 });
  const upperArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.8, 0.14), armMat);
  upperArm.position.y = 0.9;
  upperArm.castShadow = true;
  shoulderPivot.add(upperArm);

  // Red accent stripe on upper arm
  const accentMat = new THREE.MeshStandardMaterial({ color: 0xD71921, metalness: 0.2, roughness: 0.6 });
  const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 0.08), accentMat);
  stripe.position.set(0, 0.9, 0.071);
  shoulderPivot.add(stripe);

  // Elbow pivot (rotation around X)
  elbowPivot = new THREE.Group();
  elbowPivot.position.y = 1.8;
  shoulderPivot.add(elbowPivot);

  // Elbow joint sphere
  const elbowSphere = new THREE.Mesh(new THREE.SphereGeometry(0.1, 20, 20), jointMat);
  elbowPivot.add(elbowSphere);

  // Forearm (extends upward along +Y)
  const forearmMat = new THREE.MeshStandardMaterial({ color: 0x8a8a8a, metalness: 0.5, roughness: 0.4 });
  const forearm = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), forearmMat);
  forearm.position.y = 0.8;
  forearm.castShadow = true;
  elbowPivot.add(forearm);

  // Red accent on forearm
  const stripe2 = new THREE.Mesh(new THREE.BoxGeometry(0.07, 1.4, 0.07), accentMat);
  stripe2.position.set(0, 0.8, 0.061);
  elbowPivot.add(stripe2);

  // Gripper pivot
  const gripperPivot = new THREE.Group();
  gripperPivot.position.y = 1.6;
  elbowPivot.add(gripperPivot);

  // Gripper base block
  const gripBaseMat = new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.3, roughness: 0.5 });
  const gripBase = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.08, 0.15), gripBaseMat);
  gripBase.position.y = 0.04;
  gripperPivot.add(gripBase);

  // Left finger
  const fingerMat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, metalness: 0.2, roughness: 0.6 });
  const lf = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.06), fingerMat);
  lf.position.set(-0.15, 0.2, 0);
  lf.castShadow = true;
  gripperPivot.add(lf);
  leftFinger = lf;

  // Right finger
  const rf = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.25, 0.06), fingerMat);
  rf.position.set(0.15, 0.2, 0);
  rf.castShadow = true;
  gripperPivot.add(rf);
  rightFinger = rf;
}

export function updateArm(base = 0, shoulder = 160, elbow = 0, gripper = 45) {
  if (!basePivot) return;

  basePivot.rotation.y = (base / 190) * Math.PI * 2;

  // Shoulder: 90-190 range, 160=start. Rotates around X (tilt forward/backward)
  // Positive X rotation tilts arm toward +Z (forward toward camera)
  const shoulderDeg = (160 - shoulder) * 0.6;
  shoulderPivot.rotation.x = shoulderDeg * THREE.MathUtils.DEG2RAD;

  // Elbow: 0-190, positive = forearm bends backward (negative X rotation)
  const elbowDeg = -elbow * 0.5;
  elbowPivot.rotation.x = elbowDeg * THREE.MathUtils.DEG2RAD;

  // Gripper: 45=open, 140=closed
  const t = THREE.MathUtils.clamp((gripper - 45) / (140 - 45), 0, 1);
  const spread = 0.15 - t * 0.11;
  leftFinger.position.x = -spread;
  rightFinger.position.x = spread;
}
