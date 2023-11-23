import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as dat from "dat.gui";
import nx from "./img/nx.png";
import ny from "./img/ny.png";
import nz from "./img/nz.png";
import px from "./img/px.png";
import py from "./img/py.png";
import pz from "./img/pz.png";
import wood from "./img/wood.jpeg";
import seaview from "./img/view3.png";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { gsap } from "gsap";
import "./style.css";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg") as HTMLCanvasElement,
});

// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);
// THREE.ColorManagement.enabled = false;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; //톤맵핑
renderer.toneMappingExposure = 0.5; //톤맵핑 밝기

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);
const initialCameraX = camera.position.x;
const initialCameraZ = camera.position.z;
const initialCameraY = camera.position.y;

const orbit = new OrbitControls(camera, renderer.domElement); //!
orbit.update();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//shadow enable!!!!
renderer.shadowMap.enabled = true;

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);

//glb
const gltfLoader = new GLTFLoader();
const skybluesea = new URL("./img/skybluesea.glb", import.meta.url);
const balloon = gltfLoader.load(
  skybluesea.href,
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(2, 2, 2);
    scene.add(model);
    model.position.set(-20, 10, -3);
    model.rotation.y = (-Math.PI / 2) * 3; //90 degrees
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        child.material.roughness = 0;
        child.material.metalness = 1;
        child.material.uniforms = {
          bias: { value: 0.41 },
          scale: { value: -0.13 },
          intensity: { value: 2.0 },
          factor: { value: 1.0 },
        };
      }
    });
  },
  undefined,
  (error) => {
    console.error(error);
  }
);

//plane

const woodTexture = new THREE.TextureLoader().load(wood);
woodTexture.wrapS = THREE.RepeatWrapping;
woodTexture.wrapT = THREE.RepeatWrapping;
woodTexture.repeat.set(4, 1);

//seaview pannel
const seaviewTexture = new THREE.TextureLoader().load(seaview);
const seaviewMaterial = new THREE.MeshBasicMaterial({
  side: THREE.DoubleSide,
  map: seaviewTexture,
});
seaviewMaterial.transparent = false;

const seaviewGeometry = new THREE.PlaneGeometry(112, 80);
const viewpannel = new THREE.Mesh(seaviewGeometry, seaviewMaterial);
scene.add(viewpannel);

viewpannel.rotation.y = -Math.PI;
// viewpannel.position.set(9,0,-101)
viewpannel.position.set(9, 0, -60);

const planeGeometry = new THREE.PlaneGeometry(60, 30);
planeGeometry.rotateX(-Math.PI / 2); //90 degrees
planeGeometry.rotateY(-Math.PI / 2); //90 degrees
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
  map: woodTexture,
});

const floor = new THREE.Mesh(planeGeometry, planeMaterial);
const leftwall = new THREE.Mesh(planeGeometry, planeMaterial);
const rightwall = new THREE.Mesh(planeGeometry, planeMaterial);
const ceiling = new THREE.Mesh(planeGeometry, planeMaterial);

scene.add(leftwall);
scene.add(rightwall);
scene.add(floor);
scene.add(ceiling);
ceiling.position.set(0, 15, 0);
leftwall.position.set(15, 0, 0);
rightwall.position.set(-15, 0, 0);
floor.position.setY(-15);
leftwall.rotation.z = -Math.PI / 2; //90 degrees
rightwall.rotation.z = Math.PI / 2; //90 degrees

floor.receiveShadow = true; //shadow enable !!!!
ceiling.receiveShadow = true; //shadow enable !!!!
leftwall.receiveShadow = true;
rightwall.receiveShadow = true;
leftwall.castShadow = true;
rightwall.castShadow = true;
ceiling.castShadow = true;

// const pannelGeometry = new THREE.PlaneGeometry( 30, 30 );
// const pannelMaterial = new THREE.MeshStandardMaterial({
//   map : new THREE.TextureLoader().load(wood)
// });

//sphere
// const sphereGeometry = new THREE.SphereGeometry(2);
// const sphereMaterial = new THREE.MeshStandardMaterial({
//   color: 0x0000ff,
//   wireframe: false,
//   roughness: 0,
// });
// const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
// scene.add(sphere);
// sphere.position.x = 4;
// sphere.castShadow = true; //shadow enable!!!!

//light
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const spotLight = new THREE.DirectionalLight(0xffffff, 10);
scene.add(spotLight);
spotLight.position.set(200, 200, -155);
spotLight.castShadow = true;
spotLight.shadow.camera.left = -50;
spotLight.shadow.camera.right = 50;
spotLight.shadow.camera.top = 50;
spotLight.shadow.camera.bottom = -50;
spotLight.target.position.set(0, 0, 20);

const sLightHelper = new THREE.DirectionalLightHelper(spotLight);
scene.add(sLightHelper);
const dLightShadowHelper = new THREE.CameraHelper(spotLight.shadow.camera);
scene.add(dLightShadowHelper);

//background

