import {debug} from "util";
declare function require(x: string): any;
import * as THREE from 'three'
import Scene from "./Scene";
import SceneManager from "./SceneManager";
const bgShader = require("./shaders/bg.fs");
const offScreenVs = require( "./shaders/offScreen.vs");
import {createFullScreenTexturePlane, createRenderTarget, createCustumShaderPlane} from "./OffScreenManager";

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
        this.bgTarget = createRenderTarget(100,100);
        this.planeMesh = createCustumShaderPlane(offScreenVs,bgShader);
        // @ts-ignore
        this.uniforms = this.planeMesh.material.uniforms;
        this.scene.add(this.planeMesh);
    }

    get texture():THREE.Texture
    {
        return this.bgTarget.texture;
    }


    public update():void
    {
        this.uniforms.time.value += 0.1;
        this.sceneManager.renderer.render(this.scene,this.orthoCamera,this.bgTarget);
    }
}