/**
 * Leaflet Map with addOnCLick
 */
var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3
});

var bounds = [[-26.5,-25], [1021.5,1023]];
var image = L.imageOverlay('/public/uqm_map_full.png', bounds).addTo(map);

map.fitBounds(bounds);

var sol = L.latLng([145, 175.2]);
L.marker(sol).addTo(map);
map.setView( [70, 120], 1);

function addMarkerOnMapClick(e) {
    console.log(e.latlng);

    var lat = e.latlng["lat"];
    var lng = e.latlng["lng"];
    
    var pos = L.latLng([lat, lng]);
    L.marker(pos).addTo(map);
}
map.on('click', addMarkerOnMapClick);

/**
 * get coordinates click canvas
 * PROBLEMA: canvas è 2D, come ottenere la terza dimensione ????
 */
function getCursorPosition(canvas, event) {
    // to handle only left clicks
    if(event.which != 1) return; 

    const rect = canvas.getBoundingClientRect()
    const x = event.clientX - rect.left
    const y = event.clientY - rect.top
    console.log("x: " + x + " y: " + y)
}

canvas.addEventListener('mousedown', function(e) {
    getCursorPosition(canvas, e)
})

/**
 * Three.js click handler
 */
var domEvents	= new THREEx.DomEvents(camera, renderer.domElement);
domEvents.addEventListener(scene, 'click', function(event){
  console.log(event.intersect.point);
});