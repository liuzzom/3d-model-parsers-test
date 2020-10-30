var canvas = document.getElementById("renderCanvas");

var engine = null;
var scene = null;
var sceneToRender = null;

function createDefaultEngine() {
  return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
};

function delayCreateScene(){
  // Create a scene.
  var scene = new BABYLON.Scene(engine);

  // Create a default skybox with an environment.
  var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("public/textures/environment.dds", scene);
  var currentSkybox = scene.createDefaultSkybox(hdrTexture, true);

  // Append glTF model to scene.
  BABYLON.SceneLoader.Append("public/BoomBox/", "BoomBox.gltf", scene, function (scene) {
    // Create a default arc rotate camera and light.
    scene.createDefaultCameraOrLight(true, true, true);
    scene.clearColor = BABYLON.Color3.Black();

    // The default camera looks at the back of the asset.
    // Rotate the camera by 180 degrees to the front of the asset.
    scene.activeCamera.alpha += Math.PI;
  });

  return scene;
};

try {
  engine = createDefaultEngine();
} catch (e) {
  console.log("the available createEngine function failed. Creating the default engine instead");
  engine = createDefaultEngine();
}
if (!engine) throw 'engine should not be null.';

scene = delayCreateScene();;
sceneToRender = scene

engine.runRenderLoop(function () {
  if (sceneToRender && sceneToRender.activeCamera) {
    sceneToRender.render();
  }
});

// Resize
window.addEventListener("resize", function () {
  engine.resize();
});