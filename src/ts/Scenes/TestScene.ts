import {debug} from "util";
declare function require(x: string): any;
import Scene from "../Scene";
import "imports-loader?THREE=three!three/examples/js/lines/LineSegmentsGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/WireframeGeometry2.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineMaterial.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineSegments2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Line2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Wireframe.js";
import * as THREE from 'three'
import SceneManager from "../SceneManager";
import MotionDataPrimitive from "../MotionDataPrimitive";
import MotionData from "../MotionData";
import LineCharacter from "../LineCharacter";
import MotionDataMixer from "../MotionDataMixer";
import FlyLineCharacter from "../FlyLineCharacter";
import BgLineCharacter from "../BgLineCharacter";
import AudioQuantize from "../AudioQuantize";
const motionSanba = require("../json/motion_sanba.json");
const motionArmSwings = require("../json/motion_armswings.json");
const motionWave = require("../json/motion_wave.json");
const motionSideWave = require("../json/motion_sidewave.json");
const bloomEffect = require("../shaders/bloom.fs");
const layerShader = require("../shaders/layer.glsl");
import {createFullScreenTexturePlane, createRenderTarget} from "../OffScreenManager";
import CircleTriangleLine from "../CircleTriangleLine";
import BackGround from "../BackGround";
import CircleHumanScene from "../CircleHumanScene";
import MultipleLineCharacters from "./MultipleLineCharacters";
import WaveLine from "../WaveLine";
import Tween = JQuery.Tween;
import {TweenMax, Power0, Power1, SlowMo} from "gsap/TweenMax";
// const frag = require("../../glsl/SnoiseGradient.frag");

export default class TestScene extends Scene {

    currentLine:any = null;
    // lineAnimationData:MotionData;
    frameCount:number = 0;
    // onBeatPower:{value:0.0} = {value:0.0};
    // onBeatPoserNext:number=1;
    motionDataMixer:MotionDataMixer;
    bgScene:BackGround;
    characterTest:LineCharacter;
    audioQuantizer:AudioQuantize;
    flyLineCharacters:FlyLineCharacter[] = [];
    bgLineCharacters:BgLineCharacter[] = [];
    circleHumanScene:CircleHumanScene;
    multipleLineCharacters:MultipleLineCharacters;
    waveLine:WaveLine;
    circleTriangleLine:CircleTriangleLine;
    sceneNum:number = 0;

    layerShaderUniforms:any;
    constructor(sceneManger:SceneManager)
    {
        super(sceneManger);
        this.init();
    }
    perseJson(data:any, offset?:THREE.Vector3 )
    {
        // console.log("frame num: " + data.frames.length);
        var motiondata = new MotionData();
        data.frames.forEach((element)=> {
            // console.log(element);
            // console.log(element[0]);
            const positions:THREE.Vector3[] = [];
            for(let i = 0; i < element.length; i++)
            {
                const pos = element[i];
                const newpos = new THREE.Vector3(pos[0],pos[1],pos[2]);
                // if(offset != null) newpos.add(offset);
                positions.push(newpos);
            }
            motiondata.setMotionDataPrimitive(new MotionDataPrimitive(positions),offset);

            // console.log(positions);
        });

        this.motionDataMixer.addMotion(motiondata);
    }

    init()
    {
        this.userOffScreen();
        this.enableAutoRenderingOffScreen = false;
        this.motionDataMixer = new MotionDataMixer();
        this.circleTriangleLine = new CircleTriangleLine(this.offScreenScene,this.simplex);
        // this.lineAnimationData = new MotionData();
        this.perseJson(motionArmSwings, new THREE.Vector3(0,0,0));
        this.perseJson(motionSanba,new THREE.Vector3(0,0,0));
        this.perseJson(motionWave,new THREE.Vector3(0,0,0));
        this.perseJson(motionSideWave, new THREE.Vector3(0,0,0));
        this.camera.position.set(0,0,1);
        this.offScreenCamera.position.set(0,100,200);

        this.characterTest = new LineCharacter(this.sceneManager,this.offScreenScene);
        this.multipleLineCharacters = new MultipleLineCharacters(this.motionDataMixer,this.sceneManager,this.offScreenScene);

        this.sceneManager.renderer.setClearColor(new THREE.Color(0,0,0));
        this.sceneManager.renderer.setClearAlpha(0);
        // this.createLine(this.lineAnimationData.getCurrentMotionData());
        this.audioQuantizer = new AudioQuantize(this.scene,this.camera);
        const target = this.createPostEffect("layer",layerShader);
        this.layerShaderUniforms = this.getUniforms("layer");

        // this.createPostEffect("bloom",bloomEffect);
        // var plane = this.createOffScreenPreviewPlane();
        const posetPlane = createFullScreenTexturePlane(target.texture);
        this.waveLine = new WaveLine(this.offScreenScene,this.simplex);
        this.scene.add(posetPlane);




        // this.scene.add(this.createOffScreenPreviewPlane());
        this.bgScene = new BackGround(this.sceneManager);
        this.circleHumanScene = new CircleHumanScene(this.sceneManager,this.offScreenCamera);

    }


