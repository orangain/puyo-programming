import React, { useEffect, useRef, useState } from "react";
import { Puyo, Stage as StageComponent } from "./Stage";
import { Score as ScoreComponent } from "./Score";
import { initialize, tick } from "../game";
import { Score } from "../score";
import { Stage } from "../stage";
import { Player } from "../player";

// まずステージを整える
initialize();

export const Game: React.VFC = () => {
    const reqIdRef = useRef<number>();
    const [frame, setFrame] = useState(0); // ゲームの現在フレーム（1/60秒ごとに1追加される）

    const loop = () => {
        reqIdRef.current = requestAnimationFrame(loop); // 1/60秒後にもう一度呼び出す
        setFrame((f) => {
            tick(f);
            return f + 1;
        });
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

    const puyos: Puyo[] = [];
    Stage.board.forEach((line) =>
        line.forEach((cell) => {
            if (cell) {
                puyos.push({
                    id: cell.puyoId,
                    color: cell.puyo,
                    x: parseFloat(cell.element.style.left),
                    y: parseFloat(cell.element.style.top),
                });
            }
        })
    );
    if (Player.centerPuyoOnBoard) {
        puyos.push({
            id: Player.centerPuyoOnBoard.puyoId,
            color: Player.centerPuyoOnBoard.puyo,
            x: parseFloat(Player.centerPuyoOnBoard.element.style.left),
            y: parseFloat(Player.centerPuyoOnBoard.element.style.top),
        });
    }
    if (Player.movablePuyoOnBoard) {
        puyos.push({
            id: Player.movablePuyoOnBoard.puyoId,
            color: Player.movablePuyoOnBoard.puyo,
            x: parseFloat(Player.movablePuyoOnBoard.element.style.left),
            y: parseFloat(Player.movablePuyoOnBoard.element.style.top),
        });
    }
    if (Stage.erasingBlinkState) {
        puyos.push(
            ...Stage.erasingPuyoInfoList.map((info) => ({
                id: info.cell.puyoId,
                color: info.cell.puyo,
                x: parseFloat(info.cell.element.style.left),
                y: parseFloat(info.cell.element.style.top),
            }))
        );
    }

    return (
        <>
            <StageComponent puyos={puyos} />
            <ScoreComponent score={Score.score} />
        </>
    );
};
