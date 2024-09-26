import * as THREE from 'three';

export class Environment {
    constructor(pipeVisualization) {
        this.loaded = false
        this.environmentMap = new THREE.CubeTextureLoader()
            .load([
                'https://cdn.shopify.com/s/files/1/0711/1848/7803/files/px.jpg?v=1726056602',
                'https://cdn.shopify.com/s/files/1/0711/1848/7803/files/nx.jpg?v=1726056602',
                'https://cdn.shopify.com/s/files/1/0711/1848/7803/files/py.jpg?v=1726056602',
                'https://cdn.shopify.com/s/files/1/0711/1848/7803/files/ny.jpg?v=1726056602',
                'https://cdn.shopify.com/s/files/1/0711/1848/7803/files/pz.jpg?v=1726056602',
                'https://cdn.shopify.com/s/files/1/0711/1848/7803/files/nz.jpg?v=1726056602'

            ], (e) => {
                this.loaded = true
                this.updateEnvironment();
            }, (e) => {
            }, (e) => {
                console.error('Error loading environment map', e)
            });
        this.pipeVisualization = pipeVisualization;
        this.scene = this.pipeVisualization.scene;
        this.gui = this.pipeVisualization.gui;
        this.params = {
            envMapIntensity: 1.25
        }
    }

    updateEnvironment() {
        this.pipeVisualization.scene.traverse((child) => {
            if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
                child.material.envMap = this.environmentMap
                child.material.envMapIntensity = this.params.envMapIntensity
                child.material.needsUpdate = true
            }
        })
    }
}
