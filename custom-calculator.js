const calculator = document.getElementById('calculator');

const pipeVisualization = window.pipeVisualization;

const config = {
    "materials": {
        "Aluminum": { visualizationMaterial: "aluminum" },
        "Steel": { visualizationMaterial: "steel" },
        "Stainless Steel": { visualizationMaterial: "stainless" }
    },
    "tubeSizes": {
        '1.315" OD 0.133" Wall thickness': { OD: 1.315, ID: 1.049, currentBendRadius: 'Extra tight (1.8D) - 3\'\' CLR' },
        '1.66" OD 0.140" Wall thickness': { OD: 1.660, ID: 1.380, currentBendRadius: 'Extra tight (1.8D) - 3.8\'\' CLR' },
        '1.9" OD 0.145" Wall thickness': { OD: 1.900, ID: 1.610, currentBendRadius: 'Extra tight (1.8D) - 4.37\'\' CLR' }
    },
    "pipeSizes": {
        '1" Schedule 40': { OD: 1.315, ID: 1.049, currentBendRadius: 'Extra tight (1.8D) - 3\'\' CLR' },
        '1 1/4" Schedule 40': { OD: 1.660, ID: 1.380, currentBendRadius: 'Extra tight (1.8D) - 3.8\'\' CLR' },
        '1 1/2" Schedule 40': { OD: 1.900, ID: 1.610, currentBendRadius: 'Extra tight (1.8D) - 4.37\'\' CLR' }
    },
    "bendRadiusOptions": {
        "1.8D": { multiplier: 1.8, label: "Extra tight" },
        "3.6D": { multiplier: 3.6, label: "Tight" },
        "5D": { multiplier: 5, label: "Medium" },
        "6D": { multiplier: 6, label: "Wide" },
        "8D": { multiplier: 8, label: "Extra Wide" }
    },
    "currentBendRadius": null,
    "labels": {
        TANGENT_A: 'Tangent A',
        TANGENT_B: 'Tangent B',
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
    "sizeToInchesMap": {
        "Extra tight (1.8D) - 3.8'' CLR": { 'inches': '3.8', 'od': 1.660, 'multiplier': 1.8 },
        "Tight (3.6D) - 6.8'' CLR": { 'inches': '6.8', 'od': 1.660, 'multiplier': 3.6 },
        "Medium (5D) - 9.12'' CLR": { 'inches': '9.12', 'od': 1.660, 'multiplier': 5 },
        "Wide (6D) - 10.79'' CLR": { 'inches': '10.79', 'od': 1.660, 'multiplier': 6 },
        "Extra Wide (8D) - 14.11'' CLR": { 'inches': '14.11', 'od': 1.660, 'multiplier': 8 },
        
        "Extra tight (1.8D) - 4.37'' CLR": { 'inches': '4.37', 'od': 1.9, 'multiplier': 1.8 },
        "Tight (3.6D) - 7.79'' CLR": { 'inches': '7.79', 'od': 1.9, 'multiplier': 3.6 },
        "Medium (5D) - 10.45'' CLR": { 'inches': '10.45', 'od': 1.9, 'multiplier': 5 },
        "Wide (6D) - 12.35'' CLR": { 'inches': '12.35', 'od': 1.9, 'multiplier': 6 },
        "Extra Wide (8D) - 16.15'' CLR": { 'inches': '16.15', 'od': 1.9, 'multiplier': 8 },
        
        "Extra tight (1.8D) - 3'' CLR": { 'inches': '3', 'od': 1.315, 'multiplier': 1.8 },
        "Tight (3.6D) - 5.39'' CLR": { 'inches': '5.39', 'od': 1.315, 'multiplier': 3.6 },
        "Medium (5D) - 7.23'' CLR": { 'inches': '7.23', 'od': 1.315, 'multiplier': 5 },
        "Wide (6D) - 8.55'' CLR": { 'inches': '8.55', 'od': 1.315, 'multiplier': 6 },
        "Extra Wide (8D) - 11.18'' CLR": { 'inches': '11.18', 'od': 1.315, 'multiplier': 8 }
    },
    "offsetsMap": {
        'None': { 'TA': 0, 'TB': 0 },
        'One 2\'\' Tangent': { 'TA': 2, 'TB': 0 },
        'Two 2\'\' Tangents': { 'TA': 2, 'TB': 2 }
    }, 
    "itemTypes": {
        'Tube': {
            'currentSize': '1.315" OD 0.133" Wall thickness',
        },
        'Pipe': {
            'currentSize': '1" Schedule 40',
        } 
    },
    "tubeSizeInputNames": {
        '1.66': 'Bend Radius',
        '1.9': 'Bend Radius ',
        '1.315': 'Bend Radius  ',
        '2': 'Bend Radius',
    },
    "pipeSizeInputNames": {
        '1.66': 'Bend Radius    ',
        '1.9': 'Bend Radius     ',
        '1.315': 'Bend Radius   ',
    },
    "defaults": {
        "bendDegree": 90,
        "tangents": {
            "TA": 0,
            "TB": 0
        }
    }
};


const handleInputChange = (e, attribute) => {
    if (window.pipeVisualization === undefined) return;

    const value = e.target.value;
    switch (attribute) {
        case config.labels.MATERIAL:
            updateMaterial(value);
            break;
        case config.labels.BEND_RADIUS:
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
        default:
            console.warn(`Unhandled attribute: ${attribute}`);
    }
};

const updateMaterial = (value) => {
    if (value.includes(config.labels.ALUMINUM)) {
        window.pipeVisualization.pipe.material = window.pipeVisualization.pipe.aluminium;
    } else if (value.includes(config.labels.STAINLESS)) {
        window.pipeVisualization.pipe.material = window.pipeVisualization.pipe.stainless;
    } else if (value.includes(config.labels.STEEL)) {
        window.pipeVisualization.pipe.material = window.pipeVisualization.pipe.steel;
    }
    window.pipeVisualization.pipe.updateMaterial();
};

const updateBendRadius = (value, e, attribute) => {
    if (config.sizeToInchesMap[value]) {
        const bendRadiusValue = parseFloat(config.sizeToInchesMap[value].inches);
        window.pipeVisualization.pipe.params.bendRadius = bendRadiusValue;
        config.currentBendRadius = config.sizeToInchesMap[value].multiplier;
        window.pipeVisualization.pipe.updatePipe();
    } else {
        console.error(`Bend radius for ${value} not found in sizeToInchesMap`);
    }
};

const updateItemType = (value) => {
    if (value === 'Tube') {
        const previousSize = config.itemTypes['Tube'].currentSize;
        const tubeSizeOD = config.tubeSizes[previousSize].OD;
        const bendRadiusAttribute = config.tubeSizeInputNames[tubeSizeOD.toString()];
        const bendRadius = document.querySelector(`[data-element="${bendRadiusAttribute}"]`);
        bendRadius.value = config.tubeSizes[previousSize].currentBendRadius;
        window.pipeVisualization.pipe.updatePipe();
    } else if (value === 'Pipe') {
        const previousSize = config.itemTypes['Pipe'].currentSize;
        const pipeSizeOD = config.pipeSizes[previousSize].OD;
        const bendRadiusAttribute = config.pipeSizeInputNames[pipeSizeOD.toString()];
        const bendRadius = document.querySelector(`[data-element="${bendRadiusAttribute}"]`);
        bendRadius.value = config.pipeSizes[previousSize].currentBendRadius;
        window.pipeVisualization.pipe.updatePipe();
    }
};

const updateBendDegree = (value) => {
    const bendDegreeValue = parseInt(value);
    if (!isNaN(bendDegreeValue)) {
        window.pipeVisualization.pipe.params.bendAngle = Math.min(180, Math.max(0, bendDegreeValue));
        window.pipeVisualization.pipe.updatePipe();
    }
};

const updateOffsets = (value) => {
    const tangents = config.offsetsMap[value];
    window.pipeVisualization.pipe.params.tangentA = tangents.TA;
    window.pipeVisualization.pipe.params.tangentB = tangents.TB;
    window.pipeVisualization.pipe.updatePipe();
};


let lastInput = null;
let scheduledAnimationFrame = false;

const childElements = Array.from(calculator.children);

const debounceInput = (func, delay) => {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), delay);
    }
}

