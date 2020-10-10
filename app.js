const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/webgl-obj.html', function (req, res) {
    console.log('request for webgl-obj.html');
    res.sendFile(path.join(__dirname, 'webgl-obj.html'));
});

app.get('/webgl-mtl.html', function (req, res) {
    console.log('request for webgl-mtl.html');
    res.sendFile(path.join(__dirname, 'webgl-mtl.html'));
});

app.get('/three-obj.html', function (req, res) {
    console.log('request for three-obj.html');
    res.sendFile(path.join(__dirname, 'three-obj.html'));
});

app.use('/public', express.static(path.join(__dirname, 'public')));
app.use(express.static('.'));
