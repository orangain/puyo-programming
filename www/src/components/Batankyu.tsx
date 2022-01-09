import React from "react";
import { Config } from "../config";

type BatankyuProps = {
    farmesFromGameOver: number;
};

export const Batankyu: React.VFC<BatankyuProps> = ({ farmesFromGameOver }) => {
    const ratio = farmesFromGameOver / Config.gameOverFrame;
    const x =
        Math.cos(Math.PI / 2 + ratio * Math.PI * 2 * 10) * Config.puyoImgWidth;
    const y =
        (Math.cos(Math.PI + ratio * Math.PI * 2) *
            Config.puyoImgHeight *
            Config.stageRows) /
            4 +
        (Config.puyoImgHeight * Config.stageRows) / 2;
    return (
        <img
            src="img/batankyu.png"
            style={{
                position: "absolute",
                left: x,
                top: y,
                width: Config.puyoImgWidth * 6,
            }}
        />
    );
};
