import React from "react";
import { Config, PuyoColor } from "../config";

type PuyoImageProps = {
    color: PuyoColor;
    x: number;
    y: number;
};

export const PuyoImage: React.VFC<PuyoImageProps> = ({ color, x, y }) => {
    return (
        <img
            src={imagePath(color)}
            style={{
                position: "absolute",
                left: x,
                top: y,
                width: Math.floor(Config.puyoImgWidth),
                height: Math.floor(Config.puyoImgHeight),
            }}
        />
    );
};

function imagePath(color: PuyoColor): string {
    return `img/puyo_${color}.png`;
}
