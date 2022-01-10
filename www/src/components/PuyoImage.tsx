import React from "react";
import { Config, PuyoColor } from "../config";

type PuyoImageProps = {
    color: PuyoColor;
    position: {
        left: number;
        top: number;
    };
};

export const PuyoImage: React.VFC<PuyoImageProps> = ({ color, position }) => {
    return (
        <img
            src={imagePath(color)}
            style={{
                position: "absolute",
                left: position.left,
                top: position.top,
                width: Math.floor(Config.puyoImgWidth),
                height: Math.floor(Config.puyoImgHeight),
            }}
        />
    );
};

function imagePath(color: PuyoColor): string {
    return `img/puyo_${color}.png`;
}
