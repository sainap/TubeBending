import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import Pipe from './3d-Pipe.js';
import { Environment } from './3d-Environment.js';
import { GradientBackgronund } from './3d-Background.js';
import { LightSetup } from './3d-Lights.js';

const interval = 1 / 30

class PipeVisualization {
    constructor() {
        this.clock = new THREE.Clock();
        this.delta = 0

        this.container = document.getElementById('visualization-container');
        this.canvas = document.getElementById('webgl');

        this.image = document.getElementById('preview');

        this.pipeGroup = new THREE.Group();

        this.scene = new THREE.Scene();
        this.environment = new Environment(this)


        const cubeMap = this.environment.environmentMap
        this.environmentMap = cubeMap

        this.gradient = new GradientBackgronund({
            startColor: '111111',
            intermediaryColor: '222222',
            endColor: 'a0a0a0',
            canvasWidth: 512,
            canvasHeight: 512,
            canvasGradient: 512,
            gradientStops: [0, 0.3, 1]
        });

        this.scene.background = this.gradient.getTexture()

        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.camera = new THREE.PerspectiveCamera(
            40, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.enableZoom = false;
        this.controls.enableRotate = false;
        this.controls.enablePan = false;
        this.controls.dampingFactor = 0.25;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 100;
        this.measurements = null

        window.addEventListener('resize', this.resize.bind(this));
        this.resize();

        this.lights = []
        this.init();
    }

    setLights() {
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

    init() {
        this.rect = this.container.getBoundingClientRect();

        this.renderer.setSize(this.rect.width, this.rect.height);

        this.camera.position.z = 15;
        this.scene.add(this.camera);

        this.pipe = new Pipe(this);

        this.measurements = this.pipe.measurements
        this.pipeGroup.add(this.pipe.model);
        this.scene.add(this.pipeGroup)
        const lightSetup = new LightSetup(this.scene)
        this.lights = lightSetup.array

        this.light = lightSetup.light
        this.light2 = lightSetup.light2
    }

    animate() {
        this.delta += this.clock.getDelta();
        if (this.controls) {
            this.controls.update();
        }


        if (this.delta > interval) {
            if (this.stats) {
                this.stats.update()
            }
            this.delta = this.delta % interval;
            this.renderer.render(this.scene, this.camera);
        }


    }

    resize() {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.rect = this.container.getBoundingClientRect();

        this.camera.aspect = this.rect.width / this.rect.height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.rect.width, this.rect.height);
        this.renderer.setPixelRatio(pixelRatio);
        const camera = this.camera

        camera.updateProjectionMatrix();
        this.animate();
    }

}

const pipeVisualization = new PipeVisualization();
window.pipeVisualization = pipeVisualization
