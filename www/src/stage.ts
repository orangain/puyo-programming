import { Config } from "./config";
import { PuyoOnStage, PuyoColor, PuyoPosition } from "./puyo";

type FallingPuyo = {
    position: PuyoPosition;
    destinationTop: number;
    falling: boolean;
};

type PuyoInfo = {
    x: number;
    y: number;
    cell: PuyoOnStage;
};

export class Stage {
    static board: (null | PuyoOnStage)[][];
    private static fallingPuyoList: FallingPuyo[];
    private static eraseStartFrame: number;
    private static erasingPuyoInfoList: PuyoOnStage[];
    private static erasingPuyoIsHidden: boolean;
    static zenkeshiVisible: boolean;
    static zenkeshiShowRatio: number;
    static zenkeshiHideRatio: number;

    static initialize() {
        // メモリを準備する
        this.board = [];
        for (let y = 0; y < Config.stageRows; y++) {
            this.board[y] = [];
            for (let x = 0; x < Config.stageCols; x++) {
                this.board[y][x] = null;
            }
        }
        this.fallingPuyoList = [];
        this.erasingPuyoInfoList = [];
    }

    static getFixedPuyos(): PuyoOnStage[] {
        return this.board
            .flat()
            .filter((cell) => cell !== null) as PuyoOnStage[];
    }

    static getErasingPuyos(): PuyoOnStage[] {
        return this.erasingPuyoInfoList.map((puyo) => ({
            ...puyo,
            hidden: this.erasingPuyoIsHidden,
        }));
    }

    // メモリに puyo をセットする
    static setPuyo(x: number, y: number, puyo: PuyoColor, puyoId: number) {
        // メモリにセットする
        this.board[y][x] = {
            puyoId,
            color: puyo,
            position: {
                left: x * Config.puyoImgWidth,
                top: y * Config.puyoImgHeight,
            },
        };
    }

    // 自由落下をチェックする
    static checkFall() {
        this.fallingPuyoList.length = 0;
        let isFalling = false;
        // 下の行から上の行を見ていく
        for (let y = Config.stageRows - 2; y >= 0; y--) {
            const line = this.board[y];
            for (let x = 0; x < line.length; x++) {
                const cell = this.board[y][x];
                if (!cell) {
                    // このマスにぷよがなければ次
                    continue;
                }
                if (!this.board[y + 1][x]) {
                    // このぷよは落ちるので、取り除く
                    this.board[y][x] = null;
                    let dst = y;
                    while (
                        dst + 1 < Config.stageRows &&
                        this.board[dst + 1][x] == null
                    ) {
                        dst++;
                    }
                    // 最終目的地に置く
                    this.board[dst][x] = cell;
                    // 落ちるリストに入れる
                    this.fallingPuyoList.push({
                        position: cell.position,
                        destinationTop: dst * Config.puyoImgHeight,
                        falling: true,
                    });
                    // 落ちるものがあったことを記録しておく
                    isFalling = true;
                }
            }
        }
        return isFalling;
    }
    // 自由落下させる
    static fall() {
        let isFalling = false;
        for (const fallingPuyo of this.fallingPuyoList) {
            if (!fallingPuyo.falling) {
                // すでに自由落下が終わっている
                continue;
            }
            let top = fallingPuyo.position.top;
            top += Config.freeFallingSpeed;
            if (top >= fallingPuyo.destinationTop) {
                // 自由落下終了
                top = fallingPuyo.destinationTop;
                fallingPuyo.falling = false;
            } else {
                // まだ落下しているぷよがあることを記録する
                isFalling = true;
            }
            // ぷよを動かす
            fallingPuyo.position.top = top;
        }
        return isFalling;
    }

