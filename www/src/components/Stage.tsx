import React from "react";
import { Config, PuyoColor } from "../config";
import { PuyoImage } from "./PuyoImage";

export type Puyo = {
    id: number;
    color: PuyoColor;
    x: number;
    y: number;
};

export type StageProps = {
    puyos: Puyo[];
};

export const Stage: React.VFC<StageProps> = ({ puyos }) => {
    return (
        <div
            style={{
                width: Config.puyoImgWidth * Config.stageCols,
                height: Config.puyoImgHeight * Config.stageRows,
                backgroundColor: Config.stageBackgroundColor,
                backgroundImage: "url(img/puyo_2bg.png)",
            }}
        >
            {puyos.map(({ id, ...puyo }) => (
                <PuyoImage key={id} {...puyo} />
            ))}
        </div>
    );
};
