import * as THREE from "three";
import MotionData from "./MotionData";
import MotionDataPrimitive from "./MotionDataPrimitive";
const linedata = require("./json/line_wave.json");
import OnBeatPower from "./OnBeatPower";
import CurlNoise from "./CurlNoise";
import Simplex from "../../node_modules/perlin-simplex";

export default class WaveLine {
    scene:THREE.Scene;
    frameNum:number;
    xLines:any[] = [];
    zLines:any[] = [];
    scale = {value:1.0};
    motionData:MotionData = null;
    simplex:Simplex;
    onBeatPower:OnBeatPower;
    clock:THREE.Clock;
    divisionNum:number;
    colorA:THREE.Vector3;
    colorB:THREE.Vector3;
    constructor(scene:THREE.Scene, simplex)
    {
        for (let i = 0; i < 6; i++)
        {
            this.xLines.push(null);
            this.zLines.push(null);
        }
        this.simplex = simplex;
        this.onBeatPower = new OnBeatPower();
        this.frameNum = 0;
        this.scene = scene;
        this.divisionNum = 10;
        this.clock = new THREE.Clock();
        this.colorB = new THREE.Vector3(0,255,147);
        this.colorA = new THREE.Vector3(206,0,255);
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
        this.motionData = motiondata;



    }

    init()
    {
        this.perseJson(linedata);
        this.motionData.next();
        // console.log(this.motionData.currentFrameVertices);
        // const vertices = this.motionData.currentFrameVertices;
        // const lineValues = this.getLineValues(vertices);
        // for (let i = 0; i < this.xLines.length; i++)
        // {
        //     this.createLine(i,lineValues.vertices,lineValues.colors);
        // }

    }

    createLineX =(num:number,lineVertices:number[], colors:number[], translate?:THREE.Vector3)=>
    {

        // if(this.scale.value > 0.0)
        // {
        const currentLine = this.xLines[num];
            if(currentLine != null){
                currentLine.geometry.dispose();
                currentLine.material.dispose();
                this.scene.remove(currentLine);
            }

            // @ts-ignore
            var splineGeometry = new THREE.LineGeometry();
            splineGeometry.setPositions( lineVertices );

            splineGeometry.setColors( colors );

            // @ts-ignore
            var splineMaterial = new THREE.LineMaterial( {
                color: 0xffffff,
                linewidth: 0.005*this.scale.value, // in pixels
                vertexColors: THREE.VertexColors,
                //resolution:  // to be set by renderer, eventually
                dashed: false
            } );
            // @ts-ignore

        currentLine = new THREE.Line2( splineGeometry,splineMaterial);
        currentLine.computeLineDistances();

            if(translate)
            {

                currentLine.translateX(translate.x);
                currentLine.translateY(translate.y);
                currentLine.translateZ(translate.z);

            }

            currentLine.scale.set( this.scale.value, this.scale.value, this.scale.value );
            this.scene.add( currentLine );
            this.xLines[num] = currentLine;

    };

    createLineZ =(num:number,lineVertices:number[], colors:number[], translate?:THREE.Vector3)=>
    {

        const currentLine = this.zLines[num];
        if(currentLine != null){
            currentLine.geometry.dispose();
            currentLine.material.dispose();
            this.scene.remove(currentLine);
        }

        // @ts-ignore
        var splineGeometry = new THREE.LineGeometry();
        splineGeometry.setPositions( lineVertices );

        splineGeometry.setColors( colors );

        // @ts-ignore
        var splineMaterial = new THREE.LineMaterial( {
            color: 0xffffff,
            linewidth: 0.005*this.scale.value, // in pixels
            vertexColors: THREE.VertexColors,
            // alpha:0.1,
            // transparent:true,
            //resolution:  // to be set by renderer, eventually
            dashed: false
        } );
        // @ts-ignore

        currentLine = new THREE.Line2( splineGeometry,splineMaterial);
        currentLine.computeLineDistances();
        // @ts-ignore
        currentLine.rotateY(Math.PI/2);

        if(translate)
        {

            currentLine.translateX(translate.x);
            currentLine.translateY(translate.y);
            currentLine.translateZ(translate.z);
        }

        currentLine.scale.set( this.scale.value, this.scale.value, this.scale.value );
        this.scene.add( currentLine );
        this.zLines[num] = currentLine;

    };

