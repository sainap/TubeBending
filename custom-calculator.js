const calculator = document.getElementById('calculator');

const pipeVisualization = window.pipeVisualization

// How the inputs are mapped to the pipe visualization
const TANGENT_A_LABEL = 'Tangent A'
const TANGENT_B_LABEL = 'Tangent B'
const BEND_DEGREE_LABEL = 'Bend Degree'
const OFFSETS_LABEL = 'Offsets'
const MATERIAL_LABEL = 'Material'
const ITEM_TYPE_LABEL = 'Item Type'
const TUBE_SIZE_LABEL = 'Tube Size'
const PIPE_SIZE_LABEL = 'Pipe Size'
const BEND_RADIUS_LABEL = 'Bend Radius'

const ALUMINUM_LABEL = 'Aluminum'
const STAINLESS_LABEL = 'Stainless'
const STEEL_LABEL = 'Steel'

// Bend Radius Input to Inches Map
// 3 Tube Size Items (1.315, 1.66, 1.9) x 5 Bend Radius Items (1.8D, 3.6D, 5D, 6D, 8D)
const sizeToInchesMap = {
    "Extra tight (1.8D) - 3.8'' CLR": {
        'inches': '3.8',
        'od': 1.660,
        'multiplier': 1.8,
    },
    "Tight (3.6D) - 6.8'' CLR": {
        'inches': '6.8',
        'od': 1.660,
        'multiplier': 3.6,
    },
    "Medium (5D) - 9.12'' CLR": {
        'inches': '9.12',
        'od': 1.660,
        'multiplier': 5,
    },
    "Wide (6D) - 10.79\'\' CLR": {
        'inches': '10.79',
        'od': 1.660,
        'multiplier': 6,
    },
    "Extra Wide (8D) - 14.11\'\' CLR": {
        'inches': '14.11',
        'od': 1.660,
        'multiplier': 8,
    },
    "Extra tight (1.8D) - 4.37\'\' CLR": {
        'inches': '4.37',
        'od': 1.9,
        'multiplier': 1.8,
    },
    "Tight (3.6D) - 7.79\'\' CLR": {
        'inches': '7.79',
        'od': 1.9,
        'multiplier': 3.6,
    }
    ,
    "Medium (5D) - 10.45\'\' CLR": {
        'inches': '10.45',
        'od': 1.9,
        'multiplier': 5,
    },
    "Wide (6D) - 12.35\'\' CLR": {
        'inches': '12.35',
        'od': 1.9,
        'multiplier': 6,
    },
    "Extra Wide (8D) - 16.15\'\' CLR": {
        'inches': '16.15',
        'od': 1.9,
        'multiplier': 8,
    },
    "Extra tight (1.8D) - 3\'\' CLR": {
        'inches': '3',
        'od': 1.315,
        'multiplier': 1.8,
    },
    "Tight (3.6D) - 5.39\'\' CLR": {
        'inches': '5.39',
        'od': 1.315,
        'multiplier': 3.6,
    },
    "Medium (5D) - 7.23\'\' CLR": {
        'inches': '7.23',
        'od': 1.315,
        'multiplier': 5,
    },
    "Wide (6D) - 8.55\'\' CLR": {
        'inches': '8.55',
        'od': 1.315,
        'multiplier': 6,
    },
    "Extra Wide (8D) - 11.18\'\' CLR": {
        'inches': '11.18',
        'od': 1.315,
        'multiplier': 8,
    },

}

let currentBendRadius

// Tube Size dropdown value to OD, ID; currentBendRadius (default)
const tubeSizes = {
    '1.315" OD 0.133" Wall thickness': {
        'OD': 1.315,
        'ID': 1.049,
        'currentBendRadius': 'Extra tight (1.8D) - 3\'\' CLR'
    },
    '1.66" OD 0.140" Wall thickness': {
        'OD': 1.660,
        'ID': 1.380,
        'currentBendRadius': 'Extra tight (1.8D) - 3.8\'\' CLR'
    },
    '1.9" OD 0.145" Wall thickness': {
        'OD': 1.900,
        'ID': 1.610,
        'currentBendRadius': 'Extra tight (1.8D) - 4.37\'\' CLR'
    },
}

