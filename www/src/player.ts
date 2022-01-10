import { Config, PuyoColor } from "./config";
import { PuyoOnBoard, Stage } from "./stage";
import { Score } from "./score";
import { Input } from "./input";

type PlayingPuyo = {
    puyoId: number;
    color: PuyoColor;
};

type PuyoStatus = {
    x: number; // 中心ぷよの位置: 左から2列目
    y: number; // 画面上部ギリギリから出てくる
    left: number;
    top: number;
    dx: number; // 動くぷよの相対位置: 動くぷよは上方向にある
    dy: number;
    rotation: number; // 動くぷよの角度は90度（上向き）
};

export class Player {
    private static centerPuyo: PlayingPuyo | null;
    private static movablePuyo: PlayingPuyo | null;
    private static puyoStatus: PuyoStatus;

    private static groundFrame: number;

    private static actionStartFrame: number;
    private static moveSource: number;
    private static moveDestination: number;
    private static rotateBeforeLeft: number;
    private static rotateAfterLeft: number;
    private static rotateFromRotation: number;

    //ぷよ設置確認
    static createNewPuyo() {
        // ぷよぷよが置けるかどうか、1番上の段の左から3つ目を確認する
        if (Stage.board[0][2]) {
            // 空白でない場合は新しいぷよを置けない
            return false;
        }
        // 新しいぷよの色を決める
        const puyoColors = Math.max(
            1,
            Math.min(5, Config.puyoColors)
        ) as PuyoColor;
        const centerPuyoColor = (Math.floor(Math.random() * puyoColors) +
            1) as PuyoColor;
        const movablePuyoColor = (Math.floor(Math.random() * puyoColors) +
            1) as PuyoColor;
        // 新しいぷよ画像を作成する
        this.centerPuyo = {
            puyoId: generatePuyoId(),
            color: centerPuyoColor,
        };
        this.movablePuyo = {
            puyoId: generatePuyoId(),
            color: movablePuyoColor,
        };
        // ぷよの初期配置を定める
        this.puyoStatus = {
            x: 2, // 中心ぷよの位置: 左から2列目
            y: -1, // 画面上部ギリギリから出てくる
            left: 2 * Config.puyoImgWidth,
            top: -1 * Config.puyoImgHeight,
            dx: 0, // 動くぷよの相対位置: 動くぷよは上方向にある
            dy: -1,
            rotation: 90, // 動くぷよの角度は90度（上向き）
        };
        // 接地時間はゼロ
        this.groundFrame = 0;
        return true;
    }

    static getPlayingPuyoOnBoards(): PuyoOnBoard[] {
        if (!this.centerPuyo || !this.movablePuyo) {
            return [];
        }

        return [
            {
                ...this.centerPuyo,
                position: {
                    left: this.puyoStatus.left,
                    top: this.puyoStatus.top,
                },
            },
            {
                ...this.movablePuyo,
                position: {
                    left:
                        this.puyoStatus.left +
                        Math.cos((this.puyoStatus.rotation * Math.PI) / 180) *
                            Config.puyoImgWidth,
                    top:
                        this.puyoStatus.top -
                        Math.sin((this.puyoStatus.rotation * Math.PI) / 180) *
                            Config.puyoImgHeight,
                },
            },
        ];
    }

