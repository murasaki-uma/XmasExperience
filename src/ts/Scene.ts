import SceneManager from "./SceneManager";
import Simplex from "../../node_modules/perlin-simplex";
declare function require(x: string): any;
import * as THREE from 'three'
import LineCharacter from "./LineCharacter";

export default class Scene {
    camera:THREE.PerspectiveCamera;
    orthoCamera:THREE.OrthographicCamera;
    scene:THREE.Scene;

    sceneManager:SceneManager;
    simplex:Simplex;
    constructor(scenemanager:SceneManager)
    {

        this.sceneManager = scenemanager;
        this.simplex = new Simplex();
        this.camera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,0.1,10000);
        this.orthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,0.01,1000);
        this.camera.position.set(0,0,10);
        this.scene = new THREE.Scene();
    }

    onWindowResize =(e)=>
    {

    };
    onMouseMove =(e?)=>
    {

    };

    onClick =(e?)=>
    {

    };

    onMouseDown =(e?)=>
    {

    };

    onMouseUp =(e?)=>
    {

    };

    onKeyDown =(e?)=>
    {

    };

    update()
    {

    }



}