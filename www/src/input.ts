type KeyStatus = {
    right: boolean;
    left: boolean;
    up: boolean;
    down: boolean;
};

type TouchPoint = {
    xs: number;
    ys: number;
    xe: number;
    ye: number;
};

export class Input {
    static keyStatus: KeyStatus;
    private static touchPoint: TouchPoint;

    static initialize() {
        // キーボードの入力を確認する
        this.keyStatus = {
            right: false,
            left: false,
            up: false,
            down: false,
        };
        // ブラウザのキーボードの入力を取得するイベントリスナを登録する
        window.document.addEventListener("keydown", (e: KeyboardEvent) => {
            // キーボードが押された場合
            switch (e.keyCode) {
                case 37: // 左向きキー
                    this.keyStatus.left = true;
                    e.preventDefault();
                    return false;
                case 38: // 上向きキー
                    this.keyStatus.up = true;
                    e.preventDefault();
                    return false;
                case 39: // 右向きキー
                    this.keyStatus.right = true;
                    e.preventDefault();
                    return false;
                case 40: // 下向きキー
                    this.keyStatus.down = true;
                    e.preventDefault();
                    return false;
            }
        });
        document.addEventListener("keyup", (e: KeyboardEvent) => {
            // キーボードが離された場合
            switch (e.keyCode) {
                case 37: // 左向きキー
                    this.keyStatus.left = false;
                    e.preventDefault();
                    return false;
                case 38: // 上向きキー
                    this.keyStatus.up = false;
                    e.preventDefault();
                    return false;
                case 39: // 右向きキー
                    this.keyStatus.right = false;
                    e.preventDefault();
                    return false;
                case 40: // 下向きキー
                    this.keyStatus.down = false;
                    e.preventDefault();
                    return false;
            }
        });
        // タッチ操作追加
        this.touchPoint = {
            xs: 0,
            ys: 0,
            xe: 0,
            ye: 0,
        };
        document.addEventListener("touchstart", (e: TouchEvent) => {
            this.touchPoint.xs = e.touches[0].clientX;
            this.touchPoint.ys = e.touches[0].clientY;
        });
        document.addEventListener("touchmove", (e: TouchEvent) => {
            // 指が少し動いた時は無視
            if (
                Math.abs(e.touches[0].clientX - this.touchPoint.xs) < 20 &&
                Math.abs(e.touches[0].clientY - this.touchPoint.ys) < 20
            ) {
                return;
            }

            // 指の動きをからジェスチャーによるkeyStatusプロパティを更新
            this.touchPoint.xe = e.touches[0].clientX;
            this.touchPoint.ye = e.touches[0].clientY;
            const { xs, ys, xe, ye } = this.touchPoint;
            gesture(xs, ys, xe, ye);

            this.touchPoint.xs = this.touchPoint.xe;
            this.touchPoint.ys = this.touchPoint.ye;
        });
        document.addEventListener("touchend", (e) => {
            this.keyStatus.up = false;
            this.keyStatus.down = false;
            this.keyStatus.left = false;
            this.keyStatus.right = false;
        });

        // ジェスチャーを判定して、keyStatusプロパティを更新する関数
        const gesture = (xs: number, ys: number, xe: number, ye: number) => {
            const horizonDirection = xe - xs;
            const verticalDirection = ye - ys;

            if (Math.abs(horizonDirection) < Math.abs(verticalDirection)) {
                // 縦方向
                if (verticalDirection < 0) {
                    // up
                    this.keyStatus.up = true;
                    this.keyStatus.down = false;
                    this.keyStatus.left = false;
                    this.keyStatus.right = false;
                } else if (0 <= verticalDirection) {
                    // down
                    this.keyStatus.up = false;
                    this.keyStatus.down = true;
                    this.keyStatus.left = false;
                    this.keyStatus.right = false;
                }
            } else {
                // 横方向
                if (horizonDirection < 0) {
                    // left
                    this.keyStatus.up = false;
                    this.keyStatus.down = false;
                    this.keyStatus.left = true;
                    this.keyStatus.right = false;
                } else if (0 <= horizonDirection) {
                    // right
                    this.keyStatus.up = false;
                    this.keyStatus.down = false;
                    this.keyStatus.left = false;
                    this.keyStatus.right = true;
                }
            }
        };
    }
}
