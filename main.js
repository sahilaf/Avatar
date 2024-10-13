// Import necessary modules
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'dat.gui';

// Create a scene with fog for atmosphere
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 1.5, 5); // Fog with black color starting from 5 units away
scene.background = new THREE.Color(0x030405);

// Create a camera with FOV matching a 50mm focal length
const fov = 39.6; // FOV for 50mm equivalent
const aspect = window.innerWidth / window.innerHeight; // Aspect ratio
const near = 0.1; // Near clipping plane
const far = 1000; // Far clipping plane

const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
camera.position.set(0, 0, 3); // Initial camera position

// Set up renderer
const canvas = document.getElementById('canvas');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.outputEncoding = THREE.sRGBEncoding;
document.body.appendChild(renderer.domElement);

// Initialize GUI
const gui = new GUI();

// Load the GLTF model
const loader = new GLTFLoader();
let carModel, mixer;

loader.load('assets/Portmodelcyber.glb', (gltf) => {
    carModel = gltf.scene;
    carModel.position.set(0.2, -4.5, 0); // Initial position
    carModel.scale.set(0.06, 0.06, 0.06); // Scale down the model
    scene.add(carModel);

    // Initialize the animation mixer
    mixer = new THREE.AnimationMixer(carModel);
    const animationClip = THREE.AnimationClip.findByName(gltf.animations, 'Armature|mixamo.com|Layer0');
    const action = mixer.clipAction(animationClip);
    action.play(); // Start the animation

    // Add GUI controls
    const carFolder = gui.addFolder('Car Model');
    carFolder.add(carModel.rotation, 'x', 0, Math.PI * 2).name('Rotate X');
    carFolder.add(carModel.rotation, 'y', 0, Math.PI * 2).name('Rotate Y');
    carFolder.add(carModel.rotation, 'z', 0, Math.PI * 2).name('Rotate Z');
    carFolder.add(carModel.position, 'x', -10, 10).name('Position X');
    carFolder.add(carModel.position, 'y', -10, 10).name('Position Y');
    carFolder.add(carModel.position, 'z', -10, 10).name('Position Z');
    carFolder.add(carModel.scale, 'x', 0.1, 5).name('Scale X');
    carFolder.add(carModel.scale, 'y', 0.1, 5).name('Scale Y');
    carFolder.add(carModel.scale, 'z', 0.1, 5).name('Scale Z');
    carFolder.add(carModel, 'visible').name('Visibility');
    carFolder.open();
}, undefined, (error) => {
    console.error(error);
});

// Add lights to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 5); // Increased intensity
scene.add(ambientLight);

const greenLight = new THREE.DirectionalLight(0xD3F8BC, 12); // Increased intensity
greenLight.position.set(0, 6, 6);
greenLight.castShadow = true;
scene.add(greenLight);

const backLight = new THREE.DirectionalLight(0x50D001, 10); // Keep or adjust as needed
backLight.position.set(-5, 2, -5);
backLight.castShadow = true;
scene.add(backLight);

// Add OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = false; // Disable damping
controls.dampingFactor = 0.25; 
controls.enableZoom = false; // Disable zoom
controls.enableRotate = false;

// Prevent right-click context menu and movement
renderer.domElement.addEventListener('contextmenu', (event) => {
    event.preventDefault(); // Prevent default right-click context menu
});

renderer.domElement.addEventListener('mousedown', (event) => {
    if (event.button === 2) { // Right mouse button
        controls.enableRotate = false; // Disable rotation
        controls.enablePan = false; // Disable panning
        controls.enableZoom = false; // Disable zoom
    }
});

// Update mouse position
let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.001; // Normalize to -0.5 to 0.5
    mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    // Smooth parallax interpolation
    targetX = mouseX * 2; // Amplify for a more noticeable effect
    targetY = mouseY * 2;

    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;

    // Ensure the camera looks at the model
    if (carModel) camera.lookAt(carModel.position);

    controls.update();
    renderer.render(scene, camera);
}
animate();
