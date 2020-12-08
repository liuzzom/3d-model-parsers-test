const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// -----------------------------------------------------------------------------------------------

var aframeDir = 'a-frame';

var threejsDir = 'threejs';
var threejsObjDir = path.join(threejsDir, 'threejs-obj');
var threejsgltfDir = path.join(threejsDir, 'threejs-gltf');

var webglDir = 'webgl';

var babylonDir = 'babylonjs';
var babylonObjDir = path.join(babylonDir, 'babylon-obj');
var babylonglTFDir = path.join(babylonDir, 'babylon-glTF');

// -----------------------------------------------------------------------------------------------

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'index.html'));
});

// ---------- WebGL -----------------------------------------------------------------------------

app.get('/webgl-obj.html', function (req, res) {
	console.log('request for webgl-obj.html');
	res.sendFile(path.join(__dirname, webglDir, 'webgl-obj.html'));
	console.log('redirect to ' + path.join(__dirname, webglDir, 'webgl-obj.html'));
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

// -----------------------------------------------------------------------------------------------

app.get('/test.html', function(req, res){
	console.log('request for test.html');
	res.sendFile(path.join(__dirname, 'test.html'));
	console.log('redirect to ' + path.join(__dirname, 'test.html'));
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('.'));
