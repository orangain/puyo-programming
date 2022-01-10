import { PuyoColor } from "./config";

export type VirtualPuyoElement = {
    left: number;
    top: number;
};

export class PuyoImage {
    static getPuyo(): VirtualPuyoElement {
        return {
            left: 0,
            top: 0,
        };
    }
}
