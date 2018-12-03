import SceneManager from "./SceneManager";
import Simplex from "../../node_modules/perlin-simplex";
declare function require(x: string): any;
import * as THREE from 'three'
import LineCharacter from "./LineCharacter";

export default class Scene {
    camera:THREE.PerspectiveCamera;
    orthoCamera:THREE.OrthographicCamera;
    scene:THREE.Scene;
    offScreenScene:THREE.Scene = null;
    // useOffScreen:boolean = false;
    isOffScreen:boolean = false;
    offScreenNum:number = null;
    sceneManager:SceneManager;
    simplex:Simplex;
    offScreenPlane:THREE.Mesh = null;
    offScreenCamera:THREE.Camera = null;

    constructor(scenemanager:SceneManager)
    {

        this.sceneManager = scenemanager;
        this.simplex = new Simplex();
        this.camera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,0.1,10000);
        this.orthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,0.01,10);
        this.camera.position.set(0,0,10);
        this.scene = new THREE.Scene();

    }

    userOffScreen()
    {
        if(this.offScreenScene == null)this.offScreenScene = new THREE.Scene();
        this.isOffScreen = true;
        this.sceneManager.addOffScreen();
        if(this.offScreenNum == null)this.offScreenNum = this.sceneManager.renderTargets.length;
    }

    createOffScreenPreviewPlane():THREE.Mesh
    {
        if(this.offScreenPlane == null)
        {
            // this.offScreenCamera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,0.1,10000);
            const geo = new THREE.PlaneBufferGeometry(2,2);
            const uniforms = { 'uTex': { type: "t", value: this.sceneManager.renderTargets[this.offScreenNum].texture } };
            const mat = new THREE.ShaderMaterial({
                uniforms:uniforms,
                vertexShader: this.sceneManager.offScreenVs,
                fragmentShader: this.sceneManager.offScreenFs,
                transparent:true
            });

            this.offScreenPlane = new THREE.Mesh(geo,mat);
            // this.scene.add(this.offScreenPlane);
        }

        return this.offScreenPlane;
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