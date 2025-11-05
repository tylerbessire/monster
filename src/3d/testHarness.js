import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { RaycasterInteractions } from './interactions/raycasterInteractions.js';
import { ParticlePool } from './effects/particles.js';
import { CameraRig } from './camera/cameraRig.js';
import { overrideToonRim } from './shaders/toonRimMaterial.js';
import { runEvolution } from './evolution/evolutionTimeline.js';

const canvas = document.createElement('canvas');
document.body.appendChild(canvas);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0e0f12);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 50);
camera.position.set(0, 0.8, 2.0);
const rig = new CameraRig(camera);

const light = new THREE.DirectionalLight(0xffffff, 1.0);
light.position.set(1,2,1);
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.3));

const particles = new ParticlePool({ max: 256 });
particles.attachTo(scene);

const loader = new GLTFLoader();
// Using public sample models to demonstrate hookup
const p1 = await loader.loadAsync('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Duck/glTF-Binary/Duck.glb');
let model = p1.scene;
model.scale.setScalar(0.01);
scene.add(model);
overrideToonRim(model, { baseColor: 0xffd54f, rimColor: 0x88b7ff, rimStrength: 1.0 });

const ray = new RaycasterInteractions(camera, scene, renderer.domElement, {
  onClick: (obj) => {
    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);
    particles.burst({ position: pos.add(new THREE.Vector3(0,0.5,0)), color: '#ff6ea0' });
  },
  onHover: (obj) => {
    document.body.style.cursor = obj ? 'pointer' : 'default';
  }
});

document.getElementById('btnIdle').onclick = () => {}; // placeholder for anim controller
document.getElementById('btnPlay').onclick = () => particles.burst({ position: model.position.clone().add(new THREE.Vector3(0,0.5,0)) });

document.getElementById('btnEvolve').onclick = async () => {
  model = await runEvolution({
    currentModel: model,
    loadNextStage: async () => await loader.loadAsync('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Models/master/2.0/Avocado/glTF-Binary/Avocado.glb'),
    scene, cameraRig: rig, particles,
    onSwap: (m/*,clips*/) => {}
  });
};

addEventListener('resize', () => {
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

let last = performance.now();
function loop() {
  const now = performance.now();
  const dt = (now - last)/1000;
  last = now;
  rig.update(dt);
  particles.update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(loop);
}
loop();
