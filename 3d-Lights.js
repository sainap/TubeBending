import * as THREE from 'three'


export class LightSetup {
    constructor(scene, config = {}) {
        this.config = {
            lights: {
                ambientLight: {
                    color: 0xffffff,
                    intensity: 11
                },
                pointLight: {
                    color: 0xffffff,
                    intensity: 20,
                    castShadow: false,
                    positions: [
                        { x: 7.3, y: -3.66, z: 7 },
                        { x: 0.3, y: -4.62, z: 6.63 }
                    ]
                }
            },
        }
        this.scene = scene;
        this.lights = [];
        this.createLights();
    }

    createLights() {
        this.ambientLight = new THREE.AmbientLight(this.config.lights.ambientLight.color, this.config.lights.ambientLight.intensity);
        this.scene.add(this.ambientLight);
        this.lights.push(this.ambientLight); 

        this.pointLights = this.config.lights.pointLight.positions.map(position => {
            const pointLight = this.createPointLight(position);
            this.lights.push(pointLight);
            return pointLight;
        });
    }

    createPointLight(position) {
        const pointLight = new THREE.PointLight(this.config.lights.pointLight.color, this.config.lights.pointLight.intensity);
        pointLight.castShadow = this.config.lights.pointLight.castShadow;
        pointLight.position.set(position.x, position.y, position.z);
        this.scene.add(pointLight);
        return pointLight;
    }

    dispose() {
        this.lights.forEach(light => this.scene.remove(light));
    }
}
