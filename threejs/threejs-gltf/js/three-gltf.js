// Three.js - Load .GLTF
// from https://threejsfundamentals.org/threejs/threejs-load-gltf.html

import * as THREE from '../../modules/common/three.module.js';
import { OrbitControls } from '../../modules/common/OrbitControls.js';
import { GLTFLoader } from '../../modules/gltf/GLTFLoader.js';
import { THREEx } from "../../modules/threex.domevents.js";

// will be use to set the pointer radius
var minBoxSize = undefined;

function frameArea(sizeToFitOnScreen, boxSize, boxCenter, camera) {
	const halfSizeToFitOnScreen = sizeToFitOnScreen * 0.5;
	const halfFovY = THREE.MathUtils.degToRad(camera.fov * .5);
	const distance = halfSizeToFitOnScreen / Math.tan(halfFovY);
	// compute a unit vector that points in the direction the camera is now
	// in the xz plane from the center of the box
	const direction = (new THREE.Vector3())
		.subVectors(camera.position, boxCenter)
		.multiply(new THREE.Vector3(1, 0, 1))
		.normalize();

	// move the camera to a position distance units way from the center
	// in whatever direction the camera was from the center already
	camera.position.copy(direction.multiplyScalar(distance).add(boxCenter));

	// pick some near and far values for the frustum that
	// will contain the box.
	camera.near = boxSize / 100;
	camera.far = boxSize * 100;

	camera.updateProjectionMatrix();

	// point the camera to look at the center of the box
	camera.lookAt(boxCenter.x, boxCenter.y, boxCenter.z);
}

function addPlane(boxSize, scene, planeColor) {
	const planeSize = boxSize * 2;

	const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
	const planeMat = new THREE.MeshPhongMaterial({
		color: planeColor,
		side: THREE.DoubleSide,
	});
	const mesh = new THREE.Mesh(planeGeo, planeMat);
	mesh.rotation.x = Math.PI * -.5;
	mesh.position.y = -0.01; // FIX: hardcoded value
	scene.add(mesh);
}

function loadModel(objectPath, scene, camera, controls) {
	const gltfLoader = new GLTFLoader();

	gltfLoader.load(objectPath, (gltf) => {
		const root = gltf.scene;
		scene.add(root);

		// compute the box that contains all the stuff
		// from root and below
		const box = new THREE.Box3().setFromObject(root);

		const boxSize = box.getSize(new THREE.Vector3()).length();
		const boxSizes = box.getSize(new THREE.Vector3());
		minBoxSize = Math.min(boxSizes.x, boxSizes.y, boxSizes.z);

		const boxCenter = box.getCenter(new THREE.Vector3());

		// set the camera to frame the box
		frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

		// update the Trackball controls to handle the new size
		controls.maxDistance = boxSize * 10;
		controls.target.copy(boxCenter);
		controls.update();
	});
}

function renderModel(modelParams) {
	const canvas = document.querySelector(modelParams.selector);
	const renderer = new THREE.WebGLRenderer({ canvas });

	const fov = 45;
	const aspect = 2;  // the canvas default
	const near = 0.1;
	const far = 100;
	const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
	camera.position.set(0, 10, 20);

	const controls = new OrbitControls(camera, canvas);
	controls.target.set(0, 5, 0);
	controls.update();

	const scene = new THREE.Scene();
	if (modelParams.background) {
		scene.background = new THREE.Color(modelParams.background);
	} else {
		// set default color
		scene.background = new THREE.Color('#333333');
	}

	{
		const skyColor = 0xB1E1FF;  // light blue
		const groundColor = 0xB97A20;  // brownish orange
		const intensity = 1;
		const light = new THREE.HemisphereLight(skyColor, groundColor, intensity);
		scene.add(light);
	}

	{
		const color = 0xFFFFFF;
		const intensity = 1;
		const light = new THREE.DirectionalLight(color, intensity);
		light.position.set(5, 10, 2);
		scene.add(light);
		scene.add(light.target);
	}

	loadModel(modelParams.objectPath, scene, camera, controls);

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

	// Click Handler
	var domEvents = new THREEx.DomEvents(camera, renderer.domElement);
	var mouseDownTime = undefined;

	function clickHandler(event) {
		let point = event.intersect.point;

		let trigger = true;
		if (trigger) {
			const geometry = new THREE.SphereGeometry(minBoxSize/25, 32, 32); // FIX: hard-coded division value
			const material = new THREE.MeshBasicMaterial({ color: 0xcc0000 });
			const circle = new THREE.Mesh(geometry, material);
			circle.position.x = point.x.toFixed(3);
			circle.position.y = point.y.toFixed(3);
			circle.position.z = point.z.toFixed(3);

			scene.add(circle);
		}
	}

	domEvents.addEventListener(scene, 'mousedown', function (event) {
		mouseDownTime = new Date().getTime();
	});

	domEvents.addEventListener(scene, 'mouseup', function (event) {
		var mouseUpTime = new Date().getTime();
		// compute the difference between press and release
		var timeDiff = mouseUpTime - mouseDownTime;

		// if press and release occur within 150 ms
		//  we consider the event as a click
		if (timeDiff <= 150) {
			clickHandler(event);
		}
	});

	function render() {
		if (resizeRendererToDisplaySize(renderer)) {
			const canvas = renderer.domElement;
			camera.aspect = canvas.clientWidth / canvas.clientHeight;
			camera.updateProjectionMatrix();
		}

		renderer.render(scene, camera);

		requestAnimationFrame(render);
	}

	requestAnimationFrame(render);
}

function main() {
	const canvas = document.querySelector('#c');
	const modelPath = canvas.getAttribute("model-path");

	if (!modelPath) {
		console.error("No model-path value");
		return;
	}

	renderModel({
		selector: '#c',
		objectPath: modelPath,
		background: 'black',
	});
}


main();
