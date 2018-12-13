import * as THREE from 'three'
const offScreenFs = require( "./shaders/offScreen.fs");
const offScreenVs = require( "./shaders/offScreen.vs");

export function createRenderTarget(width: number, height: number): THREE.WebGLRenderTarget {
    return new THREE.WebGLRenderTarget(width, height, {
        magFilter: THREE.NearestFilter,
        minFilter: THREE.NearestFilter,
        wrapS: THREE.ClampToEdgeWrapping,
        wrapT: THREE.ClampToEdgeWrapping
    });
}
export function createFullScreenTexturePlane(texture:THREE.Texture,fs?:any,segments?:number): THREE.Mesh {
    const geo = new THREE.PlaneBufferGeometry(2,2, segments ? segments : 2);
    const uniforms = { uTex: { type: "t", value: texture } };
    const mat = new THREE.ShaderMaterial({
        uniforms:uniforms,
        vertexShader: offScreenVs,
        fragmentShader:fs ? fs :offScreenFs,
        transparent:true
    });

    return new THREE.Mesh(geo,mat);

}


export function createCustumShaderPlane(vs:any,fs:any): THREE.Mesh {
    const geo = new THREE.PlaneBufferGeometry(2,2);
    const uniforms = { time: { value: 0.0 } };
    const mat = new THREE.ShaderMaterial({
        uniforms:uniforms,
        vertexShader: vs,
        fragmentShader:fs,
        transparent:true
    });

    return new THREE.Mesh(geo,mat);

}
