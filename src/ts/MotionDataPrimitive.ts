import * as THREE from "three";

export default class MotionDataPrimitive
{
    positions:THREE.Vector3[];
    colors:THREE.Color[] = [];
    public offset:THREE.Vector3;
    constructor(positions:THREE.Vector3[])
    {
        this.positions = positions;


        for (let i = 0; i < positions.length; i++)
        {
            this.colors.push(new THREE.Color(0xffffff * Math.random()));
        }
    }
}