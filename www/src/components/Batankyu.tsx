import React from "react";
import { Config } from "../config";

type BatankyuProps = {
    animationRatio: number;
};

export const Batankyu: React.VFC<BatankyuProps> = ({ animationRatio }) => {
    const left =
        Math.cos(Math.PI / 2 + animationRatio * Math.PI * 2 * 10) *
        Config.puyoImgWidth;
    const top =
        (Math.cos(Math.PI + animationRatio * Math.PI * 2) *
            Config.puyoImgHeight *
            Config.stageRows) /
            4 +
        (Config.puyoImgHeight * Config.stageRows) / 2;
    return (
        <img
            src="img/batankyu.png"
            style={{
                position: "absolute",
                left,
                top,
                width: Config.puyoImgWidth * 6,
            }}
        />
    );
};
