const calculator = document.getElementById('calculator');
const pipeVisualization = window.pipeVisualization;

const config = {
    "labels": {
        TANGENT_A: 'Tangent A Length (inches)',
        TANGENT_B: 'Tangent B Length (inches)',
        BEND_DEGREE: 'Bend Degree',
        OFFSETS: 'Offsets',
        MATERIAL: 'Material',
        ITEM_TYPE: 'Item Type',
        TUBE_SIZE: 'Tube Size',
        PIPE_SIZE: 'Pipe Size',
        BEND_RADIUS: 'Bend Radius',
        ALUMINUM: 'Aluminum',
        STAINLESS: 'Stainless',
        STEEL: 'Steel'
    },
    "defaults": {
        "bendDegree": 90,
        "tangents": {
            "TA": 0,
            "TB": 0
        }
    },
    "materials": {
        "Aluminum": { visualizationMaterial: "aluminium" },
        "Steel": { visualizationMaterial: "steel" },
        "Stainless Steel": { visualizationMaterial: "stainless" }
    },
    "itemTypes": {
        'Tube': {
            'currentSize': '1.315" OD 0.133" Wall thickness',
        },
        'Pipe': {
            'currentSize': '1" Schedule 40',
        },
        'currentType': 'Tube'
    },
    "tubeSizes": {
        '1.315" OD 0.133" Wall thickness': { OD: 1.315, ID: 1.049 },
        '1.66" OD 0.140" Wall thickness': { OD: 1.660, ID: 1.380 },
        '1.9" OD 0.145" Wall thickness': { OD: 1.900, ID: 1.610 },
    },
    "pipeSizes": {
        '1" Schedule 40': { OD: 1.315, ID: 1.049 },
        '1 1/4" Schedule 40': { OD: 1.660, ID: 1.380 },
        '1 1/2" Schedule 40': { OD: 1.900, ID: 1.610 }
    },
    "bendRadiusOptions": {
        "1.8D": { multiplier: 1.8, label: "Extra tight" },
        "3.6D": { multiplier: 3.6, label: "Tight" },
        "5D": { multiplier: 5, label: "Medium" },
        "6D": { multiplier: 6, label: "Wide" },
        "8D": { multiplier: 8, label: "Extra Wide" }
    },
    "currentBendRadius": null,
    "offsetsMap": {
        'None': { 'TA': 0, 'TB': 0 },
        'One 2\'\' Tangent': { 'TA': 2, 'TB': 0 }, 
        'Two 2\'\' Tangents': { 'TA': 2, 'TB': 2 },
    }
};

const bendRadiusElements = []

const handleInputChange = (e, attribute) => {
    if (pipeVisualization === undefined) return;
    const value = e.target.value;
    switch (attribute) {
        case config.labels.MATERIAL:
            updateMaterial(value);
            break;
        case attribute.includes(config.labels.BEND_RADIUS) && attribute:
            updateBendRadius(value, e, attribute);
            break;
        case config.labels.ITEM_TYPE:
            updateItemType(value);
            break;
        case config.labels.BEND_DEGREE:
            updateBendDegree(value);
            break;
        case config.labels.OFFSETS:
            updateOffsets(value);
            break;
        case config.labels.TUBE_SIZE:
            updateTubeSize(value);
            break;
        case config.labels.PIPE_SIZE:
            updatePipeSize(value);
            break;
        case config.labels.TANGENT_A:
            updateTangentA(value);
            break;
        case config.labels.TANGENT_B:
            updateTangentB(value);
            break;
        default:
            console.warn(`Unhandled attribute: ${attribute}`);
    }
};

const updateMaterial = (value) => {
    if (value.includes(config.labels.ALUMINUM)) {
        findAndApplyMaterial("Aluminum");
    } else if (value.includes(config.labels.STAINLESS)) {
        findAndApplyMaterial("Stainless Steel");
    } else if (value.includes(config.labels.STEEL)) {
        findAndApplyMaterial("Steel");
    } else {
        console.error(`Material ${value} not found in materials`);
    }
    pipeVisualization.pipe.updateMaterial();
};

