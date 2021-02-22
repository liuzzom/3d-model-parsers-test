AFRAME.registerComponent('position-setter', {
    init: function () {
        this.el.addEventListener('model-loaded', () => {
            // compute the box that contains the model
            const box = new THREE.Box3().setFromObject(document.getElementById("model").object3D);
            const boxSizes = box.getSize(new THREE.Vector3());

            // compute the max size of the box (x, y, z)
            // it will be used to set model position
            let maxBoxSize = Math.max(boxSizes.x, boxSizes.y, boxSizes.z);

            console.log(boxSizes)

            let model = document.getElementById("model");
            model.setAttribute("position", `0 0 -${1.2 * maxBoxSize}`);
        })
    }
})

AFRAME.registerComponent("click-handler", {
    init: function () {
        var mouseDownTime = undefined;

        function clickHandler(event) {
            let point = event.detail.intersection.point
            let pointString = point.x.toFixed(3) + " " + point.y.toFixed(3) + " " + point.z.toFixed(3);
            // console.log("Click at: " + pointString);

            // compute the box that contains the model
            const box = new THREE.Box3().setFromObject(document.getElementById("model").object3D);
            const boxSizes = box.getSize(new THREE.Vector3());
            // compute the min size of the box (x, y, z)
            // it will be used to set pointer radius
            let minBoxSize = Math.min(boxSizes.x, boxSizes.y, boxSizes.z);
            let radius = minBoxSize / 25;

            let trigger = false;
            if (trigger) {
                let scene = document.getElementById("scene");
                var marker = document.createElement("a-sphere");
                scene.appendChild(marker)

                marker.setAttribute("class", "pointer");
                marker.setAttribute("radius", radius);
                marker.setAttribute("color", "#CC0000");
                marker.setAttribute("position", pointString);
            }
        }

        this.el.addEventListener("mousedown", event => {
            mouseDownTime = new Date().getTime();
        });

        this.el.addEventListener("mouseup", event => {
            var mouseUpTime = new Date().getTime();
            // compute the difference between press and release
            var timeDiff = mouseUpTime - mouseDownTime;

            // if press and release occur within 150 ms
            //  we consider the event as a click
            if (timeDiff <= 150) {
                // console.log("click detected");
                clickHandler(event);
            }
        })
    }
});