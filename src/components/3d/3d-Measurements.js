import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const bendAngleLineCurvePoints = 50;

const config = {
    labels: {
        TANGENT_A: 'Tangent A',
        TANGENT_B: 'Tangent B',
        BEND_RADIUS: 'CLR',
        BEND_ANGLE: 'Bend Angle',
        OD_TUBE: 'OD',
        ID_TUBE: 'ID'
    },
    defaultInches: 10,
    defaultDegrees: 10,
    defaultTubeOuterSize: 1,
    defaultTubeInnerSize: 0.8,
    fontSize: 0.5,
    textPipeOffset: -0.9,
    cameraOffset: 30,
    tangentATextOffset: { x: -1, y: -2.5, z: 0 },
    tangentBTextOffset: { x: 0, y: -4, z: 0 },
    tubeOuterSizeMultiplier: 1.5,
    bendRadiusTextOffset: 0.5,
    bendAngleTextOffset: { x: 0, y: -0.1, z: 0 },
    tubeSizesTextOffset: { y: -4, spacing: -0.2 },
    sharpAngleThreshold: 90,
    verySharpAngleThreshold: 40,
    maxBendAngle: 180,
    fontUrl: 'https://cdn.shopify.com/s/files/1/0711/1848/7803/files/assistant.json?v=1726238168'
};

export default class Measurements {
    constructor(pipeVisualization, pipe) {
        this.pipeVisualization = pipeVisualization;
        this.camera = this.pipeVisualization.camera;
        this.scene = this.pipeVisualization.scene
        this.pipe = pipe
        this.model = this.pipe.model

        this.tangentA = new THREE.Group();
        this.tangentB = new THREE.Group();

        this.bendRadius = new THREE.Group();
        this.bendAngle = new THREE.Group();
        this.tubeSizes = new THREE.Group();

        this.measurementsGroup = new THREE.Group();

        this.measurementsGroup.add(
            this.tangentA,
            this.tangentB,
            this.bendRadius,
            this.bendAngle,
            this.tubeSizes
        )

        this.textMaterial = new THREE.MeshStandardMaterial({
            color: 0xffffff,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending
        });

        this.tangentAInches = config.defaultInches;
        this.tangentBInches = config.defaultInches;
        this.bendRadiusInches = config.defaultInches;
        this.bendAngleDegrees = config.defaultDegrees;

        this.tubeOuterSize = config.defaultTubeOuterSize;
        this.tubeInnerSize = config.defaultTubeInnerSize;

        this.fontSize = config.fontSize;
        this.textPipeOffset = config.textPipeOffset;

        this.loader = new FontLoader();
        this.cameraOffset = config.cameraOffset;

        this.differenceToCamera = this.camera.position.z - this.cameraOffset;

        this.font = null

        this.loadFont();

    }
    loadFont() {
        this.loader.load(
            config.fontUrl,
            (font) => {
                this.font = font;
                this.createAllMeasurements();
            },
            (progress) => () => { },
            (error) => console.error('Error loading font', error)
        );
    }
    createAllMeasurements() {
        this.createTangentA(this.tangentAInches);
        this.createTangentB(this.tangentBInches);
        this.createBendRadius(this.bendRadiusInches);
        this.createBendAngle(this.bendAngleDegrees);
        this.createTubeSizes(this.tubeOuterSize, this.tubeInnerSize);
    }