const updateBendRadius = (value, e, attribute) => {
    const activeElement = getActiveBendRadiusElement();
    if (activeElement) {
        activeElement.value = value;
    }

    const options = Object.entries(config.bendRadiusOptions);
    const bendRadius = options.find(([k, v]) => value.substring(0, v.label.length) === v.label);
    if (bendRadius) {

        const multiplier = bendRadius[1].multiplier;
        let currentOd
        if (config.itemTypes['currentType'] === 'Tube') {
            currentOd = config.tubeSizes[config.itemTypes[config.itemTypes['currentType']].currentSize].OD;
        } else if (config.itemTypes['currentType'] === 'Pipe') {
            currentOd = config.pipeSizes[config.itemTypes[config.itemTypes['currentType']].currentSize].OD;
        }
        const clr = calculateBendRadius(currentOd, multiplier);
        updateParameters({ bendRadius: clr });
        config.currentBendRadius = multiplier;
    } else {
        console.error(`Bend radius ${value} not found in bendRadiusOptions`);
    }
};

const updateItemType = (value) => {
    config.itemTypes['currentType'] = value;
    if (config.itemTypes.hasOwnProperty(value)) {
        const currentBendRadius = config.currentBendRadius;
        let od
        if (value === 'Tube') {
            od = config.tubeSizes[config.itemTypes[value].currentSize].OD;
        } else if (value === 'Pipe') {
            od = config.pipeSizes[config.itemTypes[value].currentSize].OD;
        }
        const clr = calculateBendRadius(od, currentBendRadius);
        updateParameters({ bendRadius: clr });
        updateBendRadiusDropdown(currentBendRadius);
    } else {
        console.error(`Item type ${value} not found in itemTypes`);
    }
};

const updateTubeSize = (value) => {
    config.itemTypes['Tube'].currentSize = value;
    const tubeSize = config.tubeSizes[value];
    if (!tubeSize) {
        console.error(`Tube size ${value} not found in tubeSizes`);
        return;
    }
    const multiplier = config.currentBendRadius;
    const od = config.tubeSizes[value].OD;
    const clr = calculateBendRadius(od, multiplier);
    updateParameters({
        bendRadius: clr,
        tubeOuterSize: tubeSize.OD,
        tubeInnerSize: config.tubeSizes[value].ID
    });
    updateBendRadiusDropdown(multiplier);
}

const updatePipeSize = (value) => {
    config.itemTypes['Pipe'].currentSize = value;

    const multiplier = config.currentBendRadius;
    const od = config.pipeSizes[value].OD;
    const clr = calculateBendRadius(od, multiplier);

    updateParameters({
        bendRadius: clr,
        pipeOuterSize: config.pipeSizes[value].OD,
        pipeInnerSize: config.pipeSizes[value].ID
    });
    updateBendRadiusDropdown(multiplier);
}

const updateTangentA = (value) => {
    try {
        const numberValue = parseFloat(value);
        updateParameters({ tangentA: numberValue });
    } catch (e) {
        console.error('Error setting tangent A', e);
    }
}

const updateTangentB = (value) => {
    try {
        const numberValue = parseFloat(value);
        updateParameters({ tangentB: numberValue });
    } catch (e) {
        console.error('Error setting tangent B', e);
    }
}

const updateBendDegree = (value) => {
    const bendDegreeValue = parseInt(value);
    if (!isNaN(bendDegreeValue)) {
        updateParameters({ bendAngle: Math.min(180, Math.max(0, bendDegreeValue)) });
    } else {
        console.error('Invalid bend degree value');
    }
};

const updateOffsets = (value) => {
    if (!config.offsetsMap.hasOwnProperty(value)) {
        console.error(`Invalid offset value: ${value}`);
        return;
    }

    const tangents = config.offsetsMap[value];

    try {
        updateParameters({
            tangentA: tangents.TA,
            tangentB: tangents.TB
        });
    } catch (error) {
        console.error('Error updating pipe offsets:', error);
    }
};

let lastInput = null;
let scheduledAnimationFrame = false;

const childElements = Array.from(calculator.children);

