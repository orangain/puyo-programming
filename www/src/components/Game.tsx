import React, { useEffect, useRef, useState } from "react";
import { Stage as StageComponent } from "./Stage";
import { Score as ScoreComponent } from "./Score";
import { gameOverFrame, initialize, mode, tick } from "../game";
import { Score } from "../score";
import { Stage, PuyoOnBoard } from "../stage";
import { Player } from "../player";
import { Batankyu } from "./Batankyu";
import { Zenkeshi } from "./Zenkeshi";
import { Config } from "../config";

// まずステージを整える
const initialFrame = initialize();

export const Game: React.VFC = () => {
    const reqIdRef = useRef<number>();
    const [frame, setFrame] = useState(initialFrame); // ゲームの現在フレーム（1/60秒ごとに1追加される）

    const loop = () => {
        reqIdRef.current = requestAnimationFrame(loop); // 1/60秒後にもう一度呼び出す
        setFrame(tick);
    };

    useEffect(() => {
        // ゲームを開始する
        loop();
        return () => {
            if (reqIdRef.current !== undefined) {
                cancelAnimationFrame(reqIdRef.current);
            }
        };
    }, []);

    // console.log(frame)

    const puyos: PuyoOnBoard[] = [];
    puyos.push(...Stage.getPuyoOnBoards());
    puyos.push(...Player.getPlayingPuyoOnBoards());
    if (Stage.erasingBlinkState) {
        puyos.push(...Stage.erasingPuyoInfoList.map((info) => info.cell));
    }

    const isBatankyu = mode === "batankyu";

    return (
        <div
            style={{
                position: "relative",
                width: Config.puyoImgWidth * Config.stageCols,
                margin: "0 auto",
                overflow: "hidden",
                background: "url(img/puyo_2bg.png)",
            }}
        >
            {Stage.zenkeshiVisible && (
                <Zenkeshi
                    showRatio={Stage.zenkeshiShowRatio}
                    hideRatio={Stage.zenkeshiHideRatio}
                />
            )}
            <StageComponent puyos={puyos} />
            {isBatankyu && (
                <Batankyu farmesFromGameOver={frame - gameOverFrame} />
            )}
            <ScoreComponent score={Score.score} />
        </div>
    );
};
