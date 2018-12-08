import {debug} from "util";
declare function require(x: string): any;
import * as THREE from 'three'
import Scene from "./Scene";
import SceneManager from "./SceneManager";
const bgShader = require("./shaders/bg02.fs");
const offScreenVs = require( "./shaders/offScreen.vs");
import {createFullScreenTexturePlane, createRenderTarget, createCustumShaderPlane} from "./OffScreenManager";
const textureImg01 = require("../images/1908378.jpg");
const textureImg02 = require("../images/13756072.jpg");

// import texture01 from '../images/1908378.jpg';


declare function require(x: string): any;

export default class BackGround extends Scene {
    sceneManager:SceneManager;
    // public renderTarget:THREE.WebGLRenderTarget;
    planeMesh:THREE.Mesh;
    public bgTarget:THREE.WebGLRenderTarget;
    uniforms:any;
    constructor(sceneManager:SceneManager)
    {
        super(sceneManager);
        this.init();
    }

    init()
    {
        this.bgTarget = createRenderTarget(this.sceneManager.abosluteResolution.x,this.sceneManager.abosluteResolution.y);
        this.planeMesh = createCustumShaderPlane(offScreenVs,bgShader);
        // @ts-ignore
        this.uniforms = this.planeMesh.material.uniforms;
        this.uniforms.resolution = {value:new THREE.Vector2(this.sceneManager.abosluteResolution.x,this.sceneManager.abosluteResolution.y)};
        this.scene.add(this.planeMesh);

        const image01 = new Image();
        image01.src = textureImg01;
        const texture01 = new THREE.Texture();
        texture01.image = image01;
        image01.onload = ()=> {
            texture01.needsUpdate = true;
        };


        const image02 = new Image();
        image02.src = textureImg02;
        const texture02 = new THREE.Texture();
        texture02.image = image01;
        image02.onload = ()=> {
            texture02.needsUpdate = true;
        };

        // var image = new Image();
        // image.src =
    }

    get texture():THREE.Texture
    {
        return this.bgTarget.texture;
    }


    public update():void
    {
        this.uniforms.time.value += 0.01;
        this.sceneManager.renderer.render(this.scene,this.orthoCamera,this.bgTarget);
    }
}