const debounceInput = (func, delay) => {
    let timeout;
    return function (...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    }
}

const debouncedHandleInputChange = debounceInput(handleInputChange, 100);

const updateParameters = (params, render = true) => {
    Object.entries(params).forEach(([key, value]) => {
        pipeVisualization.pipe.params[key] = value;
    });
    if (render) {
        updateVisualization();
    }
}

const updateVisualization = () => {
    pipeVisualization.pipe.updatePipe();
}

const updateDropdownByValue = (element, value) => {

    const children = Array.from(element.children);
    const child = children.find(child => child.value.includes(value));
    if (child) {
        element.value = child.value;
    }
}

const updateBendRadiusDropdown = (multiplier) => {
    const activeElement = getActiveBendRadiusElement();
    const neededLabel = Object.entries(config.bendRadiusOptions).find(([k, v]) => v.multiplier === multiplier);
    if (neededLabel) {
        updateDropdownByValue(activeElement, neededLabel[1].label);
    }
}

const getActiveBendRadiusElement = () => {
    const activeElement = bendRadiusElements.find(element => element.style.display !== 'none');
    if (!activeElement) {
        console.warn('No active bend radius element found');
    }
    return activeElement || null;
}

const calculateBendRadius = (od, multiplier) => {
    const bendRadius = multiplier * od + od / 2;
    return bendRadius;
}

const findAndApplyMaterial = (value) => {
    const material = config.materials[value].visualizationMaterial;
    pipeVisualization.pipe.material = pipeVisualization.pipe.materials[material];
    pipeVisualization.pipe.updateMaterial();
}

for (let i = 0; i < childElements.length; i++) {
    const child = calculator.children[i];
    const children = Array.from(child.children);
    for (let j = 0; j < children.length; j++) {
        const div = children[j];
        const attribute = child.getAttribute('data-element');
        if (attribute == null) {
            continue
        }
        if (div.tagName !== 'INPUT' && div.tagName !== 'SELECT') {
            continue
        }
        if (div.type.toString().toLowerCase().includes('select')) {
            if (attribute.includes('Bend Degree')) {
                div.value = config.defaults.bendDegree;
            } else if (attribute.includes(config.labels.OFFSETS)) {
                const tangents = config.offsetsMap[div.value] || { TA: config.defaults.tangents.TA, TB: config.defaults.tangents.TB };

                updateParameters({
                    tangentA: tangents.TA,
                    tangentB: tangents.TB
                });

            } else if (attribute.includes(config.labels.TUBE_SIZE)) {
                const value = div.value;
                config.itemTypes['Tube'].currentSize = value;
                config.itemTypes['currentType'] = 'Tube';
            } else if (attribute.includes(config.labels.PIPE_SIZE)) {
                const value = div.value
                config.itemTypes['Pipe'].currentSize = value;
                config.itemTypes['currentType'] = 'Pipe';
            } else if (attribute.includes(config.labels.BEND_RADIUS)) {
                const bendRadiusOptions = Object.entries(config.bendRadiusOptions);
                const bendRadius = bendRadiusOptions.find(([k, v]) => div.value.substring(0, v.label.length) === v.label);
                if (bendRadius) {
                    config.currentBendRadius = bendRadius[1].multiplier;
                    bendRadiusElements.push(div);
                } else {
                    config.currentBendRadius = null;
                }
            }
            div.addEventListener('change', (e) => debouncedHandleInputChange(e, attribute));

        } else if (div.type.toString().toLowerCase().includes('number')) {

            if (attribute.includes(config.labels.TANGENT_A)) {
                div.value = pipeVisualization.pipe.params.tangentA;
            } else if (attribute.includes(config.labels.TANGENT_B)) {
                div.value = pipeVisualization.pipe.params.tangentB;
            } else if (attribute.includes(config.labels.BEND_DEGREE)) {
                div.value = pipeVisualization.pipe.params.bendAngle;
            }
            div.addEventListener('change', (e) => debouncedHandleInputChange(e, attribute));
        }
    }
}


pipeVisualization.pipe.updatePipe();
