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
import AudioQuantize from "../AudioQuantize";
const motionSanba = require("../json/motion_sanba.json");
const motionArmSwings = require("../json/motion_armswings.json");
const bloomEffect = require("../shaders/bloom.fs");
import {createFullScreenTexturePlane} from "../OffScreenManager";
// const frag = require("../../glsl/SnoiseGradient.frag");
export default class TestScene extends Scene {

    currentLine:any = null;
    // lineAnimationData:MotionData;
    frameCount:number = 0;
    onBeatPower:{value:0.0} = {value:0.0};
    onBeatPoserNext:number=1;
    motionDataMixer:MotionDataMixer;

    characterTest:LineCharacter;
    audioQuantizer:AudioQuantize;
    flyLineCharacters:FlyLineCharacter[] = [];
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

        // this.scene.add(this.createOffScreenPreviewPlane());
        this.enableAutoRenderingOffScreen = false;
        this.motionDataMixer = new MotionDataMixer();
        // this.lineAnimationData = new MotionData();
        this.perseJson(motionArmSwings, new THREE.Vector3(-100,0,0));
        this.perseJson(motionSanba,new THREE.Vector3(100,0,0));
        this.camera.position.set(0,80,400);
        this.offScreenCamera.position.set(0,80,400);

        this.characterTest = new LineCharacter(this.sceneManager,this.offScreenScene);

        this.sceneManager.renderer.setClearColor(new THREE.Color(0,0,0));
        // this.createLine(this.lineAnimationData.getCurrentMotionData());
        this.audioQuantizer = new AudioQuantize(this.offScreenScene,this.offScreenCamera);
        const target = this.createPostEffect("bloom",bloomEffect);
        // var plane = this.createOffScreenPreviewPlane();
        const posetPlane = createFullScreenTexturePlane(target.texture);
        this.scene.add(posetPlane);
        // this.scene.add(this.createOffScreenPreviewPlane());

    }


    onClick = (e)=>
    {
        this.onBeatPoserNext = 100.0;
    };

    onKeyDown =(e)=>
    {

        // console.log(e);

        if(e.code == "Space")
        {
            var min = -1;
            var rad = 0;
            const size = 5;
            for (let i = 0; i < size; i++)
            {

                const c = new FlyLineCharacter(this.sceneManager, this.offScreenScene);
                const v = this.motionDataMixer.morphingLineValues;
                c.createLine(v.vertices,v.colors, this.motionDataMixer.currentFrameVertices.offset, rad);
                this.flyLineCharacters.push(c);
                rad +=(Math.PI*2)/(size-1);
            }

        }
        // if(e.key == "ArrowRight") {
        //     // this.timeline += 0.1;
        //     // this.updateMixer();
        //     this.lineAnimationData.next();
        // }
        //
        //
        // if(e.key == "ArrowLeft") {
        //
        //     this.lineAnimationData.prev();
        // }

        // this.characterTest.createLine(this.lineAnimationData.getCurrentMotionData());

        // this.createPostEffect("bloom", bloomEffect);

    };


    update()
    {

        this.frameCount ++;
        this.motionDataMixer.update();
        // const values = this.motionDataMixer.getLineValues(this.motionDataMixer.currentFrameVertices)
        const values = this.motionDataMixer.morphingLineValues;
            this.characterTest.createLine(values.vertices,values.colors);

        for(let i = 0; i < this.flyLineCharacters.length; i++)
        {
            this.flyLineCharacters[i].update();
            if(this.flyLineCharacters[i].isUpdate == false) this.flyLineCharacters.slice(i,1);
        }


        var tex = this.updateOffScreenRenderer();
        this.updatePostEffect(tex,"bloom");

        // this.characterTest.createLine(this.motionDataMixer.currentFrameVertices);

    }




}
