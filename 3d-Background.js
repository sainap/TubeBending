import * as THREE from 'three'

export class GradientBackgronund {
    constructor(startColor, intermediaryColor, endColor) {
        this.startColor = startColor;
        this.intermediaryColor = intermediaryColor;
        this.endColor = endColor;

        this.texture = this.createBackgroundTexture();
        return this.texture;
    }
    createLinearGradient(topColor, intermediary, bottomColor) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, 512);
        gradient.addColorStop(0, '#' + topColor);
        gradient.addColorStop(0.3, '#' + intermediary);
        gradient.addColorStop(1, '#' + bottomColor);
        context.fillStyle = gradient;
        context.fillRect(0, 0, 512, 512);
        return canvas;
    }

    createBackgroundTexture = () => {
        const startColor = '111111'
        const intermediary = '222222'
        const endColor = 'a0a0a0'

        const canvasGradient = this.createLinearGradient(startColor, intermediary, endColor);

        const texture = new THREE.CanvasTexture(canvasGradient);
        return texture
    }
}
