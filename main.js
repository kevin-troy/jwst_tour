import './style.css'
//import * as THREE from 'three';
import * as THREE from "/node_modules/three/build/three.module.js";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls'
import jwstURL from '/models/jwst.glb?url'

import skyboxFront from '/starfield/front.png';
import skyboxBack from '/starfield/back.png';
import skyboxLeft from '/starfield/left.png';
import skyboxRight from '/starfield/right.png';
import skyboxTop from '/starfield/top.png';
import skyboxBottom from '/starfield/bottom.png';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(85, innerWidth/innerHeight, 1, 100);
camera.position.set(-50,20,50);
//camera.position.set(-20,10,20);
//camera.position.set(0,5,35);
camera.lookAt(0,0,0);

const ambient_light = new THREE.AmbientLight( 0xffffff, 0.5 );

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg'),
  powerPreference: "high-performance"
})
renderer.setPixelRatio(devicePixelRatio);
renderer.setSize(innerWidth, innerHeight);
renderer.gammaOutput = true

const controls =  new OrbitControls(camera, renderer.domElement);
controls.autoRotate = true;

let jwst;
let skybox_texture;
const load_mgr = new THREE.LoadingManager();
const gltf_loader = new GLTFLoader(load_mgr);
const rgbe_loader = new RGBELoader(load_mgr);
const cubeLoader = new THREE.CubeTextureLoader(load_mgr);

load_mgr.onStart = function(){
  console.log('Loading assets...')
}
load_mgr.onLoad = function(){
  console.log('Assets loaded!')
}

renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 4;

function loadAssets(){
  rgbe_loader.load('/models/Milkyway_small.hdr', function(texture){
    texture.mapping = THREE.EquirectangularReflectionMapping;
    scene.environment = texture;
    //scene.environment = cubeRenderTarget;
    gltf_loader.load(
      jwstURL,
      function(gltf){
        jwst = gltf.scene;
        jwst.name = "jwst"
        scene.add(jwst)
        skybox_texture = cubeLoader.load([
          skyboxFront,
          skyboxBack,
          skyboxLeft,
          skyboxRight,
          skyboxTop,
          skyboxBottom,
        ],
        function(){
          scene.background = skybox_texture;
          //scene.environment = skybox_texture;

          scene.overrideMaterial = new THREE.MeshStandardMaterial({metalness:0.5}); // Can be used for low-poly
          scene.overrideMaterial = null;                                            // undo with null

          console.log(jwst.getObjectById("object_16"))

          animate();
        });
      }
    )
  })
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  //cubeCamera.update(renderer, scene);
  //jwst.rotation.y+=0.005
  controls.update();
}

// window resizing
addEventListener('resize', onWindowResize);

function onWindowResize(){
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight)
}

// on page load
addEventListener('load', onPageLoad);

function onPageLoad(){
  loadAssets();
}
