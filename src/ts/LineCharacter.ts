import "imports-loader?THREE=three!three/examples/js/lines/LineSegmentsGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/WireframeGeometry2.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineMaterial.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineSegments2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Line2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Wireframe.js";
import * as THREE from 'three'
import SceneManager from "./SceneManager";
import {TweenMax, Power0, Power1, SlowMo} from "../../node_modules/gsap/TweenMax";
export default class LineCharacter
{
    scale = {value:0.0};
    currentLine:any = null;
    sceneManager:SceneManager;
    scene:THREE.Scene;
    constructor(sceneManager:SceneManager, scene:THREE.Scene) {
        this.sceneManager = sceneManager;
        this.scene = scene;

        this.scale.value = 1.0;

    }
    createLine =(lineVertices:number[], colors:number[], translate?:THREE.Vector3)=>
    {

        if(this.scale.value > 0.0)
        {
            if(this.currentLine != null){
                this.currentLine.geometry.dispose();
                this.currentLine.material.dispose();
                this.scene.remove(this.currentLine);
            }



            // @ts-ignore
            var splineGeometry = new THREE.LineGeometry();
            splineGeometry.setPositions( lineVertices );

            splineGeometry.setColors( colors );

            // @ts-ignore
            var splineMaterial = new THREE.LineMaterial( {
                color: 0xffffff,
                linewidth: 0.01*this.scale.value, // in pixels
                vertexColors: THREE.VertexColors,
                //resolution:  // to be set by renderer, eventually
                dashed: false
            } );
            // @ts-ignore
            this.currentLine = new THREE.Line2( splineGeometry,splineMaterial);
            this.currentLine.computeLineDistances();
            this.currentLine.scale.set( this.scale.value, this.scale.value, this.scale.value );
            if(translate)
            {
                this.currentLine.translateX(translate.x);
                this.currentLine.translateY(translate.y);
                this.currentLine.translateZ(translate.z);
            }
            this.scene.add( this.currentLine );

        }
    };

    public fadeOut()
    {
        if(this.scale.value >= 1.0)
        {
            TweenMax.to(this.scale, 1.0, {value:0.0 });
        }
        if(this.scale.value <= 0.0)
        {
            TweenMax.to(this.scale, 1.0, {value:1.0 });
        }




    }

    public update()
    {
    }


}