import { PuyoColor } from "./config";

export type VirtualPuyoElement = {
    style: {
        left: string;
        top: string;
    };
};

export class PuyoImage {
    static gameOverFrame: number;

    static getPuyo(): VirtualPuyoElement {
        return {
            style: {
                left: "0",
                top: "0",
            },
        };
    }

    static prepareBatankyu(frame: number) {
        this.gameOverFrame = frame;
    }
}
