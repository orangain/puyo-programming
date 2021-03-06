import { Stage } from "./stage";
import { Player } from "./player";
import { Score } from "./score";
import { Input } from "./input";
import { Config } from "./config";

type GameMode =
    | "start"
    | "checkFall"
    | "fall"
    | "checkErase"
    | "erasing"
    | "newPuyo"
    | "playing"
    | "moving"
    | "rotating"
    | "fix"
    | "gameOver"
    | "batankyu";

let mode: GameMode; // ゲームの現在の状況
let combinationCount = 0; // 何連鎖かどうか
let gameOverFrame: number; // ゲームオーバーになったフレーム

export function initialize(): number {
    // ステージを準備する
    Stage.initialize();
    // ユーザー操作の準備をする
    Input.initialize();
    // スコア表示の準備をする
    Score.initialize();
    mode = "start";
    return 0;
}

export function tick(frame: number): number {
    switch (mode) {
        case "start":
            // 最初は、もしかしたら空中にあるかもしれないぷよを自由落下させるところからスタート
            mode = "checkFall";
            break;
        case "checkFall":
            // 落ちるかどうか判定する
            if (Stage.checkFall()) {
                mode = "fall";
            } else {
                // 落ちないならば、ぷよを消せるかどうか判定する
                mode = "checkErase";
            }
            break;
        case "fall":
            if (!Stage.fall()) {
                // すべて落ちきったら、ぷよを消せるかどうか判定する
                mode = "checkErase";
            }
            break;
        case "checkErase":
            // 消せるかどうか判定する
            const eraseInfo = Stage.checkErase(frame);
            if (eraseInfo) {
                mode = "erasing";
                combinationCount++;
                // 得点を計算する
                Score.addErasingScore(
                    combinationCount,
                    eraseInfo.piece,
                    eraseInfo.color
                );
                Stage.hideZenkeshi(frame);
            } else {
                if (
                    Stage.getFixedPuyos().length === 0 &&
                    combinationCount > 0
                ) {
                    // 全消しの処理をする
                    Stage.showZenkeshi(frame);
                    Score.addZenkeshiScore();
                }
                combinationCount = 0;
                // 消せなかったら、新しいぷよを登場させる
                mode = "newPuyo";
            }
            break;
        case "erasing":
            if (!Stage.erasing(frame)) {
                // 消し終わったら、再度落ちるかどうか判定する
                mode = "checkFall";
            }
            break;
        case "newPuyo":
            if (!Player.createNewPuyo()) {
                // 新しい操作用ぷよを作成出来なかったら、ゲームオーバー
                mode = "gameOver";
            } else {
                // プレイヤーが操作可能
                mode = "playing";
            }
            break;
        case "playing":
            // プレイヤーが操作する
            const action = Player.playing(frame);
            mode = action; // 'playing' 'moving' 'rotating' 'fix' のどれかが帰ってくる
            break;
        case "moving":
            if (!Player.moving(frame)) {
                // 移動が終わったので操作可能にする
                mode = "playing";
            }
            break;
        case "rotating":
            if (!Player.rotating(frame)) {
                // 回転が終わったので操作可能にする
                mode = "playing";
            }
            break;
        case "fix":
            // 現在の位置でぷよを固定する
            Player.fix();
            // 固定したら、まず自由落下を確認する
            mode = "checkFall";
            break;
        case "gameOver":
            // ばたんきゅーの準備をする
            gameOverFrame = frame;
            mode = "batankyu";
            break;
        case "batankyu":
            Player.batankyu();
            break;
    }

    return frame + 1;
}

export function getBatankyuAnimationRatio(frame: number): number | null {
    if (mode !== "batankyu") {
        return null;
    }

    return (frame - gameOverFrame) / Config.gameOverFrame;
}
