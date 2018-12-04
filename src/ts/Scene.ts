import SceneManager from "./SceneManager";
import Simplex from "../../node_modules/perlin-simplex";
declare function require(x: string): any;
import * as THREE from 'three'
import LineCharacter from "./LineCharacter";
import {createRenderTarget} from "./OffScreenManager";
import {Mesh} from "three";

export default class Scene {
    camera:THREE.PerspectiveCamera;
    orthoCamera:THREE.OrthographicCamera;
    scene:THREE.Scene;
    offScreenScene:THREE.Scene = null;
    // postScenes:THREE.Scene[] = [];
    postScenes:Map<string,THREE.Scene>;
    postRenderTargets:Map<string, THREE.WebGLRenderTarget>;
    postPreviewMesh:Map<String,THREE.Mesh>;
    // postUniforms:Map<string,{ uTex: { type: "t", value: null } }>;
    // useOffScreen:boolean = false;
    isOffScreen:boolean = false;
    enableAutoRenderingOffScreen:boolean = true;
    offScreenNum:number = null;
    sceneManager:SceneManager;
    simplex:Simplex;
    offScreenPlane:THREE.Mesh = null;
    offScreenCamera:THREE.PerspectiveCamera = null;
    postEffectCamera:THREE.OrthographicCamera;

    constructor(scenemanager:SceneManager)
    {

        this.sceneManager = scenemanager;
        this.simplex = new Simplex();
        this.camera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,0.1,10000);
        this.orthoCamera = new THREE.OrthographicCamera(-1,1,1,-1,0.01,10);
        this.postEffectCamera = new THREE.OrthographicCamera(-1,1,1,-1,0.01,10);
        this.camera.position.set(0,0,10);
        this.offScreenCamera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,0.1,10000);
        this.offScreenCamera.position.set(0,0,0);

        this.postRenderTargets = new Map<string, THREE.WebGLRenderTarget>();
        this.postScenes =new Map<string, THREE.Scene>();
        this.postPreviewMesh = new Map<String, THREE.Mesh>();
        // this.postUniforms = new Map<string, {uTex: {type: String("t"), value: null}}>();
        this.scene = new THREE.Scene();

    }

    userOffScreen()
    {
        if(this.offScreenScene == null)this.offScreenScene = new THREE.Scene();
        this.isOffScreen = true;
        this.sceneManager.addOffScreen();
        if(this.offScreenNum == null)this.offScreenNum = this.sceneManager.renderTargets.length;
        this.offScreenScene.add(this.createOffScreenPreviewPlane());

    }

    createOffScreenPreviewPlane(fs?:any):THREE.Mesh
    {
        if(this.offScreenPlane == null)
        {
            // this.offScreenCamera = new THREE.PerspectiveCamera(70,window.innerWidth / window.innerHeight,0.1,10000);
            this.sceneManager.addOffScreen();
            const geo = new THREE.PlaneBufferGeometry(2,2);
            const uniforms = { 'uTex': { type: "t", value: this.sceneManager.renderTargets[this.offScreenNum].texture } };
            const mat = new THREE.ShaderMaterial({
                uniforms:uniforms,
                vertexShader: this.sceneManager.offScreenVs,
                fragmentShader: fs ? fs : this.sceneManager.offScreenFs,
                transparent:true
            });

            this.offScreenPlane = new THREE.Mesh(geo,mat);
            // this.scene.add(this.offScreenPlane);
        }

        return this.offScreenPlane;
    }

    createPostEffectPreviewPlane(texture:THREE.Texture,fs):THREE.Mesh
    {

        const geo = new THREE.PlaneBufferGeometry(2,2);
        const uniforms = { 'uTex': { type: "t", value: texture} };
        const mat = new THREE.ShaderMaterial({
            uniforms:uniforms,
            vertexShader: this.sceneManager.offScreenVs,
            fragmentShader: fs ? fs : this.sceneManager.offScreenFs,
            transparent:true
        });
        const offScreenPlane = new THREE.Mesh(geo,mat);

        return offScreenPlane;
    }

    get renderTarget():THREE.WebGLRenderTarget
    {
        return this.sceneManager.renderTargets[this.offScreenNum];
    }

    static createPostEffectScene(name:string):THREE.Scene
    {
        const scene = new THREE.Scene();
        scene.name = name;
        return scene;
    }

    createPostEffect(name,postEffectShader:any):THREE.WebGLRenderTarget
    {
        const postScene = Scene.createPostEffectScene(name);
        const target:THREE.WebGLRenderTarget = createRenderTarget(window.screen.width,window.screen.height);
        this.postRenderTargets.set(name,target);
        this.postScenes.set(name,postScene);
        const plane = this.createPostEffectPreviewPlane(null,postEffectShader);
        this.postPreviewMesh.set(name,plane);
        postScene.add(plane);

        return target
    }

    updatePostEffect(texture:THREE.Texture,name:string):THREE.Texture
    {
        // @ts-ignore
        this.postPreviewMesh.get(name).material.uniforms.uTex.value = texture;
        this.sceneManager.renderer.render(this.postScenes.get(name), this.postEffectCamera,this.postRenderTargets.get(name));
        return this.postRenderTargets.get(name).texture;
    }

    updateOffScreenRenderer():THREE.Texture
    {
        // console.log(this.offScreenScene.children[0]);
        this.sceneManager.renderer.render(this.offScreenScene,this.offScreenCamera,this.renderTarget);
        return this.renderTarget.texture;
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