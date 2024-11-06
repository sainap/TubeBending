import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import Measurements from './3d-Measurements.js';
import { ProfiledContourGeometry } from './3d-ProfiledContourGeometry.js';

export default class Pipe {
  constructor(pipeVisualization) {
    this.pipeVisualization = pipeVisualization;
    this.pipeGroup = this.pipeVisualization.pipeGroup;
    this.screenshotContainer = document.getElementById('zoomed-container');
    this.measurements = new Measurements(this.pipeVisualization, this);
    this.pipeGroup.add(this.measurements.measurementsGroup);

    this.params = {
      materialType: 'aluminium',
      bendRadius: 3,
      bendAngle: 88,
      tangentA: 2,
      tangentB: 2,
      tubeOuterSize: 1.66,
      tubeInnerSize: 1.38,
      arcPoints: 35,
      steps: 20,
      extrudeSegments: 50,
      materials: {
        aluminium: {
          color: '#d5d5d3',
          metalness: 0.95,
          roughness: 0.25,
        },
        steel: {
          color: '#c0c0c0',
          metalness: 0.925,
          roughness: 0.375,
        },
        stainless: {
          color: '#c8c8c8',
          metalness: 0.925,
          roughness: 0.375,
        }
      },
    };

    this.materials = this.createMaterials();
    this.material = this.materials[this.params.materialType];
    this.model = this.createPipeMesh();
    this.screenshot = null;
    this.groupSize = 40;
    this.gui = this.pipeVisualization.gui;

    this.updateMaterial();
  }

  /**
   * Creates materials based on the parameters.
   * @returns {Object} An object containing the created materials.
   */
  createMaterials() {
    const materials = {};
    for (const [type, params] of Object.entries(this.params.materials)) {
      materials[type] = new THREE.MeshStandardMaterial({
        ...params,
        side: THREE.DoubleSide,
      });
    }
    return materials;
  }

  /**
   * Takes a screenshot of the current scene and updates the screenshot image.
   */
  takeScreenshot() {
    this.pipeVisualization.renderer.render(
      this.pipeVisualization.scene,
      this.pipeVisualization.camera
    );
    const ss = this.pipeVisualization.canvas.toDataURL();
    if (!this.screenshot) {
      this.screenshot = new Image();
      this.screenshot.id = 'screenshot';
      this.screenshot.style.width = 'auto';
      this.screenshot.style.height = '100%';
    }
    this.screenshot.src = ss;
    this.screenshot.onload = () => {
      document.getElementById('screenshot')?.remove();
      this.screenshotContainer.appendChild(this.screenshot);
    };
  }

  /**
   * Updates the material of the model and its children.
   */
  updateMaterial() {
    this.model.traverse((child) => {
      if (child.isMesh) {
        child.material = this.material;
        child.material.needsUpdate = true;
      }
    });
    this.pipeVisualization.environment.updateEnvironment();
    this.takeScreenshot();
  }

  /**
   * Creates the initial pipe mesh.
   * @returns {THREE.Mesh} The created pipe mesh.
   */
  createPipeMesh() {
    const tube = new THREE.Mesh(new THREE.BufferGeometry(), this.material);
    this.pipeGroup.add(tube);
    return tube;
  }

  /**
   * Updates the pipe geometry based on the current parameters.
   */
  updatePipe() {
    const {
      bendRadius,
      bendAngle,
      tangentA,
      tangentB,
      tubeOuterSize,
      tubeInnerSize,
      arcPoints,
    } = this.params;

    const adjustedBendAngle = (bendAngle + 0.01) * (Math.PI / 180);
    const adjustedTangentA = tangentA + 0.001;

    const start = new THREE.Vector3(0, 0, 0);
    const tangentPointA = new THREE.Vector3(adjustedTangentA, 0, 0);
    const bendStart = tangentPointA.clone().multiplyScalar(adjustedTangentA ? 0.95 : 1);
    const bendEnd = new THREE.Vector3(
      adjustedTangentA + bendRadius * Math.sin(adjustedBendAngle),
      0,
      bendRadius - bendRadius * Math.cos(adjustedBendAngle)
    );
    const tangentPointB = new THREE.Vector3(
      bendEnd.x + tangentB * Math.cos(adjustedBendAngle),
      0,
      bendEnd.z + tangentB * Math.sin(adjustedBendAngle)
    );

    const points = this.generatePipePoints(start, bendStart, tangentPointB, adjustedTangentA, bendRadius, adjustedBendAngle, arcPoints);

    // Create the path curve
    const path = new THREE.CatmullRomCurve3(points.reverse());
    path.curveType = 'centripetal';
    path.tension = 0.5;

    // Define the shapes for the pipe geometry
    const shape = new THREE.Shape();
    shape.holes.push(
      new THREE.Path().absarc(0, 0, tubeInnerSize, 0, Math.PI * 2, false)
    );

    const shape2 = new THREE.Shape();
    shape2.holes.push(
      new THREE.Path().absarc(0, 0, tubeOuterSize, 0, Math.PI * 2, true)
    );

    const contour = path.getPoints(arcPoints).map((p) => new THREE.Vector2(p.x, p.z));

    // Create two geometries and merge them
    const g = new ProfiledContourGeometry(shape, contour, false, false);
    const g2 = new ProfiledContourGeometry(shape2, contour, false, false);

    const mergedGeometry = BufferGeometryUtils.mergeGeometries([g, g2]);

    // Dispose of geometries to free memory
    g.dispose();
    g2.dispose();

    // Update the model's geometry
    if (this.model.geometry) this.model.geometry.dispose();
    this.model.geometry = mergedGeometry;
    this.model.material = this.material;

    this.clearChildren();
    this.addEndCaps(points, adjustedBendAngle, bendEnd);

    this.model.geometry.computeBoundingBox();

    // Update measurements
    if (this.measurements) {
      Object.assign(this.measurements, {
        tangentAInches: adjustedTangentA,
        bendRadiusInches: bendRadius,
        bendAngleDegrees: bendAngle,
        tangentBInches: tangentB,
        tubeOuterSize,
        tubeInnerSize,
      });
      this.measurements.update();
    }

    this.groupSize = new THREE.Box3()
      .setFromObject(this.pipeGroup)
      .getSize(new THREE.Vector3())
      .length();

    this.fitCameraToObject(
      this.pipeVisualization.camera,
      this.pipeVisualization.pipeGroup,
      1.25,
      this.pipeVisualization.controls
    );

    this.measurements.update();
    this.pipeVisualization.animate();
    requestAnimationFrame(() => {
      this.takeScreenshot();
    });
  }

