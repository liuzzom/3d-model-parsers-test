# 3d-model-parsers-test
Test per la comparazione di parser Javascript di file OBJ. Sono stati creati tramite:
- WebGL
- Three.js
- A-Frame
- BabylonJS

## WebGL
- html: https://github.com/liuzzom/obj-parser-test/blob/main/webgl/webgl-obj.html
- js: https://github.com/liuzzom/obj-parser-test/blob/main/webgl/js/webgl-obj.js

## Three.js
- html: https://github.com/liuzzom/obj-parser-test/blob/main/threejs/three-obj.html
- js: https://github.com/liuzzom/obj-parser-test/blob/main/threejs/js/three-obj.js

## A-Frame
- html: https://github.com/liuzzom/obj-parser-test/blob/main/a-frame/a-frame-obj.html

## BabylonJS (OBJ)
- html: https://github.com/liuzzom/obj-parser-test/blob/main/babylonjs/babylon-obj/babylon-obj.html
- js: https://github.com/liuzzom/obj-parser-test/blob/main/babylonjs/babylon-obj/js/babylon-obj.js

## BabylonJS (glTF)
- html: https://github.com/liuzzom/obj-parser-test/blob/main/babylonjs/babylon-glTF/babylon-glTF.html
- js: https://github.com/liuzzom/obj-parser-test/blob/main/babylonjs/babylon-glTF/js/babylon-glTF.js

## Elenco Modifiche
- https://github.com/liuzzom/obj-parser-test/blob/main/Elenco%20dei%20commit.md

## Fonti
- WebGL Load Obj
      https://webglfundamentals.org/webgl/lessons/webgl-load-obj.html
- WebGL Load Obj with Mtl
      https://webglfundamentals.org/webgl/lessons/webgl-load-obj-w-mtl.html
- Three.js Loading a .OBJ File
      https://threejsfundamentals.org/threejs/lessons/threejs-load-obj.html

## TODO
- Studio formato glTF
    - Studio del formato (inserire in relazione)
    - Implementazione esempio:
        - Three.js
            - Refactoring
            - Relazione e considerazioni
        - A-Frame
            - Implementazione
            - Relazione e considerazioni
    - Considerazioni sui risultati
- Iniziare a progettare una logica di dominio:
    - Prendere in considerazione la possibilità di supportare modelli in formati multipli (obj+mat piuttosto che glTF) e librerie di rendering diverse (threejs piuttosto che a-frame, piuttosto che BabylonJS)
    - N.B.: non dovrai poi implementare necessariamente più di un provider (ma il backend deve essere predisposto per ciò
    - N.B.: non tutti i provider sono in grado di mostrare tutti i formati (i.e., compatibilità)
- Porting a TypeScript