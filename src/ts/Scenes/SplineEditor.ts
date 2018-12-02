import Scene from "../Scene";
import dat from '../../../node_modules/dat.gui';
declare function require(x: string): any;
import * as THREE from 'three'
import * as $ from '../../../node_modules/jquery';
import SceneManager from "../SceneManager";
import "imports-loader?THREE=three!three/examples/js/controls/DragControls.js";
// import "imports-loader?THREE=three!three/examples/js/controls/OrbitControls.js";
import "imports-loader?THREE=three!three/examples/js/controls/TransformControls.js";
class Splines {
    uniform:THREE.CatmullRomCurve3;
    centripetal:THREE.CatmullRomCurve3;
    chordal:THREE.CatmullRomCurve3;
}

class Parameters {
    uniform:Boolean;
    tension:number;
    centripetal:boolean;
    chordal:boolean;
    addPoint:Function;
    removePoint:Function;
    exportSpline:Function;

}

export default class SplineEditor {
    sceneManager:SceneManager;
    controls:THREE.OrbitControls;
    transformControl:THREE.TransformControls;
    splineHelperObjects:any[];
    dragcontrols:any;
    positions:THREE.Vector3[] = [];
    hiding:any;
    ARC_SEGMENTS:number = 200;
    point = new THREE.Vector3();
    splinePointsLength:number = 3;
    boxGeometry = new THREE.BoxBufferGeometry( 5, 5, 5 );
    splines:Splines;
    params:Parameters;
    gui:dat.Gui;
    dlLink:HTMLAnchorElement;
    blob:Blob;
    data:Object = {};
    parentScene:Scene;
    scene:THREE.Scene;

    constructor(parentScene:Scene)
    {
        this.parentScene = parentScene;
        this.sceneManager = this.parentScene.sceneManager;
        this.scene = parentScene.scene;
        this.init();
    }



