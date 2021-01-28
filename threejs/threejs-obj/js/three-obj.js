import * as THREE from '../../modules/common/three.module.js';
import { OrbitControls } from '../../modules/common/OrbitControls.js';
import { OBJLoader2 } from '../../modules/webgl/OBJLoader2.js';
import { MTLLoader } from '../../modules/webgl/MTLLoader.js';
import { MtlObjBridge } from '../../modules/webgl/MtlObjBridge.js';

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
    // Plane
    const planeSize = boxSize * 2;

    const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
    const planeMat = new THREE.MeshPhongMaterial({
        color: planeColor, // Used for a monochromatic plane
        side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);
    mesh.rotation.x = Math.PI * -.5;
    mesh.position.y = -0.2; // FIX: hardcoded value
    scene.add(mesh);
}

function renderModelWithMaterial(objectPath, materialPath, usePlane, planeColor, scene, camera, controls) {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(materialPath, (mtlParseResult) => {
        const objLoader = new OBJLoader2();
        const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);

        // Set the material called "Material" as double-sided
        // Efficient but strongly coupled with the actual mtl file
        // if (materials.Material) {
        //   materials.Material.side = THREE.DoubleSide;
        // }

        // Set EVERY material as double-sided
        // Works for every mtl file (or at least it should) but makes the rendering process heavier
        for (const material of Object.values(materials)) {
            material.side = THREE.DoubleSide;
        }

        objLoader.addMaterials(materials);
        objLoader.load(objectPath, (root) => {
            scene.add(root);

            // compute the box that contains all the stuff
            // from root and below
            const box = new THREE.Box3().setFromObject(root);

            const boxSize = box.getSize(new THREE.Vector3()).length();
            const boxCenter = box.getCenter(new THREE.Vector3());

            // set the camera to frame the box
            frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

            // update the Trackball controls to handle the new size
            controls.maxDistance = boxSize * 10;
            controls.target.copy(boxCenter);
            controls.update();

            if (usePlane) {
                if (planeColor) {
                    addPlane(boxSize, scene, planeColor);
                } else {
                    addPlane(boxSize, scene, '#1A1A1A')
                }
            }
        });
    });
}

function renderModelWithoutMaterial(objectPath, usePlane, planeColor, scene, camera, controls) {

    const objLoader = new OBJLoader2();
    objLoader.load(objectPath, (root) => {
        scene.add(root);
        // compute the box that contains all the stuff
        // from root and below
        const box = new THREE.Box3().setFromObject(root);

        const boxSize = box.getSize(new THREE.Vector3()).length();
        const boxCenter = box.getCenter(new THREE.Vector3());

        // set the camera to frame the box
        frameArea(boxSize * 1.2, boxSize, boxCenter, camera);

        // update the Trackball controls to handle the new size
        controls.maxDistance = boxSize * 10;
        controls.target.copy(boxCenter);
        controls.update();

        if (usePlane) {
            if (planeColor) {
                addPlane(boxSize, scene, planeColor);
            } else {
                addPlane(boxSize, scene, '#1A1A1A')
            }
        }

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

    if (modelParams.materialPath) {
        renderModelWithMaterial(modelParams.objectPath, modelParams.materialPath, modelParams.usePlane, modelParams.planeColor, scene, camera, controls);
    } else {
        renderModelWithoutMaterial(modelParams.objectPath, modelParams.usePlane, modelParams.planeColor, scene, camera, controls);
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

    // Click Handler
    var domEvents = new THREEx.DomEvents(camera, renderer.domElement);
    var mouseDownTime = undefined;

    function clickHandler(event) {
        let point = event.intersect.point;
        let pointString = point.x.toFixed(3) + ", " + point.y.toFixed(3) + ", " + point.z.toFixed(3);
        console.log("Click at: " + pointString);

        let trigger = true;
        if (trigger) {
            const geometry = new THREE.CircleGeometry(0.25, 32); // TO FIX: hard-coded value
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
        console.log("time diff: " + timeDiff);

        // if press and release occur within 150 ms
        //  we consider the event as a click
        if (timeDiff <= 150) {
            console.log("click");
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

renderModel({
    selector: '#c',
    objectPath: '../public/Windmill/windmill.obj',
    materialPath: '../public/Windmill/windmill-fixed.mtl',
    background: 'black',
    usePlane: true,
    planeColor: '#1A1A1A'
});