// Pipe Size dropdown value to OD, ID
const pipeSizes = {
    '1" Schedule 40': {
        'OD': 1.315,
        'ID': 1.049,
        'currentBendRadius': 'Extra tight (1.8D) - 3\'\' CLR'
    },
    '1 1/4" Schedule 40': {
        'OD': 1.660,
        'ID': 1.380,
        'currentBendRadius': 'Extra tight (1.8D) - 3.8\'\' CLR'
    },
    '1 1/2" Schedule 40': {
        'OD': 1.900,
        'ID': 1.610,
        'currentBendRadius': 'Extra tight (1.8D) - 4.37\'\' CLR'
    },
}

// tubeSizeInputNames[OD] = Bend Radius Input name (Label) when Tube Size is selected
const tubeSizeInputNames = {
    '1.66': 'Bend Radius',
    '1.9': 'Bend Radius ',
    '1.315': 'Bend Radius  ',
    '2': 'Bend Radius',
}

// pipeSizeInputNames[OD] = Bend Radius Input name (Label) when Pipe Size is selected
const pipeSizeInputNames = {
    '1.66': 'Bend Radius    ',
    '1.9': 'Bend Radius     ',
    '1.315': 'Bend Radius   ',
}

// Offsets dropdown value to Tangent A, Tangent B (for Standard products)
const offsetsMap = {
    'None': {
        'TA': 0,
        'TB': 0,
    },
    'One 2\'\' Tangent': {
    'TA': 2,
    'TB': 0,
    },
    'Two 2\'\' Tangents': {
        'TA': 2,
        'TB': 2,
    },
}

// Save the current size of Tube and Pipe
const itemTypes = {
    'Tube': {
        'currentSize': '1.315" OD 0.133" Wall thickness',
    },
    'Pipe': {
        'currentSize': '1" Schedule 40',
    }
}

let lastInput = null
let scheduledAnimationFrame = false

