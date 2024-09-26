import * as THREE from 'three'


export class LightSetup {
    constructor(scene) {
        this.scene = scene;
        this.array = this.createLights()
    }
    createLights() {
        this.ambientLight = new THREE.AmbientLight(0xffffff, 11);
        this.scene.add(this.ambientLight);

        this.light = new THREE.PointLight(0xffffff, 20);
        this.light.castShadow = false
        this.light.position.set(7.3, -3.66, 7)

        this.scene.add(this.light);

        this.light2 = new THREE.PointLight(0xffffff, 20);
        this.light2.castShadow = false
        this.light2.position.set(0.3, -4.62, 6.63)

        this.scene.add(this.light2);
    }
    dispose() {
        this.scene.remove(this.light);
        this.scene.remove(this.ambientLight);
    }
}