    private static falling(isDownPressed: boolean) {
        // 現状の場所の下にブロックがあるかどうか確認する
        let isBlocked = false;
        let x = this.puyoStatus.x;
        let y = this.puyoStatus.y;
        let dx = this.puyoStatus.dx;
        let dy = this.puyoStatus.dy;
        if (
            y + 1 >= Config.stageRows ||
            Stage.board[y + 1][x] ||
            (y + dy + 1 >= 0 &&
                (y + dy + 1 >= Config.stageRows ||
                    Stage.board[y + dy + 1][x + dx]))
        ) {
            isBlocked = true;
        }
        if (!isBlocked) {
            // 下にブロックがないなら自由落下してよい。プレイヤー操作中の自由落下処理をする
            this.puyoStatus.top += Config.playerFallingSpeed;
            if (isDownPressed) {
                // 下キーが押されているならもっと加速する
                this.puyoStatus.top += Config.playerDownSpeed;
            }
            if (Math.floor(this.puyoStatus.top / Config.puyoImgHeight) != y) {
                // ブロックの境を超えたので、再チェックする
                // 下キーが押されていたら、得点を加算する
                if (isDownPressed) {
                    Score.addDownScore();
                }
                y += 1;
                this.puyoStatus.y = y;
                if (
                    y + 1 >= Config.stageRows ||
                    Stage.board[y + 1][x] ||
                    (y + dy + 1 >= 0 &&
                        (y + dy + 1 >= Config.stageRows ||
                            Stage.board[y + dy + 1][x + dx]))
                ) {
                    isBlocked = true;
                }
                if (!isBlocked) {
                    // 境を超えたが特に問題はなかった。次回も自由落下を続ける
                    this.groundFrame = 0;
                    return;
                } else {
                    // 境を超えたらブロックにぶつかった。位置を調節して、接地を開始する
                    this.puyoStatus.top = y * Config.puyoImgHeight;
                    this.groundFrame = 1;
                    return;
                }
            } else {
                // 自由落下で特に問題がなかった。次回も自由落下を続ける
                this.groundFrame = 0;
                return;
            }
        }
        if (this.groundFrame == 0) {
            // 初接地である。接地を開始する
            this.groundFrame = 1;
            return;
        } else {
            this.groundFrame++;
            if (this.groundFrame > Config.playerGroundFrame) {
                return true;
            }
        }
    }
    static playing(frame: number) {
        // まず自由落下を確認する
        // 下キーが押されていた場合、それ込みで自由落下させる
        if (this.falling(Input.keyStatus.down)) {
            // 落下が終わっていたら、ぷよを固定する
            return "fix";
        }
        if (Input.keyStatus.right || Input.keyStatus.left) {
            // 左右のの確認をする
            const cx = Input.keyStatus.right ? 1 : -1;
            const x = this.puyoStatus.x;
            const y = this.puyoStatus.y;
            const mx = x + this.puyoStatus.dx;
            const my = y + this.puyoStatus.dy;
            // その方向にブロックがないことを確認する
            // まずは自分の左右を確認
            let canMove = true;
            if (
                y < 0 ||
                x + cx < 0 ||
                x + cx >= Config.stageCols ||
                Stage.board[y][x + cx]
            ) {
                if (y >= 0) {
                    canMove = false;
                }
            }
            if (
                my < 0 ||
                mx + cx < 0 ||
                mx + cx >= Config.stageCols ||
                Stage.board[my][mx + cx]
            ) {
                if (my >= 0) {
                    canMove = false;
                }
            }
            // 接地していない場合は、さらに1個下のブロックの左右も確認する
            if (this.groundFrame === 0) {
                if (
                    y + 1 < 0 ||
                    x + cx < 0 ||
                    x + cx >= Config.stageCols ||
                    Stage.board[y + 1][x + cx]
                ) {
                    if (y + 1 >= 0) {
                        canMove = false;
                    }
                }
                if (
                    my + 1 < 0 ||
                    mx + cx < 0 ||
                    mx + cx >= Config.stageCols ||
                    Stage.board[my + 1][mx + cx]
                ) {
                    if (my + 1 >= 0) {
                        canMove = false;
                    }
                }
            }

            if (canMove) {
                // 動かすことが出来るので、移動先情報をセットして移動状態にする
                this.actionStartFrame = frame;
                this.moveSource = x * Config.puyoImgWidth;
                this.moveDestination = (x + cx) * Config.puyoImgWidth;
                this.puyoStatus.x += cx;
                return "moving";
            }
        } else if (Input.keyStatus.up) {
            // 回転を確認する
            // 回せるかどうかは後で確認。まわすぞ
            const x = this.puyoStatus.x;
            const y = this.puyoStatus.y;
            const mx = x + this.puyoStatus.dx;
            const my = y + this.puyoStatus.dy;
            const rotation = this.puyoStatus.rotation;
            let canRotate = true;

            let cx = 0;
            let cy = 0;
            if (rotation === 0) {
                // 右から上には100% 確実に回せる。何もしない
            } else if (rotation === 90) {
                // 上から左に回すときに、左にブロックがあれば右に移動する必要があるのでまず確認する
                if (
                    y + 1 < 0 ||
                    x - 1 < 0 ||
                    x - 1 >= Config.stageCols ||
                    Stage.board[y + 1][x - 1]
                ) {
                    if (y + 1 >= 0) {
                        // ブロックがある。右に1個ずれる
                        cx = 1;
                    }
                }
                // 右にずれる必要がある時、右にもブロックがあれば回転出来ないので確認する
                if (cx === 1) {
                    if (
                        y + 1 < 0 ||
                        x + 1 < 0 ||
                        y + 1 >= Config.stageRows ||
                        x + 1 >= Config.stageCols ||
                        Stage.board[y + 1][x + 1]
                    ) {
                        if (y + 1 >= 0) {
                            // ブロックがある。回転出来なかった
                            canRotate = false;
                        }
                    }
                }
            } else if (rotation === 180) {
                // 左から下に回す時には、自分の下か左下にブロックがあれば1個上に引き上げる。まず下を確認する
                if (
                    y + 2 < 0 ||
                    y + 2 >= Config.stageRows ||
                    Stage.board[y + 2][x]
                ) {
                    if (y + 2 >= 0) {
                        // ブロックがある。上に引き上げる
                        cy = -1;
                    }
                }
                // 左下も確認する
                if (
                    y + 2 < 0 ||
                    y + 2 >= Config.stageRows ||
                    x - 1 < 0 ||
                    Stage.board[y + 2][x - 1]
                ) {
                    if (y + 2 >= 0) {
                        // ブロックがある。上に引き上げる
                        cy = -1;
                    }
                }
            } else if (rotation === 270) {
                // 下から右に回すときは、右にブロックがあれば左に移動する必要があるのでまず確認する
                if (
                    y + 1 < 0 ||
                    x + 1 < 0 ||
                    x + 1 >= Config.stageCols ||
                    Stage.board[y + 1][x + 1]
                ) {
                    if (y + 1 >= 0) {
                        // ブロックがある。左に1個ずれる
                        cx = -1;
                    }
                }
                // 左にずれる必要がある時、左にもブロックがあれば回転出来ないので確認する
                if (cx === -1) {
                    if (
                        y + 1 < 0 ||
                        x - 1 < 0 ||
                        x - 1 >= Config.stageCols ||
                        Stage.board[y + 1][x - 1]
                    ) {
                        if (y + 1 >= 0) {
                            // ブロックがある。回転出来なかった
                            canRotate = false;
                        }
                    }
                }
            }

            if (canRotate) {
                // 上に移動する必要があるときは、一気にあげてしまう
                if (cy === -1) {
                    if (this.groundFrame > 0) {
                        // 接地しているなら1段引き上げる
                        this.puyoStatus.y -= 1;
                        this.groundFrame = 0;
                    }
                    this.puyoStatus.top =
                        this.puyoStatus.y * Config.puyoImgHeight;
                }
                // 回すことが出来るので、回転後の情報をセットして回転状態にする
                this.actionStartFrame = frame;
                this.rotateBeforeLeft = x * Config.puyoImgHeight;
                this.rotateAfterLeft = (x + cx) * Config.puyoImgHeight;
                this.rotateFromRotation = this.puyoStatus.rotation;
                // 次の状態を先に設定しておく
                this.puyoStatus.x += cx;
                const distRotation = (this.puyoStatus.rotation + 90) % 360;
                const dCombi = [
                    [1, 0],
                    [0, -1],
                    [-1, 0],
                    [0, 1],
                ][distRotation / 90];
                this.puyoStatus.dx = dCombi[0];
                this.puyoStatus.dy = dCombi[1];
                return "rotating";
            }
        }
        return "playing";
    }
    static moving(frame: number) {
        // 移動中も自然落下はさせる
        this.falling(false);
        const ratio = Math.min(
            1,
            (frame - this.actionStartFrame) / Config.playerMoveFrame
        );
        this.puyoStatus.left =
            ratio * (this.moveDestination - this.moveSource) + this.moveSource;
        if (ratio === 1) {
            return false;
        }
        return true;
    }
    static rotating(frame: number) {
        // 回転中も自然落下はさせる
        this.falling(false);
        const ratio = Math.min(
            1,
            (frame - this.actionStartFrame) / Config.playerRotateFrame
        );
        this.puyoStatus.left =
            (this.rotateAfterLeft - this.rotateBeforeLeft) * ratio +
            this.rotateBeforeLeft;
        this.puyoStatus.rotation = this.rotateFromRotation + ratio * 90;
        if (ratio === 1) {
            this.puyoStatus.rotation = (this.rotateFromRotation + 90) % 360;
            return false;
        }
        return true;
    }

    static fix() {
        if (!this.centerPuyo || !this.movablePuyo) {
            throw new Error("centerPuyoOnBoard or movablePuyoOnBoard is null");
        }
        // 現在のぷよをステージ上に配置する
        const x = this.puyoStatus.x;
        const y = this.puyoStatus.y;
        const dx = this.puyoStatus.dx;
        const dy = this.puyoStatus.dy;
        if (y >= 0) {
            // 画面外のぷよは消してしまう
            Stage.setPuyo(x, y, this.centerPuyo.color, this.centerPuyo.puyoId);
        }
        if (y + dy >= 0) {
            // 画面外のぷよは消してしまう
            Stage.setPuyo(
                x + dx,
                y + dy,
                this.movablePuyo.color,
                this.movablePuyo.puyoId
            );
        }
        // 操作用に作成したぷよ画像を消す
        this.centerPuyo = null;
        this.movablePuyo = null;
    }

    static batankyu() {
        if (Input.keyStatus.up) {
            location.reload();
        }
    }
}

let lastPuyoId = 0;
function generatePuyoId(): number {
    return ++lastPuyoId;
}