const debouncedHandleInputChange = debounceInput(handleInputChange, 100);


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
                const tangents = config.offsetsMap[div.value] || { TA: config.defaults.tangents.TA, TB: config.defaults.tangents.TB};

                window.pipeVisualization.pipe.params.tangentA = tangents.TA;
                window.pipeVisualization.pipe.params.tangentB = tangents.TB;
                window.pipeVisualization.pipe.updatePipe();
            } else if (attribute.includes(config.labels.TUBE_SIZE)) {
                const value = div.value;
                const bendRadius = calculator.querySelector(`[data-element="Bend Radius"]`)
                config.tubeSizes[value].currentBendRadius = bendRadius.value;
                config.itemTypes['Tube'].currentSize = value;
            } else if (attribute.includes(config.labels.PIPE_SIZE)) {
                const value = div.value
                const bendRadius = calculator.querySelector(`[data-element="Bend Radius   "]`)
                config.pipeSizes[value].currentBendRadius = bendRadius.value;
                config.itemTypes['Pipe'].currentSize = value;
            } else if (attribute.includes(config.labels.BEND_RADIUS)) {
                if (config.sizeToInchesMap[div.value]) {
                    config.currentBendRadius = config.sizeToInchesMap[div.value].multiplier;
                } else {
                    console.log(`Value ${div.value} not found in sizeToInchesMap`);
                    config.currentBendRadius = null;
                }
            }
            div.addEventListener('change', (e) => debouncedHandleInputChange(e, attribute));

        } else if (div.type.toString().toLowerCase().includes('number')) {

            if (attribute.includes(config.labels.TANGENT_A)) {
                div.value = window.pipeVisualization.pipe.params.tangentA;
            } else if (attribute.includes(config.labels.TANGENT_B)) {
                div.value = window.pipeVisualization.pipe.params.tangentB;
            } else if (attribute.includes(config.labels.BEND_DEGREE)) {
                div.value = window.pipeVisualization.pipe.params.bendAngle;
            }
            div.addEventListener('change', (e) => debouncedHandleInputChange(e, attribute));
        }
    }
}


window.pipeVisualization.pipe.updatePipe();
