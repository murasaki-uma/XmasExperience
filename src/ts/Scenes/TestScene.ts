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

        //
        this.motionDataMixer = new MotionDataMixer();
        // this.lineAnimationData = new MotionData();
        this.perseJson(motionArmSwings, new THREE.Vector3(-100,0,0));
        this.perseJson(motionSanba,new THREE.Vector3(100,0,0));
        this.camera.position.set(0,80,400);

        this.characterTest = new LineCharacter(this.sceneManager,this.scene);


        // const light = new THREE.DirectionalLight( 0xffffff );
        // light.position.set( 0, 200, 100 );
        // light.castShadow = true;
        // light.shadow.camera.top = 180;
        // light.shadow.camera.bottom = - 100;
        // light.shadow.camera.left = - 120;
        // light.shadow.camera.right = 120;
        // this.scene.add( light );

        const ground = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2000, 2000 ), new THREE.MeshPhongMaterial( { color: 0x999999, depthWrite: false } ) );
        ground.rotation.x = - Math.PI / 2;
        ground.receiveShadow = true;
        // this.scene.add( ground );

        const grid = new THREE.GridHelper( 2000, 20, 0x000000, 0x000000 );
        grid.material.opacity = 0.2;
        grid.material.transparent = true;
        this.scene.add( grid );


        this.sceneManager.renderer.setClearColor(new THREE.Color(0,0,0));
        // this.createLine(this.lineAnimationData.getCurrentMotionData());
        this.audioQuantizer = new AudioQuantize(this.scene,this.camera);

        // var debugballgeo = new THREE.SphereBufferGeometry(10,10,10);
        // var debugballmat = new THREE.MeshBasicMaterial({color:new THREE.Color(1,0,0)});
        // this.debugBall = new THREE.Mesh(debugballgeo,debugballmat);
        // this.scene.add(this.debugBall);

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

                const c = new FlyLineCharacter(this.sceneManager, this.scene);
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


        // this.characterTest.createLine(this.motionDataMixer.currentFrameVertices);

    }




}
