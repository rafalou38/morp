import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class ScenePlay extends THREE.Scene{
    scene: THREE.Scene;
    playerBar: THREE.Mesh;
    camera: THREE.Camera; 
    constructor(){
        super();
        
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
		this.camera.position.set(0, 2.5, 5);
		this.camera.rotation.set(-8.5, 0, 0);
        this.add(this.camera);

        const geometry = 
            new THREE.BoxGeometry(0.2, 0.2, 0.5 )
            .translate( 0, 0, -0.5/2 );

		const material = new THREE.MeshNormalMaterial();
        
		this.playerBar = new THREE.Mesh(geometry, material);
        this.playerBar.position.set(0,0,-20);
        this.playerBar.scale.set(0.2,0.2,40);
		this.add(this.playerBar);

        

        const axesHelper = new THREE.AxesHelper( 5 );
        this.add( axesHelper );
    }

    update(time){
        // this.playerBar.scale.z = time / 10000;
    }
}