  generatePipePoints(start, bendStart, tangentPointB, adjustedTangentA, bendRadius, adjustedBendAngle, arcPoints) {
    const points = [start, bendStart];

    for (let i = 0; i <= arcPoints; i++) {
      const t = i / arcPoints;
      const angle = t * adjustedBendAngle;
      const x = adjustedTangentA + bendRadius * Math.sin(angle);
      const z = bendRadius - bendRadius * Math.cos(angle);
      points.push(new THREE.Vector3(x, 0, z));
    }

    points.push(tangentPointB);
    return points;
  }

  /**
   * Clears the child meshes from the model.
   */
  clearChildren() {
    while (this.model.children.length > 0) {
      const child = this.model.children.pop();
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
    }
  }

  /**
   * Adds end caps to the pipe model.
   * @param {THREE.Vector3[]} points - The points defining the pipe path.
   * @param {number} adjustedBendAngle - The adjusted bend angle in radians.
   * @param {THREE.Vector3} bendEnd - The end point of the bend.
   */
  addEndCaps(points, adjustedBendAngle, bendEnd) {
    const { tubeOuterSize, tubeInnerSize, tangentB } = this.params;

    const createEndCap = () => {
      const shape = new THREE.Shape().absarc(0, 0, tubeOuterSize, 0, Math.PI * 2, false);
      const hole = new THREE.Path().absarc(0, 0, tubeInnerSize, 0, Math.PI * 2, true);
      shape.holes.push(hole);
      return new THREE.ShapeGeometry(shape, 30);
    };

    const end1Geometry = createEndCap();
    const end2Geometry = createEndCap();

    end1Geometry.rotateY(Math.PI * 0.5);

    const end1Mesh = new THREE.Mesh(end1Geometry, this.material);
    const end2Mesh = new THREE.Mesh(end2Geometry, this.material);

    end2Mesh.rotation.y = Math.PI * 0.5;
    end1Mesh.rotation.x = Math.PI * 0.5;
    end1Mesh.rotation.y = adjustedBendAngle;

    const tangentBPosition = new THREE.Vector3(
      bendEnd.x + tangentB * Math.cos(adjustedBendAngle),
      bendEnd.z + tangentB * Math.sin(adjustedBendAngle),
      0,

    );

    end1Mesh.position.copy(tangentBPosition);
    end2Mesh.position.copy(points[points.length - 1]);

    this.model.add(end1Mesh, end2Mesh);
  }

  /**
   * Fits the camera to the object within the scene.
   * @param {THREE.PerspectiveCamera} camera - The camera to adjust.
   * @param {THREE.Object3D} object - The object to fit within the camera view.
   * @param {number} [offset=1.25] - The zoom-out factor.
   * @param {Object} controls - The camera controls.
   */
  fitCameraToObject(camera, object, offset = 1.25, controls) {
    camera.updateProjectionMatrix();

    const boundingBox = new THREE.Box3().setFromObject(object);
    const center = boundingBox.getCenter(new THREE.Vector3());
    const size = boundingBox.getSize(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov * Math.PI) / 180;
    let cameraZ = Math.abs((maxDim / 4) * Math.tan(fov * 2));

    cameraZ *= offset;
    camera.position.set(-3, 7.5, cameraZ);

    this.measurements.differenceToCamera = cameraZ - this.measurements.cameraOffset;

    const minZ = boundingBox.min.z;
    const cameraToFarEdge = minZ < 0 ? -minZ + cameraZ : cameraZ - minZ;

    camera.far = cameraToFarEdge * 3;

    if (controls) {
      controls.target.set(center.x, center.y + 1.5, center.z);
      controls.maxDistance = cameraToFarEdge * 2;
      controls.saveState();
    } else {
      camera.lookAt(center);
    }

    if (
      this.pipeVisualization.image.style.display !== 'none' &&
      this.measurements.font != null &&
      this.pipeVisualization.environment.loaded
    ) {
      this.pipeVisualization.image.style.display = 'none';
    }
  }
}
