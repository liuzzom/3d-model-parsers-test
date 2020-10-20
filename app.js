const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

var aframeDir = 'a-frame';
var threejsDir = 'threejs'
var webglDir = 'webgl';

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/webgl-obj.html', function (req, res) {
    console.log('request for webgl-obj.html');
    res.sendFile(path.join(__dirname, webglDir, 'webgl-obj.html'));
    console.log('redirect to ' + path.join(__dirname, webglDir, 'webgl-obj.html'));
});

app.get('/three-obj.html', function (req, res) {
    console.log('request for three-obj.html');
    res.sendFile(path.join(__dirname, threejsDir, 'three-obj.html'));
    console.log('redirect to' + path.join(__dirname, threejsDir, 'three-obj.html'));
});

app.get('/a-frame-obj.html', function (req, res) {
    console.log('request for a-frame-obj.html');
    res.sendFile(path.join(__dirname, 'a-frame', 'a-frame-obj.html'));
    console.log('redirect to ' + path.join(__dirname, aframeDir, 'a-frame-obj.html'));
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('.'));
