import './style.css'
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls'

import skyboxFront from '/starfield/front.png';
import skyboxBack from '/starfield/back.png';
import skyboxLeft from '/starfield/left.png';
import skyboxRight from '/starfield/right.png';
import skyboxTop from '/starfield/top.png';
import skyboxBottom from '/starfield/bottom.png';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(85, innerWidth/innerHeight, 0.1, 100);
camera.position.set(-30,10,30);
camera.lookAt(0,0,0);

const ambient_light = new THREE.AmbientLight( 0xffffff, 0.5 );

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#bg')
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
    gltf_loader.load(
      'models/jwst.glb',
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
          animate();
        });
      }
    )
  })
}

function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
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
