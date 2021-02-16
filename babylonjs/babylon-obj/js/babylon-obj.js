function createDefaultEngine(canvas) {
    return new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
}

function delayCreateScene(engine) {
    // Create a scene.
    var scene = new BABYLON.Scene(engine);

    // Append glTF model to scene.
    BABYLON.SceneLoader.Append("public/Windmill/", "windmill.obj", scene, function (scene) {
        BABYLON.OBJFileLoader.OPTIMIZE_WITH_UV = true;
        // Create a default arc rotate camera and light.
        scene.createDefaultCameraOrLight(true, true, true);
        scene.clearColor = BABYLON.Color3.Black();

        // The default camera looks at the back of the asset.
        // Rotate the camera by 180 degrees to the front of the asset.
        scene.activeCamera.alpha += Math.PI;
    });

    return scene;
}


function main() {
    var canvas = document.getElementById("renderCanvas");

    var engine = null;
    var scene = null;
    var sceneToRender = null;

    try {
        engine = createDefaultEngine(canvas);
    } catch (e) {
        console.warn("the available createEngine function failed. Creating the default engine instead");
        engine = createDefaultEngine(canvas);
    }
    if (!engine) throw 'engine should not be null.';

    scene = delayCreateScene(engine);
    sceneToRender = scene;

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