    public init():void
    {


        this.dlLink = document.createElement('a');
        this.blob = new Blob([JSON.stringify(this.data, null, '  ')], {type: 'application\/json'});
        this.dlLink.href = URL.createObjectURL(this.blob);

        this.params = new Parameters();
        this.params.uniform = true;
        this.params.tension = 0.5;
        this.params.centripetal = true;
        this.params.chordal = true;
        this.params.addPoint = this.addPoint;
        this.params.removePoint = this.removePoint,
        this.params.exportSpline = this.exportSpline;


        this.splines = new Splines();
        // this.parentScene.camera.far = 10000;
        // this.parentScene.camera.near = 1;
        // this.parentScene.camera.position.set( 0, 250, 1000 );
        // this.parentScene.camera.add( new THREE.AmbientLight( 0xf0f0f0 ) );
        const light:THREE.SpotLight = new THREE.SpotLight( 0xffffff, 1.5 );
        light.position.set( 0, 1500, 200 );
        light.castShadow = true;
        // @ts-ignore
        light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 70, 1, 200, 2000 ) );
        light.shadow.bias = - 0.000222;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        this.scene.add( light );
        // const helper = new THREE.GridHelper( 2000, 100 );
        // helper.position.y = - 0;
        // helper.material.opacity = 0.25;
        // helper.material.transparent = true;
        // this.scene.add( helper );

        this.sceneManager.renderer.shadowMap.enabled = true;

        this.gui = new dat.GUI();
        this.gui.width = 400;
        this.gui.add( this.params, 'centripetal' );
        this.gui.add( this.params, 'chordal' );
        this.gui.add( this.params, 'addPoint' );
        this.gui.add( this.params, 'removePoint' );
        this.gui.add( this.params, 'exportSpline' );
        this.gui.open();

        this.controls = this.sceneManager.controls;
        // this.controls = new THREE.OrbitControls( this.parentScene.camera, this.sceneManager.renderer.domElement );
        // @ts-ignore
        this.controls.damping = 0.2;
        this.controls.addEventListener( 'change', this.updateSplines );
        this.controls.addEventListener( 'start',  ()=> {
            this.cancelHideTransorm();
        } );
        this.controls.addEventListener( 'end', ()=> {
            this.delayHideTransform();
        } );


        this.transformControl = new THREE.TransformControls( this.sceneManager.debugCamera, this.sceneManager.renderer.domElement );
        this.transformControl.addEventListener( 'change', this.updateSplines );
        this.transformControl.addEventListener( 'dragging-changed',  ( event:DragEvent )=> {
            // @ts-ignore
            this.controls.enabled = ! event.value;
        } );
        this.scene.add( this.transformControl );

        // Hiding transform situation is a little in a mess :()
        this.transformControl.addEventListener( 'change', ()=> {
            this.cancelHideTransorm();
        } );
        this.transformControl.addEventListener( 'mouseDown', ()=> {
            this.cancelHideTransorm();
        } );
        this.transformControl.addEventListener( 'mouseUp', ()=> {
            this.delayHideTransform();
        } );
        this.transformControl.addEventListener( 'objectChange', ()=> {
            this.updateSplineOutline();
        } );
        this.splineHelperObjects = [];
        // @ts-ignore
        this.dragcontrols = new THREE.DragControls( this.splineHelperObjects, this.sceneManager.debugCamera, this.sceneManager.renderer.domElement ); //
        this.dragcontrols.enabled = false;
        this.dragcontrols.addEventListener( 'hoveron', ( event )=> {
            this.transformControl.attach( event.object );
            this.cancelHideTransorm();
        } );
        this.dragcontrols.addEventListener( 'hoveroff', ()=> {
            this.delayHideTransform();
        } );


        this.positions = new Array(this.splinePointsLength);
        for ( var i = 0; i < this.splinePointsLength; i ++ ) {
            this.addSplineObject( this.positions[ i ] );
        }
        this.positions = [];
        for ( var i = 0; i < this.splinePointsLength; i ++ ) {
            this.positions.push( this.splineHelperObjects[ i ].position );
        }
        const geometry = new THREE.BufferGeometry();
        geometry.addAttribute( 'position', new THREE.BufferAttribute( new Float32Array( this.ARC_SEGMENTS * 3 ), 3 ) );
        let curve:THREE.CatmullRomCurve3 = new THREE.CatmullRomCurve3( this.positions );
        // @ts-ignore
        curve.curveType = 'catmullrom';
        // @ts-ignore
        curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
            color: 0xff0000,
            opacity: 0.35
        } ) );
        // @ts-ignore
        curve.mesh.castShadow = true;
        this.splines.uniform = curve;
        // @ts-ignore
        curve = new THREE.CatmullRomCurve3( this.positions );
        // @ts-ignore
        curve.curveType = 'centripetal';
        // @ts-ignore
        curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
            color: 0x00ff00,
            opacity: 0.35
        } ) );
        // @ts-ignore
        curve.mesh.castShadow = true;
        this.splines.centripetal = curve;
        curve = new THREE.CatmullRomCurve3( this.positions );
        // @ts-ignore
        curve.curveType = 'chordal';
        // @ts-ignore
        curve.mesh = new THREE.Line( geometry.clone(), new THREE.LineBasicMaterial( {
            color: 0x0000ff,
            opacity: 0.35
        } ) );
        // @ts-ignore
        curve.mesh.castShadow = true;
        this.splines.chordal = curve;
        for ( const k in this.splines ) {
            const spline = this.splines[ k ];
            this.scene.add( spline.mesh );
        }
        // this.load( [ new THREE.Vector3( 289.76843686945404, 452.51481137238443, 56.10018915737797 ),
        //     new THREE.Vector3( - 53.56300074753207, 171.49711742836848, - 14.495472686253045 ),
        //     new THREE.Vector3( - 91.40118730204415, 176.4306956436485, - 6.958271935582161 ),
        //     new THREE.Vector3( - 383.785318791128, 491.1365363371675, 47.869296953772746 ) ] );
        // //

    }

    addSplineObject=( position? ):THREE.Mesh=> {
        const material = new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } );
        const object:THREE.Mesh = new THREE.Mesh( this.boxGeometry, material );
        if ( position ) {
            object.position.copy( position );
        } else {
            object.position.x = Math.random() * 1000 - 500;
            object.position.y = Math.random() * 600;
            object.position.z = Math.random() * 800 - 400;
        }
        object.castShadow = true;
        object.receiveShadow = true;
        this.scene.add( object );
        this.splineHelperObjects.push( object );
        return object;
    };

    addPoint=(position?:THREE.Vector3)=> {
        this.splinePointsLength ++;
        if(position){
            this.positions.push(this.addSplineObject(position).position );
        } else
        {
            this.positions.push( this.addSplineObject().position );
        }
        this.updateSplineOutline();
    };
    removePoint=()=> {
        if ( this.splinePointsLength <= 4 ) {
            return;
        }
        this.splinePointsLength --;
        this.positions.pop();
        this.scene.remove( this.splineHelperObjects.pop() );
        this.updateSplineOutline();
    };
    updateSplineOutline=()=> {
        for ( const k in this.splines ) {
            const spline = this.splines[ k ];
            const splineMesh = spline.mesh;
            const position = splineMesh.geometry.attributes.position;
            for ( let i = 0; i < this.ARC_SEGMENTS; i ++ ) {
                const t = i / ( this.ARC_SEGMENTS - 1 );
                // console.log(this.point);
                spline.getPoint( t, this.point );
                position.setXYZ( i, this.point.x, this.point.y, this.point.z );
            }
            position.needsUpdate = true;
        }
    };
    exportSpline=()=> {

        this.data = JSON.stringify({
            name:"name"
        });

        this.blob = new Blob([this.data], {type: "text.plain"});
        this.dlLink.download = "points";
        this.dlLink.href = URL.createObjectURL(this.blob);
        this.dlLink.dataset.downloadurl = ["text/plain", this.dlLink.download, this.dlLink.href].join(":");
        this.dlLink.click();

        // $('<a href="data:' + data + '" download="data.json">download JSON</a>').appendTo('#container');

    };
    load =( new_positions:THREE.Vector3[] )=> {
        while ( new_positions.length > this.positions.length ) {
            this.addPoint();
        }
        while ( new_positions.length < this.positions.length ) {
            this.removePoint();
        }
        for ( var i = 0; i < this.positions.length; i ++ ) {
            this.positions[ i ].copy( new_positions[ i ] );
        }
        this.updateSplineOutline();
    };

    updateSplines =()=> {
        // @ts-ignore
        this.splines.uniform.mesh.visible = this.params.uniform;
        // @ts-ignore
        this.splines.centripetal.mesh.visible = this.params.centripetal;
        // @ts-ignore
        this.splines.chordal.mesh.visible = this.params.chordal;

    };


    update()
    {

    }


    delayHideTransform =()=> {
        this.cancelHideTransorm();
        this.hideTransform();
    };
    hideTransform=()=> {
        this.hiding = setTimeout( ()=> {
            // @ts-ignore
            this.transformControl.detach( this.transformControl.object );
        }, 2500 );
    };
    cancelHideTransorm=()=> {
        if ( this.hiding ) clearTimeout( this.hiding );
    }
}