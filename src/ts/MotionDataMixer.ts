import Simplex from "../../node_modules/perlin-simplex";
import MotionData from "./MotionData";
import * as THREE from "three";
import MotionDataPrimitive from "./MotionDataPrimitive";
import {TweenMax, Power0, Power1, SlowMo} from "../../node_modules/gsap/TweenMax";
import OnBeatPower from "./OnBeatPower";
import CurlNoise from "./CurlNoise";

export default class MotionDataMixer
{
    motions:MotionData[] = [];
    frameCount:number = 0;
    currentMotionNum = 0;
    morphingTargetNum = 0;
    morphingDuration:number = 1;
    morphingThreshold:{value:0.0} = {value:0.0};
    isMorphing:boolean = false;
    simplex:Simplex;
    clock:THREE.Clock;
    onBeatPower:OnBeatPower;
    curlNoise:CurlNoise;
    // motionNum = 0;
    constructor()
    {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        this.simplex = new Simplex();
        this.clock = new THREE.Clock();
        this.onBeatPower = new OnBeatPower();
        this.curlNoise = new CurlNoise();
    }
    perseJson(data:any)
    {
        console.log("frame num: " + data.frames.length);
        data.frames.forEach((element)=> {
            console.log(element);
            console.log(element[0]);
            const positions:THREE.Vector3[] = [];
            const motion = new MotionData();
            for(let i = 0; i < element.length; i++)
            {
                const pos = element[i];

                positions.push(new THREE.Vector3(pos[0],pos[1],pos[2]));
            }
            motion.setMotionDataPrimitive(new MotionDataPrimitive(positions));
            console.log(positions);
        });
    }


    public NextMotion()
    {
        // this.currentMotionNum++;
        this.morphingTargetNum ++;
        this.checkMotionNum();
    }

    public PrevMotion()
    {
        // this.currentMotionNum--;
        this.morphingTargetNum --;
        this.checkMotionNum();
    }

    private checkMotionNum()
    {
        this.isMorphing = true;
        if(this.morphingTargetNum >= this.motions.length) this.morphingTargetNum = 0;
        if(this.morphingTargetNum < 0) this.morphingTargetNum = this.motions.length-1;
    }

    private startMorphing()
    {
        this.isMorphing = true;
        this.morphingThreshold.value = 0.0;
        TweenMax.to(this.morphingThreshold, this.morphingDuration, {value:1, onComplete:this.onCompleteMorphing, ease: SlowMo.ease.config(0.1, 0.1, false)});
        // TweenMax.to(this.morphingThreshold, this.morphingDuration, { ease: Power0.easeNone, value: 1.0,onComplete:this.onCompleteMorphing()});

    }

    public getLineValues(currentMotionData:MotionDataPrimitive)
    {
        var lineVertexpositions:number[] = [];
        var colors = [];
        var points:THREE.Vector3[] = [];
        var x = -100;

        points.push(currentMotionData.positions[currentMotionData.positions.length-1]);
        for (let i = 0; i < currentMotionData.positions.length; i++)
        {
            // console.log(i);
            const p = currentMotionData.positions[i].clone();

            // p.add(noise)
            points.push(p);
        }

        //points.push(currentMotionData.positions[0]);

        for(let i = 0; i < points.length; i++)
        {
            const p = points[i].clone();
            // var scaele = 10.0;
            var noise = this.simplex.noise(i,this.clock.getElapsedTime());
            var vec = p.clone().normalize();
            p.add(vec.multiplyScalar(noise*this.onBeatPower.value).add(currentMotionData.offset));

            points[i] = p;
        }


        const spline:any = new THREE.CatmullRomCurve3( points );
        spline.curveType = 'centripetal';
        spline.tension = 0.1;
        var divisions = Math.round( 12 * points.length );
        var color = new THREE.Color();
        for ( var i = 0, l = divisions; i < l; i ++ ) {
            var point = spline.getPoint( i / l );
            lineVertexpositions.push( point.x, point.y, point.z );
            // this.splineEditor.addPoint();

            color.setHSL( i / l, 1.0, 0.5 );
            colors.push( color.r, color.g, color.b );
        }

        var point = spline.getPoint( 0 );
        lineVertexpositions.push( point.x, point.y, point.z );
        // this.splineEditor.addPoint();

        color.setHSL( i / l, 1.0, 0.5 );
        colors.push( color.r, color.g, color.b );

        return {vertices:lineVertexpositions,colors:colors}
    }

    private onCompleteMorphing=()=>
    {
        this.currentMotionNum = this.morphingTargetNum;
        this.isMorphing = false;

    };

    onKeyDown=(e)=>
    {

        if(e.key == "ArrowRight") {
            this.NextMotion();
        }


        if(e.key == "ArrowLeft") {
            this.PrevMotion();
        }

        if(this.currentMotionNum != this.morphingTargetNum) this.startMorphing();
    };

    public addMotion(motionData:MotionData)
    {
        this.motions.push(motionData);
    }

   get currentMotionData()
   {
       return this.motions[this.currentMotionNum];
   }

   get morphingTargetMotionData()
   {
       return this.motions[this.morphingTargetNum];
   }



   get currentFrameVertices()
   {

                 return this.currentMotionData.currentFrameVertices;

   }

   get morphingTargetCurrentFrameVertices()
   {
       return this.morphingTargetMotionData.currentFrameVertices;
   }
   get morphingLineValues()
   {

       var current = this.getLineValues(this.currentFrameVertices);
       var morphing =  this.getLineValues(this.morphingTargetCurrentFrameVertices);


       // console.log(current.vertices.length, morphing.vertices.length);
       for (let i = 0; i < morphing.vertices.length; i+=3)
       {
           const current_x = current.vertices[i];
           const current_y = current.vertices[i+1];
           const current_z = current.vertices[i+2];

           const morph_x = morphing.vertices[i];
           const morph_y = morphing.vertices[i+1];
           const morph_z = morphing.vertices[i+2];

           var start = new THREE.Vector3(current_x,current_y,current_z);
           var to = new THREE.Vector3(morph_x,morph_y,morph_z);
           var positions = start.lerp(to,this.morphingThreshold.value);
           // console.log(morphing.vertices[i]);
           var scale = 0.02;
          const noise = this.curlNoise.curlNoise(new THREE.Vector3(positions.z * scale, 0.2, this.clock.getElapsedTime()*scale));

           var power = Math.sin(this.morphingThreshold.value * Math.PI) * 50;
           morphing.vertices[i] = positions.x +noise.x * power;
           morphing.vertices[i+1] = (positions.y +noise.y * power );
           morphing.vertices[i+2] = positions.z +noise.z * power ;
       }
       //
       return morphing;

   }

    public update():void
    {
        this.frameCount ++;
        this.onBeatPower.update();
        if(this.frameCount % 2 == 0)
        {
            // console.log(this.frameCount);
            this.currentMotionData.next();

        }
    }
}