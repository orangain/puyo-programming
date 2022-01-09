import React, { useEffect, useRef, useState } from "react";
import { Score as ScoreComponent } from "./Score";
import { initialize, tick } from "../game";
import { Score } from "../score";

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

    return (
        <>
            <ScoreComponent score={Score.score} />
        </>
    );
};