    createTextGeometry(text) {
        return new TextGeometry(text, {
            font: this.font,
            size: this.fontSize + (this.differenceToCamera) / 100,
            depth: 0,
            height: 0,
            curveSegments: 2,
            bevelEnabled: false
        });
    }
    createTangentA(inches) {
        if (this.font == undefined) return;
        this.clearChildren(this.tangentA)
        const inchesToFixedOne = inches.toFixed(1);
        const geometry = this.createTextGeometry(`${config.labels.TANGENT_A}: ${inchesToFixedOne}"`);

        const text = new THREE.Mesh(geometry, this.textMaterial);
        text.position.set(
            inches / 2 + config.tangentATextOffset.x,
            config.tangentATextOffset.y,
            config.tangentATextOffset.z
        );


        const planeGeometry = new THREE.PlaneGeometry(inches + 0.01, 0.1);
        const planeMaterial = this.textMaterial
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        const offset = this.tubeOuterSize * 1.5;
        plane.position.set(inches / 2, -offset, 0);
        text.position.y -= offset + this.textPipeOffset + (this.differenceToCamera) / 100
        text.geometry.translate(-1.5, 0.25, 0)

        this.tangentA.add(text, plane)
    }
    createTangentB(inches) {
        if (this.font == undefined) return;

        this.clearChildren(this.tangentB)

        const inchesToFixedOne = inches.toFixed(1);
        const geometry = this.createTextGeometry(`${config.labels.TANGENT_B}: ${inchesToFixedOne}"`);

        const text = new THREE.Mesh(geometry, this.textMaterial);
        text.position.set(
            config.tangentBTextOffset.x,
            config.tangentBTextOffset.y,
            config.tangentBTextOffset.z
        );

        const planeGeometry = new THREE.PlaneGeometry(inches + 0.01, 0.1);
        const planeMaterial = this.textMaterial
        const plane = new THREE.Mesh(planeGeometry, planeMaterial);

        const bendAngle = this.bendAngleDegrees * (Math.PI / 180);

        const bendEnd = new THREE.Vector3(
            this.tangentAInches + this.bendRadiusInches * Math.sin(bendAngle),
            0,
            this.bendRadiusInches - this.bendRadiusInches * Math.cos(bendAngle)
        );

        const tangentBPosition = new THREE.Vector3(
            bendEnd.x + this.tangentBInches * Math.cos(bendAngle),
            bendEnd.z + this.tangentBInches * Math.sin(bendAngle),
            0,
        );

        const offsetDistance = - this.tubeOuterSize * config.tubeOuterSizeMultiplier;

        const normalDirection = new THREE.Vector3(
            -Math.sin(bendAngle),
            Math.cos(bendAngle),
            0
        ).normalize();

        tangentBPosition.add(normalDirection.multiplyScalar(offsetDistance));

        const parallelDirection = new THREE.Vector3(
            Math.cos(bendAngle),
            Math.sin(bendAngle),
            0
        ).normalize();

        tangentBPosition.add(parallelDirection.multiplyScalar(-inches / 2));

        plane.position.copy(tangentBPosition);
        plane.rotation.z = bendAngle;

        const isSharpAngle = this.bendAngleDegrees < config.sharpAngleThreshold;

        text.geometry.translate(
            -2.5,
            isSharpAngle ? -2.25 - (this.textPipeOffset + (this.differenceToCamera) / 100) : (this.textPipeOffset + (this.differenceToCamera) / 100) + 2,
            0
        )

        if (this.bendAngleDegrees < config.verySharpAngleThreshold) {
            text.geometry.translate(5 + (this.differenceToCamera) / 10, 0, 0)
        }

        text.position.copy(tangentBPosition);
        text.rotation.z = bendAngle - Math.PI - Math.PI * (this.bendAngleDegrees < 90 ? -1 : 0);

        this.tangentB.add(plane, text);
    }

    createBendRadius(inches) {
        if (this.font == undefined) return;

        this.clearChildren(this.bendRadius);

        const inchesToFixedOne = inches.toFixed(1);

        const geometry = this.createTextGeometry(`${config.labels.BEND_RADIUS}: ${inchesToFixedOne}"`);
        geometry.center()

        const text = new THREE.Mesh(geometry, this.textMaterial);

        const bendRadius = this.bendRadiusInches;
        const bendAngle = this.bendAngleDegrees * (Math.PI / 180);

        const bendMiddle = new THREE.Vector3(0, bendRadius, 0);

        const offsetDistance = config.bendRadiusTextOffset - this.tubeOuterSize / 2 - this.fontSize * 3 - (this.differenceToCamera) / 20;

        const normalDirection = new THREE.Vector3(
            Math.sin(bendAngle / 2),
            -Math.cos(bendAngle / 2) + 0.01,
            0
        ).normalize();

        const textPosition = bendMiddle.clone().add(normalDirection.multiplyScalar(offsetDistance));

        text.position.copy(textPosition);


        const lineGeometry = new THREE.PlaneGeometry(bendRadius, 0.1);
        const lineMaterial = this.textMaterial;
        const line = new THREE.Mesh(lineGeometry, lineMaterial);

        line.position.set(
            this.tangentAInches + (bendRadius / 2) * Math.sin(bendAngle / 2),
            bendRadius / 2 - (bendRadius / 2) * Math.cos(bendAngle / 2) + inches / 2,
            0,
        );
        line.rotation.z = Math.PI / 2 + this.bendAngleDegrees * (Math.PI / 180) / 2;

        text.rotation.z = this.bendAngleDegrees * (Math.PI / 180) / 2 - Math.PI / 2;
        text.position.x += this.tangentAInches

        const pipeLight = this.pipeVisualization.light
        if (pipeLight) {
            pipeLight.position.copy(text.position)
            pipeLight.position.z = 10
        }

        this.bendRadius.add(text, line);
    }

