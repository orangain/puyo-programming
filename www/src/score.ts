export class Score {
    static score: number;

    private static rensaBonus = [
        0, 8, 16, 32, 64, 96, 128, 160, 192, 224, 256, 288, 320, 352, 384, 416,
        448, 480, 512, 544, 576, 608, 640, 672,
    ];
    private static pieceBonus = [0, 0, 0, 0, 2, 3, 4, 5, 6, 7, 10, 10];
    private static colorBonus = [0, 0, 3, 6, 12, 24];

    static initialize() {
        this.score = 0;
    }

    static addDownScore() {
        this.addScore(1);
    }

    static addErasingScore(rensa: number, piece: number, color: number) {
        rensa = Math.min(rensa, this.rensaBonus.length - 1);
        piece = Math.min(piece, this.pieceBonus.length - 1);
        color = Math.min(color, this.colorBonus.length - 1);
        let scale =
            this.rensaBonus[rensa] +
            this.pieceBonus[piece] +
            this.colorBonus[color];
        if (scale === 0) {
            scale = 1;
        }
        this.addScore(scale * piece * 10);
    }

    static addZenkeshiScore() {
        this.addScore(3600);
    }

    private static addScore(score: number) {
        this.score += score;
    }
}
