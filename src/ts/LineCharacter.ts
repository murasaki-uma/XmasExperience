import "imports-loader?THREE=three!three/examples/js/lines/LineSegmentsGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineGeometry.js";
import "imports-loader?THREE=three!three/examples/js/lines/WireframeGeometry2.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineMaterial.js";
import "imports-loader?THREE=three!three/examples/js/lines/LineSegments2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Line2.js";
import "imports-loader?THREE=three!three/examples/js/lines/Wireframe.js";
import * as THREE from 'three'
import SceneManager from "./SceneManager";

export default class LineCharacter
{
    currentLine:any = null;
    sceneManager:SceneManager;
    scene:THREE.Scene;
    constructor(sceneManager:SceneManager, scene:THREE.Scene) {
        this.sceneManager = sceneManager;
        this.scene = scene;

    }
    createLine =(lineVertices:number[], colors:THREE.Color[])=>
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
            linewidth: 0.01, // in pixels
            vertexColors: THREE.VertexColors,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        // @ts-ignore
        this.currentLine = new THREE.Line2( splineGeometry,splineMaterial);
        this.currentLine.computeLineDistances();
        this.currentLine.scale.set( 1, 1, 1 );
        this.scene.add( this.currentLine );
    };

    public update()
    {
    }


}