import * as THREE from "three";
import MotionData from "./MotionData";
import MotionDataPrimitive from "./MotionDataPrimitive";
const circleData = require("./json/motion_circle.json");
const triangleData = require("./json/motion_triangle.json");
import OnBeatPower from "./OnBeatPower";
import CurlNoise from "./CurlNoise";
import Simplex from "../../node_modules/perlin-simplex";
import {TweenMax, Power0, Power1, SlowMo} from "../../node_modules/gsap/TweenMax";
import {debug} from "util";
class Line
{
    mesh:any = null;
    scene:THREE.Scene;
    scale = {value:1.0};
    constructor(scene)

    {
        this.scene = scene;
        this.mesh = null;
    }
    createLine =(lineVertices:number[], colors:number[], translate?:THREE.Vector3)=>
    {

        if(this.mesh != null){
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.scene.remove(this.mesh);
        }
        // @ts-ignore
        const splineGeometry = new THREE.LineGeometry();
        splineGeometry.setPositions( lineVertices );

        splineGeometry.setColors( colors );

        // @ts-ignore
        const splineMaterial = new THREE.LineMaterial( {
            color: 0xffffff,
            linewidth: 0.005*this.scale.value, // in pixels
            vertexColors: THREE.VertexColors,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        // @ts-ignore

        const currentLine = new THREE.Line2( splineGeometry,splineMaterial);
        currentLine.computeLineDistances();
        // currentLine.scale.set(10,10,10);
        if(translate)
        {

            currentLine.translateX(translate.x);
            currentLine.translateY(translate.y);
            currentLine.translateZ(translate.z);

        }

        currentLine.scale.set( this.scale.value, this.scale.value, this.scale.value );
        this.scene.add( currentLine );
        this.mesh = currentLine;

    };

}
export default class CircleTriangleLine {
    scene:THREE.Scene;
    frameNum:number;
    motionDataCircle:MotionData = null;
    motionDataTriangle:MotionData = null;
    simplex:Simplex;
    onBeatPower:OnBeatPower;
    clock:THREE.Clock;
    divisionNum:number;
    colorA:THREE.Vector3;
    colorB:THREE.Vector3;
    colorC:THREE.Vector3;
    line:Line;
    seek:{value:1.0} = {value:1.0};
    constructor(scene:THREE.Scene, simplex)
    {

        this.simplex = simplex;
        this.onBeatPower = new OnBeatPower();
        this.frameNum = 0;
        this.scene = scene;
        this.divisionNum = 10;
        this.clock = new THREE.Clock();
        this.colorB = new THREE.Vector3(0,255,147);
        this.colorA = new THREE.Vector3(206,0,255);
        this.colorC = new THREE.Vector3(229,119,255);
        this.line = new Line(this.scene);
        this.motionDataCircle = this.perseJson(circleData);
        this.motionDataTriangle = this.perseJson(triangleData);

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
                // console.log(newpos);
                // if(offset != null) newpos.add(offset);
                positions.push(newpos);
            }
            motiondata.setMotionDataPrimitive(new MotionDataPrimitive(positions),offset);

            // console.log(positions);
        });
        return motiondata;



    }

    init()
    {

    }
    debugLog()
    {
        // const triangle =this.getLineValues(this.motionDataTriangle.currentFrameVertices).vertices;
        // const circle = this.getLineValues(this.motionDataCircle.currentFrameVertices).vertices;
        //
        // console.log(triangle);
        // console.log(circle);

    }
    public getLineValues(circle:MotionDataPrimitive,triangle:MotionDataPrimitive)
    {
        var lineVertexpositions:number[] = [];
        var colors = [];
        const circleSpline:any = new THREE.CatmullRomCurve3( circle.positions );
        const triangleSpline:any = new THREE.CatmullRomCurve3( triangle.positions );
        circleSpline.curveType = 'centripetal';
        circleSpline.tension = 0.1;
        triangleSpline.curveType = 'centripetal';
        triangleSpline.tension = 0.1;



        var divisions = 16;
        var color = new THREE.Color();
        for ( var i = 0, l = divisions; i < l; i ++ ) {
            var circlePoint = circleSpline.getPoint( i / l );
            var trianglePoint = triangleSpline.getPoint( i / l );
            var morph = circlePoint.lerp(trianglePoint,this.seek.value).multiplyScalar(10);
            lineVertexpositions.push( morph.x, morph.y, morph.z );
            color.setHSL( i / l, 1.0, 0.5 );
            color.setRGB(this.colorC.x/255,this.colorC.y/255,this.colorC.z/255);
            colors.push( color.r, color.g, color.b );
        }


        var circlePoint = circleSpline.getPoint( 0 );
        var trianglePoint = triangleSpline.getPoint( 0 );
        var morph = circlePoint.lerp(trianglePoint,this.seek.value).multiplyScalar(10);
        lineVertexpositions.push( morph.x, morph.y, morph.z );


        color.setRGB(this.colorC.x/255,this.colorC.y/255,this.colorC.z/255);
        colors.push( color.r, color.g, color.b );
        return {vertices:lineVertexpositions,colors:colors}
    }

    keyDown(e)
    {
        // this.debugLog();
    }

    startMorphing()
    {
        if(this.seek.value >= 1.0)
        {
            TweenMax.to(this.seek, 2.0, {value:0.0 });
        }
        if(this.seek.value <= 0.0)
        {
            TweenMax.to(this.seek, 2.0, {value:1.0 });
        }
    }




    // get mixMotion()
    // {
        // const triangle =this.getLineValues(this.motionDataTriangle.currentFrameVertices).vertices;
        // const circle = this.getLineValues(this.motionDataCircle.currentFrameVertices).vertices;
        // const newVerticex = [];
        // const circle_v = new THREE.Vector3(0,0,0);
        // const triangle_v = new THREE.Vector3(0,0,0);
        //
        // triangle_v.set(triangle[0],triangle[1],triangle[2]);
        // circle_v.set(circle[0],circle[1],circle[2]);
        // const first = circle_v.lerp(triangle_v,this.seek.value);
        // for (let i = 0; i < circle.length; i+=3)
        // {
        //     triangle_v.set(triangle[i],triangle[i+1],triangle[i+2]);
        //     circle_v.set(circle[i],circle[i+1],circle[i+2]);
        //     const p = circle_v.lerp(triangle_v,this.seek.value);
        //     newVerticex.push(p.x,p.y,p.z);
        // }
        // newVerticex.push(first);
        //
        // return newVerticex;
    // }

    update()
    {

        this.startMorphing();
        this.frameNum ++;
        if(this.frameNum % 3== 0)
        {
            this.motionDataCircle.next();
            this.motionDataTriangle.next();
        }
        //
        const circleVertices = this.motionDataCircle.currentFrameVertices;
        const triangleVertices = this.motionDataTriangle.currentFrameVertices;
        const lineValuesX = this.getLineValues(circleVertices,triangleVertices);
        // const mixVertices = this.mixMotion;
        this.line.createLine(lineValuesX.vertices,lineValuesX.colors,new THREE.Vector3(0,0,0),);

    }
}