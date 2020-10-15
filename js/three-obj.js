import * as THREE from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/build/three.module.js';
import { OrbitControls } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/controls/OrbitControls.js';
import { OBJLoader2 } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/OBJLoader2.js';
import { MTLLoader } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/MTLLoader.js';
import { MtlObjBridge } from 'https://threejsfundamentals.org/threejs/resources/threejs/r119/examples/jsm/loaders/obj2/bridge/MtlObjBridge.js';

// TODO: vedere a che serve e come funziona
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

function renderModelWithMaterial(objectPath, materialPath, scene, camera, controls) {

  {
    const mtlLoader = new MTLLoader();
    mtlLoader.load(materialPath, (mtlParseResult) => {
      const objLoader = new OBJLoader2();
      const materials = MtlObjBridge.addMaterialsFromMtlLoader(mtlParseResult);
      if (materials.Material) {
        console.log(materials.Material);
        materials.Material.side = THREE.DoubleSide;
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


        // PAVIMENTO
        // const planeSize = boxSize * 2;
        // console.log(planeSize);

        // const loader = new THREE.TextureLoader();
        // const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
        // texture.wrapS = THREE.RepeatWrapping;
        // texture.wrapT = THREE.RepeatWrapping;
        // texture.magFilter = THREE.NearestFilter;
        // const repeats = 20;
        // texture.repeat.set(repeats, repeats);

        // const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
        // const planeMat = new THREE.MeshPhongMaterial({
        //   map: texture,
        //   side: THREE.DoubleSide,
        // });
        // const mesh = new THREE.Mesh(planeGeo, planeMat);
        // mesh.rotation.x = Math.PI * -.5;
        // scene.add(mesh);
      });
    });
  }
}

function renderModelWithoutMaterial(objectPath, scene, camera, controls) {

  {
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

      // PAVIMENTO
      // const planeSize = boxSize * 2;
      // console.log(planeSize);

      // const loader = new THREE.TextureLoader();
      // const texture = loader.load('https://threejsfundamentals.org/threejs/resources/images/checker.png');
      // texture.wrapS = THREE.RepeatWrapping;
      // texture.wrapT = THREE.RepeatWrapping;
      // texture.magFilter = THREE.NearestFilter;
      // const repeats = 20;
      // texture.repeat.set(repeats, repeats);

      // const planeGeo = new THREE.PlaneBufferGeometry(planeSize, planeSize);
      // const planeMat = new THREE.MeshPhongMaterial({
      //   map: texture,
      //   side: THREE.DoubleSide,
      // });
      // const mesh = new THREE.Mesh(planeGeo, planeMat);
      // mesh.rotation.x = Math.PI * -.5;
      // scene.add(mesh);
    });
  }
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
  if (modelParams.background){
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
    renderModelWithMaterial(modelParams.objectPath, modelParams.materialPath, scene, camera, controls);
  } else {
    renderModelWithoutMaterial(modelParams.objectPath, scene, camera, controls);
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

// TODO: vedere come viene gestita la dimensione del canvas
renderModel({
  selector : '#c',
  objectPath: 'https://threejsfundamentals.org/threejs/resources/models/windmill/windmill.obj',
  materialPath: 'https://threejsfundamentals.org/threejs/resources/models/windmill/windmill-fixed.mtl',
  background: 'black'
});