    bend(geometry, axis, angle, radius) {
        let theta = 0;

        if (angle !== 0) {

            const v = geometry.attributes.position.array;
            for (let i = 0; i < v.length; i += 3) {

                let x = v[i];
                let y = v[i + 1];
                let z = v[i + 2];

                let originalX = x;
                let originalY = y;
                let originalZ = z;

                switch (axis) {
                    case "x":
                        theta = z * angle;
                        break;
                    case "y":
                        theta = x * angle;
                        break;
                    default:
                        theta = x * angle;
                        break;
                }

                let sinTheta = Math.sin(theta);
                let cosTheta = Math.cos(theta);

                switch (axis) {
                    case "x":
                        x = originalX;
                        y = (originalY - radius) * cosTheta + radius;
                        z = -(originalY - radius) * sinTheta;
                        break;
                    case "y":
                        x = -(originalZ - radius) * sinTheta;
                        y = originalY;
                        z = (originalZ - radius) * cosTheta + radius;
                        break;
                    default: // "z"
                        x = -(originalY - radius) * sinTheta;
                        y = (originalY - radius) * cosTheta + radius;
                        z = originalZ;
                        break;
                }

                let factor = angle / (Math.abs(angle) + 1);
                v[i] = originalX + factor * (x - originalX);
                v[i + 1] = originalY + factor * (y - originalY);
                v[i + 2] = originalZ + factor * (z - originalZ);
            }
            geometry.attributes.position.needsUpdate = true;
        }
    }

    createBendAngle(degrees) {
        if (this.font == undefined) return;

        const maxAngle = config.maxBendAngle

        this.clearChildren(this.bendAngle);

        const degreesToFixedOne = degrees.toFixed(1);

        const geometry = this.createTextGeometry(`${config.labels.BEND_ANGLE}: ${degreesToFixedOne}°`);
        geometry.translate(
            (maxAngle - degrees) / maxAngle,
            config.bendAngleTextOffset.y,
            config.bendAngleTextOffset.z
        );

        const bendRadius = this.bendRadiusInches;
        const bendAngleRadians = degrees * (Math.PI / 180);
        const curve = new THREE.ArcCurve(
            0, 0,
            bendRadius + this.tubeOuterSize * 1.5,
            0 - Math.PI / 2,
            bendAngleRadians - Math.PI / 2,
            false
        );
        const points = curve.getPoints(bendAngleLineCurvePoints);
        const curveGeometry = new THREE.BufferGeometry().setFromPoints(points);
        const lineMaterial = new THREE.LineBasicMaterial({ color: 0xaaaaaa });
        const line = new THREE.Line(curveGeometry, lineMaterial);
        curveGeometry.dispose()

        line.position.x = this.tangentAInches;
        line.position.y = this.bendRadiusInches;

        const textMesh = new THREE.Mesh(geometry, this.textMaterial);

        textMesh.rotation.z = -Math.PI / 2 + this.bendAngleDegrees * (Math.PI / 180) / 2;

        const bendAngle = this.bendAngleDegrees * (Math.PI / 180);

        textMesh.position.set(
            this.tangentAInches + (bendRadius + this.tubeOuterSize * 2) * Math.sin(bendAngle / 2),
            bendRadius / 2 - (bendRadius + this.tubeOuterSize * 2) * Math.cos(bendAngle / 2) + this.bendRadiusInches / 2,
            0,
        );

        this.bendAngle.add(textMesh, line);

    }

    createTubeSizes(outerSize, innerSize) {
        if (this.font == undefined) return;

        this.clearChildren(this.tubeSizes);

        const outerSizeToFixedOne = outerSize.toFixed(1);
        const innerSizeToFixedOne = innerSize.toFixed(1);

        const geometry = this.createTextGeometry(`${config.labels.ID_TUBE}: ${innerSizeToFixedOne}"`);
        const geometry2 = this.createTextGeometry(`${config.labels.OD_TUBE}: ${outerSizeToFixedOne}"`);

        const text = new THREE.Mesh(geometry, this.textMaterial);
        const text2 = new THREE.Mesh(geometry2, this.textMaterial);
        text.position.set(this.tangentAInches / 2 - 1, -2.5, 0);
        text.geometry.translate(-2.5, 0.25, 0)
        text2.geometry.translate(-2.5, 0.25, 0)

        text.position.set(
            this.tangentAInches / 2 - 1,
            config.tubeSizesTextOffset.y - outerSize - (this.differenceToCamera) / 75,
            0
        );
        text2.position.set(
            this.tangentAInches / 2 - 1,
            config.tubeSizesTextOffset.y + config.tubeSizesTextOffset.spacing - outerSize - (this.differenceToCamera) / 37 - this.fontSize,
            0
        );

        this.tubeSizes.add(text, text2)
    }

    update() {
        if (this.font) {
            this.createAllMeasurements();
        }
    }

    clearChildren(group) {
        for (var i = group.children.length - 1; i >= 0; i--) {
            if (group.children[i].geometry) {
                group.children[i].geometry.dispose();
            }
            group.remove(group.children[i]);
        }
    }


}
