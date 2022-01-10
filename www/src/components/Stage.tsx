import React from "react";
import { Config } from "../config";
import { PuyoImage } from "./PuyoImage";
import { PuyoOnBoard } from "../stage";

export type StageProps = {
    puyos: PuyoOnBoard[];
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
            {puyos.map(({ puyoId, ...puyo }) => (
                <PuyoImage key={puyoId} {...puyo} />
            ))}
        </div>
    );
};
