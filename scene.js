import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';
import { SkeletonUtils } from './SkeletonUtils.js';
import { DRACOLoader } from './DRACOLoader.js'

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(60, 1, 1, 1000);

camera.position.set(0, 0, 60);
var renderer = new THREE.WebGLRenderer({
    antialias: true,

   alpha: true 
});

var canvas = renderer.domElement;
const container = document.getElementById('result');
container.appendChild(canvas);

camera.aspect = container.clientWidth / container.clientHeight;
camera.updateProjectionMatrix();


renderer.setClearColor(0xff00ff,0);
function addLight(...pos) {
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    light.position.set(...pos);
    scene.add(light);
    scene.add(light.target);
}
addLight(5, 5, 2);
addLight(-5, 5, 5);


var base = new THREE.Group();
scene.add(base);
const manager = new THREE.LoadingManager();
manager.onLoad = init;
const models = {
    knight: { url: './animals/Knight.glb' },
    pug: { url: './animals/Pug.glb' },
    cow: { url: './animals/Cow.glb' },
   

};
{
    const gltfLoader = new GLTFLoader(manager);
    var dracoLoader = new DRACOLoader();
    gltfLoader.setDRACOLoader(dracoLoader);

    for (const model of Object.values(models)) {
        gltfLoader.load(model.url, (gltf) => {
            model.gltf = gltf;
        });
    }
}

function prepModelsAndAnimations() {
    Object.values(models).forEach(model => {
        const animsByName = {};
        model.gltf.animations.forEach((clip) => {
            animsByName[clip.name] = clip;
        });
        model.animations = animsByName;
    });
}

const mixers = [];

function init() {


    prepModelsAndAnimations();
    var i = 0;
    Object.values(models).forEach((model, ndx) => {
        const clonedScene = SkeletonUtils.clone(model.gltf.scene);
        const root = new THREE.Object3D();
        root.add(clonedScene);
        scene.add(root);
        root.position.z = 10;
        root.rotation.y = Math.PI * i / 6;
        var x = 20 * Math.cos(2 * Math.PI * (i + 2) /5.5);
        var y = 20 * Math.sin(2 * Math.PI * (i + 2) /5.5);
        root.position.x = x;
        root.position.y = y;

        const mixer = new THREE.AnimationMixer(clonedScene);
        const firstClip = Object.values(model.animations)[0];
        const action = mixer.clipAction(firstClip);
        action.play();
        mixers.push(mixer);
        i += 1;
    });
}

function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}

let then = 0;
function render(now) {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }

    for (const mixer of mixers) {
        mixer.update(deltaTime);
    }

    renderer.render(scene, camera);

    requestAnimationFrame(render);
}

requestAnimationFrame(render);

const gltfLoader = new GLTFLoader();
var dracoLoader = new DRACOLoader();
gltfLoader.setDRACOLoader(dracoLoader);


const chair = './chair/scene.gltf';
const airplane = './plane/scene.gltf';
const url = "./robot/out.glb";

gltfLoader.load(chair, (gltf) => {
    const root = gltf.scene;
    var x = 20 * Math.cos(2 * Math.PI * -0.3 / 5);
    var y = 20 * Math.sin(2 * Math.PI * -0.3 / 5);
    root.scale.set(0.006, 0.006, 0.006);
    root.rotation.y = -Math.PI / 2;
    root.position.x = x;
    root.position.y = y;
    root.position.z = 10;

    scene.add(root)
});
gltfLoader.load(airplane, (gltf) => {
    const root = gltf.scene;
    var x = 20 * Math.cos(2 * Math.PI * 1 / 6);
    var y = 20 * Math.sin(2 * Math.PI * 1 / 6);
    root.rotation.x = Math.PI / 4;
    root.rotation.y = -Math.PI / 3;
    root.position.x = x;
    root.position.y = y;
    root.position.z = 10;

    scene.add(root)
});

gltfLoader.load(url, (gltf) => {
    const root = gltf.scene;
    root.position.x = 0;
    root.position.z = 0;
    root.position.y = 0;
    root.rotation.y = -Math.PI / 2;
    root.scale.set(0.08, 0.08, 0.08);
    base.add(root);
});

var plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), -10);
var raycaster = new THREE.Raycaster();
var mouse = new THREE.Vector2();
var pointOfIntersection = new THREE.Vector3();
canvas.addEventListener("mousemove", onMouseMove, false);

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, pointOfIntersection);
    base.lookAt(pointOfIntersection);
}

renderer.setAnimationLoop(() => {
    if (resize(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }
    renderer.render(scene, camera);
});

function resize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }
    return needResize;
}