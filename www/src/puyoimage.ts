import { Config, PuyoColor } from "./config";

export type VirtualPuyoElement = {
    style: {
        left: string;
        top: string;
    };
};

export class PuyoImage {
    static puyoImages: HTMLImageElement[];
    static gameOverFrame: number;

    static initialize() {
        this.puyoImages = [];
        for (let i = 0; i < 5; i++) {
            const image = document.getElementById(
                `puyo_${i + 1}`
            ) as HTMLImageElement;
            image.removeAttribute("id");
            image.width = Config.puyoImgWidth;
            image.height = Config.puyoImgHeight;
            image.style.position = "absolute";
            this.puyoImages[i] = image;
        }
    }

    static getPuyo(index: PuyoColor): VirtualPuyoElement {
        const image = this.puyoImages[index - 1].cloneNode(
            true
        ) as HTMLImageElement;
        return image;
    }

    static prepareBatankyu(frame: number) {
        this.gameOverFrame = frame;
    }
}
