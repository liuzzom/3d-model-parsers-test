// ---- Map Definition ----
var map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3
});

// ---- Coordinates Conversion Function ----
var yx = L.latLng;

var xy = function (x, y) {
    if (L.Util.isArray(x)) {    // When doing xy([x, y]);
        return yx(x[1], x[0]);
    }
    return yx(y, x);  // When doing xy(x, y);
};

// ---- Image Loading ----
var bounds = [xy(-25, -26.5), xy(1023, 1021.5)];
var image = L.imageOverlay('/public/uqm_map_full.png', bounds).addTo(map);

// ---- Create some Marker ----
var sol = xy(175.2, 145.0);
var mizar = xy(41.6, 130.1);
var kruegerZ = xy(13.4, 56.5);
var deneb = xy(218.7, 8.3);

L.marker(sol).addTo(map).bindPopup('Sol');
L.marker(mizar).addTo(map).bindPopup('Mizar');
L.marker(kruegerZ).addTo(map).bindPopup('Krueger-Z');
L.marker(deneb).addTo(map).bindPopup('Deneb');

var travel = L.polyline([sol, deneb]).addTo(map);

map.setView(xy(120, 70), 1);

// ---- Event ----
var popup = L.popup();

function onMapClick(e) {
    console.log("clicked on: " + e.latlng);
    
    // popup
    //     .setLatLng(e.latlng)
    //     .setContent("You clicked the map at " + e.latlng.toString())
    //     .openOn(map);

    // var lat = e.latlng["lat"];
    // var lng = e.latlng["lng"];
    
    // var pos = L.latLng([lat, lng]);
    // L.marker(pos).addTo(map);
}

map.on('click', onMapClick);