import * as THREE from "three";
// import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
// import * as dat from "dat.gui";
import nx from "./img/nx.png";
import ny from "./img/ny.png";
import nz from "./img/nz.png";
import px from "./img/px.png";
import py from "./img/py.png";
import pz from "./img/pz.png";
// import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import "./style.css";
import { gsap } from "gsap";
// @ts-ignore
import SplitTextJS from "split-text-js";
// import { get } from "immer/dist/internal.js";
// import { sub } from "three/examples/jsm/nodes/Nodes.js";

const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector("#bg") as HTMLCanvasElement,
});

renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping; //톤맵핑
renderer.toneMappingExposure = 0.5; //톤맵핑 밝기

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.setZ(30);
const initialCameraX = camera.position.x;
const initialCameraZ = camera.position.z;
const initialCameraY = camera.position.y;

// const orbit = new OrbitControls(camera, renderer.domElement); //!
// orbit.update();

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
//shadow enable!!!!
renderer.shadowMap.enabled = true;

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const gridHelper = new THREE.GridHelper(30, 30);
scene.add(gridHelper);

//subway motion & svg motionblur
const blurFilter = document.getElementById("blur-filter");
const view = document.getElementById("view");

const setBlur = (x: number, y: number) => {
  blurFilter!.setAttribute("stdDeviation", x + "," + y);
};

const getPos = () => {
  const rect = view!.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
  };
};

const getSizeofView = () => {
  const rect = document.querySelector(".subwayview")!.getBoundingClientRect();
  return rect.width;
};

const subwayViewSize = getSizeofView();
console.log(subwayViewSize);

let lastPos = getPos();

const update = () => {
  const curPos = getPos();
  const dx = Math.abs(curPos.x - lastPos.x) * 2;
  const dy = Math.abs(curPos.y - lastPos.y) * 2;
  setBlur(dx, dy);
  lastPos = curPos;
  requestAnimationFrame(update);
};

update();

const viewtl = gsap.timeline();
const enlargetl = gsap.timeline();
const entertl = gsap.timeline();


gsap.config({ force3D: true });

let goto = -subwayViewSize * 4 - 40;

const gohomebtn = document.querySelector("#gohome") as HTMLButtonElement;
const getrestbtn = document.querySelector("#getrest") as HTMLButtonElement;
const seaview = window.document.querySelector(".seaview") as HTMLImageElement;
const subway = window.document.querySelector("#subway") as HTMLImageElement;

const endIntro = () => {
  entertl
  .to('.intro-scene', {
    duration: 0.5,
    autoAlpha: 0,
    ease: "power2.out",
    onComplete: () => {
      const intro = window.document.querySelector('.intro-scene') as HTMLDivElement;
      intro.style.display = "none";
      window.document.body.style.overflow = "auto";
    }
  })
}

const moveSubway = () => {
  viewtl.to(view, {
    duration: 3,
    ease: "power4.out",
    x: goto,
    onComplete: () => {
      goto = goto === 20 ? 20 - subwayViewSize * 4 - 40 : 20;
    },
  })
  .to(gohomebtn,{
    duration: 0.2,
    autoAlpha: 0,
    ease: "power2.in",
  },"<")
  .to(".subway", {
    duration: 3,
    filter: " brightness(0.3)",
    ease: "power2.in",
  },'<')
  .to(getrestbtn, {
    duration: 0.8,
    autoAlpha: 1,
    ease: "power2.out",
    onComplete: () => {
      getrestbtn.addEventListener("mouseover", () => {
        enlargetl.to(seaview, {
          duration: 0.5,
          z: 20,
          ease: "power2.out",
        }).to(subway, {
          duration: 0.5,
          z: 60,
          ease: "power2.out",
        },'<').to('.fa-person-running',{
          duration: 0.5,
          y: -10,
          rotate: -20,
          ease: "power2.out",
        },'<')
      })
      getrestbtn.addEventListener("mouseleave", () => {
        enlargetl.to(seaview, {
          duration: 0.5,
          z: 0,
          ease: "power2.out",
        }).to(subway, {
          duration: 0.5,
          z: 0,
          ease: "power2.out",
        },'<').to('.fa-person-running',{
          duration: 0.5,
          rotate: 0,
          y: 0,
          ease: "power2.out",
        },'<')})
      getrestbtn.addEventListener("click", () =>endIntro())
    }
  },"-=1")
}
gohomebtn.addEventListener("click", () => moveSubway());
window.document.querySelector('.end-scene')!.addEventListener("click", () => {
  endIntro()
})



//wave
// const sea = document.querySelector(".sea") as HTMLDivElement;
// const waveWrapper = document.querySelector(".wave-wrapper") as HTMLDivElement;
const wavetl = gsap.timeline({ repeat: -1 });
wavetl.to("#text-path", {
  duration: 5,
  attr: {
    startOffset: "100%",
  },
  ease: "none",
});

// const gltfLoader = new GLTFLoader();
// const skybluesea = new URL("./img/skybluesea.glb", import.meta.url);

//light
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

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
// const gui = new dat.GUI();

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
const texture = textureLoader.load("https://mrdoob.com/lab/javascript/webgl/clouds/cloud10.png");
texture.magFilter = THREE.LinearFilter;
texture.minFilter = THREE.LinearMipMapLinearFilter;

var fog = new THREE.Fog(0x4584b4, -100, 3000);

const cloudMaterial = new THREE.ShaderMaterial({
  uniforms: {
    map: { value: texture },
    fogColor: { value: fog.color },
    fogNear: { value: fog.near },
    fogFar: { value: fog.far },
  },
  vertexShader: document.getElementById("vs")!.textContent || "",
  fragmentShader: document.getElementById("fs")!.textContent || "",
  depthWrite: false,
  depthTest: true,
  transparent: true,
});

for (let i = 0; i < 100; i++) {
  const plane = new THREE.Mesh(cloudGeometry, cloudMaterial);
  plane.position.x = Math.random() * 500 - 300;
  plane.position.y = -Math.random() * Math.random() * 200 - 15;
  plane.position.z = -(i * 0.07) - 100;
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
  getSizeofView();
}); // 자동으로 바뀌게 해줌

const initialCameraRotation = camera.rotation.clone();

function moveCamera() {
  const t = document.body.getBoundingClientRect().top;
  camera.position.z = initialCameraZ + t * 0.01;
  camera.position.x = initialCameraX + t * 0.0002;
  camera.position.y = initialCameraY + t * 0.0002;
  console.log(camera.position.x, camera.position.y, camera.position.z);

  // const distance = camera.position.z - viewpannel.position.z;
  // if (distance <= 40 && distance >= 0) {
  //   viewpannel.material.transparent = true;
  //   const opacity = distance / 30;
  //   viewpannel.material.opacity = opacity;
  // }

  if (camera.position.z < -110 && camera.rotation.x === initialCameraRotation.x) {
    const tiltAngle = 30 * (Math.PI / 180);
    gsap.to(camera.rotation, { x: -tiltAngle, duration: 3 });
  } else if (camera.position.z >= -110 && camera.rotation.x !== initialCameraRotation.x) {
    gsap.to(camera.rotation, { x: initialCameraRotation.x, duration: 3 });
  }
}
document.body.onscroll = moveCamera;

function animate() {
  requestAnimationFrame(animate);

  // sLightHelper.update();

  raycaster.setFromCamera(mousePosition, camera);
  // const intersects = raycaster.intersectObjects(scene.children);

  renderer.render(scene, camera);
}

animate();
