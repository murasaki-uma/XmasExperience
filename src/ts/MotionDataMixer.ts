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
    previousMotionNum = 0;
    morphingDuration:number = 1;
    morphingThreshold:{value:0.0} = {value:0.0};
    isMorphing:boolean = false;
    simplex:Simplex;
    clock:THREE.Clock;
    onBeatPower:OnBeatPower;
    curlNoise:CurlNoise;
    divisionNum:number = 14;
    recordMotionData:MotionDataPrimitive = null;
    // motionNum = 0;
    constructor()
    {
        window.addEventListener('keydown', this.onKeyDown.bind(this));
        window.addEventListener( 'click', this.onClick.bind(this), false );
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
        this.previousMotionNum = this.currentMotionNum;
    }

    private startMorphing()
    {
        this.isMorphing = true;
        this.morphingThreshold.value = 0.0;
        // @ts-ignore
        const currentTime = window.timer.value;
        TweenMax.to(this.morphingThreshold, Math.max(currentTime,0.5), {value:1, onComplete:this.onCompleteMorphing});
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
        var divisions = Math.round( this.divisionNum * points.length );
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

    onClick=(e)=>
    {
        const array = [0, 1, 2, 3];
        array.forEach((item, index) => {
            if(item === 1) {
                array.splice(index, 1);
            }
        });
        const nextNum = array[Math.floor(Math.random() * array.length * 10)];
        console.log(nextNum);
        this.morphingTargetNum++;
        this.checkMotionNum();
        if(this.currentMotionNum != this.morphingTargetNum) this.startMorphing();

    };

    onKeyDown=(e)=>
    {

    };

    public addMotion(motionData:MotionData)
    {
        this.motions.push(motionData);
    }
    motionDataByNum(num:number):MotionDataPrimitive
    {
        return this.motions[num].currentFrameVertices;
    }
   get currentMotionData()
   {
       return this.motions[this.currentMotionNum];
   }

   get morphingTargetMotionData()
   {
       return this.motions[this.morphingTargetNum];
   }

   recordMotion()
   {
       Object.assign(this.recordMotionData,this.currentMotionData);
   }



   get currentFrameVertices()
   {

      return this.currentMotionData.currentFrameVertices;

   }

   get morphingTargetCurrentFrameVertices()
   {
       return this.morphingTargetMotionData.currentFrameVertices;
   }
   morphingLineValues(typeNum?:number)
   {

       const current = this.getLineValues(this.motionDataByNum(this.previousMotionNum));
       const morphing =  this.getLineValues(this.motionDataByNum(this.morphingTargetNum));
       const record = this.recordMotionData ? this.getLineValues(this.recordMotionData) : null;

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
          const noise = this.curlNoise.curlNoise(new THREE.Vector3(positions.z * scale, positions.y * scale, this.clock.getElapsedTime()*scale));

          let power = 0;
          switch (typeNum) {
              case 0:
                  const th = (this.morphingThreshold.value*0.5);

                  if(start.y > th *180)
                  {
                      power = Math.sin(this.morphingThreshold.value * Math.PI) * 30;
                      morphing.vertices[i] = start.x +noise.x * power;
                      morphing.vertices[i+1] = (start.y +noise.y * power );
                      morphing.vertices[i+2] = start.z +noise.z * power ;
                  } else
                  {
                      morphing.vertices[i] = to.x;
                      morphing.vertices[i+1] = to.y;
                      morphing.vertices[i+2] = to.z ;
                  }

                  break;

              case 1:
                  power = 0;
                  morphing.vertices[i] = positions.x +noise.x * power;
                  morphing.vertices[i+1] = (positions.y +noise.y * power );
                  morphing.vertices[i+2] = positions.z +noise.z * power ;
                  break;
          }

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
            // this.currentMotionData.next();
            for (let i = 0; i < this.motions.length; i++)
            {
                this.motions[i].next();
            }

        }
    }
}