import * as THREE from 'three'


export class LightSetup {
    constructor(scene, config = {}) {
        if (!scene) {
            console.error("Scene is required for LightSetup.");
            return;
        }

        this.scene = scene;
        this.config = {
            lights: {
                ambientLight: {
                    color: config.lights?.ambientLight?.color || 0xffffff,
                    intensity: config.lights?.ambientLight?.intensity || 11
                },
                pointLight: {
                    color: config.lights?.pointLight?.color || 0xffffff,
                    intensity: config.lights?.pointLight?.intensity || 1,
                    castShadow: config.lights?.pointLight?.castShadow || false,
                    positions: config.lights?.pointLight?.positions || [
                        { x: 7.3, y: -3.66, z: 7 },
                        { x: 0.3, y: -4.62, z: 6.63 }
                    ]
                }
            }
        };

        this.lights = [];
        this.createLights();

        this.scene.add(...this.lights);

    }

    createLights() {
        this.ambientLight = new THREE.AmbientLight(
            this.config.lights.ambientLight.color, 
            this.config.lights.ambientLight.intensity
        );
        this.scene.add(this.ambientLight);
        this.lights.push(this.ambientLight);

        this.pointLights = this.config.lights.pointLight.positions.map(position => {
            const pointLight = this.createPointLight(position);
            this.lights.push(pointLight);
            return pointLight;
        });

        // Light that moves dynamically, shining on the bend center
        this.light = this.pointLights[0];
    }

    createPointLight(position) {
        const pointLight = new THREE.PointLight(this.config.lights.pointLight.color, this.config.lights.pointLight.intensity);
        pointLight.castShadow = this.config.lights.pointLight.castShadow;
        pointLight.position.set(position.x, position.y, position.z);
        return pointLight;
    }

    dispose() {
        this.lights.forEach(light => this.scene.remove(light));
        this.lights = [];
    }
}