    // 消せるかどうか判定する
    static checkErase(startFrame: number) {
        this.eraseStartFrame = startFrame;
        this.erasingPuyoInfoList.length = 0;

        // 何色のぷよを消したかを記録する
        const erasedPuyoColor: Partial<Record<PuyoColor, boolean>> = {};

        // 隣接ぷよを確認する関数内関数を作成
        const sequencePuyoInfoList: PuyoInfo[] = [];
        const existingPuyoInfoList: PuyoInfo[] = [];
        const checkSequentialPuyo = (x: number, y: number) => {
            // ぷよがあるか確認する
            const orig = this.board[y][x];
            if (!orig) {
                // ないなら何もしない
                return;
            }
            // あるなら一旦退避して、メモリ上から消す
            const puyo = orig.color;
            sequencePuyoInfoList.push({
                x: x,
                y: y,
                cell: orig,
            });
            this.board[y][x] = null;

            // 四方向の周囲ぷよを確認する
            const direction = [
                [0, 1],
                [1, 0],
                [0, -1],
                [-1, 0],
            ];
            for (let i = 0; i < direction.length; i++) {
                const dx = x + direction[i][0];
                const dy = y + direction[i][1];
                if (
                    dx < 0 ||
                    dy < 0 ||
                    dx >= Config.stageCols ||
                    dy >= Config.stageRows
                ) {
                    // ステージの外にはみ出た
                    continue;
                }
                const cell = this.board[dy][dx];
                if (!cell || cell.color !== puyo) {
                    // ぷよの色が違う
                    continue;
                }
                // そのぷよのまわりのぷよも消せるか確認する
                checkSequentialPuyo(dx, dy);
            }
        };

        // 実際に削除できるかの確認を行う
        for (let y = 0; y < Config.stageRows; y++) {
            for (let x = 0; x < Config.stageCols; x++) {
                sequencePuyoInfoList.length = 0;
                const puyoColor = this.board[y][x]?.color;
                checkSequentialPuyo(x, y);
                if (
                    sequencePuyoInfoList.length == 0 ||
                    sequencePuyoInfoList.length < Config.erasePuyoCount
                ) {
                    // 連続して並んでいる数が足りなかったので消さない
                    if (sequencePuyoInfoList.length) {
                        // 退避していたぷよを消さないリストに追加する
                        existingPuyoInfoList.push(...sequencePuyoInfoList);
                    }
                } else {
                    if (!puyoColor) {
                        throw new Error("puyoColor must be truthy");
                    }
                    // これらは消して良いので消すリストに追加する
                    this.erasingPuyoInfoList.push(
                        ...sequencePuyoInfoList.map((info) => info.cell)
                    );
                    erasedPuyoColor[puyoColor] = true;
                }
            }
        }

        // 消さないリストに入っていたぷよをメモリに復帰させる
        for (const info of existingPuyoInfoList) {
            this.board[info.y][info.x] = info.cell;
        }

        if (this.erasingPuyoInfoList.length) {
            // もし消せるならば、消えるぷよの個数と色の情報をまとめて返す
            return {
                piece: this.erasingPuyoInfoList.length,
                color: Object.keys(erasedPuyoColor).length,
            };
        }
        return null;
    }
    // 消すアニメーションをする
    static erasing(frame: number) {
        const elapsedFrame = frame - this.eraseStartFrame;
        const ratio = elapsedFrame / Config.eraseAnimationDuration;
        if (ratio > 1) {
            // アニメーションを終了する
            this.erasingPuyoInfoList = [];
            return false;
        } else if (ratio > 0.75) {
            this.erasingPuyoIsHidden = false;
            return true;
        } else if (ratio > 0.5) {
            this.erasingPuyoIsHidden = true;
            return true;
        } else if (ratio > 0.25) {
            this.erasingPuyoIsHidden = false;
            return true;
        } else {
            this.erasingPuyoIsHidden = true;
            return true;
        }
    }

    static showZenkeshi() {
        // 全消しを表示する
        this.zenkeshiVisible = true;
        this.zenkeshiShowRatio = 0;
        this.zenkeshiHideRatio = 0;
        const startTime = Date.now();
        const animation = () => {
            const ratio = Math.min(
                (Date.now() - startTime) / Config.zenkeshiDuration,
                1
            );
            this.zenkeshiShowRatio = ratio;
            if (ratio !== 1) {
                requestAnimationFrame(animation);
            }
        };
        animation();
    }
    static hideZenkeshi() {
        // 全消しを消去する
        const startTime = Date.now();
        const animation = () => {
            const ratio = Math.min(
                (Date.now() - startTime) / Config.zenkeshiDuration,
                1
            );
            this.zenkeshiHideRatio = ratio;
            if (ratio !== 1) {
                requestAnimationFrame(animation);
            } else {
                this.zenkeshiVisible = false;
            }
        };
        animation();
    }
}
