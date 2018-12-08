import {debug} from "util";
declare function require(x: string): any;
import * as THREE from 'three'
import {createFullScreenTexturePlane, createRenderTarget} from "./OffScreenManager";
import SceneManager from "./SceneManager";
export default class CircleHumanScene
{
    scene:THREE.Scene;
    camera:THREE.PerspectiveCamera;
    renderTarget:THREE.WebGLRenderTarget;
    sceneManager:SceneManager;
    constructor(sceneManager:SceneManager,camera:THREE.PerspectiveCamera)
    {
        this.sceneManager = sceneManager;
        this.scene = new THREE.Scene();
        this.camera = camera;
        this.renderTarget = createRenderTarget(this.sceneManager.abosluteResolution.x,this.sceneManager.abosluteResolution.y);
        // var circleRadius = 400;
        // var circleShape = new THREE.Shape();
        // circleShape.moveTo( 0, circleRadius );
        // circleShape.quadraticCurveTo( circleRadius, circleRadius, circleRadius, 0 );
        // circleShape.quadraticCurveTo( circleRadius, - circleRadius, 0, - circleRadius );
        // circleShape.quadraticCurveTo( - circleRadius, - circleRadius, - circleRadius, 0 );
        // circleShape.quadraticCurveTo( - circleRadius, circleRadius, 0, circleRadius );
        //
        // this.scene.add(this.createShapeMesh( circleShape, 0xffffff));

        var x = 0, y = 0;

        var heartShape = new THREE.Shape();

        heartShape.moveTo( x + 5, y + 5 );
        heartShape.bezierCurveTo( x + 5, y + 5, x + 4, y, x, y );
        heartShape.bezierCurveTo( x - 6, y, x - 6, y + 7,x - 6, y + 7 );
        heartShape.bezierCurveTo( x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19 );
        heartShape.bezierCurveTo( x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7 );
        heartShape.bezierCurveTo( x + 16, y + 7, x + 16, y, x + 10, y );
        heartShape.bezierCurveTo( x + 7, y, x + 5, y + 5, x + 5, y + 5 );

        var geometry = new THREE.ShapeBufferGeometry( heartShape );
        var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
        var mesh = new THREE.Mesh( geometry, material ) ;
        this.scene.add( mesh );


    }



    createShapeMesh( shape, color ) {

        var geometry = new THREE.ShapeBufferGeometry( shape );
        var mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: color, side: THREE.DoubleSide } ) );

        return mesh;
    }

    get texture() : THREE.Texture
    {
        return this.renderTarget.texture;
    }
    public update()
    {
        this.sceneManager.renderer.render(this.scene,this.camera,this.renderTarget);
    }
}