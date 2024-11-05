import * as THREE from 'three';

export function ProfiledContourGeometry(profileShape, contour, contourClosed = true, openEnded = false) {
    openEnded = contourClosed ? false : openEnded;
    let profileGeometry = new THREE.ShapeGeometry(profileShape, 35);
    let flipProfileGeometry = flipShapeGeometry(profileGeometry);
    profileGeometry.rotateX(Math.PI * 0.5);

    let profile = profileGeometry.attributes.position;
    let addEnds = openEnded ? 0 : 2;
    let profilePoints = new Float32Array(profile.count * (contour.length + addEnds) * 3);

    let endProfiles = [];

    for (let i = 0; i < contour.length; i++) {
        let v1 = new THREE.Vector2().subVectors(contour[i - 1 < 0 ? contour.length - 1 : i - 1], contour[i]);
        let v2 = new THREE.Vector2().subVectors(contour[i + 1 === contour.length ? 0 : i + 1], contour[i]);

        let angle = v2.angle() - v1.angle();
        let halfAngle = angle * 0.5;

        let hA = halfAngle;
        let tA = v2.angle() + Math.PI * 0.5;
        if (!contourClosed) {
            if (i === 0 || i === contour.length - 1) {
                hA = Math.PI * 0.5;
            }
            if (i === contour.length - 1) {
                tA = v1.angle() - Math.PI * 0.5;
            }
        }

        let shift = Math.tan(hA - Math.PI * 0.5);
        let shiftMatrix = new THREE.Matrix4().set(
            1, 0, 0, 0,
            -shift, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        );

        let rotationMatrix = new THREE.Matrix4().makeRotationZ(tA);
        let translationMatrix = new THREE.Matrix4().makeTranslation(contour[i].x, contour[i].y, 0);

        let cloneProfile = profile.clone();
        cloneProfile.applyMatrix4(shiftMatrix);
        cloneProfile.applyMatrix4(rotationMatrix);
        cloneProfile.applyMatrix4(translationMatrix);

        profilePoints.set(cloneProfile.array, cloneProfile.count * i * 3);

        if (!openEnded && (i === 0 || i === contour.length - 1)) {
            endProfiles.push(cloneProfile);
        }
    }

    // Handle the ends if openEnded is false
    endProfiles.forEach((ep, idx) => {
        profilePoints.set(ep.array, ep.count * (contour.length + idx) * 3);
    });

    let fullProfileGeometry = new THREE.BufferGeometry();
    fullProfileGeometry.setAttribute("position", new THREE.BufferAttribute(profilePoints, 3));

    let index = [];
    let lastCorner = contourClosed == false ? contour.length - 1 : contour.length;
    for (let i = 0; i < lastCorner; i++) {
        for (let j = 0; j < profile.count; j++) {
            let currCorner = i;
            let nextCorner = i + 1 == contour.length ? 0 : i + 1;
            let currPoint = j;
            let nextPoint = j + 1 == profile.count ? 0 : j + 1;

            let a = nextPoint + profile.count * currCorner;
            let b = currPoint + profile.count * currCorner;
            let c = currPoint + profile.count * nextCorner;
            let d = nextPoint + profile.count * nextCorner;


            index.push(a, b, d);
            index.push(b, c, d);
        }
    }


    if (!openEnded) {
        flipProfileGeometry.index.array.forEach(i => {
            index.push(i + profile.count * contour.length);
        });
        profileGeometry.index.array.forEach(i => {
            index.push(i + profile.count * (contour.length + 1));
        });
    }

    fullProfileGeometry.setIndex(index);
    fullProfileGeometry.computeVertexNormals();

    return fullProfileGeometry;
}

function flipShapeGeometry(shapeGeometry) {
    let flipGeom = shapeGeometry.clone();
    for (let i = 0; i < flipGeom.attributes.position.count; i++) {
        flipGeom.attributes.position.array[i * 3] *= -1;
    }
    flipGeom.attributes.position.needsUpdate = true;

    var index = flipGeom.index.array;
    for (let i = 0; i < index.length; i += 3) {
        let v2 = index[i + 1];
        let tmp = v2;
        let v3 = index[i + 2];
        index[i + 1] = index[i + 2];
        index[i + 2] = tmp;
    }
    return flipGeom;
}
