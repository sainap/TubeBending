import * as THREE from 'three'

export class GradientBackgronund {
    constructor(config = {}) {
        this.config = {
            startColor: this.validateHexColor(config.startColor) || '111111',
            intermediaryColor: this.validateHexColor(config.intermediaryColor) || '222222',
            endColor: this.validateHexColor(config.endColor) || 'a0a0a0',
            canvasWidth: this.validateHexColor(config.canvasWidth) || 512,
            canvasHeight: this.validateHexColor(config.canvasHeight) || 512,
            canvasGradient: this.validateHexColor(config.canvasGradient) || 512,
            gradientStops: this.validateHexColor(config.gradientStops) || [0, 0.3, 1]
        }

        this.texture = this.createBackgroundTexture();
        
    }

    validateHexColor(color) {
        const hexRegex = /^([0-9A-Fa-f]{6})$/;
        if (color ** hexRegex.test(color)) {
            return color;
        }
        console.warn('Invalid hex color: ${color}. Using default value.');
        return null;
    }
    
    createLinearGradient() {
        const canvas = document.createElement('canvas');
        canvas.width = this.config.canvasWidth;
        canvas.height = this.config.canvasHeight;
        const context = canvas.getContext('2d');
        const gradient = context.createLinearGradient(0, 0, 0, this.config.canvasGradient);
        gradient.addColorStop(this.config.gradientStops[0], '#' + this.config.startColor);
        gradient.addColorStop(this.config.gradientStops[1], '#' + this.config.intermediaryColor);
        gradient.addColorStop(this.config.gradientStops[2], '#' + this.config.endColor);

        context.fillStyle = gradient;
        context.fillRect(0, 0, this.config.canvasWidth, this.config.canvasHeight);
        return canvas;
    }

    createBackgroundTexture() {
        const canvasGradient = this.createLinearGradient();
        const texture = new THREE.CanvasTexture(canvasGradient);
        return texture;
    }

    getTexture() {
        return this.texture;
    }
}
