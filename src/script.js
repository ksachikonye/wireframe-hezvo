console.clear();

import * as THREE from "https://cdn.skypack.dev/three@0.125.0";
import { gsap } from 'https://cdn.skypack.dev/gsap@3.11.0';
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.125.0/examples/jsm/loaders/GLTFLoader";
import { ScrollTrigger } from "https://cdn.skypack.dev/gsap@3.11.0/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// --- CONSTS

const COLORS = {
	background: "white",
	light: "#ffffff",
	sky: "#aaaaff",
	ground: "#88ff88",
	blue: "steelblue"
};

const PI = Math.PI;


const wireframeMaterial = new THREE.MeshBasicMaterial({color:'white', wireframe:true})


// --- SCENE

const scenes = {
	real: new THREE.Scene(),
	wire: new THREE.Scene()
};

scenes.wire.overrideMaterial= wireframeMaterial

let size = { width: 0, height: 0 };

scenes.real.background = new THREE.Color(COLORS.background);
scenes.real.fog = new THREE.Fog(COLORS.background, 15, 20);

scenes.wire.background = new THREE.Color(COLORS.blue);
// const loader = new THREE.TextureLoader();
// const bgTexture = loader.load('https://threejsfundamentals.org/threejs/resources/images/daikanyama.jpg');
// scenes.wire.background = bgTexture;

const views = [
	{ height: 1, bottom: 0, scene: scenes.real, camera: null },
	{ height: 0, bottom: 0, scene: scenes.wire, camera: null }
];

// --- RENDERER

const renderer = new THREE.WebGLRenderer({
	antialias: true
});

renderer.physicallyCorrectLights = true;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ReinhardToneMapping;
renderer.toneMappingExposure = 5;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const container = document.querySelector(".canvas-container");
container.appendChild(renderer.domElement);

// --- CAMERA

let cameraTarget = new THREE.Vector3(0, 4, 0);

views.forEach(view=>{	
view.camera = new THREE.PerspectiveCamera(
	40,
	size.width / size.height,
	0.1,
	100
);
view.camera.position.set(0, 1, 0);

view.scene.add(view.camera);
})


// --- LIGHTS

const directionalLight = new THREE.DirectionalLight(COLORS.light, 2);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.normalBias = 0.05;
directionalLight.position.set(2, 5, 3);

scenes.real.add(directionalLight);

const hemisphereLight = new THREE.HemisphereLight(
	COLORS.sky,
	COLORS.ground,
	0.5
);
scenes.real.add(hemisphereLight);

// --- FLOOR

const plane = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ color: COLORS.ground });
const floor = new THREE.Mesh(plane, floorMaterial);
floor.receiveShadow = true;
floor.rotateX(-Math.PI * 0.5);

scenes.real.add(floor);

// --- ON RESIZE

