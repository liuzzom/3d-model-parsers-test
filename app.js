const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// -----------------------------------------------------------------------------------------------

const aframeDir = 'a-frame';

const threejsDir = 'threejs';
const threejsObjDir = path.join(threejsDir, 'threejs-obj');
const threejsgltfDir = path.join(threejsDir, 'threejs-gltf');

const webglDir = 'webgl';

const babylonDir = 'babylonjs';
const babylonObjDir = path.join(babylonDir, 'babylon-obj');
const babylonglTFDir = path.join(babylonDir, 'babylon-glTF');

const leafletDir = 'leaflet';

const modelViewerDir = 'model-viewer';

// -----------------------------------------------------------------------------------------------

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/', (req, res) => {
	console.log("request for index page");
	res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------- WebGL -----------------------------------------------------------------------------

app.get('/webgl-obj.html', function (req, res) {
	console.log('request for webgl-obj.html');
	res.sendFile(path.join(__dirname, webglDir, 'webgl-obj.html'));
	console.log('redirect to ' + path.join(__dirname, webglDir, 'webgl-obj.html'));
});

app.get('/webgl-leaflet-obj.html', function (req, res) {
	console.log('request for webgl-leaflet-obj.html');
	res.sendFile(path.join(__dirname, webglDir, 'webgl-leaflet-obj.html'));
	console.log('redirect to ' + path.join(__dirname, webglDir, 'webgl-leaflet-obj.html'));
});

// ---------- Three.js --------------------------------------------------------------------------

app.get('/three-obj.html', function (req, res) {
	console.log('request for three-obj.html');
	res.sendFile(path.join(__dirname, threejsObjDir, 'three-obj.html'));
	console.log('redirect to' + path.join(__dirname, threejsObjDir, 'three-obj.html'));
});

app.get('/three-gltf.html', function (req, res) {
	console.log('request for three-gltf.html');
	res.sendFile(path.join(__dirname, threejsgltfDir, 'three-gltf.html'));
	console.log('redirect to' + path.join(__dirname, threejsgltfDir, 'three-gltf.html'));
});

app.get('/three-gltf-big.html', function (req, res) {
	console.log('request for three-gltf-big.html');
	res.sendFile(path.join(__dirname, threejsgltfDir, 'three-gltf-big.html'));
	console.log('redirect to' + path.join(__dirname, threejsgltfDir, 'three-gltf-big.html'));
});

// ---------- A-Frame ---------------------------------------------------------------------------

app.get('/a-frame-obj.html', function (req, res) {
	console.log('request for a-frame-obj.html');
	res.sendFile(path.join(__dirname, aframeDir, 'a-frame-obj.html'));
	console.log('redirect to ' + path.join(__dirname, aframeDir, 'a-frame-obj.html'));
});

app.get('/a-frame-glTF.html', function (req, res) {
	console.log('request for a-frame-glTF.html');
	res.sendFile(path.join(__dirname, aframeDir, 'a-frame-glTF.html'));
	console.log('redirect to ' + path.join(__dirname, aframeDir, 'a-frame-glTF.html'));
});

app.get('/a-frame-glTF-big.html', function (req, res) {
	console.log('request for a-frame-glTF-big.html');
	res.sendFile(path.join(__dirname, aframeDir, 'a-frame-glTF-big.html'));
	console.log('redirect to ' + path.join(__dirname, aframeDir, 'a-frame-glTF-big.html'));
});

// ---------- Babylon.js ------------------------------------------------------------------------

app.get('/babylon-obj.html', function (req, res) {
	console.log('request for babylon-obj.html');
	res.sendFile(path.join(__dirname, babylonObjDir, 'babylon-obj.html'));
	console.log('redirect to ' + path.join(__dirname, babylonObjDir, 'babylon-obj.html'));
});

app.get('/babylon-glTF.html', function (req, res) {
	console.log('request for babylon-glTF.html');
	res.sendFile(path.join(__dirname, babylonglTFDir, 'babylon-glTF.html'));
	console.log('redirect to ' + path.join(__dirname, babylonglTFDir, 'babylon-glTF.html'));
});

app.get('/babylon-glTF-big.html', function (req, res) {
	console.log('request for babylon-glTF-big.html');
	res.sendFile(path.join(__dirname, babylonglTFDir, 'babylon-glTF-big.html'));
	console.log('redirect to ' + path.join(__dirname, babylonglTFDir, 'babylon-glTF-big.html'));
});

// ---------- Leaflet ------------------------------------------------------------------------

app.get('/simple_leaflet.html', function (req, res) {
	console.log('request for simple_leaflet.html');
	res.sendFile(path.join(__dirname, leafletDir, 'simple_leaflet.html'));
	console.log('redirect to ' + path.join(__dirname, leafletDir, 'simple_leaflet.html'));
});

app.get('/fullscreen_with_geo.html', function (req, res) {
	console.log('request for fullscreen_with_geo.html');
	res.sendFile(path.join(__dirname, leafletDir, 'fullscreen_with_geo.html'));
	console.log('redirect to ' + path.join(__dirname, leafletDir, 'fullscreen_with_geo.html'));
});

app.get('/layers_control.html', function (req, res) {
	console.log('request for layers_control.html');
	res.sendFile(path.join(__dirname, leafletDir, 'layers_control.html'));
	console.log('redirect to ' + path.join(__dirname, leafletDir, 'layers_control.html'));
});

app.get('/non_geo_map.html', function (req, res) {
	console.log('request for non_geo_map.html');
	res.sendFile(path.join(__dirname, leafletDir, 'non_geo_map.html'));
	console.log('redirect to ' + path.join(__dirname, leafletDir, 'non_geo_map.html'));
});


// ---------- model-viewer -----------------------------------------------------------------------

app.get('/astronaut.html', function (req, res) {
	console.log('request for astronaut.html');
	res.sendFile(path.join(__dirname, modelViewerDir, 'astronaut.html'));
	console.log('redirect to ' + path.join(__dirname, 'model-viewer', 'astronaut.html'));
});

// -----------------------------------------------------------------------------------------------

app.get('/test.html', function(req, res){
	console.log('request for test.html');
	res.sendFile(path.join(__dirname, 'test.html'));
	console.log('redirect to ' + path.join(__dirname, 'test.html'));
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('.'));
