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
    geometry:THREE.BufferGeometry;
    constructor(sceneManager:SceneManager,camera:THREE.PerspectiveCamera)
    {
        this.sceneManager = sceneManager;
        this.scene = new THREE.Scene();
        this.camera = camera;
        this.renderTarget = createRenderTarget(this.sceneManager.abosluteResolution.x,this.sceneManager.abosluteResolution.y);


        var indices = [];
        var vertices = [];
        var colors = [];
        this.geometry = new THREE.BufferGeometry();

        var centerx = 10;
        var centery = 10;

        var size = 30;
        for (let i = 0; i < size; i++)
        {
            const x = Math.cos(Math.PI*2/(size-1) * i) * 50 + centerx;
            const y = Math.sin(Math.PI*2/(size-1) * i) * 50 + centery;
            vertices.push(x,y,0);
            colors.push(Math.random(),Math.random(),Math.random());

        }


        vertices.unshift(
            centerx,centery,0

        );

        for (let i = 1; i < size-1; i++)
        {
            indices.push( 0,i,i+1 );
            if(i == size-2)
                indices.push( 0,size-1,1 );
        }
        indices.push( 0,1,2 );
        function disposeArray() {
            this.array = null;
        }
        this.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ).onUpload( disposeArray ) );
        this.geometry.setIndex( indices );
        // this.geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
        this.geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).onUpload( disposeArray ) );
        this.geometry.computeBoundingSphere();
        var material = new THREE.MeshBasicMaterial( {

            side: THREE.DoubleSide, vertexColors: THREE.VertexColors
        } );
        var mesh = new THREE.Mesh( this.geometry , material );
        this.scene.add( mesh );

        // const verts = []
        //
        // for (let i = 0; i < 30; i ++)
        // {
        //     const x = Math.cos(Math.PI * 2/30 * i) * 100;
        //     const y = Math.sin(Math.PI * 2/30 * i) * 100;
        //     const z = 0;
        //     verts.push(new THREE.Vector3(x,y,z));
        //
        // }

        this.createShapeMesh();


    }



    createShapeMesh( ) {

        var indices = [];
        var vertices = [];
        var colors = [];

        var centerx = 100;
        var centery = 10;

        var size = 30;
        for (let i = 0; i < size; i++)
        {
            const x = Math.cos(Math.PI*2/(size-1) * i) * 50 + centerx;
            const y = Math.sin(Math.PI*2/(size-1) * i) * 50 + centery;
            vertices.push(x,y,0);
            colors.push(Math.random(),Math.random(),Math.random());

        }


        vertices.unshift(
            centerx,centery,0

        );

        // const x = Math.cos(Math.PI*2/10 * 0) * 100;
        // const y = Math.sin(Math.PI*2/10 * ) * 100;
        // vertices.push(x,y,0);
        // colors.push(Math.random(),Math.random(),Math.random());

        for (let i = 1; i < size-1; i++)
        {
            indices.push( 0,i,i+1 );
            if(i == size-2)
                indices.push( 0,size-1,1 );
        }

        // colors.push(
        //     0,1,0,
        //     1,1,1,
        //     1,1,1
        // );
        indices.push( 0,1,2 );
        function disposeArray() {
            this.array = null;
        }
        this.geometry.addAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ).onUpload( disposeArray ) );
        this.geometry.setIndex( indices );
        // this.geometry.addAttribute( 'normal', new THREE.Float32BufferAttribute( normals, 3 ).onUpload( disposeArray ) );
        this.geometry.addAttribute( 'color', new THREE.Float32BufferAttribute( colors, 3 ).onUpload( disposeArray ) );

        // @ts-ignore
        this.geometry.attributes.position.needsUpdate = true;
        this.geometry.index.needsUpdate = true;
    }

    get texture() : THREE.Texture
    {
        return this.renderTarget.texture;
    }
    public update()
    {

        // this.createShapeMesh();
        this.sceneManager.renderer.render(this.scene,this.camera,this.renderTarget);
    }
}