console.log("test.js works");

var map = L.map('map', {
    renderer: L.canvas()
});

var line = L.polyline( coordinates, { renderer: myRenderer } );
var circle = L.circle( center, { renderer: myRenderer } );
