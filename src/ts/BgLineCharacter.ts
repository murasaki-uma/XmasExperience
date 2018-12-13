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
import {Float32BufferAttribute} from "three";

export default class BgLineCharacter extends LineCharacter
{
    positions:number[];
    geometry:any;
    colors:number[];
    offset:THREE.Vector3;
    rotate:number;
    translate:THREE.Vector3;
    time:number;

    public isUpdate:boolean =true;
    constructor(sceneManager:SceneManager, scene:THREE.Scene) {
        super(sceneManager, scene);
        this.translate = new THREE.Vector3(0,0,0);
        this.time = 0.0;
    }

    createLine =(lineVertices:number[], colors:number[], offset?:THREE.Vector3)=>
    {

        this.positions = [];
        this.colors = colors;
        this.offset = offset;

        if(this.currentLine != null){
            this.currentLine.geometry.dispose();
            this.currentLine.material.dispose();
            this.scene.remove(this.currentLine);
        }


        for (let i = 0; i < lineVertices.length; i+=3)
        {
            this.positions.push(lineVertices[i] += offset.x);
            this.positions.push(lineVertices[i+1] += offset.y);
            this.positions.push(lineVertices[i+2] += offset.z);
        }


        // this.positions = lineVertices;
        // @ts-ignore
        this.geometry = new THREE.LineGeometry();
        // this.geometry.positions.dynamic = true;
        this.geometry.setPositions( lineVertices );
        // this.geometry.attributes.positions.dynamic = true;


        for(let i = 0; i < this.colors.length; i++)
        {
            this.colors[i] +=0.7 ;
            // this.colors[i+1] *=1.5;
            // this.colors[i+2] *=1.5;
        }

        // for
        this.geometry.setColors( this.colors );

        // @ts-ignore
        var splineMaterial = new THREE.LineMaterial( {
            color: 0xffffff,
            linewidth: 0.01, // in pixels
            vertexColors: THREE.VertexColors,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        // @ts-ignore
        this.currentLine = new THREE.Line2( this.geometry,splineMaterial);
        // console.log(this.geometry);
        this.currentLine.computeLineDistances();
        this.currentLine.scale.set( 1, 1, 1 );

        this.geometry.attributes.position.dynamic = true;

        // console.log(this.currentLine);
        this.currentLine.rotation.z += 0.5;
        this.scene.add( this.currentLine );
    };



    updateLine =()=>
    {

        this.time += 0.01;
        if(this.currentLine != null){
            this.currentLine.geometry.dispose();
            this.currentLine.material.dispose();
            this.scene.remove(this.currentLine);
        }

        var positions = [];
        for (let i = 0; i < this.positions.length; i+=3)
        {
            var y = this.positions[i+1] + this.time * 500;
            var z = this.positions[i+2];

            var x = this.positions[i] + Math.sin(y*0.01 + this.time) * 10 + this.time *10;

            positions.push(x);
            positions.push(y);
            positions.push(z);
            // this.positions[i+2] -= this.offset.z;
        }


        const bools = [];
        for (let i = 0; i < this.colors.length; i++)
        {
            var c = Math.max(this.colors[i] -0.04,0.0);
            this.colors[i] = c;
            if(c <= 0.0) bools.push(false);
        }

        if(bools.length == this.colors.length) this.isUpdate = false;


        // @ts-ignore
        this.geometry = new THREE.LineGeometry();
        // this.geometry.positions.dynamic = true;
        this.geometry.setPositions( positions );
        // this.geometry.attributes.positions.dynamic = true;
        // this.colors = colors;
        this.geometry.setColors( this.colors );

        // @ts-ignore
        var splineMaterial = new THREE.LineMaterial( {
            color: 0xffffff,
            linewidth: 0.01, // in pixels
            vertexColors: THREE.VertexColors,
            // alpha:0.1,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        // @ts-ignore
        this.currentLine = new THREE.Line2( this.geometry,splineMaterial);

        this.currentLine.computeLineDistances();
        this.currentLine.scale.set( 1, 1, 1 );


        this.geometry.attributes.position.dynamic = true;

        // console.log(this.currentLine);

        this.currentLine.rotation.z -= 0.5;
        this.scene.add( this.currentLine );
    };


    public update()
    {

        if(this.isUpdate){
            this.updateLine();
        } else
        {
            this.currentLine.geometry.dispose();
            this.currentLine.material.dispose();
            this.scene.remove(this.currentLine);
        }
            // this.createLine(this.positions,this.colors,this.offset,this.rotate);

    }


}