for (let i = 0; i < calculator.children.length; i++) {
    const child = calculator.children[i]
    const children = child.children;
    for (let j = 0; j < children.length; j++) {
        const div = children[j]
        const attribute = child.getAttribute('data-element')
        if (attribute == null) {
            continue
        }

        if (div.tagName !== 'INPUT' && div.tagName !== 'SELECT') {
            continue
        }
        if (div.type.toString().toLowerCase().includes('select')) {
            if (attribute.includes('Bend Degree')) {
                div.value = '90'
            } else if (attribute.includes(OFFSETS_LABEL)) {
                const tangents = offsetsMap[div.value]

                window.pipeVisualization.pipe.params.tangentA = tangents.TA;
                window.pipeVisualization.pipe.params.tangentB = tangents.TB;
                window.pipeVisualization.pipe.updatePipe()
            } else if (attribute.includes(TUBE_SIZE_LABEL)) {
                const value = div.value
                const bendRadius = calculator.querySelector(`[data-element="Bend Radius"]`)
                tubeSizes[value].currentBendRadius = bendRadius.value
                itemTypes['Tube'].currentSize = value
            } else if (attribute.includes(PIPE_SIZE_LABEL)) {
                const value = div.value
                const bendRadius = calculator.querySelector(`[data-element="Bend Radius   "]`)
                pipeSizes[value].currentBendRadius = bendRadius.value
                itemTypes['Pipe'].currentSize = value
                // For bend radius
            } else if (attribute.includes(BEND_RADIUS_LABEL)) {
                currentBendRadius = sizeToInchesMap[div.value].multiplier
            }
            div.addEventListener('change', (e) => {
                if (window.pipeVisualization === undefined) return;
                lastInput = e.target.value
                if (scheduledAnimationFrame) {
                    return
                }
                scheduledAnimationFrame = true

                requestAnimationFrame(() => {
                    let bendRadius;
                    let bendRadiusAttribute;
                    if (attribute.includes(MATERIAL_LABEL)) {
                        const materialName = e.target.value
                        if (materialName.includes(ALUMINUM_LABEL)) {
                            if (materialName.includes('6061')) {
                                // 6061
                            } else if (materialName.includes('6063')) {
                                // 6063
                            }
                            window.pipeVisualization.pipe.material = window.pipeVisualization.pipe.aluminium

                        } else if (materialName.includes(STAINLESS_LABEL)) {
                            window.pipeVisualization.pipe.material = window.pipeVisualization.pipe.stainless

                        } else if (materialName.includes(STEEL_LABEL) && !materialName.includes(STAINLESS_LABEL)) {
                            window.pipeVisualization.pipe.material = window.pipeVisualization.pipe.steel
                        }
                        window.pipeVisualization.pipe.updateMaterial()
                    } else if (attribute.includes(BEND_RADIUS_LABEL)) {
                        const value = parseFloat(sizeToInchesMap[e.target.value].inches);
                        window.pipeVisualization.pipe.params.bendRadius = value
                        window.pipeVisualization.pipe.updatePipe()
                        currentBendRadius = sizeToInchesMap[e.target.value].multiplier

                    } else if (attribute.includes(ITEM_TYPE_LABEL)) {
                        const value = e.target.value

                        let bendRadius
                        if (value == 'Tube') {
                            const previousSize = itemTypes['Tube'].currentSize
                            const tubeSizeOD = tubeSizes[previousSize].OD
                            const tubeSizeID = tubeSizes[previousSize].ID
                            const bendRadiusAttribute = tubeSizeInputNames[tubeSizeOD.toString()]
                            bendRadius = document.querySelector(`[data-element="${bendRadiusAttribute}"]`);
                            bendRadius.value = tubeSizes[previousSize].currentBendRadius;
                            let bendRadiusValue = bendRadius.children[1].value;
                            const bendRadiusInches = parseFloat(sizeToInchesMap[bendRadiusValue].inches);

                            window.pipeVisualization.pipe.params.tubeOuterSize = tubeSizeOD
                            window.pipeVisualization.pipe.params.tubeInnerSize = tubeSizeID
                            window.pipeVisualization.pipe.params.bendRadius = bendRadiusInches
                            window.pipeVisualization.pipe.updatePipe()
                        } else if (value == 'Pipe') {
                            const previousSize = itemTypes['Pipe'].currentSize
                            const pipeSizeOD = pipeSizes[previousSize].OD
                            const pipeSizeID = pipeSizes[previousSize].ID
                            const bendRadiusAttribute = pipeSizeInputNames[pipeSizeOD.toString()]
                            bendRadius = document.querySelector(`[data-element="${bendRadiusAttribute}"]`);
                            bendRadius.value = pipeSizes[previousSize].currentBendRadius;
                            let bendRadiusValue = bendRadius.children[1].value;

                            window.pipeVisualization.pipe.params.tubeOuterSize = pipeSizeOD
                            window.pipeVisualization.pipe.params.tubeInnerSize = pipeSizeID
                            window.pipeVisualization.pipe.params.bendRadius = parseFloat(sizeToInchesMap[bendRadiusValue].inches)
                            window.pipeVisualization.pipe.updatePipe()
                        }

                    } else if (attribute.includes(TUBE_SIZE_LABEL)) {
                        const od = tubeSizes[e.target.value].OD;
                        const id = tubeSizes[e.target.value].ID;

                        const entriesForOd = Object.entries(sizeToInchesMap).filter(([key, value]) => value.od.toString() == od.toString())
                        const entry = entriesForOd.find(([key, value]) => value.multiplier == currentBendRadius)
                        bendRadiusAttribute = tubeSizeInputNames[od.toString()];
                        bendRadius = document.querySelector(`[data-element="${bendRadiusAttribute}"]`);
                        bendRadius.children[1].value = entry[0];
                        let bendRadiusValue = bendRadius.children[1].value;
                        var val = parseFloat(sizeToInchesMap[bendRadiusValue].inches);

                        window.pipeVisualization.pipe.params.bendRadius = val
                        window.pipeVisualization.pipe.params.tubeOuterSize = od
                        window.pipeVisualization.pipe.params.tubeInnerSize = id

                        window.pipeVisualization.pipe.updatePipe()
                        itemTypes['Tube'].currentSize = e.target.value
                    } else if (attribute.includes(PIPE_SIZE_LABEL)) {
                        const od = pipeSizes[e.target.value].OD;
                        const id = pipeSizes[e.target.value].ID;
                        console.log('Pipe size changed, bend radius value: ', currentBendRadius);

                        const entriesForOd = Object.entries(sizeToInchesMap).filter(([key, value]) => value.od.toString() == od.toString())
                        const entry = entriesForOd.find(([key, value]) => value.multiplier == currentBendRadius)


                        bendRadiusAttribute = pipeSizeInputNames[od.toString()];
                        bendRadius = document.querySelector(`[data-element="${bendRadiusAttribute}"]`);
                        bendRadius.children[1].value = entry[0];
                        console.log('Pipe size changed, bend radius value: ', bendRadius.children[1].value, entry[0]);
                        console.log('Current bend radius was ', currentBendRadius);

                        let bendRadiusValue = bendRadius.children[1].value;
                        var val = parseFloat(sizeToInchesMap[bendRadiusValue].inches);
                        console.log('Pipe size changed, bend radius value: ', val)
                        window.pipeVisualization.pipe.params.bendRadius = val
                        window.pipeVisualization.pipe.params.tubeOuterSize = od
                        window.pipeVisualization.pipe.params.tubeInnerSize = id

                        window.pipeVisualization.pipe.updatePipe()
                        itemTypes['Pipe'].currentSize = e.target.value
                    } else if (attribute.includes(BEND_DEGREE_LABEL)) {
                        const value = parseInt(e.target.value.toString())
                        if (isNaN(value)) {
                            scheduledAnimationFrame = false
                            return
                        }
                        window.pipeVisualization.pipe.params.bendAngle = Math.min(180, Math.max(0, value))
                        e.target.value = window.pipeVisualization.pipe.params.bendAngle
                        window.pipeVisualization.pipe.updatePipe()

                    } else if (attribute.includes(OFFSETS_LABEL)) {
                        const value = e.target.value
                        const tangents = offsetsMap[value]
                
                        window.pipeVisualization.pipe.params.tangentA = tangents.TA
                        window.pipeVisualization.pipe.params.tangentB = tangents.TB
                        window.pipeVisualization.pipe.updatePipe()

                    }
                    scheduledAnimationFrame = false
                })
            })
        } else if (div.type.toString().toLowerCase().includes('number')) {

            if (attribute.includes(TANGENT_A_LABEL)) {
                div.value = window.pipeVisualization.pipe.params.tangentA
            } else if (attribute.includes(TANGENT_B_LABEL)) {
                div.value = window.pipeVisualization.pipe.params.tangentB
            } else if (attribute.includes(BEND_DEGREE_LABEL)) {
                div.value = window.pipeVisualization.pipe.params.bendAngle
            }
            div.addEventListener('input', (e) => {
                if (window.pipeVisualization === undefined) return;

                const inputType = e.target.getAttribute('type') || ''
                lastInput = e.target.value
                if (scheduledAnimationFrame) {
                    return
                }
                scheduledAnimationFrame = true
                requestAnimationFrame(() => {
                    let changed = false
                    if (attribute.includes(TANGENT_A_LABEL)) {
                        const value = parseInt(e.target.value)
                        if (isNaN(value)) {
                            scheduledAnimationFrame = false
                            return
                        }
                        window.pipeVisualization.pipe.params.tangentA = Math.min(15, Math.max(0, value))
                        e.target.value = window.pipeVisualization.pipe.params.tangentA
                        changed = true
                    } else if (attribute.includes(TANGENT_B_LABEL)) {
                        const value = parseInt(e.target.value)
                        if (isNaN(value)) {
                            scheduledAnimationFrame = false
                            return
                        }
                        window.pipeVisualization.pipe.params.tangentB = Math.min(15, Math.max(0, value))
                        e.target.value = window.pipeVisualization.pipe.params.tangentB
                        changed = true

                    } else if (attribute.includes(BEND_DEGREE_LABEL)) {
                        const value = parseInt(e.target.value)
                        if (isNaN(value)) {
                            scheduledAnimationFrame = false
                            return
                        }
                        window.pipeVisualization.pipe.params.bendAngle = Math.min(180, Math.max(0, value))
                        e.target.value = window.pipeVisualization.pipe.params.bendAngle
                        changed = true
                    }
                    if (changed) {
                        window.pipeVisualization.pipe.updatePipe();
                    }
                    scheduledAnimationFrame = false
                })
            })
        }
    }
}

window.pipeVisualization.pipe.updatePipe()