const cubeTextureLoader = new THREE.CubeTextureLoader();
const hdrTextureURL = new URL("./img/sky.hdr", import.meta.url);
const rgbLoader = new RGBELoader();
rgbLoader.load(hdrTextureURL.href, (texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  // scene.background = texture;
  scene.environment = texture;
});
const skybox = cubeTextureLoader.load([nx, px, py, ny, nz, pz]);
scene.background = skybox;

//mouse

const mousePosition = new THREE.Vector2();
window.addEventListener("mousemove", (e) => {
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1;
  mousePosition.y = -(e.clientY / window.innerHeight) * 2 + 1;
});

const raycaster = new THREE.Raycaster();

// gui
const gui = new dat.GUI();

// const options = {
//   speed: 0.01,
//   intensity: 150,
//   // cameraX: -100,
//   // cameraY: 100,
//   // cameraZ: 100,
//   cameraLookX: 0,
//   cameraLookY: 0,
//   cameraLookZ: 0,
// };

// gui.add(options, "speed", 0, 0.1);
// gui.add(options, "intensity", 0, 200).onChange((e) => (spotLight.intensity = e));
// // gui.add(options, "cameraX", -500, 500).onChange((e) => (camera.position.x = e));
// // gui.add(options, "cameraY", -500, 500).onChange((e) => (camera.position.y = e));
// // gui.add(options, "cameraZ", -500, 500).onChange((e) => (camera.position.z = e));
// gui.add(options, "cameraLookY", -1000, 1000).onChange((e) => camera.lookAt(0, e, 0));
// gui.add(options, "cameraLookX", -1000, 1000).onChange((e) => camera.lookAt(e, 0, 0));
// gui.add(options, "cameraLookZ", -800, 800).onChange((e) => camera.lookAt(0, 0, e));

// let step = 0;

//cloud
const cloudGeometry = new THREE.PlaneGeometry(100, 60);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load("https://mrdoob.com/lab/javascript/webgl/clouds/cloud10.png", animate);
texture.magFilter = THREE.LinearMipMapLinearFilter;
texture.minFilter = THREE.LinearMipMapLinearFilter;

var fog = new THREE.Fog(0x4584b4, -100, 3000);

const cloudMaterial = new THREE.ShaderMaterial({
  uniforms: {
    map: { type: "t", value: texture },
    fogColor: { type: "c", value: fog.color },
    fogNear: { type: "f", value: fog.near },
    fogFar: { type: "f", value: fog.far },
  },
  vertexShader: `
varying vec2 vUv;

void main() {

vUv = uv;
gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

}
`,

  fragmentShader: `
uniform sampler2D map;

uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;

varying vec2 vUv;

void main() {

float depth = gl_FragCoord.z / gl_FragCoord.w;
float fogFactor = smoothstep( fogNear, fogFar, depth );

gl_FragColor = texture2D( map, vUv );
gl_FragColor.w *= pow( gl_FragCoord.z, 20.0 );
gl_FragColor = mix( gl_FragColor, vec4( fogColor, gl_FragColor.w ), fogFactor );

}
`,
  depthWrite: false,
  depthTest: true,
  transparent: true,
});

for (let i = 0; i < 100; i++) {
  const plane = new THREE.Mesh(cloudGeometry, cloudMaterial);
  plane.position.x = Math.random() * 500 - 300;
  plane.position.y = -Math.random() * Math.random() * 200 - 15;
  plane.position.z = -i -100 ;
  plane.rotation.z = Math.random() * Math.PI;
  plane.scale.x = plane.scale.y = Math.random() * Math.random() * 1.5 + 0.5;
  scene.add(plane);
}

const mesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
scene.add(mesh);
mesh.position.z = -8000;

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}); // 자동으로 바뀌게 해줌

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;

  camera.position.z = initialCameraZ + t * 0.01;
  camera.position.x = initialCameraX + t * 0.0002;
  camera.position.y = initialCameraY + t * 0.0002;
  console.log(camera.position.x, camera.position.y, camera.position.z);
  if (camera.position.z < -14.73) {
    viewpannel.position.z = viewpannel.position.z - t * 0.01;
    if (camera.position.z < -29) {
      scene.remove(viewpannel);
      scene.remove(leftwall);
      scene.remove(rightwall);
      scene.remove(floor);
      scene.remove(ceiling);
    }
  }
  if(camera.position.z < -80){
    scene.remove(mesh)

    gltfLoader.load(
      skybluesea.href,
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(2, 2, 2);
        scene.add(model);
        model.position.set(-20, 10, -3);
        model.rotation.y = (-Math.PI / 2) * 3; //90 degrees
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            child.material.roughness = 0;
            child.material.metalness = 1;
            child.material.uniforms = {
              bias: { value: 0.41 },
              scale: { value: -0.13 },
              intensity: { value: 2.0 },
              factor: { value: 1.0 },
            };
          }
        });
      },
      undefined,
      (error) => {
        console.error(error);
      }
    );
  }
}
document.body.onscroll = moveCamera;

function animate() {
  requestAnimationFrame(animate);

  sLightHelper.update();

  raycaster.setFromCamera(mousePosition, camera);
  const intersects = raycaster.intersectObjects(scene.children);

  renderer.render(scene, camera);
}

animate();
