import "imports-loader?THREE=three!three/examples/js/lines/LineSegmentsGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/WireframeGeometry2.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineMaterial.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineSegments2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Line2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Wireframe.js";
import * as THREE from 'three'
import SceneManager from "./SceneManager";
import LineCharacter from "./LineCharacter";

export default class FlyLineCharacter extends LineCharacter
{
    constructor(sceneManager:SceneManager, scene:THREE.Scene) {
        super(sceneManager, scene);
    }

    createLine =(lineVertices:number[], colors:THREE.Color[], offset?:THREE.Vector3, rotate?:number)=>
    {

        if(this.currentLine != null){
            this.currentLine.geometry.dispose();
            this.currentLine.material.dispose();
            this.scene.remove(this.currentLine);
        }


        for (let i = 0; i < lineVertices.length; i+=3)
        {
            lineVertices[i] -= offset.x;
            lineVertices[i+1] -= offset.y;
            lineVertices[i+2] -= offset.z;
        }

        // @ts-ignore
        var splineGeometry = new THREE.LineGeometry();
        splineGeometry.setPositions( lineVertices );

        splineGeometry.setColors( colors );

        // @ts-ignore
        var splineMaterial = new THREE.LineMaterial( {
            color: 0xffffff,
            linewidth: 0.01, // in pixels
            vertexColors: THREE.VertexColors,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        // @ts-ignore
        this.currentLine = new THREE.Line2( splineGeometry,splineMaterial);
        this.currentLine.computeLineDistances();
        this.currentLine.scale.set( 1, 1, 1 );

        this.currentLine.translateX(offset.x);
        this.currentLine.translateY(offset.y);
        this.currentLine.translateZ(offset.z);
        this.currentLine.rotation.z += rotate;



        this.scene.add( this.currentLine );
    };
    public update()
    {
    }


}