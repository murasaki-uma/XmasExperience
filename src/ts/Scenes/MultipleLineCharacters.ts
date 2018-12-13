import "imports-loader?THREE=three!three/examples/js/lines/LineSegmentsGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/WireframeGeometry2.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineMaterial.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineSegments2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Line2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Wireframe.js";
import * as THREE from 'three'
import SceneManager from "../SceneManager";
import {TweenMax, Power0, Power1, SlowMo} from "gsap/TweenMax";
import MotionDataMixer from "../MotionDataMixer";
import LineCharacter from "../LineCharacter";

class CharacterModifier
{
    translate:THREE.Vector3;
    moveVec:THREE.Vector3;
    invert:boolean;
    constructor(position:THREE.Vector3,moveVec:THREE.Vector3,invert:boolean)
    {
        this.translate = position;
        this.moveVec = moveVec;
        this.invert = invert;
    }

    update()
    {
        this.translate.add(this.moveVec);

        if(this.translate.z > 100) this.translate.set(this.translate.x,this.translate.y,-700)
    }
}

export default class MultipleLineCharacters {
    motionDataMixer:MotionDataMixer;
    scale = {value:0.0};
    lines:LineCharacter[] = [];
    scene:THREE.Scene;
    sceneManager:SceneManager;
    modifier:CharacterModifier[] = [];
    constructor(mixer:MotionDataMixer, sceneManager:SceneManager, scene:THREE.Scene)
    {
        this.motionDataMixer = mixer;
        this.scene = scene;
        this.sceneManager = sceneManager;
        var z = 0;
        for (let i  = 0; i < 6; i++)
        {

            if(i%2==0 && i != 0) z -= 250;
            this.lines.push(new LineCharacter(this.sceneManager,this.scene));
            const t = i % 2 == 0 ? new THREE.Vector3(-100,0,z) : new THREE.Vector3(100,0,z);
            const v = new THREE.Vector3(0,0,1);
            const b = i % 2 != 0;

            this.modifier.push(new CharacterModifier(t,v,b));

        }
    }


    public fadeOut()
    {
        TweenMax.to(this.scale, 1.0, {value:0.0 });

    }

    public fadeIn()
    {
        TweenMax.to(this.scale, 1.0, {value:1.0 });

    }

    update()
    {
        const values = this.motionDataMixer.morphingLineValues(0);
        for (let i  = 0; i < 6; i++) {
            this.modifier[i].update();
            this.lines[i].createLine(values.vertices, values.colors,this.modifier[i].translate);
            this.lines[i].scale = this.scale;
        }
    }
}