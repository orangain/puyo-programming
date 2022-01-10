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

    static calculateScore(rensa: number, piece: number, color: number) {
        rensa = Math.min(rensa, Score.rensaBonus.length - 1);
        piece = Math.min(piece, Score.pieceBonus.length - 1);
        color = Math.min(color, Score.colorBonus.length - 1);
        let scale =
            Score.rensaBonus[rensa] +
            Score.pieceBonus[piece] +
            Score.colorBonus[color];
        if (scale === 0) {
            scale = 1;
        }
        this.addScore(scale * piece * 10);
    }

    static addScore(score: number) {
        this.score += score;
    }
}
