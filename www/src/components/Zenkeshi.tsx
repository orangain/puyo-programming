import React from "react";
import { Config } from "../config";

type ZenkeshiProps = {
    showRatio: number;
    hideRatio: number;
};

export const Zenkeshi: React.VFC<ZenkeshiProps> = ({
    showRatio,
    hideRatio,
}) => {
    const startTop = Config.puyoImgHeight * Config.stageRows;
    const endTop = (Config.puyoImgHeight * Config.stageRows) / 3;
    const top = (endTop - startTop) * showRatio + startTop;
    const opacity = 1 - hideRatio;

    return (
        <img
            src="img/zenkeshi.png"
            style={{
                position: "absolute",
                top,
                opacity,
                width: Config.puyoImgWidth * 6,
            }}
        />
    );
};
