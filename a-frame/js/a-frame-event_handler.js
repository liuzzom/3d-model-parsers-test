AFRAME.registerComponent("click-handler", {
    init: function () {
        var mouseDownTime = undefined;

        function clickHandler(event) {
            let point = event.detail.intersection.point
            let pointString = point.x.toFixed(3) + " " + point.y.toFixed(3) + " " + point.z.toFixed(3);
            console.log("Click at: " + pointString);

            let trigger = true
            if(trigger) {
                let scene = document.getElementById("scene");
                var marker = document.createElement("a-circle");
                scene.appendChild(marker)
                
                marker.setAttribute("class", "marker");
                marker.setAttribute("radius", "0.25");
                marker.setAttribute("color", "#EF2D5E");
                marker.setAttribute("position", pointString);
            }
        }

        this.el.addEventListener("mousedown", event => {
            mouseDownTime = new Date().getTime();
        })

        this.el.addEventListener("mouseup", event => {
            var mouseUpTime = new Date().getTime();
            // compute the difference between press and release
            var timeDiff = mouseUpTime - mouseDownTime;

            // if press and release occur within 150 ms
            //  we consider the event as a click
            if(timeDiff <= 150){
                console.log("click");
                clickHandler(event);
            }
        })
    }
})