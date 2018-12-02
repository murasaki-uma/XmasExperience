import MotionDataPrimitive from "./MotionDataPrimitive";

export default class MotionData
{
    motionData:MotionDataPrimitive[];
    maxMotionDataPrimitiveNum:number;
    private currentMotionDataPrimitiveNum:number = 0;
    public frameCountStep:number = 1;
    // offset:THREE.Vector3

    constructor()
    {
        this.motionData = [];

    }
    setMotionDataPrimitive(data:MotionDataPrimitive, offset?:THREE.Vector3)
    {
        data.offset = offset;
        // this.offset = offset;
        this.motionData.push(data);
        this.maxMotionDataPrimitiveNum = this.motionData.length;
    }

    next():MotionDataPrimitive
    {
        this.currentMotionDataPrimitiveNum +=this.frameCountStep;
        this.check();
        return this.motionData[0];
    }

    prev()
    {
        this.currentMotionDataPrimitiveNum-=this.frameCountStep;
        this.check();
        return this.motionData[this.currentMotionDataPrimitiveNum];
    }

    public get currentFrameVertices():MotionDataPrimitive
    {
        return this.motionData[this.currentMotionDataPrimitiveNum];
    }

    check()
    {
        if(this.currentMotionDataPrimitiveNum < 0) this.currentMotionDataPrimitiveNum = this.motionData.length-1;
        if(this.currentMotionDataPrimitiveNum >= this.maxMotionDataPrimitiveNum) this.currentMotionDataPrimitiveNum = 0;
    }
}