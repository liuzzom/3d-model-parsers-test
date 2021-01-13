// See https://leafletjs.com/examples/layers-control/ for furhter informations

var littleton = L.marker([39.61, -105.02]).bindPopup('This is Littleton, CO.'),
  denver = L.marker([39.74, -104.99]).bindPopup('This is Denver, CO.'),
  aurora = L.marker([39.73, -104.8]).bindPopup('This is Aurora, CO.'),
  golden = L.marker([39.77, -105.23]).bindPopup('This is Golden, CO.');
// cities layer that combines your city markers into one layer you can add or remove from the map at once
var cities = L.layerGroup([littleton, denver, aurora, golden]);

/**
 * There are two types of layers:
 * - base layers that are mutually exclusive (e.g. tile layers)
 * - overlays
 * 
 * In this example, we have:
 * - two base layers (a grayscale and a colored base map) to switch between
 * - an overlay to switch on and off: the city markers we created earlier.
 */

var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
  'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
  mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

// create those base layers and add the default ones to the map
var grayscale = L.tileLayer(mbUrl, { id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr }),
  streets = L.tileLayer(mbUrl, { id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr });

var map = L.map('map', {
  center: [39.73, -104.99],
  zoom: 10,
  layers: [grayscale, cities]
});

var baseLayers = {
  "Grayscale": grayscale,
  "Streets": streets
};

var overlays = {
  "Cities": cities
};

// create a Layers Control and add it to the map (see also https://leafletjs.com/reference-1.7.1.html#control-layers)
L.control.layers(baseLayers, overlays).addTo(map);