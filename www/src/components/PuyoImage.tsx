import React from "react";
import { Config } from "../config";
import { PuyoColor } from "../puyo";

type PuyoImageProps = {
    color: PuyoColor;
    position: {
        left: number;
        top: number;
    };
    hidden?: boolean;
};

export const PuyoImage: React.VFC<PuyoImageProps> = ({
    color,
    position,
    hidden,
}) => {
    return (
        <img
            src={imagePath(color)}
            style={{
                position: "absolute",
                visibility: hidden ? "hidden" : "visible",
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
