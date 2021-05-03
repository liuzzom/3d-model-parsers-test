AFRAME.registerComponent('position-setter', {
    init: function () {
        this.el.addEventListener('model-loaded', () => {
            // compute the box that contains the model
            const box = new THREE.Box3().setFromObject(document.getElementById("model").object3D);
            const boxSizes = box.getSize(new THREE.Vector3());

            // compute the max size of the box (x, y, z)
            // it will be used to set model position
            let maxBoxSize = Math.max(boxSizes.x, boxSizes.y, boxSizes.z);

            let model = document.getElementById("model");
            model.setAttribute("position", `0 0 -${1.2 * maxBoxSize}`);
        })
    }
})

AFRAME.registerComponent("click-handler", {
    init: function () {
        let mouseDownTime = undefined;

        function clickHandler(event) {
            let point = event.detail.intersection.point
            let pointString = point.x.toFixed(3) + " " + point.y.toFixed(3) + " " + point.z.toFixed(3);
            console.log("Click at: " + pointString);

            showPointer(point);
        }

        this.el.addEventListener("mousedown", event => {
            mouseDownTime = new Date().getTime();
        });

        this.el.addEventListener("mouseup", event => {
            let mouseUpTime = new Date().getTime();
            // compute the difference between press and release
            let timeDiff = mouseUpTime - mouseDownTime;

            // if press and release occur within 150 ms
            //  we consider the event as a click
            if (timeDiff <= 150) {
                // console.log("click detected");
                clickHandler(event);
            }
        })
    }
});

function showPointer(pointer) {
    let pointString = pointer.x.toFixed(3) + " " + pointer.y.toFixed(3) + " " + pointer.z.toFixed(3);
    console.log(pointString);

    // compute the box that contains the model
    const box = new THREE.Box3().setFromObject(document.getElementById("model").object3D);
    const boxSizes = box.getSize(new THREE.Vector3());
    // compute the min size of the box (x, y, z)
    // it will be used to set pointer radius
    let minBoxSize = Math.min(boxSizes.x, boxSizes.y, boxSizes.z);
    let radius = minBoxSize / 25;
    // let radius = 0.208;
    // console.log(boxSizes);
    console.log(radius);

    let scene = document.getElementById("scene");
    let marker = document.createElement("a-sphere");

    marker.setAttribute("class", "pointer");
    marker.setAttribute("radius", radius.toString());
    marker.setAttribute("color", "#CC0000");
    marker.setAttribute("position", pointString);

    scene.appendChild(marker);
}

function main(){
    // Mocked Pointers
    const pointers = [
        {x: 2.326, y: 9.048, z: -12.392},
        {x: 2.380, y: 5.220, z: -10.323},
    ]

    // Wait for some time and then call showPointer for every pointer
    setTimeout(() => {
        for(let pointer of pointers){
            showPointer(pointer);
        }
    }, 125);
}
main();