const onResize = () => {
	size.width = container.clientWidth;
	size.height = container.clientHeight;

	views.forEach(view=>{
		view.camera.aspect = size.width / size.height;
		view.camera.updateProjectionMatrix();
	})

	renderer.setSize(size.width, size.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};

window.addEventListener("resize", onResize);
onResize();

// --- TICK

const points = [];

const clamp = (min, value, max) => Math.max(Math.min(max, value), min)

const updatePoints = () => {
	points.forEach(point => {
		const screenPosition = point.mesh.position.clone()
		screenPosition.setFromMatrixPosition( point.mesh.matrixWorld );
		screenPosition.project(views[0].camera)
		
		// const translateX = clamp(0, screenPosition.x + 0.5, 1)
		// const translateY = clamp(0, -screenPosition.y + 0.5, 1)
		
		const translateX = clamp(-50, screenPosition.x * 100 * 0.5, 50)
        const translateY = clamp(-50, -screenPosition.y * 100 * 0.5, 50)
				
		point.node.style.setProperty('--x', translateX);
		point.node.style.setProperty('--y', translateY);
	})
}

const tick = () => {
	views.forEach(view=>{
		view.camera.lookAt(cameraTarget);
		let bottom = size.height * view.bottom
		let height = size.height * view.height
		renderer.setViewport(0,0, size.width, size.height)
		renderer.setScissor(0, bottom, size.width, height)
		renderer.setScissorTest(true)
		renderer.render(view.scene, view.camera);
	})
	updatePoints();
	window.requestAnimationFrame(() => tick());
};

tick();


// console.log(GLTFLoader)

const models = {};
const clones = {}
let cameras = null
let witches = null
let bears = null

const hideLoading = () => {
	document.body.classList.add('ready')
	gsap.to('.loading', {y: '-150%', ease: 'power4.in', duration: 0.4 })
}

const setupAnimation = () => {
	
	hideLoading()
	
	cameras = {position: [views[0].camera.position, views[1].camera.position, ]}
	witches = {position: [models.witch.position, clones.witch.position],
			  rotation: [models.witch.rotation, clones.witch.rotation],}
	bears = {position: [models.bear.position, clones.bear.position], 
			rotation: [models.bear.rotation, clones.bear.rotation], }
	
	gsap.set(witches.position, {x :5})
	gsap.set(bears.position, {x :-5})
	
	const replay = () => {
		setTimeout(() => {
			handTL.play(0);
		}, 2000)
	}
	const handTL = gsap.timeline({repeat: 3, onComplete: replay});
	handTL.to('.hand', {y: 20, ease: 'power2.inOut', duration: 0.2})
	handTL.to('.hand', {y: 0, ease: 'power2.inOut', duration: 0.2})

	desktopAnimation()
	// ScrollTrigger.matchMedia({
	// 	"(prefers-reduced-motion: no-preference)": desktopAnimation
	// });
};

const desktopAnimation = () => {
	
	let section = 0;
	const tl = gsap.timeline({
		default: {
			duration: 1,
			ease: "power2.inOut"
		},
		scrollTrigger: {
			trigger: ".page",
			start: "top top",
			end: "bottom bottom",
			scrub: 0.1,
			markers: true
		}
	});
	
	// Title Section 	

	tl.to(witches.position, { x: 1.5 }, section);
	tl.to(witches.rotation, { y: PI * -0.3 }, section);
	tl.to(bears.position, { x: -1.5 }, section);
	tl.to(bears.rotation, { y: PI * 0.3 }, section);
	tl.to(cameraTarget, {y:1}, section)
	tl.to(cameras.position, {z:5, ease: "power2.out" }, section)

	// Bear Stats
	
	section += 1;
	tl.to(witches.position, { x: 5, ease: "power4.in" }, section);
	tl.to(bears.position, { z: 2 }, section);
	tl.to(views[1], {height:1,ease: 'none'}, section)

	// Witch Stats
	
	section += 1;
	section += 1;
	tl.to(witches.position, { x: 1, z: 2, ease: "power4.out" }, section);
	tl.to(bears.position, { z: 0, x: -5, ease: "power4.in" }, section);

	// Winner
	
	section += 1;
	section += 1;
	tl.to(witches.position, { x: 1, z: 0 }, section);
	tl.to(bears.position, { x: -1, z: 0 }, section);
	tl.to(views[1], { height: 0, bottom: 1, ease: 'none'}, section)
	
	
};

const LoadingManager = new THREE.LoadingManager(() => {
	console.log("LoadingManager");
	setupAnimation();
});

const gltfLoader = new GLTFLoader(LoadingManager);

const pointMaterial = new THREE.MeshBasicMaterial({color:'red'})
const pointGeometry = new THREE.SphereGeometry(0.05, 10, 10);

const toLoad = [
	{
		name: "witch",
		points: [
			{
				position: new THREE.Vector3(0, 1, 1),
				element: '#witch-stat-1'
			}
		],
		group: new THREE.Group(),
		file: "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/witch/model.gltf"
	},
	{
		name: "bear",
		points: [{
				position: new THREE.Vector3(0, 1, 1),
				element: '#bear-stat-1'
			}],
		group: new THREE.Group(),
		file: "https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/bear/model.gltf"
	}
];

toLoad.forEach((item) => {
	console.log(item.name);
	gltfLoader.load(item.file, (model) => {
		model.scene.traverse((child) => {
			if (child instanceof THREE.Mesh) {
				child.receiveShadow = true;
				child.castShadow = true;
			}
		});
		
		console.log(model.scene)
		
		item.group.add(model.scene);
		scenes.real.add(item.group);
		models[item.name] = item.group;
		const clone = item.group.clone()
		clones[item.name] = clone
		scenes.wire.add(clone);
		
		item.points.forEach(point => {
			const mesh = new THREE.Mesh(pointGeometry, pointMaterial)
			mesh.position.copy(point.position)
			item.group.add(mesh);
			
			points.push({
				mesh: mesh,
				node: document.querySelector(point.element)
			})
		})
		
	});
});
