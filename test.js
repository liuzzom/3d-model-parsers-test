import { Model } from './Model';
// let noSourceModel = new Model();
let oneSourceModel = new Model("src/file.gltf");
let moreSourcesModel = new Model("src/file.obj", "src/file.mtl");
console.log(oneSourceModel);
console.log(moreSourcesModel);
