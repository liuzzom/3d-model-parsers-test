function createDefaultEngine(canvas) {
  return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
};

function delayCreateScene(engine, modelFolder, modelFile) {
  // Create a scene.
  var scene = new BABYLON.Scene(engine);

  // Create a default skybox with an environment.
  // var hdrTexture = BABYLON.CubeTexture.CreateFromPrefilteredData("public/textures/environment.dds", scene);
  // var currentSkybox = scene.createDefaultSkybox(hdrTexture, true);

  // Append glTF model to scene.
  BABYLON.SceneLoader.Append(modelFolder, modelFile, scene, function (scene) {
    // Create a default arc rotate camera and light.
    scene.createDefaultCameraOrLight(true, true, true);
    scene.clearColor = BABYLON.Color3.Black();

    // The default camera looks at the back of the asset.
    // Rotate the camera by 180 degrees to the front of the asset.
    scene.activeCamera.alpha += Math.PI;
  });

  return scene;
};


function main() {
  var canvas = document.getElementById("renderCanvas");
  var modelPath = canvas.getAttribute("model-path");

  var engine = null;
  var scene = null;
  var sceneToRender = null;
  
  try {
    engine = createDefaultEngine(canvas);
  } catch (e) {
    console.log("the available createEngine function failed. Creating the default engine instead");
    engine = createDefaultEngine(canvas);
  }
  if (!engine) throw 'engine should not be null.';

  var pathElems = modelPath.split("/");
  var modelFile = pathElems.pop();
  var modelFolder = pathElems.join("/") + "/";
  console.log(modelFile);
  console.log(modelFolder);

  scene = delayCreateScene(engine, modelFolder, modelFile);
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
}

main();