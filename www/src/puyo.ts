export type PuyoColor = 1 | 2 | 3 | 4 | 5;

export type Puyo = {
    puyoId: number;
    color: PuyoColor;
};

export type PuyoPosition = {
    left: number;
    top: number;
};

export type PuyoOnBoard = Puyo & {
    position: PuyoPosition;
    hidden?: boolean;
};
