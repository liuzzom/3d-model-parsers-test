# obj-parser-test
Test per la comparazione di parser Javascript di file OBJ. Sono stati creati tramite:
- WebGL
- Three.js
- A-Frame (Coming Soon)

## WebGL
- html: https://github.com/liuzzom/obj-parser-test/blob/main/webgl/webgl-obj.html
- js: https://github.com/liuzzom/obj-parser-test/blob/main/webgl/js/webgl-obj.js

## Three.js
- html: https://github.com/liuzzom/obj-parser-test/blob/main/threejs/three-obj.html
- js: https://github.com/liuzzom/obj-parser-test/blob/main/threejs/js/three-obj.js

## A-Frame (Coming Soon...)
- html: https://github.com/liuzzom/obj-parser-test/blob/main/a-frame/a-frame-obj.html

## Elenco Modifiche
- 10/10/2020-01:
    - Creazione cartella js
    - Creazione .gitignore
    - Creazione index.html
    - Modifica posizione camera webgl-mtl.js (const radius = m4.length(range) * 1.2;)
- 10/10/2020-02:
    - Aggiornamento README
- 14/10/2020-01:
    - Creazione a-frame-obj
- 15/10/2020-01:
    - Rimozione Esempio OBJ senza MTL
    - Utilizzo di File OBJ e MTL locali
- 20/10/2020-01:
    - Modifica struttura delle cartelle
    - Modifica alla creazione del piano d'appoggio nel parser Three.js (Creata funzione addPlane)
    - Modifica ai parametri dell'oggetto nella chiamata a renderModel (Parser Three.js)

## Fonti
- WebGL Load Obj
      https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
- WebGL Load Obj with Mtl
      https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
- Three.js Loading a .OBJ File
      https://threejsfundamentals.org/threejs/lessons/threejs-load-obj.html

## TODO
- Task definiti nella mail
- Vedere funzionamento Camera e rotazione WebGL
- Relazione Parser A-Frame
- Analisi Problema Gestione .MTL A-Frame
