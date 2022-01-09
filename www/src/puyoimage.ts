import { Config, PuyoColor } from './config';
import { Stage } from "./stage"

export class PuyoImage {

    static puyoImages: HTMLImageElement[];
    static batankyuImage: HTMLImageElement;
    static gameOverFrame: number;

    static initialize() {
        this.puyoImages = [];
        for (let i = 0; i < 5; i++) {
            const image = document.getElementById(`puyo_${i + 1}`) as HTMLImageElement;
            image.removeAttribute('id');
            image.width = Config.puyoImgWidth;
            image.height = Config.puyoImgHeight;
            image.style.position = 'absolute';
            this.puyoImages[i] = image;
        }
        this.batankyuImage = document.getElementById('batankyu') as HTMLImageElement;
        this.batankyuImage.width = Config.puyoImgWidth * 6;
        this.batankyuImage.style.position = 'absolute';
    }

    static getPuyo(index: PuyoColor): HTMLImageElement {
        const image = this.puyoImages[index - 1].cloneNode(true) as HTMLImageElement;
        return image;
    }

    static prepareBatankyu(frame: number) {
        this.gameOverFrame = frame;
        Stage.stageElement.appendChild(this.batankyuImage);
        this.batankyuImage.style.top = -this.batankyuImage.height + 'px';
    }

    static batankyu(frame: number) {
        const ratio = (frame - this.gameOverFrame) / Config.gameOverFrame;
        const x = Math.cos(Math.PI / 2 + ratio * Math.PI * 2 * 10) * Config.puyoImgWidth;
        const y = Math.cos(Math.PI + ratio * Math.PI * 2) * Config.puyoImgHeight * Config.stageRows / 4 + Config.puyoImgHeight * Config.stageRows / 2;
        this.batankyuImage.style.left = x + 'px';
        this.batankyuImage.style.top = y + 'px';
    }
}