    onClick = (e)=>
    {

    };

    onKeyDown =(e)=>
    {

        this.circleTriangleLine.debugLog();

        if(e.key == "r")
        {
            this.createFlyCharacters(1)
        }



        if(e.key== "c")
        {
            this.changeScene();
        }
        //
        // }

    };


    createFlyCharacters(type:number)
    {
        var rad = 0;
        const size = 5;
        switch (type) {
            case 0:
                for (let i = 0; i < size; i++)
                {
                    const c = new FlyLineCharacter(this.sceneManager, this.offScreenScene);
                    const v = this.motionDataMixer.morphingLineValues(0);
                    c.createWaveLine(v.vertices,v.colors, this.motionDataMixer.currentFrameVertices.offset, rad);
                    this.flyLineCharacters.push(c);
                    rad +=(Math.PI*2)/(size-1);
                }
                break;
            case 1:
                for (let i = 0; i < size; i++)
                {
                    const c = new BgLineCharacter(this.sceneManager, this.offScreenScene);
                    const v = this.motionDataMixer.morphingLineValues(0);
                    c.createLine(v.vertices,v.colors, new THREE.Vector3((Math.random()-0.5)*700,(Math.random())*-400,(Math.random()-0.5)*300-100));
                    this.bgLineCharacters.push(c);
                    rad +=(Math.PI*2)/(size-1);
                }
                break;

        }

    }

    fadeIn()
    {
        this.characterTest.fadeIn();
        this.sceneManager.renderer.setClearAlpha(0);
        // this.sceneManager.renderer.setClearColor(0xffffff);
    }
    random():number
    {
        return Math.random();
    }

    changeScene()
    {
        var num = (this.sceneNum+1) % 2;

        if(num == 1)
        {
            this.characterTest.fadeOut();
            this.multipleLineCharacters.fadeIn();
            this.waveLine.fadeIn();
            TweenMax.to({value:1.0}, 1.0, {value:0.0, onComplete:()=>{
                this.changeSceneNum();}
            });
        } else
        {
            this.characterTest.fadeIn();
            this.multipleLineCharacters.fadeOut();
            this.waveLine.fadeOut();
            TweenMax.to({value:1.0}, 1.0,  {value:0.0, onComplete:()=>{
                    this.changeSceneNum();}
            });
        }
    }

    changeSceneNum()
    {
        this.sceneNum = (this.sceneNum+1) % 2;
    }

    update()
    {
        this.audioQuantizer.update();
        this.frameCount ++;
        this.motionDataMixer.update();

        if(this.multipleLineCharacters.scale.value > 0)
        {
            this.waveLine.update();
            this.multipleLineCharacters.update();
        }
        if(this.characterTest.scale.value > 0)
        {
            // this.multipleLineCharacters.update();
            const values = this.motionDataMixer.morphingLineValues(0);
            this.characterTest.createLine(values.vertices,values.colors);
        }





        for(let i = 0; i < this.flyLineCharacters.length; i++)
        {
            this.flyLineCharacters[i].update();
            if(this.flyLineCharacters[i].isUpdate == false) this.flyLineCharacters.slice(i,1);
        }

        for(let i = 0; i < this.bgLineCharacters.length; i++)
        {
            this.bgLineCharacters[i].update();
            if(this.bgLineCharacters[i].isUpdate == false) this.bgLineCharacters.slice(i,1);
        }

        const tex = this.updateOffScreenRenderer();
        this.bgScene.update();
        const bgtex = this.bgScene.texture;
        // this.updatePostEffect(tex,"bloom");
        this.updateTextures(bgtex,tex,"layer");

    }

    updateTextures(bg:THREE.Texture,main:THREE.Texture, name:string):THREE.Texture
    {
        // @ts-ignore
        // this.postPreviewMesh.get(name).material.uniforms.uTex.value = texture;
        this.layerShaderUniforms.texture01 = {value:bg};
        this.layerShaderUniforms.texture02 = {value:main};
        this.sceneManager.renderer.render(this.postScenes.get(name), this.postEffectCamera,this.postRenderTargets.get(name));
        return this.postRenderTargets.get(name).texture;
    }





}
