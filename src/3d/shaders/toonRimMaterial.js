// src/3d/shaders/toonRimMaterial.js
import * as THREE from 'three';

export function createToonRimMaterial({
  baseColor = 0xffffff,
  emissive = 0x000000,
  rimColor = 0xffffff,
  rimStrength = 1.0,
  rimPower = 2.0,
  quantize = 4,
} = {}) {
  const uniforms = {
    uBaseColor:   { value: new THREE.Color(baseColor) },
    uEmissive:    { value: new THREE.Color(emissive) },
    uRimColor:    { value: new THREE.Color(rimColor) },
    uRimStrength: { value: rimStrength },
    uRimPower:    { value: rimPower },
    uQuantize:    { value: quantize },
    uLightDir:    { value: new THREE.Vector3(0.5, 1.0, 0.3).normalize() },
  };

  const vertexShader = /* glsl */`
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    void main() {
      vNormal = normalize(normalMatrix * normal);
      vec4 wp = modelMatrix * vec4(position, 1.0);
      vWorldPos = wp.xyz;
      gl_Position = projectionMatrix * viewMatrix * wp;
    }
  `;

  const fragmentShader = /* glsl */`
    precision highp float;
    varying vec3 vNormal;
    varying vec3 vWorldPos;
    uniform vec3 uBaseColor;
    uniform vec3 uEmissive;
    uniform vec3 uRimColor;
    uniform float uRimStrength;
    uniform float uRimPower;
    uniform int uQuantize;
    uniform vec3 uLightDir;

    void main() {
      float NdotL = max(dot(normalize(vNormal), normalize(uLightDir)), 0.0);
      float stepVal = floor(NdotL * float(uQuantize)) / float(uQuantize);
      vec3 toon = uBaseColor * (0.15 + 0.85 * stepVal);

      vec3 V = normalize(-vWorldPos);
      float rim = pow(1.0 - max(dot(normalize(vNormal), V), 0.0), uRimPower);
      vec3 rimCol = uRimColor * rim * uRimStrength;

      vec3 color = toon + rimCol + uEmissive;
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader, fragmentShader,
    lights: false, fog: false, transparent: false,
  });
  material.name = "ToonRimMaterial";
  return material;
}

export function overrideToonRim(model, options = {}) {
  model.traverse(obj => {
    if (obj.isMesh) {
      const emissive = (obj.material && obj.material.emissive) ? obj.material.emissive.getHex() : 0x000000;
      const baseColor = (obj.material && obj.material.color) ? obj.material.color.getHex() : 0xffffff;
      obj.material = createToonRimMaterial({ emissive, baseColor, ...options });
    }
  });
}