    public getLineValues(currentMotionData:MotionDataPrimitive)
    {
        var lineVertexpositions:number[] = [];
        var colors = [];
        var points:THREE.Vector3[] = [];


        for (let i = 0; i < currentMotionData.positions.length; i++)
        {
            // console.log(i);
            const p = currentMotionData.positions[i].clone();

            // p.add(noise)
            points.push(p);
            // console.log(p);
        }

        var clampX = 200;

        for(let i = 0; i < points.length; i++)
        {
            const p = points[i].clone();
            // var scaele = 10.0;
            var noise = this.simplex.noise(i,this.clock.getElapsedTime());
            var vec = p.clone().normalize();
            // p.add(vec.multiplyScalar(noise*this.onBeatPower.value));
            p.multiply(new THREE.Vector3(20,5,10));

            points[i] = p;
        }
        //
        //
        const spline:any = new THREE.CatmullRomCurve3( points );
        spline.curveType = 'centripetal';
        spline.tension = 0.1;
        var divisions = Math.round( this.divisionNum * points.length );
        var color = new THREE.Color();
        for ( var i = 0, l = divisions; i < l; i ++ ) {
            var point = spline.getPoint( i / l );
            lineVertexpositions.push( point.x, point.y, point.z );

            var alpha;
            // if(type== 0){
            //     alpha = 1.0-Math.min(Math.abs(point.x),clampX)/clampX;
            // } else
            // {
            //     alpha = Math.min(-1*(point.x-100)/clampX,1.0);
            //
            // }
            // this.splineEditor.addPoint();

            color.setHSL( i / l, 1.0, 0.5 );
            colors.push( color.r, color.g, color.b );
        }

        // var point = spline.getPoint( 0 );
        lineVertexpositions.push( point.x, point.y, point.z );
        color.setHSL( i / l, 1.0, 0.5 );
        colors.push( color.r, color.g, color.b );

        return {vertices:lineVertexpositions,colors:colors}
    }

    update()
    {

        this.motionData.next();

        const vertices = this.motionData.currentFrameVertices;
        const lineValuesX = this.getLineValues(vertices);
        const lineValuesZ = this.getLineValues(vertices);
        // this.updateLine(lineValues.vertices);
        for (let i = 0; i < this.xLines.length; i++)
        {
            let zlineDiffAlpah =i/(this.xLines.length-1);
            // console.log(zlineDiffAlpah);
            const colors = [];
            const colorsz = [];

            for (let j = 0; j < lineValuesX.colors.length; j+=3)
            {
                const alpha = 1.0-j/(lineValuesX.colors.length-1);
                const alpha02 = 1.0-Math.abs(i/(this.xLines.length-1)-0.5) * 2 + 0.1;
                colors.push(0.0);
                colors.push(0.0);
                colors.push(0.0);
                // var v = new THREE.Vector3(this.colorB.x,this.colorB.y,this.colorB.z);
                // v = v.lerp(this.colorA,alpha);
                colorsz.push(alpha*alpha02);
                colorsz.push(alpha*alpha02);
                colorsz.push(alpha*alpha02);
                // alphaz = 1.0-j/(colors.length-1)*0.5;
            }
            this.createLineX(i,lineValuesX.vertices,colors,
                new THREE.Vector3(0,0,-i*100),
            );

            this.createLineZ(i,lineValuesX.vertices,colorsz,
                new THREE.Vector3(200,0,-i*100+250),
            );
        }
    }
}