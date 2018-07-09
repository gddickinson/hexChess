var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

if (ctx.canvas.width < ctx.canvas.height) {
    ctx.canvas.width = window.innerWidth - (window.innerWidth * 0.05);
    ctx.canvas.height = ctx.canvas.width;
} else {
    ctx.canvas.height = window.innerHeight - (window.innerHeight * 0.05);
    ctx.canvas.width = ctx.canvas.height;
}

var rect = c.getBoundingClientRect();

//hex cell variables
var width = rect.width * 0.8;
var height = rect.height * 0.8;
var rad = width / (20 * 1.55);

function getHex_X(x, y) {
    var rad = width / (20 * 1.55);
    return (y % 2 ? rad * 2.5 : rad) + rad * 3 * x;
}

function getHex_Y(x, y) {
    var rad = width / (20 * 1.55);
    return rad + rad * Math.sin(Math.PI / 3) * y;
}

//set board shape by designating cells outside of board that will not be drawn
var offBoard = "(0,0),(0,1),(0,2),(0,3),(0,4),(0,5),(0,6),(0,7),(0,8),(0,9),(0,10),(0,11),(0,12),(0,13),(0,14),(0,15),(0,16),(0,18),(0,19),(0,20),(0,21),(0,22),(0,24),(0,25),(0,26),(0,27),(0,28),(0,29),(0,30),(0,31),(0,32),(0,33),(0,34),(0,35),(0,36),(0,37),(0,38),(0,39)(1,0),(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,12),(1,20),(1,26),(1,28),(1,30),(1,31),(1,31),(1,32),(1,33),(1,34),(1,35),(1,36),(1,37),(1,38),(1,39),(2,0),(2,1),(2,2),(2,3),(2,4),(2,6),(2,34),(2,36),(2,37),(2,38),(2,39),(3,0),(3,1),(3,2),(3,3),(3,4),(3,5),(3,35),(3,36),(3,37),(3,38),(3,39),(4,0),(4,1),(4,39),(5,0),(5,1),(5,39),(6,0),(6,1),(6,39),(7,0),(7,1),(7,39),(8,0),(8,1),(8,3),(8,5),(8,35),(8,37),(8,39),(9,0),(9,1),(9,2),(9,3),(9,4),(9,36),(9,37),(9,38),(9,39),(10,0),(10,1),(10,2),(10,3),(10,4),(10,5),(10,6),(10,7),(10,9),(10,31),(10,33),(10,34),(10,35),(10,36),(10,37),(10,38),(10,39),(11,0),(11,1),(11,2),(11,3),(11,4),(11,5),(11,6),(11,7),(11,8),(11,9),(11,10),(11,11),(11,12),(11,13),(11,15),(11,19),(11,20),(11,21),(11,25),(11,27),(11,28),(11,29),(11,30),(11,31),(11,32),(11,33),(11,34),(11,35),(11,36),(11,37),(11,38),(11,39)";


//create class for board
class Gameboard {
    constructor(cellwidth, cellheight, rad, offBoardList) {
        this.width = cellwidth;
        this.height = cellheight;
        this.rad = rad;
        this.offBoardList = offBoardList;
    }
    drawBoard() {
        //plot base board with white background
        for (var x = 0; x < 12; x++) {
            for (var y = 0; y < 40; y++) {
                var searchStr = "(" + x + "," + y + ")";
                if (offBoard.includes(searchStr) == false) {
                    drawHex(
                        getHex_X(x, y),
                        getHex_Y(x, y),
                        this.rad,
                        x + '' + y,
                        "white",
                        true,
                        "none"
                    );
                }
            }
        }
    }

    hexInBoard(x, y) {
        var searchStr = "(" + x + "," + y + ")";
        if (x > 11) {
            return false;
        }
        if (x < 0) {
            return false;
        }
        if (y > 39) {
            return false;
        }
        if (y < 0) {
            return false;
        }
        if (offBoard.includes(searchStr)) {
            return false;
        } else {
            return true;
        }
    }
}

///////////move selection parameters////////////////////////////////////////////////
//var previousScore = 10000;
//var param_early = 50;
//var param_late = 100;
//var param_capture_1 = 5;
//var param_capture_2 = 2;
//var param_capture_3 = 2;
//var param_defend_1 = 2;
//var param_defend_2 = 2;
//var param_defend_3 = 2;
//var param_flock_1 = 2;
//var param_flock_2 = 2;
//var param_flock_3 = 2;
//var pawn_1 = 10;
//var pawn_2 = 2;
//var pawn_3 = 1;
//var pawnPromo_1 = 1;
//var pawnPromo_2 = 1;
//var pawnPromo_3 = 1;
//var knight_1 = 2;
//var knight_2 = 1;
//var knight_3 = 1;
//var bishop_1 = 2;
//var bishop_2 = 1;
//var bishop_3 = 1;
//var rook_1 = 1;
//var rook_2 = 1;
//var rook_3 = 2;
//var queen_1 = 1;
//var queen_2 = 2;
//var queen_3 = 3;
//var dragon_1 = 1;
//var dragon_2 = 1;
//var dragon_3 = 1;
//var king_1 = 1;
//var king_2 = 1;
//var king_3 = 1;
//var kingCapture_1 = 1;
//var kingCapture_2 = 3;
//var kingCapture_3 = 5;
//var kingDefend_1 = 2;
//var kingDefend_2 = 2;
//var kingDefend_3 = 3;
//var param_avoidDanger_1 = 5;
//var param_avoidDanger_2 = 5;
//var param_avoidDanger_3 = 5;
//var param_capture_1_time = 5;
//var param_capture_1_score = 5;
//var param_capture_2_time = 5;
//var param_capture_2_score = 5; 
//var param_capture_3_time = 5;
//var param_capture_3_score = 5; 
//var param_defend_1_time = 5; 
//var param_defend_1_score = 5;
//var param_defend_2_time = 5;  
//var param_defend_2_score = 5;
//var param_defend_3_time = 5; 
//var param_defend_3_score = 5; 
//var param_flock_1_time = 5; 
//var param_flock_1_score = 5; 
//var param_flock_2_time = 5;  
//var param_flock_2_score = 5; 
//var param_flock_3_time = 5;  
//var param_flock_3_score = 5;
//var pawn_1_time = 5;
//var pawn_1_score = 5; 
//var pawn_2_time = 5; 
//var pawn_2_score = 5; 
//var pawn_3_time = 5;  
//var pawn_3_score = 5; 
//var knight_1_time = 5; 
//var knight_1_score = 5; 
//var knight_2_time = 5; 
//var knight_2_score = 5; 
//var knight_3_time = 5; 
//var knight_3_score = 5; 
//var bishop_1_time = 5; 
//var bishop_1_score = 5; 
//var bishop_2_time = 5; 
//var bishop_2_score = 5; 
//var bishop_3_time = 5;
//var bishop_3_score = 5; 
//var rook_1_time = 5; 
//var rook_1_score = 5;
//var rook_2_time = 5; 
//var rook_2_score = 5; 
//var rook_3_time = 5;  
//var rook_3_score = 5; 
//var queen_1_time = 5; 
//var queen_1_score = 5; 
//var queen_2_time = 5;  
//var queen_2_score = 5; 
//var queen_3_time = 5;  
//var queen_3_score = 5; 
//var king_1_time = 5; 
//var king_1_score = 5; 
//var king_2_time = 5; 
//var king_2_score = 5; 
//var king_3_time = 5; 
//var king_3_score = 5; 
//var dragon_1_time = 5; 
//var dragon_1_score = 5;
//var dragon_2_time = 5;  
//var dragon_2_score = 5; 
//var dragon_3_time = 5;  
//var dragon_3_score = 5; 
//var kingCapture_1_time = 5;
//var kingCapture_1_score = 5; 
//var kingCapture_2_time = 5;  
//var kingCapture_2_score = 5; 
//var kingCapture_3_time = 5;  
//var kingCapture_3_score = 5; 
//var kingDefend_1_time = 5; 
//var kingDefend_1_score = 5;
//var kingDefend_2_time = 5; 
//var kingDefend_2_score = 5;
//var kingDefend_3_time = 5; 
//var kingDefend_3_score = 5; 
//var param_avoidDanger_1_time = 5; 
//var param_avoidDanger_1_score = 5;
//var param_avoidDanger_2_time = 5; 
//var param_avoidDanger_2_score = 5;
//var param_avoidDanger_3_time = 5; 
//var param_avoidDanger_3_score = 5;



loadScript('http://127.0.0.1:8887/parameterFile.txt');
loadScript('http://127.0.0.1:8887/parameterFile_b.txt');



///////////////////////////////////////////////////////////////////////////////////


//create class for piece positions///////////////////////////////////////////////////
class PieceList {
    constructor(whitePawns, whiteKnights, whiteRooks, whiteBishops, whiteQueen, whiteKing, whiteDragon,
        blackPawns, blackKnights, blackRooks, blackBishops, blackQueen, blackKing, blackDragon) {
        this.whitePawns = whitePawns;
        this.whiteKnights = whiteKnights;
        this.whiteRooks = whiteRooks;
        this.whiteBishops = whiteBishops;
        this.whiteQueen = whiteQueen;
        this.whiteKing = whiteKing;
        this.whiteDragon = whiteDragon;
        this.blackPawns = blackPawns;
        this.blackKnights = blackKnights;
        this.blackRooks = blackRooks;
        this.blackBishops = blackBishops;
        this.blackQueen = blackQueen;
        this.blackKing = blackKing;
        this.blackDragon = blackDragon;
        this.computerPlayer = 'None';
        this.turnNumber = 0;
        this.sideToMove = 'w';
        this.turnComplete = false;
        this.pieceToMoveHexSelected = false;
        this.hexToMoveToSelected = false;
        this.selectedCellX = 15;
        this.selectedCellY = 40;
        this.selectedCelltoMovetoX = 15;
        this.selectedCelltoMovetoY = 40;
        this.oldX = 15;
        this.oldY = 40;
        this.pieceSelected = 'none';
        this.colourSelected = 'none';
        this.pieceTypeSelected = 'none';
        this.readyToMove = false;
        this.availableMovesForCurrentPiece = '';
        this.gameRecord = [];
        this.gameOver = false;
        this.winner = "None";
        //Values of pieces
        this.pawnValue = 1;
        this.knightValue = 3;
        this.bishopValue = 3;
        this.rookValue = 5;
        this.queenValue = 9;
        this.kingValue = 1000;
        this.dragonValue = 20;
        this.pieceSymbolList = ['P', 'R', 'N', 'B', 'Q', 'K', 'D'];
        
        this.allMovesAvailable_white = [];
        this.allMovesAvailable_black = [];
    }

    get whitePieceList() {
        var whiteList = [this.whitePawns, this.whiteKnights, this.whiteRooks, this.whiteBishops, this.whiteQueen, this.whiteKing, this.whiteDragon];
        return whiteList;
    }

    get whiteHexsOccupied() {
        var ans = [];
        for (var i = 0; i < this.whitePieceList.length; i++) {
            var subList = this.whitePieceList[i];
            subList = subList.split(';');
            for (var j = 0; j < subList.length; j++) {
                if (subList[j].length > 3) {
                    ans.push(subList[j])
                }
            }
        }
        return ans;
    }

    get blackHexsOccupied() {
        var ans = [];
        for (var i = 0; i < this.blackPieceList.length; i++) {
            var subList = this.blackPieceList[i];
            subList = subList.split(';');
            for (var j = 0; j < subList.length; j++) {
                if (subList[j].length > 3) {
                    ans.push(subList[j])
                }
            }
        }
        return ans;
    }

    get blackPieceList() {
        var blackList = [this.blackPawns, this.blackKnights, this.blackRooks, this.blackBishops, this.blackQueen, this.blackKing, this.blackDragon];
        return blackList;
    }

    allPieces() {
        var allList = [this.whitePawns, this.whiteKnights, this.whiteRooks, this.whiteBishops, this.whiteQueen, this.whiteKing, this.whiteDragon, this.blackPawns, this.blackKnights, this.blackRooks, this.blackBishops, this.blackQueen, this.blackKing, this.blackDragon];
        return allList;
    }

    get whiteImageList() {
        return ['wP', 'wN', 'wR', 'wB', 'wQ', 'wK', 'wD'];
    }

    get blackImageList() {
        return ['bP', 'bN', 'bR', 'bB', 'bQ', 'bK', 'bD'];
    }

    setPieces() {
        //white
        for (var i = 0; i < this.whiteImageList.length; i++) {
            setPiece(this.whiteImageList[i], this.whitePieceList[i]);
        }
        //black
        for (i = 0; i < this.blackImageList.length; i++) {
            setPiece(this.blackImageList[i], this.blackPieceList[i]);
        }
    }

    getHexContent(x, y) {
        var ans = 'none';
        var searchStr = "(" + x + "," + y + ")";
        // test for white pieces
        for (var i = 0; i < this.whitePieceList.length; i++) {
            if (this.whitePieceList[i].includes(searchStr) == true) {
                ans = this.whiteImageList[i];
            }
        }

        // test for black pieces
        for (var i = 0; i < this.blackPieceList.length; i++) {
            if (this.blackPieceList[i].includes(searchStr) == true) {
                ans = this.blackImageList[i];
            }
        }
        return ans;
    }

    getHexOwner(x, y) {
        var ans = 'none';
        var searchStr = "(" + x + "," + y + ")";
        // test for white pieces
        for (var i = 0; i < this.whitePieceList.length; i++) {
            if (this.whitePieceList[i].includes(searchStr) == true) {
                ans = 'w';
            }
        }
        // test for black pieces
        for (var i = 0; i < this.blackPieceList.length; i++) {
            if (this.blackPieceList[i].includes(searchStr) == true) {
                ans = 'b';
            }
        }
        return ans;
    }

    selectHex(x, y, colour) {
        if (board.hexInBoard(x, y)) {
            if (this.selectedCellX == 15) {
                drawHex(getHex_X(x, y),
                    getHex_Y(x, y),
                    rad,
                    x + '' + y,
                    colour,
                    false,
                    this.getHexContent(x, y));

                this.selectedCellX = x;
                this.selectedCellY = y;

            } else {
                drawHex(getHex_X(this.selectedCellX, this.selectedCellY),
                    getHex_Y(this.selectedCellX, this.selectedCellY),
                    rad,
                    this.selectedCellX + '' + this.selectedCellY,
                    'white',
                    true,
                    this.getHexContent(this.selectedCellX, this.selectedCellY));

                this.selectedCellX = x;
                this.selectedCellY = y;

                drawHex(getHex_X(x, y),
                    getHex_Y(x, y),
                    rad,
                    x + '' + y,
                    colour,
                    false,
                    this.getHexContent(x, y));
            }
        }
    }

    getPieceScore(piece) {
        if (piece == 'P') {
            return this.pawnValue;
        }
        if (piece == 'N') {
            return this.knightValue;
        }
        if (piece == 'B') {
            return this.bishopValue;
        }
        if (piece == 'R') {
            return this.rookValue;
        }
        if (piece == 'Q') {
            return this.queenValue;
        }
        if (piece == 'K') {
            return this.kingValue;
        }
        if (piece == 'D') {
            return this.dragonValue;
        }
    }

    movePiece(x, y, piece) {
        //delete old
        drawHex(getHex_X(this.oldX, this.oldY),
            getHex_Y(this.oldX, this.oldY),
            rad,
            this.oldX + '' + this.oldY,
            'white',
            true,
            'none');

        //make new
        drawHex(getHex_X(x, y),
            getHex_Y(x, y),
            rad,
            x + '' + y,
            'white',
            false,
            piece);

        this.updatePieceList(x, y, piece);

        //pawn promotion
        var colour = piece.split("")[0];
        var pieceType = piece.split("")[1]
        //console.log(colour)
        if (pieceType == "P" && this.pawnPromoteTest(colour, x, y) == true) {
            if (colour == 'w') {
                this.promoteWhitePawn(x, y);
            } else {
                this.promoteBlackPawn(x, y);
            }
        }
    }

    removeblackPiece(replaceStr) {
        this.blackPawns = this.blackPawns.replace(replaceStr, "");
        this.blackKnights = this.blackKnights.replace(replaceStr, "");
        this.blackRooks = this.blackRooks.replace(replaceStr, "");
        this.blackBishops = this.blackBishops.replace(replaceStr, "");
        this.blackQueen = this.blackQueen.replace(replaceStr, "");
        this.blackKing = this.blackKing.replace(replaceStr, "");
        this.blackDragon = this.blackDragon.replace(replaceStr, "");
    }

    removewhitePiece(replaceStr) {
        this.whitePawns = this.whitePawns.replace(replaceStr, "");
        this.whiteKnights = this.whiteKnights.replace(replaceStr, "");
        this.whiteRooks = this.whiteRooks.replace(replaceStr, "");
        this.whiteBishops = this.whiteBishops.replace(replaceStr, "");
        this.whiteQueen = this.whiteQueen.replace(replaceStr, "");
        this.whiteKing = this.whiteKing.replace(replaceStr, "");
        this.whiteDragon = this.whiteDragon.replace(replaceStr, "");
    }

    pawnPromoteTest(colour, x, y) {
        var searchStr = "(" + x + "," + y + ")";
        if (colour == "w") {
            var test = whitePawnPromoHexs + whitePawnPromoHexs2;
        } else {
            var test = blackPawnPromoHexs + blackPawnPromoHexs2;
        }
        return test.includes(searchStr);
    }

    promoteWhitePawn(x, y) {
        var replaceStr = "(" + x + "," + y + ")";
        this.whitePawns = this.whitePawns.replace(replaceStr, "");
        this.whiteQueen = this.whiteQueen + ";" + replaceStr;

        drawHex(getHex_X(x, y),
            getHex_Y(x, y),
            rad,
            x + '' + y,
            'white',
            false,
            "wQ");
    }

    promoteBlackPawn(x, y) {
        var replaceStr = "(" + x + "," + y + ")";
        this.blackPawns = this.blackPawns.replace(replaceStr, "");
        this.blackQueen = this.blackQueen + ";" + replaceStr;

        drawHex(getHex_X(x, y),
            getHex_Y(x, y),
            rad,
            x + '' + y,
            'white',
            false,
            "bQ");
    }

    updatePieceList(x, y, piece) {
        var oldStr = "(" + this.oldX + "," + this.oldY + ")";
        var replaceStr = "(" + x + "," + y + ")";

        //update whitepieces
        if (piece == 'wP') {
            this.whitePawns = this.whitePawns.replace(oldStr, replaceStr);
            this.removeblackPiece(replaceStr);
        }
        if (piece == 'wN') {
            this.whiteKnights = this.whiteKnights.replace(oldStr, replaceStr);
            this.removeblackPiece(replaceStr);
        }
        if (piece == 'wR') {
            this.whiteRooks = this.whiteRooks.replace(oldStr, replaceStr);
            this.removeblackPiece(replaceStr);
        }
        if (piece == 'wB') {
            this.whiteBishops = this.whiteBishops.replace(oldStr, replaceStr);
            this.removeblackPiece(replaceStr);
        }
        if (piece == 'wQ') {
            this.whiteQueen = this.whiteQueen.replace(oldStr, replaceStr);
            this.removeblackPiece(replaceStr);
        }
        if (piece == 'wK') {
            this.whiteKing = this.whiteKing.replace(oldStr, replaceStr);
            this.removeblackPiece(replaceStr);
        }
        if (piece == 'wD') {
            this.whiteDragon = this.whiteDragon.replace(oldStr, replaceStr);
            this.removeblackPiece(replaceStr);
        }
        //update blackpieces
        if (piece == 'bP') {
            this.blackPawns = this.blackPawns.replace(oldStr, replaceStr);
            this.removewhitePiece(replaceStr);
        }
        if (piece == 'bN') {
            this.blackKnights = this.blackKnights.replace(oldStr, replaceStr);
            this.removewhitePiece(replaceStr);
        }
        if (piece == 'bR') {
            this.blackRooks = this.blackRooks.replace(oldStr, replaceStr);
            this.removewhitePiece(replaceStr);
        }
        if (piece == 'bB') {
            this.blackBishops = this.blackBishops.replace(oldStr, replaceStr);
            this.removewhitePiece(replaceStr);
        }
        if (piece == 'bQ') {
            this.blackQueen = this.blackQueen.replace(oldStr, replaceStr);
            this.removewhitePiece(replaceStr);
        }
        if (piece == 'bK') {
            this.blackKing = this.blackKing.replace(oldStr, replaceStr);
            this.removewhitePiece(replaceStr);
        }
        if (piece == 'bD') {
            this.blackDragon = this.blackDragon.replace(oldStr, replaceStr);
            this.removewhitePiece(replaceStr);
        }
    }

    availableForSelection(x, y, colour) {
        // check on board
        if (board.hexInBoard(x, y) == false) {
            return false;
        } else {
            var searchStr = "(" + x + "," + y + ")";
            if (colour == 'w') {
                var allAvailable = this.whitePawns + this.whiteKnights + this.whiteRooks + this.whiteBishops + this.whiteQueen + this.whiteKing + this.whiteDragon;
                return allAvailable.includes(searchStr);
            }
            if (colour == 'b') {
                var allAvailable = this.blackPawns + this.blackKnights + this.blackRooks + this.blackBishops + this.blackQueen + this.blackKing + this.blackDragon;
                return allAvailable.includes(searchStr);
            }
        }
    }


    availableForMove(x, y) {
        // check on board
        if (board.hexInBoard(x, y) == false) {
            return false;
        }
        if (this.colourSelected == 'w') {
            var currentHex = "(" + this.oldX + "," + this.oldY + ")";
            var allUnavailable = this.whitePawns + this.whiteKnights + this.whiteRooks + this.whiteBishops + this.whiteQueen + this.whiteKing + this.whiteDragon + offBoard + currentHex;
            var searchStr = "(" + x + "," + y + ")";
            if (allUnavailable.includes(searchStr) == true) {
                return false;
            } else {
                return true;
            }
        } else {
            var currentHex = "(" + this.oldX + "," + this.oldY + ")";
            var allUnavailable = this.blackPawns + this.blackKnights + this.blackRooks + this.blackBishops + this.blackQueen + this.blackKing + this.blackDragon + offBoard + currentHex;
            var searchStr = "(" + x + "," + y + ")";
            if (allUnavailable.includes(searchStr) == true) {
                return false;
            } else {
                return true;
            }
        }
    }

    setPieceSelected(x, y) {
        this.pieceSelected = this.getHexContent(x, y);
        if (this.pieceSelected == 'none') {
            this.colourSelected = 'none';
            this.pieceTypeSelected = 'none';
            return;
        }
        var splitStr = this.pieceSelected.split("")
        this.colourSelected = splitStr[0];
        this.pieceTypeSelected = splitStr[1];
    }

    changeSideToMove() {
        if (this.sideToMove == 'w') {
            this.sideToMove = 'b';
        } else {
            this.sideToMove = 'w';
        }
        this.turnNumber += 1;
        this.updateGameState();
    }

    //pieceMove rules

    pawnMoves(x, y) {
        if (this.sideToMove == 'w') {
            //even x
            if (y % 2 == 0) {
                //console.log([[x-1,y-1],[x,y-2],[x,y-1]]);
                return [[x - 1, y - 1], [x, y - 2], [x, y - 4], [x, y - 1]];
            }
            //odd x
            else {
                return [[x, y - 1], [x, y - 2], [x, y - 4], [x + 1, y - 1]];
            }
        } else {
            //even x
            if (y % 2 == 0) {
                return [[x - 1, y + 1], [x, y + 2], [x, y + 1], [x, y + 4]];
            }
            //odd x
            else {
                return [[x, y + 1], [x, y + 2], [x + 1, y + 1], [x, y + 4]];
            }
        }
    }

    knightMoves(x, y) {
        //even y
        if (y % 2 == 0) {
            return [[x - 1, y - 5], [x - 1, y - 4], [x - 2, y - 1], [x - 2, y + 1], [x - 1, y + 4], [x - 1, y + 5], [x, y - 5], [x + 1, y - 4], [x + 1, y - 1], [x + 1, y + 1], [x + 1, y + 4], [x, y + 5]];
        }
        //odd y
        else {
            return [[x, y - 5], [x - 1, y - 4], [x - 1, y - 1], [x - 1, y + 1], [x - 1, y + 4], [x, y + 5], [x + 1, y - 5], [x + 1, y - 4], [x + 2, y - 1], [x + 2, y + 1], [x + 1, y + 4], [x + 1, y + 5]];
        }
    }

    bishopMoves(x, y) {
        //even y
        if (y % 2 == 0) {
            return [[x - 1, y - 3], [x - 1, y], [x - 1, y + 3], [x, y - 3], [x + 1, y], [x, y + 3], [x - 1, y - 6], [x + 1, y - 6], [x - 2, y], [x + 2, y], [x - 1, y + 6], [x + 1, y + 6]];
        }
        //odd y
        else {
            return [[x, y - 3], [x - 1, y], [x, y + 3], [x + 1, y - 3], [x + 1, y], [x + 1, y + 3], [x - 1, y - 6], [x + 1, y - 6], [x + 2, y], [x - 2, y], [x - 1, y + 6], [x + 1, y + 6]];
        }
    }

    rookMoves(x, y) {
        //even y
        if (y % 2 == 0) {
            return [[x - 1, y - 1], [x - 1, y + 1], [x, y - 2], [x, y + 2], [x, y - 1], [x, y + 1], [x - 1, y - 2], [x - 2, y - 3], [x - 1, y + 2], [x - 2, y + 3], [x, y - 4], [x, y - 6], [x, y + 4], [x, y + 6], [x + 1, y - 2], [x + 1, y - 3], [x + 1, y + 2], [x + 1, y + 3]];
        }
        //odd y
        else {
            return [[x, y - 1], [x, y + 1], [x, y - 2], [x, y + 2], [x + 1, y - 1], [x + 1, y + 1], [x - 1, y - 2], [x - 1, y - 3], [x - 1, y + 2], [x - 1, y + 3], [x, y - 4], [x, y - 6], [x, y + 4], [x, y + 6], [x + 1, y - 2], [x + 2, y - 3], [x + 1, y + 2], [x + 2, y + 3]];
        }
    }

    queenMoves(x, y) {
        //even y
        if (y % 2 == 0) {
            return [[x - 1, y - 1], [x - 1, y + 1], [x, y - 2], [x, y + 2], [x, y - 1], [x, y + 1], [x - 1, y - 2], [x - 2, y - 3], [x - 1, y + 2], [x - 2, y + 3], [x, y - 4], [x, y - 6], [x, y + 4], [x, y + 6], [x + 1, y - 2], [x + 1, y - 3], [x + 1, y + 2], [x + 1, y + 3], [x - 1, y - 3], [x - 1, y], [x - 1, y + 3], [x, y - 3], [x + 1, y], [x, y + 3], [x - 1, y - 6], [x + 1, y - 6], [x - 2, y], [x + 2, y], [x - 1, y + 6], [x + 1, y + 6], [x, y - 8], [x, y + 8], [x + 2, y - 4], [x + 2, y + 4], [x - 2, y - 4], [x - 2, y + 4]];
        }
        //odd y
        else {
            return [[x, y - 1], [x, y + 1], [x, y - 2], [x, y + 2], [x + 1, y - 1], [x + 1, y + 1], [x - 1, y - 2], [x - 1, y - 3], [x - 1, y + 2], [x - 1, y + 3], [x, y - 4], [x, y - 6], [x, y + 4], [x, y + 6], [x + 1, y - 2], [x + 2, y - 3], [x + 1, y + 2], [x + 2, y + 3], [x, y - 3], [x - 1, y], [x, y + 3], [x + 1, y - 3], [x + 1, y], [x + 1, y + 3], [x - 1, y - 6], [x + 1, y - 6], [x + 2, y], [x - 2, y], [x - 1, y + 6], [x + 1, y + 6], [x, y - 8], [x, y + 8], [x + 2, y - 4], [x + 2, y + 4], [x - 2, y - 4], [x - 2, y + 4]];
        }
    }

    kingMoves(x, y) {
        //even y
        if (y % 2 == 0) {
            return [[x - 1, y - 1], [x, y - 1], [x, y - 2], [x - 1, y + 1], [x, y + 2], [x, y + 1]];
        }
        //odd y
        else {
            return [[x, y - 1], [x, y + 1], [x, y + 2], [x + 1, y + 1], [x + 1, y - 1], [x, y - 2]];
        }
    }

    dragonMoves(x, y) {
        //even y
        if (y % 2 == 0) {
            return [[x - 1, y - 1], [x - 1, y + 1], [x, y - 2], [x, y + 2], [x, y - 1], [x, y + 1], [x - 1, y - 2], [x - 2, y - 3], [x - 1, y - 4], [x - 1, y - 5], [x - 1, y + 2], [x - 2, y + 3], [x, y - 4], [x, y - 6], [x, y + 4], [x, y + 6], [x + 1, y - 2], [x + 1, y - 3], [x + 1, y + 2], [x + 1, y + 3], [x - 1, y - 3], [x - 1, y], [x - 1, y + 3], [x, y - 3], [x + 1, y], [x, y + 3], [x - 1, y - 6], [x + 1, y - 6], [x - 2, y], [x + 2, y], [x - 1, y + 6], [x + 1, y + 6], [x, y - 8], [x, y + 8], [x + 2, y - 4], [x + 2, y + 4], [x - 2, y - 4], [x - 2, y + 4], [x - 2, y - 1], [x - 2, y + 1], [x, y - 5], [x, y + 5], [x + 1, y - 4], [x + 1, y + 4], [x - 1, y + 4], [x - 1, y + 5], [x + 1, y - 1], [x + 1, y + 1]];
        }
        //odd y
        else {
            return [[x, y - 1], [x, y + 1], [x, y - 2], [x, y + 2], [x + 1, y - 1], [x + 1, y + 1], [x - 1, y - 2], [x - 1, y - 3], [x - 1, y + 2], [x - 1, y + 3], [x, y - 4], [x, y - 6], [x, y + 4], [x, y + 6], [x + 1, y - 2], [x + 2, y - 3], [x + 1, y + 2], [x + 2, y + 3], [x, y - 3], [x - 1, y], [x, y + 3], [x + 1, y - 3], [x + 1, y], [x + 1, y + 3], [x - 1, y - 6], [x + 1, y - 6], [x + 2, y], [x - 2, y], [x - 1, y + 6], [x + 1, y + 6], [x, y - 8], [x, y + 8], [x + 2, y - 4], [x + 2, y + 4], [x - 2, y - 4], [x - 2, y + 4], [x - 1, y - 4], [x, y - 5], [x + 1, y - 4], [x + 1, y - 5], [x + 2, y - 1], [x + 2, y + 1], [x + 1, y + 4], [x + 1, y + 5], [x, y + 4], [x - 1, y + 4], [x - 1, y + 1], [x - 1, y - 1], [x, y + 5]];
        }

    }


    showHexsAvailabletoMove(x, y, piece) {
        var hexsToActivate = [];
        var testPiece = piece.split("")[1];
        if (testPiece == 'P') {
            hexsToActivate = this.pawnMoves(x, y);
        }
        if (testPiece == 'N') {
            hexsToActivate = this.knightMoves(x, y);
        }
        if (testPiece == 'R') {
            hexsToActivate = this.rookMoves(x, y);
        }
        if (testPiece == 'B') {
            hexsToActivate = this.bishopMoves(x, y);
        }
        if (testPiece == 'Q') {
            hexsToActivate = this.queenMoves(x, y);
        }
        if (testPiece == 'K') {
            hexsToActivate = this.kingMoves(x, y);
        }
        if (testPiece == 'D') {
            hexsToActivate = this.dragonMoves(x, y);
        }
        for (var i = 0; i < hexsToActivate.length; i++) {
            var testX = hexsToActivate[i][0];
            var testY = hexsToActivate[i][1];
            //get near piece to fill near hex
            var nearPiece = this.getHexContent(testX, testY);
            //test if hex open and not blocked by intermediate piece
            if (this.availableForMove(testX, testY) && this.jumpNeeded(x, y, testX, testY, piece) == false) {
                drawHex(
                    getHex_X(testX, testY),
                    getHex_Y(testX, testY),
                    rad,
                    testX + '' + testY,
                    "yellow",
                    false,
                    nearPiece
                );
                var pushStr = "(" + testX + "," + testY + ")";
                this.availableMovesForCurrentPiece = this.availableMovesForCurrentPiece + pushStr;
            }
        }
        return;
    }

    getAvailableMoves(x, y, testPiece, colour) {
        var hexsToActivate = [];
        var availableMoves = [];
        var unSplitPiece = colour + testPiece;
        if (testPiece == 'P') {
            hexsToActivate = this.pawnMoves(x, y);
        }
        if (testPiece == 'N') {
            hexsToActivate = this.knightMoves(x, y);
        }
        if (testPiece == 'R') {
            hexsToActivate = this.rookMoves(x, y);
        }
        if (testPiece == 'B') {
            hexsToActivate = this.bishopMoves(x, y);
        }
        if (testPiece == 'Q') {
            hexsToActivate = this.queenMoves(x, y);
        }
        if (testPiece == 'K') {
            hexsToActivate = this.kingMoves(x, y);
        }
        if (testPiece == 'D') {
            hexsToActivate = this.dragonMoves(x, y);
        }
        for (var i = 0; i < hexsToActivate.length; i++) {
            var testX = hexsToActivate[i][0];
            var testY = hexsToActivate[i][1];

            //get near piece to fill near hex
            var nearPiece = this.getHexContent(testX, testY);

            //test if hex open and not blocked by intermediate piece
            if (this.availableForMove(testX, testY) && this.jumpNeeded(x, y, testX, testY, unSplitPiece) == false) {
                var move = [testX, testY];
                availableMoves.push(move);
            }
        }
        return availableMoves;
    }

    getIntermediateHexs(x1, y1, x2, y2) {
        var listOfHexs = "";
        var diffX = Math.abs(x1 - x2);
        var diffY = Math.abs(y1 - y2);
        //bishop sideways move
        if (y1 == y2) {
            if (x2 > x1) {
                var intHex = "(" + (x1 + 1) + "," + (y1) + ");";
            } else {
                var intHex = "(" + (x1 - 1) + "," + (y1) + ");";
            }
            listOfHexs = listOfHexs + intHex;
            return listOfHexs;
        }
        //castle moves
        if (x1 == x2) {
            if (diffY == 3) {
                //bishop diag - 1 step
                return listOfHexs;
            }
            //get number of intermediate hexs
            diffY = (diffY / 2);
            if (y2 < y1) {
                for (var i = 1; i < diffY; i++) {
                    var intHex = "(" + x1 + "," + (y1 - (2 * i)) + ");";
                    listOfHexs = listOfHexs + intHex;
                }
            }
            if (y2 > y1) {
                for (var i = 1; i < diffY; i++) {
                    var intHex = "(" + x1 + "," + (y1 + (2 * i)) + ");";
                    listOfHexs = listOfHexs + intHex;
                }
            }
        } else {
            //TODO - Something not right with bishop moves - incorrectly getting blocked pieces
            if (x2 > x1) { //moves to the right
                //fix for diagonal moves 
                if (y2 < y1) {
                    if (y1 % 2 == 0) { //even
                        if (diffX == 1 && diffY == 3) {
                            var intHex = "(" + (x1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 - 2) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2;
                            return listOfHexs;
                        }
                        if (diffX == 2 && diffY == 4) {
                            var intHex = "(" + (x1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 - 2) + ");";
                            var intHex3 = "(" + (x1 + 1) + "," + (y1 - 3) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2 + intHex3;
                            return listOfHexs;
                        }
                    } else { //odd
                        if (diffX == 2 && diffY == 3) {
                            var intHex = "(" + (x1 + 1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 - 2) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2;
                            return listOfHexs;
                        }
                        if (diffX == 2 && diffY == 4) {
                            var intHex = "(" + (x1 + 1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 - 2) + ");";
                            var intHex3 = "(" + (x1 + 2) + "," + (y1 - 3) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2 + intHex3;
                            return listOfHexs;
                        }
                    }
                } else {
                    if (y1 % 2 == 0) {
                        if (diffX == 1 && diffY == 3) {
                            var intHex = "(" + (x1) + "," + (y1 + 1) + ");";
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 + 2) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2;
                            return listOfHexs;
                        }
                        if (diffX == 2 && diffY == 4) {
                            var intHex = "(" + (x1) + "," + (y1 + 1) + ");";
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 + 2) + ");";
                            var intHex3 = "(" + (x1 + 1) + "," + (y1 + 3) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2 + intHex3;
                            return listOfHexs;
                        }
                    }
                }
                if (diffY % 3 == 0 && diffY > 3) {
                    //bishop diag - 1 step
                    if (y2 < y1) {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1) + "," + (y1 - 3) + ");";
                        } else {
                            var intHex = "(" + (x1 + 1) + "," + (y1 - 3) + ");";
                        }
                        listOfHexs = listOfHexs + intHex;
                        return listOfHexs;
                    } else {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1) + "," + (y1 + 3) + ");";
                        } else {
                            var intHex = "(" + (x1 + 1) + "," + (y1 + 3) + ");";
                        }
                        listOfHexs = listOfHexs + intHex;
                        return listOfHexs;
                    }
                }
                if (diffX < 2 && diffY == 3) {
                    //bishop diag - 1 step
                    if (y2 < y1) {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1) + "," + (y1 - 3) + ");";
                        } else {
                            var intHex = "(" + (x1 + 1) + "," + (y1 - 3) + ");";
                        }
                        listOfHexs = listOfHexs + intHex;
                        return listOfHexs;
                    } else {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1) + "," + (y1 + 3) + ");";
                        } else {
                            var intHex = "(" + (x1 + 1) + "," + (y1 + 3) + ");";
                        }
                        listOfHexs = listOfHexs + intHex;
                        return listOfHexs;
                    }
                } else {
                    //castle diag - move right
                    //move up + right
                    if (y2 < y1) {
                        //start from left side hex
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1) + "," + (y1 - 1) + ");";
                            //console.log("test even up")
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 - 2) + ");";
                            var intHex3 = "(" + (x1 + 1) + "," + (y1 - 3) + ");";
                            //start from right side hex
                        } else {
                            var intHex = "(" + (x1 + 1) + "," + (y1 - 1) + ");";
                            //console.log("test odd up")
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 - 2) + ");";
                            var intHex3 = "(" + (x1 + 2) + "," + (y1 - 3) + ");";
                        }
                        //move down and right  
                    } else {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1) + "," + (y1 + 1) + ");";
                            //console.log("test even down")
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 + 2) + ");";
                            var intHex3 = "(" + (x1 + 1) + "," + (y1 + 3) + ");";
                        } else {
                            var intHex = "(" + (x1 + 1) + "," + (y1 + 1) + ");";
                            //console.log("test odd down")
                            var intHex2 = "(" + (x1 + 1) + "," + (y1 + 2) + ");";
                            var intHex3 = "(" + (x1 + 2) + "," + (y1 + 3) + ");";
                        }
                    }
                    if (diffY - 1 == 1) {
                        listOfHexs = listOfHexs + intHex;
                    }
                    if (diffY - 1 == 2) {
                        listOfHexs = listOfHexs + intHex + intHex2;
                    }
                    if (diffY - 1 == 3) {
                        listOfHexs = listOfHexs + intHex + intHex2 + intHex3;
                    }
                    return listOfHexs;
                }
            } else { //moves to the left
                //fix for diagonal moves 
                if (y2 < y1) {
                    if (y1 % 2 == 0) { //Even
                        if (diffX == 2 && diffY == 3) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 - 2) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2;
                            return listOfHexs;
                        }
                        if (diffX == 2 && diffY == 4) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 - 2) + ");";
                            var intHex3 = "(" + (x1 - 2) + "," + (y1 - 3) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2 + intHex3;
                            return listOfHexs;
                        }
                    } else { //odd
                        if (diffX == 1 && diffY == 3) {
                            var intHex = "(" + (x1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 - 2) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2;
                            return listOfHexs;
                        }
                        if (diffX == 2 && diffY == 4) {
                            var intHex = "(" + (x1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 - 2) + ");";
                            var intHex3 = "(" + (x1 - 1) + "," + (y1 - 3) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2 + intHex3;
                            return listOfHexs;
                        }
                    }
                } else {
                    if (y1 % 2 == 0) {
                        if (diffX == 2 && diffY == 4) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 + 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 + 2) + ");";
                            var intHex3 = "(" + (x1 - 2) + "," + (y1 + 3) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2 + intHex3;
                            return listOfHexs;
                        }
                    }
                }

                if (diffY % 3 == 0 && diffY > 3) {
                    //bishop diag - 1 step
                    if (y2 < y1) {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 - 3) + ");";
                        } else {
                            var intHex = "(" + (x1) + "," + (y1 - 3) + ");";
                        }
                        listOfHexs = listOfHexs + intHex;
                        return listOfHexs;
                    } else {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 + 3) + ");";
                        } else {
                            var intHex = "(" + (x1) + "," + (y1 + 3) + ");";
                        }
                        listOfHexs = listOfHexs + intHex;
                        return listOfHexs;
                    }
                }

                if (diffX < 2 && diffY == 3) {
                    //bishop diag - 1 step
                    if (y2 < y1) {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 - 3) + ");";
                        } else {
                            var intHex = "(" + (x1) + "," + (y1 - 3) + ");";
                        }
                        listOfHexs = listOfHexs + intHex;
                        return listOfHexs;
                    } else {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 + 3) + ");";
                        } else {
                            var intHex = "(" + (x1) + "," + (y1 + 3) + ");";
                        }
                        listOfHexs = listOfHexs + intHex;
                        return listOfHexs;
                    }

                } else {
                    //castle diag
                    //moving up and left
                    if (y2 < y1) {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 - 2) + ");";
                            var intHex3 = "(" + (x1 - 2) + "," + (y1 - 3) + ");";
                        } else {
                            var intHex = "(" + (x1) + "," + (y1 - 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 - 2) + ");";
                            var intHex3 = "(" + (x1 - 1) + "," + (y1 - 3) + ");";
                        }
                    } else {
                        if (y1 % 2 == 0) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 + 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 + 2) + ");";
                            var intHex3 = "(" + (x1 - 2) + "," + (y1 + 3) + ");";
                        } else {
                            var intHex = "(" + (x1) + "," + (y1 + 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 + 2) + ");";
                            var intHex3 = "(" + (x1 - 1) + "," + (y1 + 3) + ");";
                        }
                    }
                    if (diffY - 1 == 1) {
                        listOfHexs = listOfHexs + intHex;
                    }
                    if (diffY - 1 == 2) {
                        listOfHexs = listOfHexs + intHex + intHex2;
                    }
                    if (diffY - 1 == 3) {
                        listOfHexs = listOfHexs + intHex + intHex2 + intHex3;
                    }
                    //console.log("diifY: " + diffY);
                    return listOfHexs;
                }
            }
        }
        return listOfHexs;
    }



    getPointTotal(colour) {
        var totalPoints = 0;

        for (var i = 0; i < this.pieceSymbolList.length; i++) {

            var piece = this.pieceSymbolList[i];


            if (colour == 'b') {

                if (piece == 'P') {
                    var piecesList = this.blackPawns.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'R') {
                    var piecesList = this.blackRooks.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'N') {
                    var piecesList = this.blackKnights.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'B') {
                    var piecesList = this.blackBishops.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'Q') {
                    var piecesList = this.blackQueen.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'K') {
                    var piecesList = this.blackKing.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'D') {
                    var piecesList = this.blackDragon.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
            }
            if (colour == 'w') {

                if (piece == 'P') {
                    var piecesList = this.whitePawns.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'R') {
                    var piecesList = this.whiteRooks.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'N') {
                    var piecesList = this.whiteKnights.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'B') {
                    var piecesList = this.whiteBishops.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'Q') {
                    var piecesList = this.whiteQueen.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'K') {
                    var piecesList = this.whiteKing.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
                if (piece == 'D') {
                    var piecesList = this.whiteDragon.split(",");
                    totalPoints = totalPoints + ((piecesList.length - 1) * this.getPieceScore(piece));
                }
            }

        }

        return totalPoints;
    }

    jumpNeeded(x1, y1, x2, y2, piece) {
        var testPiece = piece.split("")[1];
        var colour = this.getHexOwner(x1, y1);
        if (testPiece == "P") {
            //add rule to prevent forward capturing moves
            if (colour == 'w' && this.getHexContent(x1, y1 - 2) != 'none' && Math.abs(y2 - y1) > 1) {
                return true;
            }
            if (colour == 'b' && this.getHexContent(x1, y1 + 2) != 'none' && Math.abs(y2 - y1) > 1) {
                return true;
            }
        }
        //if knight ignore jumps and return false
        if (testPiece == "N") {
            return false;
        } else {
            var intermediates = this.getIntermediateHexs(x1, y1, x2, y2).split(";");

            if (intermediates == "") {
                //console.log("No intermediates: " + x2 + "," + y2)
                return false;
            }
            //dragon not included - pieces can move under dragon
            var occupied = this.whitePawns + this.whiteKnights + this.whiteRooks + this.whiteBishops + this.whiteQueen + this.whiteKing + this.blackPawns + this.blackKnights + this.blackRooks + this.blackBishops + this.blackQueen + this.blackKing + offBoard;

            for (var i = 0; i < intermediates.length; i++) {
                if (occupied.includes(intermediates[i]) && intermediates[i] != "") {
                    return true;
                }
            }
        }
        return false;
    }

    availableCurrentPieceMove(x, y) {
        var searchStr = "(" + x + "," + y + ")";
        if (this.availableMovesForCurrentPiece.includes(searchStr) == true) {
            return true;
        } else {
            return false;
        }
    }

    resetAvailableMoves() {
        this.availableMovesForCurrentPiece = "";
        return;
    }

    updateGameState() {
        //record all positions turn-by-turn
        var newTurn = [this.turnNumber, this.sideToMove, this.whitePawns, this.whiteKnights, this.whiteRooks, this.whiteBishops, this.whiteQueen, this.whiteKing, this.whiteDragon, this.blackPawns, this.blackKnights, this.blackRooks, this.blackBishops, this.blackQueen, this.blackKing, this.blackDragon];
        this.gameRecord.push(newTurn);
    }

    redrawBoard() {
        var lastRecord = this.gameRecord[this.turnNumber - 1];
        console.log(lastRecord);
        game.whitePawns = lastRecord[2];
        game.whiteKnights = lastRecord[3];
        game.whiteRooks = lastRecord[4];
        game.whiteBishops = lastRecord[5];
        game.whiteQueen = lastRecord[6];
        game.whiteKing = lastRecord[7];
        game.whiteDragon = lastRecord[8];
        game.blackPawns = lastRecord[9];
        game.blackKnights = lastRecord[10];
        game.blackRooks = lastRecord[11];
        game.blackBishops = lastRecord[12];
        game.blackQueen = lastRecord[13];
        game.blackKing = lastRecord[14];
        game.blackDragon = lastRecord[15];
        this.turnNumber = lastRecord[0];
        this.sideToMove = lastRecord[1];
        this.turnComplete = false;
        this.pieceToMoveHexSelected = false;
        this.hexToMoveToSelected = false;
        this.selectedCellX = 15;
        this.selectedCellY = 40;
        this.selectedCelltoMovetoX = 15;
        this.selectedCelltoMovetoY = 40;
        this.oldX = 15;
        this.oldY = 40;
        this.pieceSelected = 'none';
        this.colourSelected = 'none';
        this.pieceTypeSelected = 'none';
        this.readyToMove = false;
        this.availableMovesForCurrentPiece = "";
        board.drawBoard();
        this.setPieces();
        console.log("undo move pushed")
        return;
    }

    isGameWon() {
        //TODO     
        if (this.blackKing.length < 2) {
            this.gameOver = true;
            this.winner = "White";
            return true;
        }
        if (this.whiteKing.length < 2) {
            this.gameOver = true;
            this.winner = "Black";
            return true;
        }
        return false;
    }

    //Basic AI///



    convertStringLoc(strLocation) {
        var x = "";
        var y = "";
        var ans = strLocation.split(",");
        x = ans[0].replace("(", "");
        x = ans[1].replace(")", "");
        return [x, y];
    }


    getHexXYZ(x, y) {
        if (x == 0) {
            return hex_0[y];
        }
        if (x == 1) {
            return hex_1[y];
        }
        if (x == 2) {
            return hex_2[y];
        }
        if (x == 3) {
            return hex_3[y];
        }
        if (x == 4) {
            return hex_4[y];
        }
        if (x == 5) {
            return hex_5[y];
        }
        if (x == 6) {
            return hex_6[y];
        }
        if (x == 7) {
            return hex_7[y];
        }
        if (x == 8) {
            return hex_8[y];
        }
        if (x == 9) {
            return hex_9[y];
        }
        if (x == 10) {
            return hex_10[y];
        }
        if (x == 11) {
            return hex_11[y];
        }
    }


    strToCordinates(strPos) {
        strPos = strPos.split(',');
        if (strPos[0].length > 1) {

            var x = Number(strPos[0].replace("(", ""));
            var y = Number(strPos[1].replace(")", ""));
        }
        return [x, y]
    }


    distanceBetweenTwoHexs(x1, y1, x2, y2) {
        var XYZ1 = this.getHexXYZ(x1, y1);
        var XYZ2 = this.getHexXYZ(x2, y2)
        var distance = Math.max(XYZ2[0] - XYZ1[0], XYZ2[1] - XYZ1[1], XYZ2[2] - XYZ1[2]);
        return distance;
    }

    isMoveDangerous(posList, colour) {
        //TODO - get all positions available for move by opposition next turn
        if (colour == 'w') {
            var testColour = 'b';
            var oppositionMoves = this.allMovesAvailable_black;
        }
        if (colour == 'b') {
            var testColour = 'w';
            var oppositionMoves = this.allMovesAvailable_white;
        }

        for (var i = 0; i < posList.length; i++) {
            for (var j = 0; j < oppositionMoves.length; j++) {
                var test1 = posList[i][2];
                var test2 = oppositionMoves[j][2];

                //console.log(test1);
                //console.log(test2);

                if (test1[0] == test2[0] && test1[1] == test2[1]) {

                    if (this.turnNumber < param_early) {
                        if (colour = 'w') {
                            posList[i][3] = posList[i][3] - (param_avoidDanger_1 * this.getPieceScore(posList[i][0])) + (param_avoidDanger_1_time * game.turnNumber) + (param_avoidDanger_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                        } else {
                            posList[i][3] = posList[i][3] - (param_avoidDanger_1_b * this.getPieceScore(posList[i][0])) + (param_avoidDanger_1_time_b * game.turnNumber) + (param_avoidDanger_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                        }

                    }

                    if (this.turnNumber > param_early && this.turnNumber < param_late) {
                        if (colour = 'w') {
                            posList[i][3] = posList[i][3] - (param_avoidDanger_2 * this.getPieceScore(posList[i][0])) + (param_avoidDanger_2_time * game.turnNumber) + (param_avoidDanger_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                        } else {
                            posList[i][3] = posList[i][3] - (param_avoidDanger_2_b * this.getPieceScore(posList[i][0])) + (param_avoidDanger_2_time_b * game.turnNumber) + (param_avoidDanger_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                        }

                    } else {
                        if (colour = 'w') {
                            posList[i][3] = posList[i][3] - (param_avoidDanger_3 * this.getPieceScore(posList[i][0])) + (param_avoidDanger_3_time * game.turnNumber) + (param_avoidDanger_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                        } else {
                            posList[i][3] = posList[i][3] - (param_avoidDanger_3_b * this.getPieceScore(posList[i][0])) + (param_avoidDanger_3_time_b * game.turnNumber) + (param_avoidDanger_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                        }

                    }
                }
            }
        }

        return posList;
    }


    pieceVulnerability(x, y, colour, piece) {
        if(colour = 'b'){
          var sidesMoves = this.allMovesAvailable_black;  
        }
        else{
           var sidesMoves = this.allMovesAvailable_white;  
        }
        
        
        for (var j = 0; j < sidesMoves.length; j++) {
                var test = sidesMoves[j][2];
            if (test[0] == x && test[1] == y) {
                return 1;
            }
        }
        return 2*(this.getPieceScore(piece));
    }

    getMovesAndScore(piece, colour) {
        var initialScore = 0;
        var currentPosition = "";
        var possiblePositions = "";
        var possiblePositionsIfColourDif = "";
        var x = 0;
        var y = 0;
        var AllMoves = [];
        var otherColour = "";

        if (colour == 'b') {
            var promoHexs = ["(4,38)", "(5,38)", "(6,38)", "(7,38)", "(8,38)", "(0,23)", "(1,29)", "(2,23)", "(2,35)", "(9,35)", "(10,32)", "(10,29)", "(11,26)", "(11,23)"];
            otherColour = 'w';

            if (piece == 'P') {
                var piecesList = this.blackPawns.split(";");
            }
            if (piece == 'R') {
                var piecesList = this.blackRooks.split(";");
            }
            if (piece == 'N') {
                var piecesList = this.blackKnights.split(";");
            }
            if (piece == 'B') {
                var piecesList = this.blackBishops.split(";");
            }
            if (piece == 'Q') {
                var piecesList = this.blackQueen.split(";");
            }
            if (piece == 'K') {
                var piecesList = this.blackKing.split(";");
            }
            if (piece == 'D') {
                var piecesList = this.blackDragon.split(";");
            }
        }
        if (colour == 'w') {
            var promoHexs = ["(4,38)", "(5,38)", "(6,38)", "(7,38)", "(8,38)", "(2,5)", "(1,11)", "(0,17)", "(9,5)", "(10,8)", "(10,11)", "(11,14)", "(11,17)"];
            otherColour = 'b';

            if (piece == 'P') {
                var piecesList = this.whitePawns.split(";");
            }
            if (piece == 'R') {
                var piecesList = this.whiteRooks.split(";");
            }
            if (piece == 'N') {
                var piecesList = this.whiteKnights.split(";");
            }
            if (piece == 'B') {
                var piecesList = this.whiteBishops.split(";");
            }
            if (piece == 'Q') {
                var piecesList = this.whiteQueen.split(";");
            }
            if (piece == 'K') {
                var piecesList = this.whiteKing.split(";");
            }
            if (piece == 'D') {
                var piecesList = this.whiteDragon.split(";");
            }
        }

        if (piecesList.length < 1) {
            console.log('No pieces error!');
            return [];
        }
        //console.log(piece);
        //console.log("param_early", param_early);
        for (var i = 0; i < piecesList.length; i++) {
            currentPosition = piecesList[i].split(",")

            if (currentPosition[0].length > 1) {
                x = Number(currentPosition[0].replace("(", ""));
                y = Number(currentPosition[1].replace(")", ""));
                possiblePositions = this.getAvailableMoves(x, y, piece, colour);
                possiblePositionsIfColourDif = this.getAvailableMoves(x, y, piece, otherColour);

                //console.log('test');

                for (var j = 0; j < possiblePositions.length; j++) {
                    var score = initialScore;
                    var hexContent = this.getHexContent(possiblePositions[j][0], possiblePositions[j][1]);
                    var hexContent2 = this.getHexContent(possiblePositionsIfColourDif[j][0], possiblePositionsIfColourDif[j][1]);

                    //capture if possible
                    if (this.turnNumber < param_early) {
                        if (hexContent != 'none') {
                            if (colour == 'w') {
                                score = score + (param_capture_1 * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'b', piece))) + (param_capture_1_time * game.turnNumber) + (param_capture_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_capture_1_b * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'w', piece))) + (param_capture_1_time_b * game.turnNumber) + (param_capture_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                    }

                    if (this.turnNumber > param_early && this.turnNumber < param_late) {
                        if (hexContent != 'none') {
                            if (colour == 'w') {
                                score = score + (param_capture_2 * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'b', piece))) + (param_capture_2_time * game.turnNumber) + (param_capture_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_capture_2_b * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'w', piece))) + (param_capture_2_time_b * game.turnNumber) + (param_capture_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }


                    } else {
                        if (hexContent != 'none') {
                            if (colour == 'w') {
                                score = score + (param_capture_3 * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'b', piece))) + (param_capture_3_time * game.turnNumber) + (param_capture_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_capture_3_b * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'w', piece))) + (param_capture_3_time_b * game.turnNumber) + (param_capture_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                    }


                    //defend own pieces if possible
                    if (this.turnNumber < param_early) {
                        if (hexContent2 != 'none') {
                            if (colour == "w") {
                                score = score + (param_defend_1 * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'w', (this.getPieceScore(hexContent2.split("")[1]))))) + (param_defend_1_time * game.turnNumber) + (param_defend_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_defend_1_b * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'b', (this.getPieceScore(hexContent2.split("")[1]))))) + (param_defend_1_time_b * game.turnNumber) + (param_defend_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                    }

                    if (this.turnNumber > param_early && this.turnNumber < param_late) {
                        if (hexContent2 != 'none') {
                            if (colour == "w") {
                                score = score + (param_defend_2 * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'w', (this.getPieceScore(hexContent2.split("")[1]))))) + (param_defend_2_time * game.turnNumber) + (param_defend_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_defend_2_b * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'b', (this.getPieceScore(hexContent2.split("")[1]))))) + (param_defend_2_time_b * game.turnNumber) + (param_defend_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                    }

                    if (this.turnNumber > param_late) {
                        if (hexContent2 != 'none') {
                            if (colour == "w") {
                                score = score + (param_defend_3 * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'w', (this.getPieceScore(hexContent2.split("")[1]))))) + (param_defend_3_time * game.turnNumber) + (param_defend_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_defend_3_b * (this.pieceVulnerability(possiblePositions[j][0], possiblePositions[j][1], 'b', (this.getPieceScore(hexContent2.split("")[1]))))) + (param_defend_3_time_b * game.turnNumber) + (param_defend_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                    }

                    //flock together
                    if (colour == 'w') {
                        var ownedHexPos = this.whiteHexsOccupied;
                    }
                    if (colour == 'b') {
                        var ownedHexPos = this.blackHexsOccupied;
                    }


                    //console.log("Owned Hex:", ownedHexPos);

                    //head toward owned hexs
                    var ownedScore = 0;
                    for (var z = 0; z < ownedHexPos.length; z++) {
                        var hexPos = this.strToCordinates(ownedHexPos[z]);

                        if (hexPos.length > 1 && possiblePositions[j].length > 1) {

                            var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], hexPos[0], hexPos[1]);
                            if (distanceToHex > 0) {
                                var newScore = 1 + Math.ceil(1 / distanceToHex);
                                if (newScore > ownedScore) {
                                    ownedScore = newScore;
                                }
                            }
                        }


                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (param_flock_1 * ownedScore) + (param_flock_1_time * game.turnNumber) + (param_flock_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_flock_1_b * ownedScore) + (param_flock_1_time_b * game.turnNumber) + (param_flock_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (param_flock_2 * ownedScore) + (param_flock_2_time * game.turnNumber) + (param_flock_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_flock_2_b * ownedScore) + (param_flock_2_time_b * game.turnNumber) + (param_flock_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        } else {
                            if (colour == 'w') {
                                score = score + (param_flock_3 * ownedScore) + (param_flock_3_time * game.turnNumber) + (param_flock_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_flock_3_b * ownedScore) + (param_flock_3_time_b * game.turnNumber) + (param_flock_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                    }


                    //move at enemy 
                    if (colour == 'b') {
                        var ownedHexPos = this.whiteHexsOccupied;
                    }
                    if (colour == 'w') {
                        var ownedHexPos = this.blackHexsOccupied;
                    }



                    //head toward opposition hexs
                    var ownedScore = 0;
                    for (var z = 0; z < ownedHexPos.length; z++) {
                        var hexPos = this.strToCordinates(ownedHexPos[z]);

                        if (hexPos.length > 1 && possiblePositions[j].length > 1) {

                            var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], hexPos[0], hexPos[1]);
                            if (distanceToHex > 0) {
                                var newScore = 1 + Math.ceil(1 / distanceToHex);
                                if (newScore > ownedScore) {
                                    ownedScore = newScore;
                                }
                            }
                        }


                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (param_attack_1 * ownedScore) + (param_attack_1_time * game.turnNumber) + (param_attack_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_attack_1_b * ownedScore) + (param_attack_1_time_b * game.turnNumber) + (param_attack_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (param_attack_2 * ownedScore) + (param_attack_2_time * game.turnNumber) + (param_attack_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_attack_2_b * ownedScore) + (param_attack_2_time_b * game.turnNumber) + (param_attack_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        } else {
                            if (colour == 'w') {
                                score = score + (param_attack_3 * ownedScore) + (param_attack_3_time * game.turnNumber) + (param_attack_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (param_attack_3_b * ownedScore) + (param_attack_3_time_b * game.turnNumber) + (param_attack_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }
                        }
                    }



                    //add piece specific scoring here///

                    //pawns
                    if (piece == 'P') {

                        //head toward promo hexs
                        var promoScore = 0;

                        if (possiblePositions[j].length > 1) {
                            for (var z = 0; z < promoHexs.length; z++) {
                                var hexPos = this.strToCordinates(promoHexs[z]);
                                //console.log("test",possiblePositions[j],hexPos);
                                var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], hexPos[0], hexPos[1]);
                                var posScore = Math.ceil(1 / distanceToHex);
                                if (posScore > promoScore) {
                                    promoScore = posScore;
                                }
                            }

                            if (this.turnNumber < param_early) {
                                if (colour == 'w') {
                                    score = score + (pawn_1) + (pawn_1_time * game.turnNumber) + (pawn_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                    score = score + (pawnPromo_1 * promoScore);
                                } else {
                                    score = score + (pawn_1_b) + (pawn_1_time_b * game.turnNumber) + (pawn_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                    score = score + (pawnPromo_1_b * promoScore);
                                }

                            }

                            if (this.turnNumber > param_early && this.turnNumber < param_late) {
                                if (colour == 'w') {
                                    score = score + (pawn_2) + (pawn_2_time * game.turnNumber) + (pawn_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                    score = score + (pawnPromo_2 * promoScore);
                                } else {
                                    score = score + (pawn_2_b) + (pawn_2_time_b * game.turnNumber) + (pawn_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                    score = score + (pawnPromo_2_b * promoScore);
                                }

                            } else {
                                if (colour == 'w') {
                                    score = score + (pawn_3) + (pawn_3_time * game.turnNumber) + (pawn_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                    score = score + (pawnPromo_3 * promoScore);
                                } else {
                                    score = score + (pawn_3_b) + (pawn_3_time_b * game.turnNumber) + (pawn_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                    score = score + (pawnPromo_3_b * promoScore);
                                }

                            }
                        }

                    } ///end pawns

                    //Knights
                    if (piece == 'N') {
                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (knight_1) + (knight_1_time * game.turnNumber) + (knight_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (knight_1_b) + (knight_1_time_b * game.turnNumber) + (knight_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }


                        }

                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (knight_2) + (knight_2_time * game.turnNumber) + (knight_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (knight_2_b) + (knight_2_time_b * game.turnNumber) + (knight_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }


                        } else {
                            if (colour == 'w') {
                                score = score + (knight_3) + (knight_3_time * game.turnNumber) + (knight_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (knight_3_b) + (knight_3_time_b * game.turnNumber) + (knight_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }


                        }
                    } ///end Knights

                    //Bishops
                    if (piece == 'B') {
                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (bishop_1) + (bishop_1_time * game.turnNumber) + (bishop_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (bishop_1_b) + (bishop_1_time_b * game.turnNumber) + (bishop_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }

                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (bishop_2) + (bishop_2_time * game.turnNumber) + (bishop_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (bishop_2_b) + (bishop_2_time_b * game.turnNumber) + (bishop_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        } else {
                            if (colour == 'w') {
                                score = score + (bishop_3) + (bishop_3_time * game.turnNumber) + (bishop_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (bishop_3_b) + (bishop_3_time_b * game.turnNumber) + (bishop_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }
                    } ///end Bishops

                    //Rooks
                    if (piece == 'R') {
                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (rook_1) + (rook_1_time * game.turnNumber) + (rook_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (rook_1_b) + (rook_1_time_b * game.turnNumber) + (rook_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }

                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (rook_2) + (rook_2_time * game.turnNumber) + (rook_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (rook_2_b) + (rook_2_time_b * game.turnNumber) + (rook_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        } else {
                            if (colour == 'w') {
                                score = score + (rook_3) + (rook_3_time * game.turnNumber) + (rook_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (rook_3_b) + (rook_3_time_b * game.turnNumber) + (rook_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }
                    } ///end Rooks

                    //Queen
                    if (piece == 'Q') {
                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (queen_1) + (queen_1_time * game.turnNumber) + (queen_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (queen_1_b) + (queen_1_time_b * game.turnNumber) + (queen_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }

                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (queen_2) + (queen_2_time * game.turnNumber) + (queen_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (queen_2_b) + (queen_2_time_b * game.turnNumber) + (queen_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        } else {
                            if (colour == 'w') {
                                score = score + (queen_3) + (queen_3_time * game.turnNumber) + (queen_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (queen_3_b) + (queen_3_time_b * game.turnNumber) + (queen_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }
                    } ///end Queen

                    //King
                    if (piece == 'K') {
                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (king_1) + (king_1_time * game.turnNumber) + (king_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (king_1_b) + (king_1_time_b * game.turnNumber) + (king_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }

                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (king_2) + (king_2_time * game.turnNumber) + (king_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (king_2_b) + (king_2_time_b * game.turnNumber) + (king_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        } else {
                            if (colour == 'w') {
                                score = score + (king_3) + (king_3_time * game.turnNumber) + (king_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (king_3_b) + (king_3_time_b * game.turnNumber) + (king_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }
                    } ///end King

                    //Dragon
                    if (piece == 'D') {
                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (dragon_1) + (dragon_1_time * game.turnNumber) + (dragon_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (dragon_1_b) + (dragon_1_time_b * game.turnNumber) + (dragon_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }

                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (dragon_2) + (dragon_2_time * game.turnNumber) + (dragon_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (dragon_2_b) + (dragon_2_time_b * game.turnNumber) + (dragon_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        } else {
                            if (colour == 'w') {
                                score = score + (dragon_3) + (dragon_3_time * game.turnNumber) + (dragon_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (dragon_3_b) + (dragon_3_time_b * game.turnNumber) + (dragon_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }


                    } ///end Dragon


                    //////mission/////////

                    //king capture              
                    if (colour == 'w') {
                        var kingPos = this.strToCordinates(this.blackKing);
                    }
                    if (colour == 'b') {
                        var kingPos = this.strToCordinates(this.whiteKing);
                    }


                    if (possiblePositions[j].length > 1) {
                        var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], kingPos[0], kingPos[1]);
                        var posScore = (2 * Math.ceil(1 / distanceToHex));

                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (kingCapture_1 * posScore) + (kingCapture_1_time * game.turnNumber) + (kingCapture_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (kingCapture_1_b * posScore) + (kingCapture_1_time_b * game.turnNumber) + (kingCapture_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }

                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (kingCapture_2 * posScore) + (kingCapture_2_time * game.turnNumber) + (kingCapture_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (kingCapture_2_b * posScore) + (kingCapture_2_time_b * game.turnNumber) + (kingCapture_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        } else {
                            if (colour == 'w') {
                                score = score + (kingCapture_3 * posScore) + (kingCapture_3_time * game.turnNumber) + (kingCapture_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (kingCapture_3_b * posScore) + (kingCapture_3_time_b * game.turnNumber) + (kingCapture_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }
                    }


                    //king defend////////
                    if (colour == 'b') {
                        var kingPos = this.strToCordinates(this.blackKing);
                    }
                    if (colour == 'w') {
                        var kingPos = this.strToCordinates(this.whiteKing);
                    }

                    if (possiblePositions[j].length > 1) {
                        var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], kingPos[0], kingPos[1]);
                        var posScore = (2 * Math.ceil(1 / distanceToHex));

                        if (this.turnNumber < param_early) {
                            if (colour == 'w') {
                                score = score + (kingDefend_1 * posScore) + (kingDefend_1_time * game.turnNumber) + (kingDefend_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (kingDefend_1_b * posScore) + (kingDefend_1_time_b * game.turnNumber) + (kingDefend_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }

                        if (this.turnNumber > param_early && this.turnNumber < param_late) {
                            if (colour == 'w') {
                                score = score + (kingDefend_2 * posScore) + (kingDefend_2_time * game.turnNumber) + (kingDefend_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (kingDefend_2_b * posScore) + (kingDefend_2_time_b * game.turnNumber) + (kingDefend_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        } else {
                            if (colour == 'w') {
                                score = score + (kingDefend_3 * posScore) + (kingDefend_3_time * game.turnNumber) + (kingDefend_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                            } else {
                                score = score + (kingDefend_3_b * posScore) + (kingDefend_3_time_b * game.turnNumber) + (kingDefend_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                            }

                        }
                    }


                    //Dragon capture   

                    if (colour == 'w') {
                        var dragonPos = this.strToCordinates(this.blackDragon.split(";")[0]);
                    }
                    if (colour == 'b') {
                        var dragonPos = this.strToCordinates(this.whiteDragon.split(";")[0]);
                    }


                    if (dragonPos.length > 4 && possiblePositions[j].length > 1) {


                        if (possiblePositions[j].length > 1) {
                            var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], dragonPos[0], dragonPos[1]);
                            var posScore = (2 * Math.ceil(1 / distanceToHex));

                            if (this.turnNumber < param_early) {
                                if (colour == 'w') {
                                    score = score + (dragonCapture_1 * posScore) + (dragonCapture_1_time * game.turnNumber) + (dragonCapture_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                } else {
                                    score = score + (dragonCapture_1_b * posScore) + (dragonCapture_1_time_b * game.turnNumber) + (dragonCapture_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                }

                            }

                            if (this.turnNumber > param_early && this.turnNumber < param_late) {
                                if (colour == 'w') {
                                    score = score + (dragonCapture_2 * posScore) + (dragonCapture_2_time * game.turnNumber) + (dragonCapture_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                } else {
                                    score = score + (dragonCapture_2_b * posScore) + (dragonCapture_2_time_b * game.turnNumber) + (dragonCapture_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                }

                            } else {
                                if (colour == 'w') {
                                    score = score + (dragonCapture_3 * posScore) + (dragonCapture_3_time * game.turnNumber) + (dragonCapture_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                } else {
                                    score = score + (dragonCapture_3_b * posScore) + (dragonCapture_3_time_b * game.turnNumber) + (dragonCapture_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                }

                            }
                        }
                    }


                    //Dragon defend////////
                    if (colour == 'b') {
                        var dragonPos = this.strToCordinates(this.blackDragon.split(";")[0]);
                    }
                    if (colour == 'w') {
                        var dragonPos = this.strToCordinates(this.whiteDragon.split(";")[0]);
                    }


                    if (dragonPos.length > 4 && possiblePositions[j].length > 1) {

                        if (possiblePositions[j].length > 1) {
                            var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], dragonPos[0], dragonPos[1]);
                            var posScore = (2 * Math.ceil(1 / distanceToHex));

                            if (this.turnNumber < param_early) {
                                if (colour == 'w') {
                                    score = score + (dragonDefend_1 * posScore) + (dragonDefend_1_time * game.turnNumber) + (dragonDefend_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                } else {
                                    score = score + (dragonDefend_1_b * posScore) + (dragonDefend_1_time_b * game.turnNumber) + (dragonDefend_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                }

                            }

                            if (this.turnNumber > param_early && this.turnNumber < param_late) {
                                if (colour == 'w') {
                                    score = score + (dragonDefend_2 * posScore) + (dragonDefend_2_time * game.turnNumber) + (dragonDefend_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                } else {
                                    score = score + (dragonDefend_2_b * posScore) + (dragonDefend_2_time_b * game.turnNumber) + (dragonDefend_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                }

                            } else {
                                if (colour == 'w') {
                                    score = score + (dragonDefend_3 * posScore) + (dragonDefend_3_time * game.turnNumber) + (dragonDefend_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                } else {
                                    score = score + (dragonDefend_3_b * posScore) + (dragonDefend_3_time_b * game.turnNumber) + (dragonDefend_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                }

                            }
                        }
                    }




                    //Pawn capture

                    if (colour == 'w') {
                        var pawnList = this.blackPawns;
                    }
                    if (colour == 'b') {
                        var pawnList = this.whitePawns;
                    }

                    var splitList = pawnList.split(';');

                    for (var z = 0; z < splitList.length; z++) {

                        var pawnPos = this.strToCordinates(splitList[z]);
                        //console.log(pawnPos);

                        var finalScore = 0;
                        var testScore = 0;

                        if (pawnPos.length > 4 && possiblePositions[j].length > 1) {


                            if (possiblePositions[j].length > 1) {
                                var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], pawnPos[z][0], pawnPos[z][1]);
                                var posScore = (2 * Math.ceil(1 / distanceToHex));

                                if (this.turnNumber < param_early) {
                                    if (colour == 'w') {
                                        testScore = (pawnCapture_1 * posScore) + (pawnCapture_1_time * game.turnNumber) + (pawnCapture_1_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                    } else {
                                        testScore = (pawnCapture_1_b * posScore) + (pawnCapture_1_time_b * game.turnNumber) + (pawnCapture_1_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                    }

                                }

                                if (this.turnNumber > param_early && this.turnNumber < param_late) {
                                    if (colour == 'w') {
                                        testScore = (pawnCapture_2 * posScore) + (pawnCapture_2_time * game.turnNumber) + (pawnCapture_2_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                    } else {
                                        score = score + (pawnCapture_2_b * posScore) + (pawnCapture_2_time_b * game.turnNumber) + (pawnCapture_2_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                    }

                                } else {
                                    if (colour == 'w') {
                                        testScore = (pawnCapture_3 * posScore) + (pawnCapture_3_time * game.turnNumber) + (pawnCapture_3_score * game.getPointTotal('w') / game.getPointTotal('b'));
                                    } else {
                                        testScore = (pawnCapture_3_b * posScore) + (pawnCapture_3_time_b * game.turnNumber) + (pawnCapture_3_score_b * game.getPointTotal('b') / game.getPointTotal('w'));
                                    }

                                }
                            }
                        }
                        if (testScore > finalScore) {
                            finalScore = testScore;
                        }
                    }


                    score = score + finalScore;



                    ///////////////////////////////////
                    var listRow = [piece, piecesList[i], possiblePositions[j], score];
                    //console.log(piece, score);
                    AllMoves.push(listRow);
                }
            }

        }

        return AllMoves;
    }

    getAllMovesForTurn(colour) {
        //TODO
        //AllMoves will contain list of [piece, currentPosition, possiblePosition, score] for every possible move
        var AllMoves = [];
        for (var p = 0; p < this.pieceSymbolList.length; p++) {
            var pieceMoves = this.getMovesAndScore(this.pieceSymbolList[p], colour);
            for (var q = 0; q < pieceMoves.length; q++) {
                AllMoves.push(pieceMoves[q]);
            }
        }
        return AllMoves;
    }


    mutateParam() {
        var times = 3

        for (var i = 0; i < times; i++) {
            var rndChoice = Math.floor(Math.random() * Math.floor(148));

            //console.log("choice :", rndChoice);

            var rndValue = Math.round(Math.random() * 250, 1);
            if (Math.random() > 0.5) {
                rndValue = rndValue * -1;
            }


            //console.log(rndValue);

            if (rndChoice == 0) {
                param_early = rndValue;
            }
            if (rndChoice == 1) {
                param_late = rndValue;
            }
            if (rndChoice == 2) {
                param_capture_1 = rndValue;
            }
            if (rndChoice == 3) {
                param_capture_2 = rndValue;
            }
            if (rndChoice == 4) {
                param_capture_3 = rndValue;
            }
            if (rndChoice == 5) {
                param_defend_1 = rndValue;
            }
            if (rndChoice == 6) {
                param_defend_2 = rndValue;
            }
            if (rndChoice == 7) {
                param_defend_3 = rndValue;
            }
            if (rndChoice == 8) {
                param_flock_1 = rndValue;
            }
            if (rndChoice == 9) {
                param_flock_2 = rndValue;
            }
            if (rndChoice == 10) {
                param_flock_3 = rndValue;
            }
            if (rndChoice == 11) {
                pawn_1 = rndValue;
            }
            if (rndChoice == 12) {
                pawn_2 = rndValue;
            }
            if (rndChoice == 13) {
                pawn_3 = rndValue;
            }
            if (rndChoice == 14) {
                pawnPromo_1 = rndValue;
            }
            if (rndChoice == 15) {
                pawnPromo_2 = rndValue;
            }
            if (rndChoice == 16) {
                pawnPromo_3 = rndValue;
            }
            if (rndChoice == 17) {
                knight_1 = rndValue;
            }
            if (rndChoice == 18) {
                knight_2 = rndValue;
            }
            if (rndChoice == 19) {
                knight_3 = rndValue;
            }
            if (rndChoice == 20) {
                bishop_1 = rndValue;
            }
            if (rndChoice == 21) {
                bishop_2 = rndValue;
            }
            if (rndChoice == 22) {
                bishop_3 = rndValue;
            }
            if (rndChoice == 23) {
                rook_1 = rndValue;
            }
            if (rndChoice == 24) {
                rook_2 = rndValue;
            }
            if (rndChoice == 25) {
                rook_3 = rndValue;
            }
            if (rndChoice == 26) {
                queen_1 = rndValue;
            }
            if (rndChoice == 27) {
                queen_2 = rndValue;
            }
            if (rndChoice == 28) {
                queen_3 = rndValue;
            }
            if (rndChoice == 29) {
                dragon_1 = rndValue;
            }
            if (rndChoice == 30) {
                dragon_2 = rndValue;
            }
            if (rndChoice == 31) {
                dragon_3 = rndValue;
            }
            if (rndChoice == 32) {
                king_1 = rndValue;
            }
            if (rndChoice == 33) {
                king_2 = rndValue;
            }
            if (rndChoice == 34) {
                king_3 = rndValue;
            }
            if (rndChoice == 35) {
                kingCapture_1 = rndValue;
            }
            if (rndChoice == 36) {
                kingCapture_2 = rndValue;
            }
            if (rndChoice == 37) {
                kingCapture_3 = rndValue;
            }
            if (rndChoice == 38) {
                kingDefend_1 = rndValue;
            }
            if (rndChoice == 39) {
                kingDefend_2 = rndValue;
            }
            if (rndChoice == 40) {
                kingDefend_3 = rndValue;
            }
            if (rndChoice == 41) {
                param_avoidDanger_1 = rndValue;
            }
            if (rndChoice == 42) {
                param_avoidDanger_2 = rndValue;
            }
            if (rndChoice == 43) {
                param_avoidDanger_3 = rndValue;
            }

            if (rndChoice == 44) {
                param_capture_1_time = rndValue;
            }
            if (rndChoice == 45) {
                param_capture_2_time = rndValue;
            }
            if (rndChoice == 46) {
                param_capture_3_time = rndValue;
            }
            if (rndChoice == 47) {
                param_capture_1_score = rndValue;
            }
            if (rndChoice == 48) {
                param_capture_2_score = rndValue;
            }
            if (rndChoice == 49) {
                param_capture_3_score = rndValue;
            }
            if (rndChoice == 50) {
                param_defend_1_time = rndValue;
            }
            if (rndChoice == 51) {
                param_defend_2_time = rndValue;
            }
            if (rndChoice == 52) {
                param_defend_3_time = rndValue;
            }
            if (rndChoice == 53) {
                param_defend_1_score = rndValue;
            }
            if (rndChoice == 54) {
                param_defend_2_score = rndValue;
            }
            if (rndChoice == 55) {
                param_defend_3_score = rndValue;
            }
            if (rndChoice == 56) {
                param_flock_1_time = rndValue;
            }
            if (rndChoice == 57) {
                param_flock_2_time = rndValue;
            }
            if (rndChoice == 58) {
                param_flock_3_time = rndValue;
            }
            if (rndChoice == 59) {
                param_flock_1_score = rndValue;
            }
            if (rndChoice == 60) {
                param_flock_2_score = rndValue;
            }
            if (rndChoice == 61) {
                param_flock_3_score = rndValue;
            }
            if (rndChoice == 62) {
                pawn_1_time = rndValue;
            }
            if (rndChoice == 63) {
                pawn_2_time = rndValue;
            }
            if (rndChoice == 64) {
                pawn_3_time = rndValue;
            }
            if (rndChoice == 65) {
                pawn_1_score = rndValue;
            }
            if (rndChoice == 66) {
                pawn_2_score = rndValue;
            }
            if (rndChoice == 67) {
                pawn_3_score = rndValue;
            }
            if (rndChoice == 68) {
                knight_1_time = rndValue;
            }
            if (rndChoice == 69) {
                knight_2_time = rndValue;
            }
            if (rndChoice == 70) {
                knight_3_time = rndValue;
            }
            if (rndChoice == 71) {
                knight_1_score = rndValue;
            }
            if (rndChoice == 72) {
                knight_2_score = rndValue;
            }
            if (rndChoice == 73) {
                knight_3_score = rndValue;
            }
            if (rndChoice == 74) {
                bishop_1_time = rndValue;
            }
            if (rndChoice == 75) {
                bishop_2_time = rndValue;
            }
            if (rndChoice == 76) {
                bishop_3_time = rndValue;
            }
            if (rndChoice == 77) {
                bishop_1_score = rndValue;
            }
            if (rndChoice == 78) {
                bishop_2_score = rndValue;
            }
            if (rndChoice == 79) {
                bishop_3_score = rndValue;
            }
            if (rndChoice == 80) {
                rook_1_time = rndValue;
            }
            if (rndChoice == 81) {
                rook_2_time = rndValue;
            }
            if (rndChoice == 82) {
                rook_3_time = rndValue;
            }
            if (rndChoice == 83) {
                rook_1_score = rndValue;
            }
            if (rndChoice == 84) {
                rook_2_score = rndValue;
            }
            if (rndChoice == 85) {
                rook_3_score = rndValue;
            }
            if (rndChoice == 86) {
                queen_1_time = rndValue;
            }
            if (rndChoice == 87) {
                queen_2_time = rndValue;
            }
            if (rndChoice == 88) {
                queen_3_time = rndValue;
            }
            if (rndChoice == 89) {
                queen_1_score = rndValue;
            }
            if (rndChoice == 90) {
                queen_2_score = rndValue;
            }
            if (rndChoice == 91) {
                queen_3_score = rndValue;
            }
            if (rndChoice == 92) {
                king_1_time = rndValue;
            }
            if (rndChoice == 93) {
                king_2_time = rndValue;
            }
            if (rndChoice == 94) {
                king_3_time = rndValue;
            }
            if (rndChoice == 95) {
                king_1_score = rndValue;
            }
            if (rndChoice == 96) {
                king_2_score = rndValue;
            }
            if (rndChoice == 97) {
                king_3_score = rndValue;
            }
            if (rndChoice == 98) {
                dragon_1_time = rndValue;
            }
            if (rndChoice == 99) {
                dragon_2_time = rndValue;
            }
            if (rndChoice == 100) {
                dragon_3_time = rndValue;
            }
            if (rndChoice == 101) {
                dragon_1_score = rndValue;
            }
            if (rndChoice == 102) {
                dragon_2_score = rndValue;
            }
            if (rndChoice == 103) {
                dragon_3_score = rndValue;
            }
            if (rndChoice == 104) {
                kingCapture_1_time = rndValue;
            }
            if (rndChoice == 105) {
                kingCapture_2_time = rndValue;
            }
            if (rndChoice == 106) {
                kingCapture_3_time = rndValue;
            }
            if (rndChoice == 107) {
                kingCapture_1_score = rndValue;
            }
            if (rndChoice == 108) {
                kingCapture_2_score = rndValue;
            }
            if (rndChoice == 109) {
                kingCapture_3_score = rndValue;
            }
            if (rndChoice == 110) {
                kingDefend_1_time = rndValue;
            }
            if (rndChoice == 111) {
                kingDefend_2_time = rndValue;
            }
            if (rndChoice == 112) {
                kingDefend_3_time = rndValue;
            }
            if (rndChoice == 113) {
                kingDefend_1_score = rndValue;
            }
            if (rndChoice == 114) {
                kingDefend_2_score = rndValue;
            }
            if (rndChoice == 115) {
                kingDefend_3_score = rndValue;
            }
            if (rndChoice == 116) {
                param_avoidDanger_1_time = rndValue;
            }
            if (rndChoice == 117) {
                param_avoidDanger_2_time = rndValue;
            }
            if (rndChoice == 118) {
                param_avoidDanger_3_time = rndValue;
            }
            if (rndChoice == 116) {
                param_avoidDanger_1_score = rndValue;
            }
            if (rndChoice == 117) {
                param_avoidDanger_2_score = rndValue;
            }
            if (rndChoice == 118) {
                param_avoidDanger_3_score = rndValue;
            }

            if (rndChoice == 119) {
                param_attack_1 = rndValue;
            }
            if (rndChoice == 120) {
                param_attack_2 = rndValue;
            }
            if (rndChoice == 121) {
                param_attack_3 = rndValue;
            }
            if (rndChoice == 122) {
                param_attack_1_score = rndValue;
            }
            if (rndChoice == 123) {
                param_attack_2_score = rndValue;
            }
            if (rndChoice == 124) {
                param_attack_3_score = rndValue;
            }
            if (rndChoice == 125) {
                param_attack_1_time = rndValue;
            }
            if (rndChoice == 126) {
                param_attack_1_time = rndValue;
            }
            if (rndChoice == 127) {
                param_attack_1_time = rndValue;
            }
            if (rndChoice == 128) {
                dragonCapture_1 = rndValue;
            }
            if (rndChoice == 129) {
                dragonCapture_2 = rndValue;
            }
            if (rndChoice == 130) {
                dragonCapture_3 = rndValue;
            }
            if (rndChoice == 131) {
                dragonDefend_1 = rndValue;
            }
            if (rndChoice == 132) {
                dragonDefend_2 = rndValue;
            }
            if (rndChoice == 133) {
                dragonDefend_3 = rndValue;
            }

            if (rndChoice == 134) {
                dragonDefend_1_time = rndValue;
            }
            if (rndChoice == 135) {
                dragonDefend_2_time = rndValue;
            }
            if (rndChoice == 136) {
                dragonDefend_3_time = rndValue;
            }

            if (rndChoice == 137) {
                dragonDefend_1_score = rndValue;
            }
            if (rndChoice == 138) {
                dragonDefend_2_score = rndValue;
            }
            if (rndChoice == 139) {
                dragonDefend_3_score = rndValue;
            }

            if (rndChoice == 140) {
                pawnCapture_1 = rndValue;
            }
            if (rndChoice == 141) {
                pawnCapture_2 = rndValue;
            }
            if (rndChoice == 142) {
                pawnCapture_3 = rndValue;
            }

            if (rndChoice == 143) {
                pawnCapture_1_time = rndValue;
            }
            if (rndChoice == 144) {
                pawnCapture_2_time = rndValue;
            }
            if (rndChoice == 145) {
                pawnCapture_3_time = rndValue;
            }

            if (rndChoice == 146) {
                pawnCapture_1_score = rndValue;
            }
            if (rndChoice == 147) {
                pawnCapture_2_score = rndValue;
            }
            if (rndChoice == 148) {
                pawnCapture_3_score = rndValue;
            }

        }
    }

    mutateParam_b() {
        var rndChoice = Math.floor(Math.random() * Math.floor(148));

        //console.log("choice :", rndChoice);

        var rndValue = Math.round(Math.random() * 20, 1);
        if (Math.random() > 0.5) {
            rndValue = rndValue * -1;
        }


        //console.log(rndValue);

        if (rndChoice == 0) {
            param_early_b = param_early_b + rndValue;
        }
        if (rndChoice == 1) {
            param_late_b = param_late_b + rndValue;
        }
        if (rndChoice == 2) {
            param_capture_1_b = param_capture_1_b + rndValue;
        }
        if (rndChoice == 3) {
            param_capture_2_b = param_capture_2_b + rndValue;
        }
        if (rndChoice == 4) {
            param_capture_3_b = param_capture_3_b + rndValue;
        }
        if (rndChoice == 5) {
            param_defend_1_b = param_defend_1_b + rndValue;
        }
        if (rndChoice == 6) {
            param_defend_2_b = param_defend_2_b + rndValue;
        }
        if (rndChoice == 7) {
            param_defend_3_b = param_defend_3_b + rndValue;
        }
        if (rndChoice == 8) {
            param_flock_1_b = param_flock_1_b + rndValue;
        }
        if (rndChoice == 9) {
            param_flock_2_b = param_flock_2_b + rndValue;
        }
        if (rndChoice == 10) {
            param_flock_3_b = param_flock_3_b + rndValue;
        }
        if (rndChoice == 11) {
            pawn_1_b = pawn_1_b + rndValue;
        }
        if (rndChoice == 12) {
            pawn_2_b = pawn_2_b + rndValue;
        }
        if (rndChoice == 13) {
            pawn_3_b = pawn_3_b + rndValue;
        }
        if (rndChoice == 14) {
            pawnPromo_1_b = pawnPromo_1_b + rndValue;
        }
        if (rndChoice == 15) {
            pawnPromo_2_b = pawnPromo_2_b + rndValue;
        }
        if (rndChoice == 16) {
            pawnPromo_3_b = pawnPromo_3_b + rndValue;
        }
        if (rndChoice == 17) {
            knight_1_b = knight_1_b + rndValue;
        }
        if (rndChoice == 18) {
            knight_2_b = knight_2_b + rndValue;
        }
        if (rndChoice == 19) {
            knight_3_b = knight_3_b + rndValue;
        }
        if (rndChoice == 20) {
            bishop_1_b = bishop_1_b + rndValue;
        }
        if (rndChoice == 21) {
            bishop_2_b = bishop_2_b + rndValue;
        }
        if (rndChoice == 22) {
            bishop_3_b = bishop_3_b + rndValue;
        }
        if (rndChoice == 23) {
            rook_1_b = rook_1_b + rndValue;
        }
        if (rndChoice == 24) {
            rook_2_b = rook_2_b + rndValue;
        }
        if (rndChoice == 25) {
            rook_3_b = rook_3_b + rndValue;
        }
        if (rndChoice == 26) {
            queen_1_b = queen_1_b + rndValue;
        }
        if (rndChoice == 27) {
            queen_2_b = queen_2_b + rndValue;
        }
        if (rndChoice == 28) {
            queen_3_b = queen_3_b + rndValue;
        }
        if (rndChoice == 29) {
            dragon_1_b = dragon_1_b + rndValue;
        }
        if (rndChoice == 30) {
            dragon_2_b = dragon_2_b + rndValue;
        }
        if (rndChoice == 31) {
            dragon_3_b = dragon_3_b + rndValue;
        }
        if (rndChoice == 32) {
            king_1_b = king_1_b + rndValue;
        }
        if (rndChoice == 33) {
            king_2_b = king_2_b + rndValue;
        }
        if (rndChoice == 34) {
            king_3_b = king_3_b + rndValue;
        }
        if (rndChoice == 35) {
            kingCapture_1_b = kingCapture_1_b + rndValue;
        }
        if (rndChoice == 36) {
            kingCapture_2_b = kingCapture_2_b + rndValue;
        }
        if (rndChoice == 37) {
            kingCapture_3_b = kingCapture_3_b + rndValue;
        }
        if (rndChoice == 38) {
            kingDefend_1_b = kingDefend_1_b + rndValue;
        }
        if (rndChoice == 39) {
            kingDefend_2_b = kingDefend_2_b + rndValue;
        }
        if (rndChoice == 40) {
            kingDefend_3_b = kingDefend_3_b + rndValue;
        }
        if (rndChoice == 41) {
            param_avoidDanger_1_b = param_avoidDanger_1_b + rndValue;
        }
        if (rndChoice == 42) {
            param_avoidDanger_2_b = param_avoidDanger_2_b + rndValue;
        }
        if (rndChoice == 43) {
            param_avoidDanger_3_b = param_avoidDanger_3_b + rndValue;
        }

        if (rndChoice == 44) {
            param_capture_1_time_b = param_capture_1_time_b + rndValue;
        }
        if (rndChoice == 45) {
            param_capture_2_time_b = param_capture_2_time_b + rndValue;
        }
        if (rndChoice == 46) {
            param_capture_3_time_b = param_capture_3_time_b + rndValue;
        }
        if (rndChoice == 47) {
            param_capture_1_score_b = param_capture_1_score_b + rndValue;
        }
        if (rndChoice == 48) {
            param_capture_2_score_b = param_capture_2_score_b + rndValue;
        }
        if (rndChoice == 49) {
            param_capture_3_score_b = param_capture_3_score_b + rndValue;
        }
        if (rndChoice == 50) {
            param_defend_1_time_b = param_defend_1_time_b + rndValue;
        }
        if (rndChoice == 51) {
            param_defend_2_time_b = param_defend_2_time_b + rndValue;
        }
        if (rndChoice == 52) {
            param_defend_3_time_b = param_defend_3_time_b + rndValue;
        }
        if (rndChoice == 53) {
            param_defend_1_score_b = param_defend_1_score_b + rndValue;
        }
        if (rndChoice == 54) {
            param_defend_2_score_b = param_defend_2_score_b + rndValue;
        }
        if (rndChoice == 55) {
            param_defend_3_score_b = param_defend_3_score_b + rndValue;
        }
        if (rndChoice == 56) {
            param_flock_1_time_b = param_flock_1_time_b + rndValue;
        }
        if (rndChoice == 57) {
            param_flock_2_time_b = param_flock_2_time_b + rndValue;
        }
        if (rndChoice == 58) {
            param_flock_3_time_b = param_flock_3_time_b + rndValue;
        }
        if (rndChoice == 59) {
            param_flock_1_score_b = param_flock_1_score_b + rndValue;
        }
        if (rndChoice == 60) {
            param_flock_2_score_b = param_flock_2_score_b + rndValue;
        }
        if (rndChoice == 61) {
            param_flock_3_score_b = param_flock_3_score_b + rndValue;
        }
        if (rndChoice == 62) {
            pawn_1_time_b = pawn_1_time_b + rndValue;
        }
        if (rndChoice == 63) {
            pawn_2_time_b = pawn_2_time_b + rndValue;
        }
        if (rndChoice == 64) {
            pawn_3_time_b = pawn_3_time_b + rndValue;
        }
        if (rndChoice == 65) {
            pawn_1_score_b = pawn_1_score_b + rndValue;
        }
        if (rndChoice == 66) {
            pawn_2_score_b = pawn_2_score_b + rndValue;
        }
        if (rndChoice == 67) {
            pawn_3_score_b = pawn_3_score_b + rndValue;
        }
        if (rndChoice == 68) {
            knight_1_time_b = knight_1_time_b + rndValue;
        }
        if (rndChoice == 69) {
            knight_2_time_b = knight_2_time_b + rndValue;
        }
        if (rndChoice == 70) {
            knight_3_time_b = knight_3_time_b + rndValue;
        }
        if (rndChoice == 71) {
            knight_1_score_b = knight_1_score_b + rndValue;
        }
        if (rndChoice == 72) {
            knight_2_score_b = knight_2_score_b + rndValue;
        }
        if (rndChoice == 73) {
            knight_3_score_b = knight_3_score_b + rndValue;
        }
        if (rndChoice == 74) {
            bishop_1_time_b = bishop_1_time_b + rndValue;
        }
        if (rndChoice == 75) {
            bishop_2_time_b = bishop_2_time_b + rndValue;
        }
        if (rndChoice == 76) {
            bishop_3_time_b = bishop_3_time_b + rndValue;
        }
        if (rndChoice == 77) {
            bishop_1_score_b = bishop_1_score_b + rndValue;
        }
        if (rndChoice == 78) {
            bishop_2_score_b = bishop_2_score_b + rndValue;
        }
        if (rndChoice == 79) {
            bishop_3_score_b = bishop_3_score_b + rndValue;
        }
        if (rndChoice == 80) {
            rook_1_time_b = rook_1_time_b + rndValue;
        }
        if (rndChoice == 81) {
            rook_2_time_b = rook_2_time_b + rndValue;
        }
        if (rndChoice == 82) {
            rook_3_time_b = rook_3_time_b + rndValue;
        }
        if (rndChoice == 83) {
            rook_1_score_b = rook_1_score_b + rndValue;
        }
        if (rndChoice == 84) {
            rook_2_score_b = rook_2_score_b + rndValue;
        }
        if (rndChoice == 85) {
            rook_3_score_b = rook_3_score_b + rndValue;
        }
        if (rndChoice == 86) {
            queen_1_time_b = queen_1_time_b + rndValue;
        }
        if (rndChoice == 87) {
            queen_2_time_b = queen_2_time_b + rndValue;
        }
        if (rndChoice == 88) {
            queen_3_time_b = queen_3_time_b + rndValue;
        }
        if (rndChoice == 89) {
            queen_1_score_b = queen_1_score_b + rndValue;
        }
        if (rndChoice == 90) {
            queen_2_score_b = queen_2_score_b + rndValue;
        }
        if (rndChoice == 91) {
            queen_3_score_b = queen_3_score_b + rndValue;
        }
        if (rndChoice == 92) {
            king_1_time_b = king_1_time_b + rndValue;
        }
        if (rndChoice == 93) {
            king_2_time_b = king_2_time_b + rndValue;
        }
        if (rndChoice == 94) {
            king_3_time_b = king_3_time_b + rndValue;
        }
        if (rndChoice == 95) {
            king_1_score_b = king_1_score_b + rndValue;
        }
        if (rndChoice == 96) {
            king_2_score_b = king_2_score_b + rndValue;
        }
        if (rndChoice == 97) {
            king_3_score_b = king_3_score_b + rndValue;
        }
        if (rndChoice == 98) {
            dragon_1_time_b = dragon_1_time_b + rndValue;
        }
        if (rndChoice == 99) {
            dragon_2_time_b = dragon_2_time_b + rndValue;
        }
        if (rndChoice == 100) {
            dragon_3_time_b = dragon_3_time_b + rndValue;
        }
        if (rndChoice == 101) {
            dragon_1_score_b = dragon_1_score_b + rndValue;
        }
        if (rndChoice == 102) {
            dragon_2_score_b = dragon_2_score_b + rndValue;
        }
        if (rndChoice == 103) {
            dragon_3_score_b = dragon_3_score_b + rndValue;
        }
        if (rndChoice == 104) {
            kingCapture_1_time_b = kingCapture_1_time_b + rndValue;
        }
        if (rndChoice == 105) {
            kingCapture_2_time_b = kingCapture_2_time_b + rndValue;
        }
        if (rndChoice == 106) {
            kingCapture_3_time_b = kingCapture_3_time_b + rndValue;
        }
        if (rndChoice == 107) {
            kingCapture_1_score_b = kingCapture_1_score_b + rndValue;
        }
        if (rndChoice == 108) {
            kingCapture_2_score_b = kingCapture_2_score_b + rndValue;
        }
        if (rndChoice == 109) {
            kingCapture_3_score_b = kingCapture_3_score_b + rndValue;
        }
        if (rndChoice == 110) {
            kingDefend_1_time_b = kingDefend_1_time_b + rndValue;
        }
        if (rndChoice == 111) {
            kingDefend_2_time_b = kingDefend_2_time_b + rndValue;
        }
        if (rndChoice == 112) {
            kingDefend_3_time_b = kingDefend_3_time_b + rndValue;
        }
        if (rndChoice == 113) {
            kingDefend_1_score_b = kingDefend_1_score_b + rndValue;
        }
        if (rndChoice == 114) {
            kingDefend_2_score_b = kingDefend_2_score_b + rndValue;
        }
        if (rndChoice == 115) {
            kingDefend_3_score_b = kingDefend_3_score_b + rndValue;
        }
        if (rndChoice == 116) {
            param_avoidDanger_1_time_b = param_avoidDanger_1_time_b + rndValue;
        }
        if (rndChoice == 117) {
            param_avoidDanger_2_time_b = param_avoidDanger_2_time_b + rndValue;
        }
        if (rndChoice == 118) {
            param_avoidDanger_3_time_b = param_avoidDanger_3_time_b + rndValue;
        }
        if (rndChoice == 116) {
            param_avoidDanger_1_score_b = param_avoidDanger_1_score_b + rndValue;
        }
        if (rndChoice == 117) {
            param_avoidDanger_2_score_b = param_avoidDanger_2_score_b + rndValue;
        }
        if (rndChoice == 118) {
            param_avoidDanger_3_score_b = param_avoidDanger_3_score_b + rndValue;
        }
        if (rndChoice == 119) {
            param_attack_1_b = param_attack_1_b + rndValue;
        }
        if (rndChoice == 120) {
            param_attack_2_b = param_attack_2_b + rndValue;
        }
        if (rndChoice == 121) {
            param_attack_3_b = param_attack_3_b + rndValue;
        }
        if (rndChoice == 122) {
            param_attack_1_score_b = param_attack_1_score_b + rndValue;
        }
        if (rndChoice == 123) {
            param_attack_2_score_b = param_attack_2_score_b + rndValue;
        }
        if (rndChoice == 124) {
            param_attack_3_score_b = param_attack_3_score_b + rndValue;
        }
        if (rndChoice == 125) {
            param_attack_1_time_b = param_attack_1_time_b + rndValue;
        }
        if (rndChoice == 126) {
            param_attack_1_time_b = param_attack_1_time_b + rndValue;
        }
        if (rndChoice == 127) {
            param_attack_1_time_b = param_attack_1_time_b + rndValue;
        }
        if (rndChoice == 128) {
            dragonCapture_1_b = dragonCapture_1_b + rndValue;
        }
        if (rndChoice == 129) {
            dragonCapture_2_b = dragonCapture_2_b + rndValue;
        }
        if (rndChoice == 130) {
            dragonCapture_3_b = dragonCapture_3_b + rndValue;
        }
        if (rndChoice == 131) {
            dragonDefend_1_b = dragonDefend_1_b + rndValue;
        }
        if (rndChoice == 132) {
            dragonDefend_2_b = dragonDefend_2_b + rndValue;
        }
        if (rndChoice == 133) {
            dragonDefend_3_b = dragonDefend_3_b + rndValue;

        }
        if (rndChoice == 134) {
            dragonDefend_1_time = dragonDefend_1_time + rndValue;
        }
        if (rndChoice == 135) {
            dragonDefend_2_time = dragonDefend_2_time + rndValue;
        }
        if (rndChoice == 136) {
            dragonDefend_3_time = dragonDefend_3_time + rndValue;
        }

        if (rndChoice == 137) {
            dragonDefend_1_score = dragonDefend_1_score + rndValue;
        }
        if (rndChoice == 138) {
            dragonDefend_2_score = dragonDefend_2_score + rndValue;
        }
        if (rndChoice == 139) {
            dragonDefend_3_score = dragonDefend_3_score + rndValue;
        }

        if (rndChoice == 140) {
            pawnCapture_1 = pawnCapture_1 + rndValue;
        }
        if (rndChoice == 141) {
            pawnCapture_2 = pawnCapture_2 + rndValue;
        }
        if (rndChoice == 142) {
            pawnCapture_3 = pawnCapture_3 + rndValue;
        }

        if (rndChoice == 143) {
            pawnCapture_1_time = pawnCapture_1_time + rndValue;
        }
        if (rndChoice == 144) {
            pawnCapture_2_time = pawnCapture_2_time + rndValue;
        }
        if (rndChoice == 145) {
            pawnCapture_3_time = pawnCapture_3_time + rndValue;
        }

        if (rndChoice == 146) {
            pawnCapture_1_score = pawnCapture_1_score + rndValue;
        }
        if (rndChoice == 147) {
            pawnCapture_2_score = pawnCapture_2_score + rndValue;
        }
        if (rndChoice == 148) {
            pawnCapture_3_score = pawnCapture_3_score + rndValue;
        }


    }



} ///////////////end of class//////////////////////////////////////////////


//set start positions
//white in play
var whitePawns = "(4,36);(4,35);(5,36);(5,35);(6,34);(6,35);(7,36);(7,35);(8,36);(5,34);(5,33);(6,33);(7,34)";

var whiteKnights = "(4,37);(7,37)";
//var whiteKnights = "(7,37)";
var whiteRooks = "(4,38);(8,38);(5,38)";
//var whiteRooks = "";
var whiteBishops = "(6,36);(6,37);(7,38)";
//var whiteBishops = "";
var whiteQueen = "(5,37)";
//var whiteQueen = "";
var whiteKing = "(6,38)"
var whiteDragon = "(9,35);(2,35)";
//var whiteDragon = "";

//black in play
var blackPawns = "(4,4);(4,5);(5,4);(5,5);(6,6);(6,5);(7,4);(7,5);(8,4);(5,6);(5,7);(6,7);(7,6)";

var blackKnights = "(4,3);(7,3)";
//var blackKnights = "(4,3)";
var blackRooks = "(4,2);(8,2);(7,2)";
//var blackRooks = "";
var blackBishops = "(5,2);(5,3);(6,4)";
//var blackBishops = "";
var blackQueen = "(6,3)";
//var blackQueen = "";
var blackKing = "(6,2)";
var blackDragon = "(2,5);(9,5)";
//var blackDragon = "";

//pawn promotion hexs
var whitePawnPromoHexs = "(4,2);(5,2);(6,2);(7,2);(8,2)";
var blackPawnPromoHexs = "(4,38);(5,38);(6,38);(7,38);(8,38)";
var whitePawnPromoHexs2 = "(2,5);(1,11);(0,17);(9,5);(10,8);(10,11);(11,14);(11,17)";
var blackPawnPromoHexs2 = "(0,23);(1,29);(2,23);(2,35);(9,35);(10,32);(10,29);(11,26);(11,23)";


//create board object
const board = new Gameboard(height, width, rad, offBoard)
board.drawBoard()

//create game object
const game = new PieceList(whitePawns, whiteKnights, whiteRooks, whiteBishops, whiteQueen, whiteKing, whiteDragon, blackPawns, blackKnights, blackRooks, blackBishops, blackQueen, blackKing, blackDragon);

//set board
game.setPieces();



function setPiece(piece, positionList) {
    for (var x = 0; x < 12; x++) {
        for (var y = 0; y < 40; y++) {
            var searchStr = "(" + x + "," + y + ")";
            if (offBoard.includes(searchStr) == false) {
                if (positionList.includes(searchStr) == true) {

                    drawHex(
                        getHex_X(x, y),
                        getHex_Y(x, y),
                        rad,
                        x + '' + y,
                        "white",
                        false,
                        piece
                    );
                }
            }
        }
    }
}


function clickHex(colour) {
    var newX = 0;
    var newY = 0;
    drawHex(getHex_X(x, y),
        getHex_Y(x, y),
        rad,
        newX + '' + newY,
        colour,
        true,
        "none"
    );
}


function drawHex(x, y, radius, n, colour, textOn, piece) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    for (var a = 1; a <= 6; a++) {
        var angle = ((Math.PI * 2) / 6) * a;
        ctx.lineTo(
            x + Math.cos(angle) * radius,
            y + Math.sin(angle) * radius
        );
    }
    ctx.fillStyle = colour;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.stroke();
    //ctx.font = "15px sans";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.textSize = height;
    ctx.fillStyle = "#333";
    if (textOn) {
        ctx.fillText(n, x, y);
    }

    if (piece != 'none') {
        var img = document.getElementById(piece);
        ctx.drawImage(img, x - width / 40, y - height / 40, height / (20), width / (20));
    }
}

// Get 'Info' id
var info = document.getElementById('info');


function updateMessageBox(x, y) {
    info.innerHTML = 'Side to move: ' + game.sideToMove + '<br />Position X: ' + x + '<br />Position Y: ' + y + '<br />Piece: ' + game.getHexContent(x, y) + '<br />Turn #: ' + game.turnNumber;
}

function displayWinnerMessage() {
    if (game.winner == 'stalemate') {
        if (game.getPointTotal('w') > game.getPointTotal('b')) {
            game.winner = 'White';
        } else {
            game.winner = 'Black';
        }

    }

    info.innerHTML = game.winner + ' Wins!' + '<br />Turn #: ' + game.turnNumber;
    console.log(game.getPointTotal('b'));



    //save parameters
    //console.log("Turn #",game.turnNumber);
    //console.log("Previous ",previousScore);

    //previousScore = game.turnNumber;
    saveFile(game.winner);
    sleep(500);
    //console.log("Save File!")


    //console.log('restart now')
    loadScript('http://127.0.0.1:8887/parameterFile.txt');
    loadScript('http://127.0.0.1:8887/parameterFile_b.txt');
    resetGame();
    game.gameOver = false;
    sleep(500);
    document.getElementById('btnMutate').click();

}

//////////Main Game Loop /////////////////////////////////

function selectPiece(p) {
    if (game.gameOver == false) {

        if (game.computerPlayer == 'Auto') {
            //loop if auto on - every 500ms
            setInterval(function () {
                if (game.computerPlayer == 'Auto') {
                    computerMoves();
                }
            }, 400);

        } else {
            var rect = c.getBoundingClientRect();
            var xPos = (p.pageX - rect.left);
            var yPos = (p.pageY - rect.top);
            var can_height = ctx.canvas.height;
            var can_width = ctx.canvas.width;
            var yAdjust = can_height / 45;
            var xAdjust = can_width / 25;

            if (xPos < (xAdjust * 0.1) || yPos < (yAdjust * 1.6) || xPos > can_width - xAdjust || yPos > can_height - (yAdjust * 4)) {
                info.innerHTML = 'Off Board';
            } else {
                if ((yPos % yAdjust) < (yAdjust * 0.5)) {
                    //console.log("YPos: " + yPos % yAdjust);
                    yPos = Math.floor((yPos / yAdjust) - 1);
                } else {
                    //console.log("YPos: " + yPos % yAdjust);
                    yPos = Math.ceil((yPos / yAdjust) - 1);
                }
                if ((xPos % xAdjust) < (xAdjust * 0.5)) {
                    //console.log("XPos: "+xPos % xAdjust);
                    xPos = Math.floor(xPos / xAdjust / 2);
                } else {
                    //console.log("XPos: "+xPos % xAdjust);
                    xPos = Math.ceil((xPos / xAdjust) / 2);
                }

                updateMessageBox(xPos, yPos)
                board.drawBoard();
                game.setPieces();

                //check if piece is selected to move  
                if (game.pieceToMoveHexSelected != true) {

                    //check if hex selected contains a valid piece
                    if (game.availableForSelection(xPos, yPos, game.sideToMove)) {
                        game.selectHex(xPos, yPos, 'blue');
                        game.setPieceSelected(xPos, yPos);
                        game.showHexsAvailabletoMove(xPos, yPos, game.pieceSelected);
                        game.oldX = game.selectedCellX;
                        game.oldY = game.selectedCellY;
                        game.readyToMove = true;
                        game.pieceToMoveHexSelected = true;
                        updateMessageBox(xPos, yPos);
                    }

                } else {
                    //check if hex to move to is valid

                    if (game.availableForMove(xPos, yPos) && game.availableCurrentPieceMove(xPos, yPos)) {
                        //move piece
                        game.movePiece(xPos, yPos, game.pieceSelected);

                        //test if game won - if so exit and display winner
                        if (game.isGameWon() == true) {
                            displayWinnerMessage();
                            game.gameOver = true;
                            //TODO - update game record with final move?
                            return;
                        }

                        game.readyToMove = false;
                        game.pieceToMoveHexSelected = false;
                        game.changeSideToMove();
                        game.resetAvailableMoves();
                        game.oldX = 15;
                        game.oldY = 40;
                        updateMessageBox(xPos, yPos);
                        return; //TODO

                    } else {
                        game.resetAvailableMoves();
                        //if hex not available unselect piece - select new piece if one in hex
                        if (game.availableForSelection(xPos, yPos, game.sideToMove)) {
                            game.resetAvailableMoves();
                            game.selectHex(xPos, yPos, 'blue');
                            game.setPieceSelected(xPos, yPos);
                            game.showHexsAvailabletoMove(xPos, yPos, game.pieceSelected);
                            game.oldX = game.selectedCellX;
                            game.oldY = game.selectedCellY;
                            game.readyToMove = true;
                            game.pieceToMoveHexSelected = true;
                            updateMessageBox(xPos, yPos);
                            return; //TODO 
                        } else {
                            game.pieceSelected = 'none';
                            game.pieceToMoveHexSelected = false;
                            game.colourSelected = 'none';
                        }
                    }
                }
            }




        }
    } else {
        displayWinnerMessage();
    }

} //end_selectPiece



function resetGame() {
    //TODO
    //reset Game
    game.whitePawns = whitePawns;
    game.whiteKnights = whiteKnights;
    game.whiteRooks = whiteRooks;
    game.whiteBishops = whiteBishops;
    game.whiteQueen = whiteQueen;
    game.whiteKing = whiteKing;
    game.whiteDragon = whiteDragon;
    game.blackPawns = blackPawns;
    game.blackKnights = blackKnights;
    game.blackRooks = blackRooks;
    game.blackBishops = blackBishops;
    game.blackQueen = blackQueen;
    game.blackKing = blackKing;
    game.blackDragon = blackDragon;
    game.turnNumber = 0;
    game.sideToMove = 'w';
    game.turnComplete = false;
    game.pieceToMoveHexSelected = false;
    game.hexToMoveToSelected = false;
    game.selectedCellX = 15;
    game.selectedCellY = 40;
    game.selectedCelltoMovetoX = 15;
    game.selectedCelltoMovetoY = 40;
    game.oldX = 15;
    game.oldY = 40;
    game.pieceSelected = 'none';
    game.colourSelected = 'none';
    game.pieceTypeSelected = 'none';
    game.readyToMove = false;
    game.availableMovesForCurrentPiece = "";
    game.gameRecord = [];
    board.drawBoard();
    game.setPieces();
    console.log("reset pushed")
    return;
}

function undoMove() {
    //TODO
    //move game state back one step
    if (game.turnNumber == 1) {
        resetGame();
        return;
    } else {
        var lastRecord = game.gameRecord[game.turnNumber - 2];
        game.whitePawns = lastRecord[2];
        game.whiteKnights = lastRecord[3];
        game.whiteRooks = lastRecord[4];
        game.whiteBishops = lastRecord[5];
        game.whiteQueen = lastRecord[6];
        game.whiteKing = lastRecord[7];
        game.whiteDragon = lastRecord[8];
        game.blackPawns = lastRecord[9];
        game.blackKnights = lastRecord[10];
        game.blackRooks = lastRecord[11];
        game.blackBishops = lastRecord[12];
        game.blackQueen = lastRecord[13];
        game.blackKing = lastRecord[14];
        game.blackDragon = lastRecord[15];
        game.turnNumber = lastRecord[0];
        game.sideToMove = lastRecord[1];
        game.turnComplete = false;
        game.pieceToMoveHexSelected = false;
        game.hexToMoveToSelected = false;
        game.selectedCellX = 15;
        game.selectedCellY = 40;
        game.selectedCelltoMovetoX = 15;
        game.selectedCelltoMovetoY = 40;
        game.oldX = 15;
        game.oldY = 40;
        game.pieceSelected = 'none';
        game.colourSelected = 'none';
        game.pieceTypeSelected = 'none';
        game.readyToMove = false;
        game.availableMovesForCurrentPiece = "";
        game.gameRecord.pop();
        board.drawBoard();
        game.setPieces();
        console.log("undo move pushed")
        return;
    }
}

function showBoard() {
    //game.getAllMovesForTurn(game.sideToMove);
    board.drawBoard();
}

function computerMoves() {
    if (game.gameOver == false) {

        game.colourSelected = game.sideToMove;
        game.allMovesAvailable_white = game.getAllMovesForTurn('w');
        game.allMovesAvailable_black = game.getAllMovesForTurn('b');
        //score dangerous moves
        if(game.sideToMove == 'w'){
           var allMovesAvailable = game.allMovesAvailable_white;
        }
        else{
           var allMovesAvailable = game.allMovesAvailable_black; 
        }
        
        
        var sortedList = allMovesAvailable.sort(function (a, b) {
            return a[3] < b[3] ? 1 : -1;
        })

        var max = sortedList[0][3];
        var min = sortedList[sortedList.length - 1][3];
        var filteredList = [];

        for (var i = 0; i < sortedList.length; i++) {
            if (sortedList[i][3] >= max) {
                filteredList.push(sortedList[i]);
            }
        }

        //random off
        if (true) {
            moveToMake = filteredList[Math.floor(Math.random() * filteredList.length)];
        } else {
            moveToMake = allMovesAvailable[Math.floor(Math.random() * allMovesAvailable.length)];
        }

        //make move
        //console.log(moveToMake[1]);
        var currentPosition = moveToMake[1].split(",");
        xPos = Number(currentPosition[0].replace("(", ""));
        yPos = Number(currentPosition[1].replace(")", ""));
        var newX = moveToMake[2][0];
        var newY = moveToMake[2][1];
        var pieceToMove = game.sideToMove + moveToMake[0];
        game.selectHex(xPos, yPos, 'blue');
        game.setPieceSelected(xPos, yPos);
        game.oldX = xPos;
        game.oldY = yPos;
        game.readyToMove = true;
        game.pieceToMoveHexSelected = true;
        game.movePiece(newX, newY, pieceToMove);

        //test if game won - if so exit and display winner
        if (game.isGameWon() == true || game.turnNumber > 400) {
            if (game.turnNumber >= 400) {
                game.winner = 'stalemate';
            }
            game.gameOver = true;
            displayWinnerMessage();

            //TODO - update game record with final move?
            return;
        }

        game.readyToMove = false;
        game.pieceToMoveHexSelected = false;
        game.changeSideToMove();
        game.resetAvailableMoves();
        game.oldX = 15;
        game.oldY = 40;
        board.drawBoard();
        game.setPieces();
        updateMessageBox(xPos, yPos);
    }

}

function setPlayerNumber() {
    //TODO
    if (game.computerPlayer == 'None') {
        game.computerPlayer = 'Auto';
        document.getElementById('btnNumberPlayers').innerHTML = "Auto Play Off";
    } else {
        game.computerPlayer = 'None';
        document.getElementById('btnNumberPlayers').innerHTML = "Auto Play On ";
    }

    return;
}

function mutate() {
    //TODO
    game.mutateParam();
    game.mutateParam_b();

    game.computerPlayer = 'Auto';
    document.getElementById('btnNumberPlayers').innerHTML = "Auto Play Off";

    return;
}




//add event listeners
//addEventListener('mousemove', getPos, false);
addEventListener('click', selectPiece, false);




function saveFile(winner) {
    console.log("Winner: ", winner);
    console.log("Turns:", game.turnNumber);
    console.log("Previous Score:", previousScore);
    
    
    console.log(param_early,
        previousWinner,
        numberOfWins,
        previousScore,
        param_early,
        param_late,
        param_capture_1,
        param_capture_2,
        param_capture_3,
        param_defend_1,
        param_defend_2,
        param_defend_3,
        param_flock_1,
        param_flock_2,
        param_flock_3);
    

    if (winner == 'White' && game.turnNumber <= previousScore) {
        var wins = numberOfWins +1;

        var saveStr = 'var previousWinner = ' + "'" + game.winner + "'" + ';' +
            'var numberOfGames = '
            'var numberOfWins = ' + wins + ';' +
            'var previousScore = ' + game.turnNumber + ';' +
            'var param_early = ' + param_early + ';' +
            'var param_late = ' + param_late + ';' +
            'var param_capture_1 = ' + param_capture_1 + ';' +
            'var param_capture_2 = ' + param_capture_2 + ';' +
            'var param_capture_3 = ' + param_capture_3 + ';' +
            'var param_defend_1 = ' + param_defend_1 + ';' +
            'var param_defend_2 = ' + param_defend_2 + ';' +
            'var param_defend_3 = ' + param_defend_3 + ';' +
            'var param_flock_1 = ' + param_flock_1 + ';' +
            'var param_flock_2 = ' + param_flock_2 + ';' +
            'var param_flock_3 = ' + param_flock_3 + ';' +
            'var pawn_1 = ' + pawn_1 + ';' +
            'var pawn_2 = ' + pawn_2 + ';' +
            'var pawn_3 = ' + pawn_3 + ';' +
            'var pawnPromo_1 = ' + pawnPromo_1 + ';' +
            'var pawnPromo_2 = ' + pawnPromo_2 + ';' +
            'var pawnPromo_3 = ' + pawnPromo_3 + ';' +
            'var knight_1 = ' + knight_1 + ';' +
            'var knight_2 = ' + knight_2 + ';' +
            'var knight_3 = ' + knight_3 + ';' +
            'var bishop_1 = ' + bishop_1 + ';' +
            'var bishop_2 = ' + bishop_2 + ';' +
            'var bishop_3 = ' + bishop_3 + ';' +
            'var rook_1 = ' + rook_1 + ';' +
            'var rook_2 = ' + rook_2 + ';' +
            'var rook_3 = ' + rook_3 + ';' +
            'var queen_1 = ' + queen_1 + ';' +
            'var queen_2 = ' + queen_2 + ';' +
            'var queen_3 = ' + queen_3 + ';' +
            'var dragon_1 = ' + dragon_1 + ';' +
            'var dragon_2 = ' + dragon_2 + ';' +
            'var dragon_3 = ' + dragon_3 + ';' +
            'var king_1 = ' + king_1 + ';' +
            'var king_2 = ' + king_2 + ';' +
            'var king_3 = ' + king_3 + ';' +
            'var kingCapture_1 = ' + kingCapture_1 + ';' +
            'var kingCapture_2 = ' + kingCapture_2 + ';' +
            'var kingCapture_3 = ' + kingCapture_3 + ';' +
            'var kingDefend_1 = ' + kingDefend_1 + ';' +
            'var kingDefend_2 = ' + kingDefend_2 + ';' +
            'var kingDefend_3 = ' + kingDefend_3 + ';' +
            'var param_avoidDanger_1 = ' + param_avoidDanger_1 + ';' +
            'var param_avoidDanger_2 = ' + param_avoidDanger_2 + ';' +
            'var param_avoidDanger_3 = ' + param_avoidDanger_3 + ';' +
            'var param_capture_1_time = ' + param_capture_1_time + ';' +
            'var param_capture_1_score = ' + param_capture_1_score + ';' +
            'var param_capture_2_time = ' + param_capture_2_time + ';' +
            'var param_capture_2_score = ' + param_capture_2_score + ';' +
            'var param_capture_3_time = ' + param_capture_3_time + ';' +
            'var param_capture_3_score = ' + param_capture_3_score + ';' +
            'var param_defend_1_time = ' + param_defend_1_time + ';' +
            'var param_defend_1_score = ' + param_defend_1_score + ';' +
            'var param_defend_2_time = ' + param_defend_2_time + ';' +
            'var param_defend_2_score = ' + param_defend_2_score + ';' +
            'var param_defend_3_time = ' + param_defend_3_time + ';' +
            'var param_defend_3_score = ' + param_defend_3_score + ';' +
            'var param_flock_1_time = ' + param_flock_1_time + ';' +
            'var param_flock_1_score = ' + param_flock_1_score + ';' +
            'var param_flock_2_time = ' + param_flock_2_time + ';' +
            'var param_flock_2_score = ' + param_flock_2_score + ';' +
            'var param_flock_3_time = ' + param_flock_3_time + ';' +
            'var param_flock_3_score = ' + param_flock_3_score + ';' +
            'var pawn_1_time = ' + pawn_1_time + ';' +
            'var pawn_1_score = ' + pawn_1_score + ';' +
            'var pawn_2_time = ' + pawn_2_time + ';' +
            'var pawn_2_score = ' + pawn_2_score + ';' +
            'var pawn_3_time = ' + pawn_3_time + ';' +
            'var pawn_3_score = ' + pawn_3_score + ';' +
            'var knight_1_time = ' + knight_1_time + ';' +
            'var knight_1_score = ' + knight_1_score + ';' +
            'var knight_2_time = ' + knight_2_time + ';' +
            'var knight_2_score = ' + knight_2_score + ';' +
            'var knight_3_time = ' + knight_3_time + ';' +
            'var knight_3_score = ' + knight_3_score + ';' +
            'var bishop_1_time = ' + bishop_1_time + ';' +
            'var bishop_1_score = ' + bishop_1_score + ';' +
            'var bishop_2_time = ' + bishop_2_time + ';' +
            'var bishop_2_score = ' + bishop_2_score + ';' +
            'var bishop_3_time = ' + bishop_3_time + ';' +
            'var bishop_3_score = ' + bishop_3_score + ';' +
            'var rook_1_time = ' + rook_1_time + ';' +
            'var rook_1_score = ' + rook_1_score + ';' +
            'var rook_2_time = ' + rook_2_time + ';' +
            'var rook_2_score = ' + rook_2_score + ';' +
            'var rook_3_time = ' + rook_3_time + ';' +
            'var rook_3_score = ' + rook_3_score + ';' +
            'var queen_1_time = ' + queen_1_time + ';' +
            'var queen_1_score = ' + queen_1_score + ';' +
            'var queen_2_time = ' + queen_2_time + ';' +
            'var queen_2_score = ' + queen_2_score + ';' +
            'var queen_3_time = ' + queen_3_time + ';' +
            'var queen_3_score = ' + queen_3_score + ';' +
            'var king_1_time = ' + king_1_time + ';' +
            'var king_1_score = ' + king_1_score + ';' +
            'var king_2_time = ' + king_2_time + ';' +
            'var king_2_score = ' + king_2_score + ';' +
            'var king_3_time = ' + king_3_time + ';' +
            'var king_3_score = ' + king_3_score + ';' +
            'var dragon_1_time = ' + dragon_1_time + ';' +
            'var dragon_1_score = ' + dragon_1_score + ';' +
            'var dragon_2_time = ' + dragon_2_time + ';' +
            'var dragon_2_score = ' + dragon_2_score + ';' +
            'var dragon_3_time = ' + dragon_3_time + ';' +
            'var dragon_3_score = ' + dragon_3_score + ';' +
            'var kingCapture_1_time = ' + kingCapture_1_time + ';' +
            'var kingCapture_1_score = ' + kingCapture_1_score + ';' +
            'var kingCapture_2_time = ' + kingCapture_2_time + ';' +
            'var kingCapture_2_score = ' + kingCapture_2_score + ';' +
            'var kingCapture_3_time = ' + kingCapture_3_time + ';' +
            'var kingCapture_3_score = ' + kingCapture_3_score + ';' +
            'var kingDefend_1_time = ' + kingDefend_1_time + ';' +
            'var kingDefend_1_score = ' + kingDefend_1_score + ';' +
            'var kingDefend_2_time = ' + kingDefend_2_time + ';' +
            'var kingDefend_2_score = ' + kingDefend_2_score + ';' +
            'var kingDefend_3_time = ' + kingDefend_3_time + ';' +
            'var kingDefend_3_score = ' + kingDefend_3_score + ';' +
            'var param_avoidDanger_1_time = ' + param_avoidDanger_1_time + ';' +
            'var param_avoidDanger_1_score = ' + param_avoidDanger_1_score + ';' +
            'var param_avoidDanger_2_time = ' + param_avoidDanger_2_time + ';' +
            'var param_avoidDanger_2_score = ' + param_avoidDanger_2_score + ';' +
            'var param_avoidDanger_3_time = ' + param_avoidDanger_3_time + ';' +
            'var param_avoidDanger_3_score = ' + param_avoidDanger_3_score + ';' +
            'var param_attack_1 = ' + param_attack_1 + ';' +
            'var param_attack_2 = ' + param_attack_2 + ';' +
            'var param_attack_3 = ' + param_attack_3 + ';' +
            'var param_attack_1_time = ' + param_attack_1_time + ';' +
            'var param_attack_1_score = ' + param_attack_1_score + ';' +
            'var param_attack_2_time = ' + param_attack_2_time + ';' +
            'var param_attack_2_score = ' + param_attack_2_score + ';' +
            'var param_attack_3_time = ' + param_attack_3_time + ';' +
            'var param_attack_3_score = ' + param_attack_3_score + ';' +
            'var dragonCapture_1 = ' + dragonCapture_1 + ';' +
            'var dragonCapture_2 = ' + dragonCapture_2 + ';' +
            'var dragonCapture_3 = ' + dragonCapture_3 + ';' +
            'var dragonDefend_1 = ' + dragonDefend_1 + ';' +
            'var dragonDefend_2 = ' + dragonDefend_2 + ';' +
            'var dragonDefend_3 = ' + dragonDefend_3 + ';' +
            'var dragonCapture_1_time = ' + dragonCapture_1_time + ';' +
            'var dragonCapture_1_score = ' + dragonCapture_1_score + ';' +
            'var dragonCapture_2_time = ' + dragonCapture_2_time + ';' +
            'var dragonCapture_2_score = ' + dragonCapture_2_score + ';' +
            'var dragonCapture_3_time = ' + dragonCapture_3_time + ';' +
            'var dragonCapture_3_score = ' + dragonCapture_3_score + ';' +
            'var dragonDefend_1_time = ' + dragonDefend_1_time + ';' +
            'var dragonDefend_1_score = ' + dragonDefend_1_score + ';' +
            'var dragonDefend_2_time = ' + dragonDefend_2_time + ';' +
            'var dragonDefend_2_score = ' + dragonDefend_2_score + ';' +
            'var dragonDefend_3_time = ' + dragonDefend_3_time + ';' +
            'var dragonDefend_3_score = ' + dragonDefend_3_score + ';' +
            'var pawnCapture_1 = ' + pawnCapture_1 + ';' +
            'var pawnCapture_2 = ' + pawnCapture_2 + ';' +
            'var pawnCapture_3 = ' + pawnCapture_3 + ';' +
            'var pawnCapture_1_time = ' + pawnCapture_1_time + ';' +
            'var pawnCapture_1_score = ' + pawnCapture_1_score + ';' +
            'var pawnCapture_2_time = ' + pawnCapture_2_time + ';' +
            'var pawnCapture_2_score = ' + pawnCapture_2_score + ';' +
            'var pawnCapture_3_time = ' + pawnCapture_3_time + ';' +
            'var pawnCapture_3_score = ' + pawnCapture_3_score + ';'

        download('parameterFile.txt', saveStr);

    }

//    if (winner == 'White' && game.turnNumber > previousScore) {
//        console.log('black save');
//
//        var saveStr = 'var previousWinner_b = ' + "'" + game.winner + "'" + ';' +
//            'var previousScore_b = ' + game.turnNumber + ';' +
//            'var param_early_b = ' + param_early_b + ';' +
//            'var param_late_b = ' + param_late_b + ';' +
//            'var param_capture_1_b = ' + param_capture_1_b + ';' +
//            'var param_capture_2_b = ' + param_capture_2_b + ';' +
//            'var param_capture_3_b = ' + param_capture_3_b + ';' +
//            'var param_defend_1_b = ' + param_defend_1_b + ';' +
//            'var param_defend_2_b = ' + param_defend_2_b + ';' +
//            'var param_defend_3_b = ' + param_defend_3_b + ';' +
//            'var param_flock_1_b = ' + param_flock_1_b + ';' +
//            'var param_flock_2_b = ' + param_flock_2_b + ';' +
//            'var param_flock_3_b = ' + param_flock_3_b + ';' +
//            'var pawn_1_b = ' + pawn_1_b + ';' +
//            'var pawn_2_b = ' + pawn_2_b + ';' +
//            'var pawn_3_b = ' + pawn_3_b + ';' +
//            'var pawnPromo_1_b = ' + pawnPromo_1_b + ';' +
//            'var pawnPromo_2_b = ' + pawnPromo_2_b + ';' +
//            'var pawnPromo_3_b = ' + pawnPromo_3_b + ';' +
//            'var knight_1_b = ' + knight_1_b + ';' +
//            'var knight_2_b = ' + knight_2_b + ';' +
//            'var knight_3_b = ' + knight_3_b + ';' +
//            'var bishop_1_b = ' + bishop_1_b + ';' +
//            'var bishop_2_b = ' + bishop_2_b + ';' +
//            'var bishop_3_b = ' + bishop_3_b + ';' +
//            'var rook_1_b = ' + rook_1_b + ';' +
//            'var rook_2_b = ' + rook_2_b + ';' +
//            'var rook_3_b = ' + rook_3_b + ';' +
//            'var queen_1_b = ' + queen_1_b + ';' +
//            'var queen_2_b = ' + queen_2_b + ';' +
//            'var queen_3_b = ' + queen_3_b + ';' +
//            'var dragon_1_b = ' + dragon_1_b + ';' +
//            'var dragon_2_b = ' + dragon_2_b + ';' +
//            'var dragon_3_b = ' + dragon_3_b + ';' +
//            'var king_1_b = ' + king_1_b + ';' +
//            'var king_2_b = ' + king_2_b + ';' +
//            'var king_3_b = ' + king_3_b + ';' +
//            'var kingCapture_1_b = ' + kingCapture_1_b + ';' +
//            'var kingCapture_2_b = ' + kingCapture_2_b + ';' +
//            'var kingCapture_3_b = ' + kingCapture_3_b + ';' +
//            'var kingDefend_1_b = ' + kingDefend_1_b + ';' +
//            'var kingDefend_2_b = ' + kingDefend_2_b + ';' +
//            'var kingDefend_3_b = ' + kingDefend_3_b + ';' +
//            'var param_avoidDanger_1_b = ' + param_avoidDanger_1_b + ';' +
//            'var param_avoidDanger_2_b = ' + param_avoidDanger_2_b + ';' +
//            'var param_avoidDanger_3_b = ' + param_avoidDanger_3_b + ';' +
//            'var param_capture_1_time_b = ' + param_capture_1_time_b + ';' +
//            'var param_capture_1_score_b = ' + param_capture_1_score_b + ';' +
//            'var param_capture_2_time_b = ' + param_capture_2_time_b + ';' +
//            'var param_capture_2_score_b = ' + param_capture_2_score_b + ';' +
//            'var param_capture_3_time_b = ' + param_capture_3_time_b + ';' +
//            'var param_capture_3_score_b = ' + param_capture_3_score_b + ';' +
//            'var param_defend_1_time_b = ' + param_defend_1_time_b + ';' +
//            'var param_defend_1_score_b = ' + param_defend_1_score_b + ';' +
//            'var param_defend_2_time_b = ' + param_defend_2_time_b + ';' +
//            'var param_defend_2_score_b = ' + param_defend_2_score_b + ';' +
//            'var param_defend_3_time_b = ' + param_defend_3_time_b + ';' +
//            'var param_defend_3_score_b = ' + param_defend_3_score_b + ';' +
//            'var param_flock_1_time_b = ' + param_flock_1_time_b + ';' +
//            'var param_flock_1_score_b = ' + param_flock_1_score_b + ';' +
//            'var param_flock_2_time_b = ' + param_flock_2_time_b + ';' +
//            'var param_flock_2_score_b = ' + param_flock_2_score_b + ';' +
//            'var param_flock_3_time_b = ' + param_flock_3_time_b + ';' +
//            'var param_flock_3_score_b = ' + param_flock_3_score_b + ';' +
//            'var pawn_1_time_b = ' + pawn_1_time_b + ';' +
//            'var pawn_1_score_b = ' + pawn_1_score_b + ';' +
//            'var pawn_2_time_b = ' + pawn_2_time_b + ';' +
//            'var pawn_2_score_b = ' + pawn_2_score_b + ';' +
//            'var pawn_3_time_b = ' + pawn_3_time_b + ';' +
//            'var pawn_3_score_b = ' + pawn_3_score_b + ';' +
//            'var knight_1_time_b = ' + knight_1_time_b + ';' +
//            'var knight_1_score_b = ' + knight_1_score_b + ';' +
//            'var knight_2_time_b = ' + knight_2_time_b + ';' +
//            'var knight_2_score_b = ' + knight_2_score_b + ';' +
//            'var knight_3_time_b = ' + knight_3_time_b + ';' +
//            'var knight_3_score_b = ' + knight_3_score_b + ';' +
//            'var bishop_1_time_b = ' + bishop_1_time_b + ';' +
//            'var bishop_1_score_b = ' + bishop_1_score_b + ';' +
//            'var bishop_2_time_b = ' + bishop_2_time_b + ';' +
//            'var bishop_2_score_b = ' + bishop_2_score_b + ';' +
//            'var bishop_3_time_b = ' + bishop_3_time_b + ';' +
//            'var bishop_3_score_b = ' + bishop_3_score_b + ';' +
//            'var rook_1_time_b = ' + rook_1_time_b + ';' +
//            'var rook_1_score_b = ' + rook_1_score_b + ';' +
//            'var rook_2_time_b = ' + rook_2_time_b + ';' +
//            'var rook_2_score_b = ' + rook_2_score_b + ';' +
//            'var rook_3_time_b = ' + rook_3_time_b + ';' +
//            'var rook_3_score_b = ' + rook_3_score_b + ';' +
//            'var queen_1_time_b = ' + queen_1_time_b + ';' +
//            'var queen_1_score_b = ' + queen_1_score_b + ';' +
//            'var queen_2_time_b = ' + queen_2_time_b + ';' +
//            'var queen_2_score_b = ' + queen_2_score_b + ';' +
//            'var queen_3_time_b = ' + queen_3_time_b + ';' +
//            'var queen_3_score_b = ' + queen_3_score_b + ';' +
//            'var king_1_time_b = ' + king_1_time_b + ';' +
//            'var king_1_score_b = ' + king_1_score_b + ';' +
//            'var king_2_time_b = ' + king_2_time_b + ';' +
//            'var king_2_score_b = ' + king_2_score_b + ';' +
//            'var king_3_time_b = ' + king_3_time_b + ';' +
//            'var king_3_score_b = ' + king_3_score_b + ';' +
//            'var dragon_1_time_b = ' + dragon_1_time_b + ';' +
//            'var dragon_1_score_b = ' + dragon_1_score_b + ';' +
//            'var dragon_2_time_b = ' + dragon_2_time_b + ';' +
//            'var dragon_2_score_b = ' + dragon_2_score_b + ';' +
//            'var dragon_3_time_b = ' + dragon_3_time_b + ';' +
//            'var dragon_3_score_b = ' + dragon_3_score_b + ';' +
//            'var kingCapture_1_time_b = ' + kingCapture_1_time_b + ';' +
//            'var kingCapture_1_score_b = ' + kingCapture_1_score_b + ';' +
//            'var kingCapture_2_time_b = ' + kingCapture_2_time_b + ';' +
//            'var kingCapture_2_score_b = ' + kingCapture_2_score_b + ';' +
//            'var kingCapture_3_time_b = ' + kingCapture_3_time_b + ';' +
//            'var kingCapture_3_score_b = ' + kingCapture_3_score_b + ';' +
//            'var kingDefend_1_time_b = ' + kingDefend_1_time_b + ';' +
//            'var kingDefend_1_score_b = ' + kingDefend_1_score_b + ';' +
//            'var kingDefend_2_time_b = ' + kingDefend_2_time_b + ';' +
//            'var kingDefend_2_score_b = ' + kingDefend_2_score + ';' +
//            'var kingDefend_3_time_b = ' + kingDefend_3_time_b + ';' +
//            'var kingDefend_3_score_b = ' + kingDefend_3_score_b + ';' +
//            'var param_avoidDanger_1_time_b = ' + param_avoidDanger_1_time_b + ';' +
//            'var param_avoidDanger_1_score_b = ' + param_avoidDanger_1_score_b + ';' +
//            'var param_avoidDanger_2_time_b = ' + param_avoidDanger_2_time_b + ';' +
//            'var param_avoidDanger_2_score_b = ' + param_avoidDanger_2_score_b + ';' +
//            'var param_avoidDanger_3_time_b = ' + param_avoidDanger_3_time_b + ';' +
//            'var param_avoidDanger_3_score_b = ' + param_avoidDanger_3_score + ';' +
//            'var param_attack_1_b = ' + param_attack_1_b + ';' +
//            'var param_attack_2_b = ' + param_attack_2_b + ';' +
//            'var param_attack_3_b = ' + param_attack_3_b + ';' +
//            'var param_attack_1_time_b = ' + param_attack_1_time_b + ';' +
//            'var param_attack_1_score_b = ' + param_attack_1_score_b + ';' +
//            'var param_attack_2_time_b = ' + param_attack_2_time_b + ';' +
//            'var param_attack_2_score_b = ' + param_attack_2_score_b + ';' +
//            'var param_attack_3_time_b = ' + param_attack_3_time_b + ';' +
//            'var param_attack_3_score_b = ' + param_attack_3_score_b + ';' +
//            'var dragonCapture_1_b = ' + dragonCapture_1_b + ';' +
//            'var dragonCapture_2_b = ' + dragonCapture_2_b + ';' +
//            'var dragonCapture_3_b = ' + dragonCapture_3_b + ';' +
//            'var dragonDefend_1_b = ' + dragonDefend_1_b + ';' +
//            'var dragonDefend_2_b = ' + dragonDefend_2_b + ';' +
//            'var dragonDefend_3_b = ' + dragonDefend_3_b + ';' +
//            'var dragonCapture_1_time_b = ' + dragonCapture_1_time_b + ';' +
//            'var dragonCapture_1_score_b = ' + dragonCapture_1_score_b + ';' +
//            'var dragonCapture_2_time_b = ' + dragonCapture_2_time_b + ';' +
//            'var dragonCapture_2_score_b = ' + dragonCapture_2_score_b + ';' +
//            'var dragonCapture_3_time_b = ' + dragonCapture_3_time_b + ';' +
//            'var dragonCapture_3_score_b = ' + dragonCapture_3_score_b + ';' +
//            'var dragonDefend_1_time_b = ' + dragonDefend_1_time_b + ';' +
//            'var dragonDefend_1_score_b = ' + dragonDefend_1_score_b + ';' +
//            'var dragonDefend_2_time_b = ' + dragonDefend_2_time_b + ';' +
//            'var dragonDefend_2_score_b = ' + dragonDefend_2_score + ';' +
//            'var dragonDefend_3_time_b = ' + dragonDefend_3_time_b + ';' +
//            'var dragonDefend_3_score_b = ' + dragonDefend_3_score_b + ';' +
//            'var pawnCapture_1_b = ' + pawnCapture_1_b + ';' +
//            'var pawnCapture_2_b = ' + pawnCapture_2_b + ';' +
//            'var pawnCapture_3_b = ' + pawnCapture_3_b + ';' +
//            'var pawnCapture_1_time_b = ' + pawnCapture_1_time_b + ';' +
//            'var pawnCapture_1_score_b = ' + pawnCapture_1_score_b + ';' +
//            'var pawnCapture_2_time_b = ' + pawnCapture_2_time_b + ';' +
//            'var pawnCapture_2_score_b = ' + pawnCapture_2_score_b + ';' +
//            'var pawnCapture_3_time_b = ' + pawnCapture_3_time_b + ';' +
//            'var pawnCapture_3_score_b = ' + pawnCapture_3_score_b + ';'
//
//        download('parameterFile_b.txt', saveStr);
//
//    }

    if (winner == 'Black' && game.turnNumber <= previousScore_b) {
        var wins = numberOfWins_b +1
        
        

        var saveStr = 'var previousWinner_b = ' + "'" + game.winner + "'" + ';' +
            'var numberOfWins_b = ' + wins + ';' +
            'var previousScore_b = ' + game.turnNumber + ';' +
            'var param_early_b = ' + param_early_b + ';' +
            'var param_late_b = ' + param_late_b + ';' +
            'var param_capture_1_b = ' + param_capture_1_b + ';' +
            'var param_capture_2_b = ' + param_capture_2_b + ';' +
            'var param_capture_3_b = ' + param_capture_3_b + ';' +
            'var param_defend_1_b = ' + param_defend_1_b + ';' +
            'var param_defend_2_b = ' + param_defend_2_b + ';' +
            'var param_defend_3_b = ' + param_defend_3_b + ';' +
            'var param_flock_1_b = ' + param_flock_1_b + ';' +
            'var param_flock_2_b = ' + param_flock_2_b + ';' +
            'var param_flock_3_b = ' + param_flock_3_b + ';' +
            'var pawn_1_b = ' + pawn_1_b + ';' +
            'var pawn_2_b = ' + pawn_2_b + ';' +
            'var pawn_3_b = ' + pawn_3_b + ';' +
            'var pawnPromo_1_b = ' + pawnPromo_1_b + ';' +
            'var pawnPromo_2_b = ' + pawnPromo_2_b + ';' +
            'var pawnPromo_3_b = ' + pawnPromo_3_b + ';' +
            'var knight_1_b = ' + knight_1_b + ';' +
            'var knight_2_b = ' + knight_2_b + ';' +
            'var knight_3_b = ' + knight_3_b + ';' +
            'var bishop_1_b = ' + bishop_1_b + ';' +
            'var bishop_2_b = ' + bishop_2_b + ';' +
            'var bishop_3_b = ' + bishop_3_b + ';' +
            'var rook_1_b = ' + rook_1_b + ';' +
            'var rook_2_b = ' + rook_2_b + ';' +
            'var rook_3_b = ' + rook_3_b + ';' +
            'var queen_1_b = ' + queen_1_b + ';' +
            'var queen_2_b = ' + queen_2_b + ';' +
            'var queen_3_b = ' + queen_3_b + ';' +
            'var dragon_1_b = ' + dragon_1_b + ';' +
            'var dragon_2_b = ' + dragon_2_b + ';' +
            'var dragon_3_b = ' + dragon_3_b + ';' +
            'var king_1_b = ' + king_1_b + ';' +
            'var king_2_b = ' + king_2_b + ';' +
            'var king_3_b = ' + king_3_b + ';' +
            'var kingCapture_1_b = ' + kingCapture_1_b + ';' +
            'var kingCapture_2_b = ' + kingCapture_2_b + ';' +
            'var kingCapture_3_b = ' + kingCapture_3_b + ';' +
            'var kingDefend_1_b = ' + kingDefend_1_b + ';' +
            'var kingDefend_2_b = ' + kingDefend_2_b + ';' +
            'var kingDefend_3_b = ' + kingDefend_3_b + ';' +
            'var param_avoidDanger_1_b = ' + param_avoidDanger_1_b + ';' +
            'var param_avoidDanger_2_b = ' + param_avoidDanger_2_b + ';' +
            'var param_avoidDanger_3_b = ' + param_avoidDanger_3_b + ';' +
            'var param_capture_1_time_b = ' + param_capture_1_time_b + ';' +
            'var param_capture_1_score_b = ' + param_capture_1_score_b + ';' +
            'var param_capture_2_time_b = ' + param_capture_2_time_b + ';' +
            'var param_capture_2_score_b = ' + param_capture_2_score_b + ';' +
            'var param_capture_3_time_b = ' + param_capture_3_time_b + ';' +
            'var param_capture_3_score_b = ' + param_capture_3_score_b + ';' +
            'var param_defend_1_time_b = ' + param_defend_1_time_b + ';' +
            'var param_defend_1_score_b = ' + param_defend_1_score_b + ';' +
            'var param_defend_2_time_b = ' + param_defend_2_time_b + ';' +
            'var param_defend_2_score_b = ' + param_defend_2_score_b + ';' +
            'var param_defend_3_time_b = ' + param_defend_3_time_b + ';' +
            'var param_defend_3_score_b = ' + param_defend_3_score_b + ';' +
            'var param_flock_1_time_b = ' + param_flock_1_time_b + ';' +
            'var param_flock_1_score_b = ' + param_flock_1_score_b + ';' +
            'var param_flock_2_time_b = ' + param_flock_2_time_b + ';' +
            'var param_flock_2_score_b = ' + param_flock_2_score_b + ';' +
            'var param_flock_3_time_b = ' + param_flock_3_time_b + ';' +
            'var param_flock_3_score_b = ' + param_flock_3_score_b + ';' +
            'var pawn_1_time_b = ' + pawn_1_time_b + ';' +
            'var pawn_1_score_b = ' + pawn_1_score_b + ';' +
            'var pawn_2_time_b = ' + pawn_2_time_b + ';' +
            'var pawn_2_score_b = ' + pawn_2_score_b + ';' +
            'var pawn_3_time_b = ' + pawn_3_time_b + ';' +
            'var pawn_3_score_b = ' + pawn_3_score_b + ';' +
            'var knight_1_time_b = ' + knight_1_time_b + ';' +
            'var knight_1_score_b = ' + knight_1_score_b + ';' +
            'var knight_2_time_b = ' + knight_2_time_b + ';' +
            'var knight_2_score_b = ' + knight_2_score_b + ';' +
            'var knight_3_time_b = ' + knight_3_time_b + ';' +
            'var knight_3_score_b = ' + knight_3_score_b + ';' +
            'var bishop_1_time_b = ' + bishop_1_time_b + ';' +
            'var bishop_1_score_b = ' + bishop_1_score_b + ';' +
            'var bishop_2_time_b = ' + bishop_2_time_b + ';' +
            'var bishop_2_score_b = ' + bishop_2_score_b + ';' +
            'var bishop_3_time_b = ' + bishop_3_time_b + ';' +
            'var bishop_3_score_b = ' + bishop_3_score_b + ';' +
            'var rook_1_time_b = ' + rook_1_time_b + ';' +
            'var rook_1_score_b = ' + rook_1_score_b + ';' +
            'var rook_2_time_b = ' + rook_2_time_b + ';' +
            'var rook_2_score_b = ' + rook_2_score_b + ';' +
            'var rook_3_time_b = ' + rook_3_time_b + ';' +
            'var rook_3_score_b = ' + rook_3_score_b + ';' +
            'var queen_1_time_b = ' + queen_1_time_b + ';' +
            'var queen_1_score_b = ' + queen_1_score_b + ';' +
            'var queen_2_time_b = ' + queen_2_time_b + ';' +
            'var queen_2_score_b = ' + queen_2_score_b + ';' +
            'var queen_3_time_b = ' + queen_3_time_b + ';' +
            'var queen_3_score_b = ' + queen_3_score_b + ';' +
            'var king_1_time_b = ' + king_1_time_b + ';' +
            'var king_1_score_b = ' + king_1_score_b + ';' +
            'var king_2_time_b = ' + king_2_time_b + ';' +
            'var king_2_score_b = ' + king_2_score_b + ';' +
            'var king_3_time_b = ' + king_3_time_b + ';' +
            'var king_3_score_b = ' + king_3_score_b + ';' +
            'var dragon_1_time_b = ' + dragon_1_time_b + ';' +
            'var dragon_1_score_b = ' + dragon_1_score_b + ';' +
            'var dragon_2_time_b = ' + dragon_2_time_b + ';' +
            'var dragon_2_score_b = ' + dragon_2_score_b + ';' +
            'var dragon_3_time_b = ' + dragon_3_time_b + ';' +
            'var dragon_3_score_b = ' + dragon_3_score_b + ';' +
            'var kingCapture_1_time_b = ' + kingCapture_1_time_b + ';' +
            'var kingCapture_1_score_b = ' + kingCapture_1_score_b + ';' +
            'var kingCapture_2_time_b = ' + kingCapture_2_time_b + ';' +
            'var kingCapture_2_score_b = ' + kingCapture_2_score_b + ';' +
            'var kingCapture_3_time_b = ' + kingCapture_3_time_b + ';' +
            'var kingCapture_3_score_b = ' + kingCapture_3_score_b + ';' +
            'var kingDefend_1_time_b = ' + kingDefend_1_time_b + ';' +
            'var kingDefend_1_score_b = ' + kingDefend_1_score_b + ';' +
            'var kingDefend_2_time_b = ' + kingDefend_2_time_b + ';' +
            'var kingDefend_2_score_b = ' + kingDefend_2_score + ';' +
            'var kingDefend_3_time_b = ' + kingDefend_3_time_b + ';' +
            'var kingDefend_3_score_b = ' + kingDefend_3_score_b + ';' +
            'var param_avoidDanger_1_time_b = ' + param_avoidDanger_1_time_b + ';' +
            'var param_avoidDanger_1_score_b = ' + param_avoidDanger_1_score_b + ';' +
            'var param_avoidDanger_2_time_b = ' + param_avoidDanger_2_time_b + ';' +
            'var param_avoidDanger_2_score_b = ' + param_avoidDanger_2_score_b + ';' +
            'var param_avoidDanger_3_time_b = ' + param_avoidDanger_3_time_b + ';' +
            'var param_avoidDanger_3_score_b = ' + param_avoidDanger_3_score + ';' +
            'var param_attack_1_b = ' + param_attack_1_b + ';' +
            'var param_attack_2_b = ' + param_attack_2_b + ';' +
            'var param_attack_3_b = ' + param_attack_3_b + ';' +
            'var param_attack_1_time_b = ' + param_attack_1_time_b + ';' +
            'var param_attack_1_score_b = ' + param_attack_1_score_b + ';' +
            'var param_attack_2_time_b = ' + param_attack_2_time_b + ';' +
            'var param_attack_2_score_b = ' + param_attack_2_score_b + ';' +
            'var param_attack_3_time_b = ' + param_attack_3_time_b + ';' +
            'var param_attack_3_score_b = ' + param_attack_3_score_b + ';' +
            'var dragonCapture_1_b = ' + dragonCapture_1_b + ';' +
            'var dragonCapture_2_b = ' + dragonCapture_2_b + ';' +
            'var dragonCapture_3_b = ' + dragonCapture_3_b + ';' +
            'var dragonDefend_1_b = ' + dragonDefend_1_b + ';' +
            'var dragonDefend_2_b = ' + dragonDefend_2_b + ';' +
            'var dragonDefend_3_b = ' + dragonDefend_3_b + ';' +
            'var dragonCapture_1_time_b = ' + dragonCapture_1_time_b + ';' +
            'var dragonCapture_1_score_b = ' + dragonCapture_1_score_b + ';' +
            'var dragonCapture_2_time_b = ' + dragonCapture_2_time_b + ';' +
            'var dragonCapture_2_score_b = ' + dragonCapture_2_score_b + ';' +
            'var dragonCapture_3_time_b = ' + dragonCapture_3_time_b + ';' +
            'var dragonCapture_3_score_b = ' + dragonCapture_3_score_b + ';' +
            'var dragonDefend_1_time_b = ' + dragonDefend_1_time_b + ';' +
            'var dragonDefend_1_score_b = ' + dragonDefend_1_score_b + ';' +
            'var dragonDefend_2_time_b = ' + dragonDefend_2_time_b + ';' +
            'var dragonDefend_2_score_b = ' + dragonDefend_2_score + ';' +
            'var dragonDefend_3_time_b = ' + dragonDefend_3_time_b + ';' +
            'var dragonDefend_3_score_b = ' + dragonDefend_3_score_b + ';' +
            'var pawnCapture_1_b = ' + pawnCapture_1_b + ';' +
            'var pawnCapture_2_b = ' + pawnCapture_2_b + ';' +
            'var pawnCapture_3_b = ' + pawnCapture_3_b + ';' +
            'var pawnCapture_1_time_b = ' + pawnCapture_1_time_b + ';' +
            'var pawnCapture_1_score_b = ' + pawnCapture_1_score_b + ';' +
            'var pawnCapture_2_time_b = ' + pawnCapture_2_time_b + ';' +
            'var pawnCapture_2_score_b = ' + pawnCapture_2_score_b + ';' +
            'var pawnCapture_3_time_b = ' + pawnCapture_3_time_b + ';' +
            'var pawnCapture_3_score_b = ' + pawnCapture_3_score_b + ';'

        download('parameterFile_b.txt', saveStr);
    }

//    if (winner == 'Black' && game.turnNumber > previousScore_b) {
//
//        var saveStr = 'var previousWinner = ' + "'" + game.winner + "'" + ';' +
//            'var previousScore = ' + game.turnNumber + ';' +
//            'var param_early = ' + param_early + ';' +
//            'var param_late = ' + param_late + ';' +
//            'var param_capture_1 = ' + param_capture_1 + ';' +
//            'var param_capture_2 = ' + param_capture_2 + ';' +
//            'var param_capture_3 = ' + param_capture_3 + ';' +
//            'var param_defend_1 = ' + param_defend_1 + ';' +
//            'var param_defend_2 = ' + param_defend_2 + ';' +
//            'var param_defend_3 = ' + param_defend_3 + ';' +
//            'var param_flock_1 = ' + param_flock_1 + ';' +
//            'var param_flock_2 = ' + param_flock_2 + ';' +
//            'var param_flock_3 = ' + param_flock_3 + ';' +
//            'var pawn_1 = ' + pawn_1 + ';' +
//            'var pawn_2 = ' + pawn_2 + ';' +
//            'var pawn_3 = ' + pawn_3 + ';' +
//            'var pawnPromo_1 = ' + pawnPromo_1 + ';' +
//            'var pawnPromo_2 = ' + pawnPromo_2 + ';' +
//            'var pawnPromo_3 = ' + pawnPromo_3 + ';' +
//            'var knight_1 = ' + knight_1 + ';' +
//            'var knight_2 = ' + knight_2 + ';' +
//            'var knight_3 = ' + knight_3 + ';' +
//            'var bishop_1 = ' + bishop_1 + ';' +
//            'var bishop_2 = ' + bishop_2 + ';' +
//            'var bishop_3 = ' + bishop_3 + ';' +
//            'var rook_1 = ' + rook_1 + ';' +
//            'var rook_2 = ' + rook_2 + ';' +
//            'var rook_3 = ' + rook_3 + ';' +
//            'var queen_1 = ' + queen_1 + ';' +
//            'var queen_2 = ' + queen_2 + ';' +
//            'var queen_3 = ' + queen_3 + ';' +
//            'var dragon_1 = ' + dragon_1 + ';' +
//            'var dragon_2 = ' + dragon_2 + ';' +
//            'var dragon_3 = ' + dragon_3 + ';' +
//            'var king_1 = ' + king_1 + ';' +
//            'var king_2 = ' + king_2 + ';' +
//            'var king_3 = ' + king_3 + ';' +
//            'var kingCapture_1 = ' + kingCapture_1 + ';' +
//            'var kingCapture_2 = ' + kingCapture_2 + ';' +
//            'var kingCapture_3 = ' + kingCapture_3 + ';' +
//            'var kingDefend_1 = ' + kingDefend_1 + ';' +
//            'var kingDefend_2 = ' + kingDefend_2 + ';' +
//            'var kingDefend_3 = ' + kingDefend_3 + ';' +
//            'var param_avoidDanger_1 = ' + param_avoidDanger_1 + ';' +
//            'var param_avoidDanger_2 = ' + param_avoidDanger_2 + ';' +
//            'var param_avoidDanger_3 = ' + param_avoidDanger_3 + ';' +
//            'var param_capture_1_time = ' + param_capture_1_time + ';' +
//            'var param_capture_1_score = ' + param_capture_1_score + ';' +
//            'var param_capture_2_time = ' + param_capture_2_time + ';' +
//            'var param_capture_2_score = ' + param_capture_2_score + ';' +
//            'var param_capture_3_time = ' + param_capture_3_time + ';' +
//            'var param_capture_3_score = ' + param_capture_3_score + ';' +
//            'var param_defend_1_time = ' + param_defend_1_time + ';' +
//            'var param_defend_1_score = ' + param_defend_1_score + ';' +
//            'var param_defend_2_time = ' + param_defend_2_time + ';' +
//            'var param_defend_2_score = ' + param_defend_2_score + ';' +
//            'var param_defend_3_time = ' + param_defend_3_time + ';' +
//            'var param_defend_3_score = ' + param_defend_3_score + ';' +
//            'var param_flock_1_time = ' + param_flock_1_time + ';' +
//            'var param_flock_1_score = ' + param_flock_1_score + ';' +
//            'var param_flock_2_time = ' + param_flock_2_time + ';' +
//            'var param_flock_2_score = ' + param_flock_2_score + ';' +
//            'var param_flock_3_time = ' + param_flock_3_time + ';' +
//            'var param_flock_3_score = ' + param_flock_3_score + ';' +
//            'var pawn_1_time = ' + pawn_1_time + ';' +
//            'var pawn_1_score = ' + pawn_1_score + ';' +
//            'var pawn_2_time = ' + pawn_2_time + ';' +
//            'var pawn_2_score = ' + pawn_2_score + ';' +
//            'var pawn_3_time = ' + pawn_3_time + ';' +
//            'var pawn_3_score = ' + pawn_3_score + ';' +
//            'var knight_1_time = ' + knight_1_time + ';' +
//            'var knight_1_score = ' + knight_1_score + ';' +
//            'var knight_2_time = ' + knight_2_time + ';' +
//            'var knight_2_score = ' + knight_2_score + ';' +
//            'var knight_3_time = ' + knight_3_time + ';' +
//            'var knight_3_score = ' + knight_3_score + ';' +
//            'var bishop_1_time = ' + bishop_1_time + ';' +
//            'var bishop_1_score = ' + bishop_1_score + ';' +
//            'var bishop_2_time = ' + bishop_2_time + ';' +
//            'var bishop_2_score = ' + bishop_2_score + ';' +
//            'var bishop_3_time = ' + bishop_3_time + ';' +
//            'var bishop_3_score = ' + bishop_3_score + ';' +
//            'var rook_1_time = ' + rook_1_time + ';' +
//            'var rook_1_score = ' + rook_1_score + ';' +
//            'var rook_2_time = ' + rook_2_time + ';' +
//            'var rook_2_score = ' + rook_2_score + ';' +
//            'var rook_3_time = ' + rook_3_time + ';' +
//            'var rook_3_score = ' + rook_3_score + ';' +
//            'var queen_1_time = ' + queen_1_time + ';' +
//            'var queen_1_score = ' + queen_1_score + ';' +
//            'var queen_2_time = ' + queen_2_time + ';' +
//            'var queen_2_score = ' + queen_2_score + ';' +
//            'var queen_3_time = ' + queen_3_time + ';' +
//            'var queen_3_score = ' + queen_3_score + ';' +
//            'var king_1_time = ' + king_1_time + ';' +
//            'var king_1_score = ' + king_1_score + ';' +
//            'var king_2_time = ' + king_2_time + ';' +
//            'var king_2_score = ' + king_2_score + ';' +
//            'var king_3_time = ' + king_3_time + ';' +
//            'var king_3_score = ' + king_3_score + ';' +
//            'var dragon_1_time = ' + dragon_1_time + ';' +
//            'var dragon_1_score = ' + dragon_1_score + ';' +
//            'var dragon_2_time = ' + dragon_2_time + ';' +
//            'var dragon_2_score = ' + dragon_2_score + ';' +
//            'var dragon_3_time = ' + dragon_3_time + ';' +
//            'var dragon_3_score = ' + dragon_3_score + ';' +
//            'var kingCapture_1_time = ' + kingCapture_1_time + ';' +
//            'var kingCapture_1_score = ' + kingCapture_1_score + ';' +
//            'var kingCapture_2_time = ' + kingCapture_2_time + ';' +
//            'var kingCapture_2_score = ' + kingCapture_2_score + ';' +
//            'var kingCapture_3_time = ' + kingCapture_3_time + ';' +
//            'var kingCapture_3_score = ' + kingCapture_3_score + ';' +
//            'var kingDefend_1_time = ' + kingDefend_1_time + ';' +
//            'var kingDefend_1_score = ' + kingDefend_1_score + ';' +
//            'var kingDefend_2_time = ' + kingDefend_2_time + ';' +
//            'var kingDefend_2_score = ' + kingDefend_2_score + ';' +
//            'var kingDefend_3_time = ' + kingDefend_3_time + ';' +
//            'var kingDefend_3_score = ' + kingDefend_3_score + ';' +
//            'var param_avoidDanger_1_time = ' + param_avoidDanger_1_time + ';' +
//            'var param_avoidDanger_1_score = ' + param_avoidDanger_1_score + ';' +
//            'var param_avoidDanger_2_time = ' + param_avoidDanger_2_time + ';' +
//            'var param_avoidDanger_2_score = ' + param_avoidDanger_2_score + ';' +
//            'var param_avoidDanger_3_time = ' + param_avoidDanger_3_time + ';' +
//            'var param_avoidDanger_3_score = ' + param_avoidDanger_3_score + ';' +
//            'var param_attack_1 = ' + param_attack_1 + ';' +
//            'var param_attack_2 = ' + param_attack_2 + ';' +
//            'var param_attack_3 = ' + param_attack_3 + ';' +
//            'var param_attack_1_time = ' + param_attack_1_time + ';' +
//            'var param_attack_1_score = ' + param_attack_1_score + ';' +
//            'var param_attack_2_time = ' + param_attack_2_time + ';' +
//            'var param_attack_2_score = ' + param_attack_2_score + ';' +
//            'var param_attack_3_time = ' + param_attack_3_time + ';' +
//            'var param_attack_3_score = ' + param_attack_3_score + ';' +
//            'var dragonCapture_1 = ' + dragonCapture_1 + ';' +
//            'var dragonCapture_2 = ' + dragonCapture_2 + ';' +
//            'var dragonCapture_3 = ' + dragonCapture_3 + ';' +
//            'var dragonDefend_1 = ' + dragonDefend_1 + ';' +
//            'var dragonDefend_2 = ' + dragonDefend_2 + ';' +
//            'var dragonDefend_3 = ' + dragonDefend_3 + ';' +
//            'var dragonCapture_1_time = ' + dragonCapture_1_time + ';' +
//            'var dragonCapture_1_score = ' + dragonCapture_1_score + ';' +
//            'var dragonCapture_2_time = ' + dragonCapture_2_time + ';' +
//            'var dragonCapture_2_score = ' + dragonCapture_2_score + ';' +
//            'var dragonCapture_3_time = ' + dragonCapture_3_time + ';' +
//            'var dragonCapture_3_score = ' + dragonCapture_3_score + ';' +
//            'var dragonDefend_1_time = ' + dragonDefend_1_time + ';' +
//            'var dragonDefend_1_score = ' + dragonDefend_1_score + ';' +
//            'var dragonDefend_2_time = ' + dragonDefend_2_time + ';' +
//            'var dragonDefend_2_score = ' + dragonDefend_2_score + ';' +
//            'var dragonDefend_3_time = ' + dragonDefend_3_time + ';' +
//            'var dragonDefend_3_score = ' + dragonDefend_3_score + ';' +
//            'var pawnCapture_1 = ' + pawnCapture_1 + ';' +
//            'var pawnCapture_2 = ' + pawnCapture_2 + ';' +
//            'var pawnCapture_3 = ' + pawnCapture_3 + ';' +
//            'var pawnCapture_1_time = ' + pawnCapture_1_time + ';' +
//            'var pawnCapture_1_score = ' + pawnCapture_1_score + ';' +
//            'var pawnCapture_2_time = ' + pawnCapture_2_time + ';' +
//            'var pawnCapture_2_score = ' + pawnCapture_2_score + ';' +
//            'var pawnCapture_3_time = ' + pawnCapture_3_time + ';' +
//            'var pawnCapture_3_score = ' + pawnCapture_3_score + ';'
//
//        download('parameterFile.txt', saveStr);
//
//    }

}

//function loadFile() {
//    loadScript('http://127.0.0.1:8887/parameterFile.txt');
//}
//
//download function
function download(filename, text) {
    var pom = document.createElement('a');
    pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    pom.setAttribute('download', filename);

    if (document.createEvent) {
        var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    } else {
        pom.click();
    }
}

//TODO

function loadScript(url) {
    var head = document.getElementsByTagName('head')[0];
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    head.appendChild(script);
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


function getPoints() {
    console.log("black Points remaining: ", game.getPointTotal('b'));
    console.log("white Points remaining: ", game.getPointTotal('w'));

}


function resetParamFiles(){
    //TODO
            var saveStr1 = 'var previousWinner = ' + "'" + 'None' + "'" + ';' +
            'var numberOfWins = ' + 0 + ';' +
            'var previousScore = ' + 10000 + ';' +
            'var param_early = ' + 50+ ';' +
            'var param_late = ' + 100 + ';' +
            'var param_capture_1 = ' + 0 + ';' +
            'var param_capture_2 = ' + 0 + ';' +
            'var param_capture_3 = ' + 0+ ';' +
            'var param_defend_1 = ' + 0 + ';' +
            'var param_defend_2 = ' + 0 + ';' +
            'var param_defend_3 = ' + 0+ ';' +
            'var param_flock_1 = ' + 0 + ';' +
            'var param_flock_2 = ' + 0 + ';' +
            'var param_flock_3 = ' + 0 + ';' +
            'var pawn_1 = ' + 0 + ';' +
            'var pawn_2 = ' + 0 + ';' +
            'var pawn_3 = ' + 0 + ';' +
            'var pawnPromo_1 = ' + 0 + ';' +
            'var pawnPromo_2 = ' + 0+ ';' +
            'var pawnPromo_3 = ' + 0 + ';' +
            'var knight_1 = ' + 0 + ';' +
            'var knight_2 = ' + 0 + ';' +
            'var knight_3 = ' + 0 + ';' +
            'var bishop_1 = ' + 0+ ';' +
            'var bishop_2 = ' + 0 + ';' +
            'var bishop_3 = ' + 0 + ';' +
            'var rook_1 = ' + 0 + ';' +
            'var rook_2 = ' + 0+ ';' +
            'var rook_3 = ' + 0 + ';' +
            'var queen_1 = ' + 0 + ';' +
            'var queen_2 = ' + 0 + ';' +
            'var queen_3 = ' + 0 + ';' +
            'var dragon_1 = ' + 0 + ';' +
            'var dragon_2 = ' + 0 + ';' +
            'var dragon_3 = ' + 0+ ';' +
            'var king_1 = ' + 0 + ';' +
            'var king_2 = ' + 0 + ';' +
            'var king_3 = ' + 0 + ';' +
            'var kingCapture_1 = ' + 0 + ';' +
            'var kingCapture_2 = ' + 0+ ';' +
            'var kingCapture_3 = ' + 0 + ';' +
            'var kingDefend_1 = ' + 0 + ';' +
            'var kingDefend_2 = ' + 0 + ';' +
            'var kingDefend_3 = ' + 0 + ';' +
            'var param_avoidDanger_1 = ' + 0 + ';' +
            'var param_avoidDanger_2 = ' + 0 + ';' +
            'var param_avoidDanger_3 = ' + 0 + ';' +
            'var param_capture_1_time = ' + 0 + ';' +
            'var param_capture_1_score = ' + 0 + ';' +
            'var param_capture_2_time = ' + 0 + ';' +
            'var param_capture_2_score = ' + 0 + ';' +
            'var param_capture_3_time = ' + 0 + ';' +
            'var param_capture_3_score = ' + 0 + ';' +
            'var param_defend_1_time = ' + 0 + ';' +
            'var param_defend_1_score = ' + 0 + ';' +
            'var param_defend_2_time = ' + 0 + ';' +
            'var param_defend_2_score = ' + 0 + ';' +
            'var param_defend_3_time = ' + 0 + ';' +
            'var param_defend_3_score = ' + 0 + ';' +
            'var param_flock_1_time = ' + 0 + ';' +
            'var param_flock_1_score = ' + 0 + ';' +
            'var param_flock_2_time = ' + 0+ ';' +
            'var param_flock_2_score = ' + 0 + ';' +
            'var param_flock_3_time = ' + 0 + ';' +
            'var param_flock_3_score = ' + 0 + ';' +
            'var pawn_1_time = ' + 0 + ';' +
            'var pawn_1_score = ' + 0 + ';' +
            'var pawn_2_time = ' + 0 + ';' +
            'var pawn_2_score = ' + 0 + ';' +
            'var pawn_3_time = ' + 0 + ';' +
            'var pawn_3_score = ' + 0 + ';' +
            'var knight_1_time = ' + 0 + ';' +
            'var knight_1_score = ' + 0 + ';' +
            'var knight_2_time = ' + 0 + ';' +
            'var knight_2_score = ' + 0 + ';' +
            'var knight_3_time = ' + 0 + ';' +
            'var knight_3_score = ' + 0 + ';' +
            'var bishop_1_time = ' + 0 + ';' +
            'var bishop_1_score = ' + 0 + ';' +
            'var bishop_2_time = ' + 0 + ';' +
            'var bishop_2_score = ' + 0 + ';' +
            'var bishop_3_time = ' + 0 + ';' +
            'var bishop_3_score = ' + 0 + ';' +
            'var rook_1_time = ' + 0 + ';' +
            'var rook_1_score = ' + 0 + ';' +
            'var rook_2_time = ' + 0 + ';' +
            'var rook_2_score = ' + 0 + ';' +
            'var rook_3_time = ' + 0 + ';' +
            'var rook_3_score = ' + 0 + ';' +
            'var queen_1_time = ' + 0 + ';' +
            'var queen_1_score = ' + 0 + ';' +
            'var queen_2_time = ' + 0 + ';' +
            'var queen_2_score = ' + 0 + ';' +
            'var queen_3_time = ' + 0 + ';' +
            'var queen_3_score = ' + 0 + ';' +
            'var king_1_time = ' + 0 + ';' +
            'var king_1_score = ' + 0 + ';' +
            'var king_2_time = ' + 0 + ';' +
            'var king_2_score = ' + 0 + ';' +
            'var king_3_time = ' + 0 + ';' +
            'var king_3_score = ' + 0 + ';' +
            'var dragon_1_time = ' + 0 + ';' +
            'var dragon_1_score = ' + 0 + ';' +
            'var dragon_2_time = ' + 0 + ';' +
            'var dragon_2_score = ' + 0 + ';' +
            'var dragon_3_time = ' + 0 + ';' +
            'var dragon_3_score = ' + 0+ ';' +
            'var kingCapture_1_time = ' + 0 + ';' +
            'var kingCapture_1_score = ' + 0 + ';' +
            'var kingCapture_2_time = ' + 0 + ';' +
            'var kingCapture_2_score = ' + 0 + ';' +
            'var kingCapture_3_time = ' + 0 + ';' +
            'var kingCapture_3_score = ' + 0 + ';' +
            'var kingDefend_1_time = ' + 0 + ';' +
            'var kingDefend_1_score = ' + 0 + ';' +
            'var kingDefend_2_time = ' + 0 + ';' +
            'var kingDefend_2_score = ' + 0 + ';' +
            'var kingDefend_3_time = ' + 0 + ';' +
            'var kingDefend_3_score = ' + 0 + ';' +
            'var param_avoidDanger_1_time = ' + 0 + ';' +
            'var param_avoidDanger_1_score = ' + 0 + ';' +
            'var param_avoidDanger_2_time = ' + 0 + ';' +
            'var param_avoidDanger_2_score = ' + 0 + ';' +
            'var param_avoidDanger_3_time = ' + 0 + ';' +
            'var param_avoidDanger_3_score = ' + 0 + ';' +
            'var param_attack_1 = ' + 0 + ';' +
            'var param_attack_2 = ' + 0 + ';' +
            'var param_attack_3 = ' + 0 + ';' +
            'var param_attack_1_time = ' + 0+ ';' +
            'var param_attack_1_score = ' + 0 + ';' +
            'var param_attack_2_time = ' + 0 + ';' +
            'var param_attack_2_score = ' + 0 + ';' +
            'var param_attack_3_time = ' + 0 + ';' +
            'var param_attack_3_score = ' + 0 + ';' +
            'var dragonCapture_1 = ' + 0 + ';' +
            'var dragonCapture_2 = ' + 0 + ';' +
            'var dragonCapture_3 = ' + 0 + ';' +
            'var dragonDefend_1 = ' + 0 + ';' +
            'var dragonDefend_2 = ' + 0 + ';' +
            'var dragonDefend_3 = ' + 0 + ';' +
            'var dragonCapture_1_time = ' + 0 + ';' +
            'var dragonCapture_1_score = ' + 0 + ';' +
            'var dragonCapture_2_time = ' + 0 + ';' +
            'var dragonCapture_2_score = ' + 0 + ';' +
            'var dragonCapture_3_time = ' + 0 + ';' +
            'var dragonCapture_3_score = ' + 0 + ';' +
            'var dragonDefend_1_time = ' + 0 + ';' +
            'var dragonDefend_1_score = ' + 0 + ';' +
            'var dragonDefend_2_time = ' + 0 + ';' +
            'var dragonDefend_2_score = ' + 0 + ';' +
            'var dragonDefend_3_time = ' + 0 + ';' +
            'var dragonDefend_3_score = ' + 0 + ';' +
            'var pawnCapture_1 = ' + 0+ ';' +
            'var pawnCapture_2 = ' + 0 + ';' +
            'var pawnCapture_3 = ' + 0 + ';' +
            'var pawnCapture_1_time = ' + 0 + ';' +
            'var pawnCapture_1_score = ' + 0 + ';' +
            'var pawnCapture_2_time = ' + 0 + ';' +
            'var pawnCapture_2_score = ' + 0 + ';' +
            'var pawnCapture_3_time = ' + 0 + ';' +
            'var pawnCapture_3_score = ' + 0 + ';'

        download('parameterFile.txt', saveStr1);
    
            var saveStr2 = 'var previousWinner_b = ' + "'" + 'None' + "'" + ';' +
            'var numberOfWins_b = ' + 0 + ';' +    
            'var previousScore_b = ' + 10000 + ';' +
            'var param_early_b = ' + 50 + ';' +
            'var param_late_b = ' + 100 + ';' +
            'var param_capture_1_b = ' + 0 + ';' +
            'var param_capture_2_b = ' + 0 + ';' +
            'var param_capture_3_b = ' + 0 + ';' +
            'var param_defend_1_b = ' + 0 + ';' +
            'var param_defend_2_b = ' + 0 + ';' +
            'var param_defend_3_b = ' + 0 + ';' +
            'var param_flock_1_b = ' + 0 + ';' +
            'var param_flock_2_b = ' + 0 + ';' +
            'var param_flock_3_b = ' + 0 + ';' +
            'var pawn_1_b = ' + 0 + ';' +
            'var pawn_2_b = ' + 0 + ';' +
            'var pawn_3_b = ' + 0 + ';' +
            'var pawnPromo_1_b = ' + 0+ ';' +
            'var pawnPromo_2_b = ' + 0 + ';' +
            'var pawnPromo_3_b = ' + 0 + ';' +
            'var knight_1_b = ' + 0 + ';' +
            'var knight_2_b = ' + 0 + ';' +
            'var knight_3_b = ' + 0 + ';' +
            'var bishop_1_b = ' + 0 + ';' +
            'var bishop_2_b = ' + 0 + ';' +
            'var bishop_3_b = ' + 0 + ';' +
            'var rook_1_b = ' + 0 + ';' +
            'var rook_2_b = ' + 0 + ';' +
            'var rook_3_b = ' + 0 + ';' +
            'var queen_1_b = ' + 0 + ';' +
            'var queen_2_b = ' + 0 + ';' +
            'var queen_3_b = ' + 0 + ';' +
            'var dragon_1_b = ' + 0 + ';' +
            'var dragon_2_b = ' + 0 + ';' +
            'var dragon_3_b = ' + 0 + ';' +
            'var king_1_b = ' + 0 + ';' +
            'var king_2_b = ' + 0 + ';' +
            'var king_3_b = ' + 0 + ';' +
            'var kingCapture_1_b = ' + 0 + ';' +
            'var kingCapture_2_b = ' + 0 + ';' +
            'var kingCapture_3_b = ' + 0 + ';' +
            'var kingDefend_1_b = ' + 0 + ';' +
            'var kingDefend_2_b = ' + 0 + ';' +
            'var kingDefend_3_b = ' + 0 + ';' +
            'var param_avoidDanger_1_b = ' + 0 + ';' +
            'var param_avoidDanger_2_b = ' + 0 + ';' +
            'var param_avoidDanger_3_b = ' + 0 + ';' +
            'var param_capture_1_time_b = ' + 0 + ';' +
            'var param_capture_1_score_b = ' + 0 + ';' +
            'var param_capture_2_time_b = ' + 0 + ';' +
            'var param_capture_2_score_b = ' + 0 + ';' +
            'var param_capture_3_time_b = ' + 0 + ';' +
            'var param_capture_3_score_b = ' + 0 + ';' +
            'var param_defend_1_time_b = ' + 0 + ';' +
            'var param_defend_1_score_b = ' + 0 + ';' +
            'var param_defend_2_time_b = ' + 0 + ';' +
            'var param_defend_2_score_b = ' + 0 + ';' +
            'var param_defend_3_time_b = ' + 0 + ';' +
            'var param_defend_3_score_b = ' + 0 + ';' +
            'var param_flock_1_time_b = ' + 0 + ';' +
            'var param_flock_1_score_b = ' + 0 + ';' +
            'var param_flock_2_time_b = ' + 0 + ';' +
            'var param_flock_2_score_b = ' + 0 + ';' +
            'var param_flock_3_time_b = ' + 0 + ';' +
            'var param_flock_3_score_b = ' + 0 + ';' +
            'var pawn_1_time_b = ' + 0 + ';' +
            'var pawn_1_score_b = ' + 0 + ';' +
            'var pawn_2_time_b = ' + 0 + ';' +
            'var pawn_2_score_b = ' + 0 + ';' +
            'var pawn_3_time_b = ' + 0 + ';' +
            'var pawn_3_score_b = ' + 0 + ';' +
            'var knight_1_time_b = ' + 0 + ';' +
            'var knight_1_score_b = ' + 0 + ';' +
            'var knight_2_time_b = ' + 0 + ';' +
            'var knight_2_score_b = ' + 0 + ';' +
            'var knight_3_time_b = ' + 0 + ';' +
            'var knight_3_score_b = ' + 0 + ';' +
            'var bishop_1_time_b = ' + 0 + ';' +
            'var bishop_1_score_b = ' + 0 + ';' +
            'var bishop_2_time_b = ' + 0 + ';' +
            'var bishop_2_score_b = ' + 0 + ';' +
            'var bishop_3_time_b = ' + 0 + ';' +
            'var bishop_3_score_b = ' + 0 + ';' +
            'var rook_1_time_b = ' + 0 + ';' +
            'var rook_1_score_b = ' + 0 + ';' +
            'var rook_2_time_b = ' + 0 + ';' +
            'var rook_2_score_b = ' + 0 + ';' +
            'var rook_3_time_b = ' + 0 + ';' +
            'var rook_3_score_b = ' + 0 + ';' +
            'var queen_1_time_b = ' + 0+ ';' +
            'var queen_1_score_b = ' + 0 + ';' +
            'var queen_2_time_b = ' + 0+ ';' +
            'var queen_2_score_b = ' + 0 + ';' +
            'var queen_3_time_b = ' + 0+ ';' +
            'var queen_3_score_b = ' + 0 + ';' +
            'var king_1_time_b = ' + 0 + ';' +
            'var king_1_score_b = ' + 0 + ';' +
            'var king_2_time_b = ' + 0 + ';' +
            'var king_2_score_b = ' + 0 + ';' +
            'var king_3_time_b = ' + 0 + ';' +
            'var king_3_score_b = ' + 0 + ';' +
            'var dragon_1_time_b = ' + 0 + ';' +
            'var dragon_1_score_b = ' + 0 + ';' +
            'var dragon_2_time_b = ' + 0 + ';' +
            'var dragon_2_score_b = ' + 0 + ';' +
            'var dragon_3_time_b = ' + 0 + ';' +
            'var dragon_3_score_b = ' + 0+ ';' +
            'var kingCapture_1_time_b = ' + 0 + ';' +
            'var kingCapture_1_score_b = ' + 0 + ';' +
            'var kingCapture_2_time_b = ' + 0 + ';' +
            'var kingCapture_2_score_b = ' + 0 + ';' +
            'var kingCapture_3_time_b = ' + 0 + ';' +
            'var kingCapture_3_score_b = ' + 0 + ';' +
            'var kingDefend_1_time_b = ' + 0+ ';' +
            'var kingDefend_1_score_b = ' + 0 + ';' +
            'var kingDefend_2_time_b = ' + 0+ ';' +
            'var kingDefend_2_score_b = ' + 0+ ';' +
            'var kingDefend_3_time_b = ' + 0 + ';' +
            'var kingDefend_3_score_b = ' + 0 + ';' +
            'var param_avoidDanger_1_time_b = ' + 0 + ';' +
            'var param_avoidDanger_1_score_b = ' + 0 + ';' +
            'var param_avoidDanger_2_time_b = ' + 0 + ';' +
            'var param_avoidDanger_2_score_b = ' + 0 + ';' +
            'var param_avoidDanger_3_time_b = ' + 0 + ';' +
            'var param_avoidDanger_3_score_b = ' + 0 + ';' +
            'var param_attack_1_b = ' + 0 + ';' +
            'var param_attack_2_b = ' + 0 + ';' +
            'var param_attack_3_b = ' + 0 + ';' +
            'var param_attack_1_time_b = ' + 0 + ';' +
            'var param_attack_1_score_b = ' + 0 + ';' +
            'var param_attack_2_time_b = ' + 0 + ';' +
            'var param_attack_2_score_b = ' + 0 + ';' +
            'var param_attack_3_time_b = ' + 0 + ';' +
            'var param_attack_3_score_b = ' + 0 + ';' +
            'var dragonCapture_1_b = ' + 0 + ';' +
            'var dragonCapture_2_b = ' + 0 + ';' +
            'var dragonCapture_3_b = ' + 0 + ';' +
            'var dragonDefend_1_b = ' + 0 + ';' +
            'var dragonDefend_2_b = ' + 0 + ';' +
            'var dragonDefend_3_b = ' + 0 + ';' +
            'var dragonCapture_1_time_b = ' + 0 + ';' +
            'var dragonCapture_1_score_b = ' + 0 + ';' +
            'var dragonCapture_2_time_b = ' + 0 + ';' +
            'var dragonCapture_2_score_b = ' + 0 + ';' +
            'var dragonCapture_3_time_b = ' + 0 + ';' +
            'var dragonCapture_3_score_b = ' + 0 + ';' +
            'var dragonDefend_1_time_b = ' + 0 + ';' +
            'var dragonDefend_1_score_b = ' + 0 + ';' +
            'var dragonDefend_2_time_b = ' + 0 + ';' +
            'var dragonDefend_2_score_b = ' + 0 + ';' +
            'var dragonDefend_3_time_b = ' + 0 + ';' +
            'var dragonDefend_3_score_b = ' + 0 + ';' +
            'var pawnCapture_1_b = ' + 0 + ';' +
            'var pawnCapture_2_b = ' + 0 + ';' +
            'var pawnCapture_3_b = ' + 0 + ';' +
            'var pawnCapture_1_time_b = ' + 0 + ';' +
            'var pawnCapture_1_score_b = ' + 0 + ';' +
            'var pawnCapture_2_time_b = ' + 0 + ';' +
            'var pawnCapture_2_score_b = ' + 0 + ';' +
            'var pawnCapture_3_time_b = ' + 0 + ';' +
            'var pawnCapture_3_score_b = ' + 0 + ';'

        download('parameterFile_b.txt', saveStr2);
}



/////////////////////////////////////////////
/// Hex position table for distance calc
var hex_0 = [[-12, 16, -4], [-11, 15, -4], [-12, 15, -3], [-11, 14, -3], [-12, 14, -2], [-11, 13, -2], [-12, 13, -1], [-11, 12, -1], [-12, 12, 0], [-11, 11, 0], [-12, 11, 1], [-11, 10, 1], [-12, 10, 2], [-11, 9, 2], [-12, 9, 3], [-11, 8, 3], [-12, 8, 4], [-11, 7, 4], [-12, 7, 5], [-11, 6, 5], [-12, 6, 6], [-11, 5, 6], [-12, 5, 7], [-11, 4, 7], [-12, 4, 8], [-11, 3, 8], [-12, 3, 9], [-11, 2, 9], [-12, 2, 10], [-11, 1, 10], [-12, 1, 11], [-11, 0, 11], [-12, 0, 12], [-11, -1, 12], [-12, -1, 13], [-11, -2, 13], [-12, -2, 14], [-11, -3, 14], [-12, -3, 15], [-11, -4, 15], [-12, -4, 16]],
    hex_1 = [[-10, 15, -5], [-9, 14, -5], [-10, 14, -4], [-9, 13, -4], [-10, 13, -3], [-9, 12, -3], [-10, 12, -2], [-9, 11, -2], [-10, 11, -1], [-9, 10, -1], [-10, 10, 0], [-9, 9, 0], [-10, 9, 1], [-9, 8, 1], [-10, 8, 2], [-9, 7, 2], [-10, 7, 3], [-9, 6, 3], [-10, 6, 4], [-9, 5, 4], [-10, 5, 5], [-9, 4, 5], [-10, 4, 6], [-9, 3, 6], [-10, 3, 7], [-9, 2, 7], [-10, 2, 8], [-9, 1, 8], [-10, 1, 9], [-9, 0, 9], [-10, 0, 10], [-9, -1, 10], [-10, -1, 11], [-9, -2, 11], [-10, -2, 12], [-9, -3, 12], [-10, -3, 13], [-9, -4, 13], [-10, -4, 14], [-9, -5, 14], [-10, -5, 15]],
    hex_2 = [[-8, 14, -6], [-7, 13, -6], [-8, 13, -5], [-7, 12, -5], [-8, 12, -4], [-7, 11, -4], [-8, 11, -3], [-7, 10, -3], [-8, 10, -2], [-7, 9, -2], [-8, 9, -1], [-7, 8, -1], [-8, 8, 0], [-7, 7, 0], [-8, 7, 1], [-7, 6, 1], [-8, 6, 2], [-7, 5, 2], [-8, 5, 3], [-7, 4, 3], [-8, 4, 4], [-7, 3, 4], [-8, 3, 5], [-7, 2, 5], [-8, 2, 6], [-7, 1, 6], [-8, 1, 7], [-7, 0, 7], [-8, 0, 8], [-7, -1, 8], [-8, -1, 9], [-7, -2, 9], [-8, -2, 10], [-7, -3, 10], [-8, -3, 11], [-7, -4, 11], [-8, -4, 12], [-7, -5, 12], [-8, -5, 13], [-7, -6, 13], [-8, -6, 14]],
    hex_3 = [[-6, 13, -7], [-5, 12, -7], [-6, 12, -6], [-5, 11, -6], [-6, 11, -5], [-5, 10, -5], [-6, 10, -4], [-5, 9, -4], [-6, 9, -3], [-5, 8, -3], [-6, 8, -2], [-5, 7, -2], [-6, 7, -1], [-5, 6, -1], [-6, 6, 0], [-5, 5, 0], [-6, 5, 1], [-5, 4, 1], [-6, 4, 2], [-5, 3, 2], [-6, 3, 3], [-5, 2, 3], [-6, 2, 4], [-5, 1, 4], [-6, 1, 5], [-5, 0, 5], [-6, 0, 6], [-5, -1, 6], [-6, -1, 7], [-5, -2, 7], [-6, -2, 8], [-5, -3, 8], [-6, -3, 9], [-5, -4, 9], [-6, -4, 10], [-5, -5, 10], [-6, -5, 11], [-5, -6, 11], [-6, -6, 12], [-5, -7, 12], [-6, -7, 13]],
    hex_4 = [[-4, 12, -8], [-3, 11, -8], [-4, 11, -7], [-3, 10, -7], [-4, 10, -6], [-3, 9, -6], [-4, 9, -5], [-3, 8, -5], [-4, 8, -4], [-3, 7, -4], [-4, 7, -3], [-3, 6, -3], [-4, 6, -2], [-3, 5, -2], [-4, 5, -1], [-3, 4, -1], [-4, 4, 0], [-3, 3, 0], [-4, 3, 1], [-3, 2, 1], [-4, 2, 2], [-3, 1, 2], [-4, 1, 3], [-3, 0, 3], [-4, 0, 4], [-3, -1, 4], [-4, -1, 5], [-3, -2, 5], [-4, -2, 6], [-3, -3, 6], [-4, -3, 7], [-3, -4, 7], [-4, -4, 8], [-3, -5, 8], [-4, -5, 9], [-3, -6, 9], [-4, -6, 10], [-3, -7, 10], [-4, -7, 11], [-3, -8, 11], [-4, -8, 12]],
    hex_5 = [[-2, 11, -9], [-1, 10, -9], [-2, 10, -8], [-1, 9, -8], [-2, 9, -7], [-1, 8, -7], [-2, 8, -6], [-1, 7, -6], [-2, 7, -5], [-1, 6, -5], [-2, 6, -4], [-1, 5, -4], [-2, 5, -3], [-1, 4, -3], [-2, 4, -2], [-1, 3, -2], [-2, 3, -1], [-1, 2, -1], [-2, 2, 0], [-1, 1, 0], [-2, 1, 1], [-1, 0, 1], [-2, 0, 2], [-1, -1, 2], [-2, -1, 3], [-1, -2, 3], [-2, -2, 4], [-1, -3, 4], [-2, -3, 5], [-1, -4, 5], [-2, -4, 6], [-1, -5, 6], [-2, -5, 7], [-1, -6, 7], [-2, -6, 8], [-1, -7, 8], [-2, -7, 9], [-1, -8, 9], [-2, -8, 10], [-1, -9, 10], [-2, -9, 11]],
    hex_6 = [[0, 10, -10], [1, 9, -10], [0, 9, -9], [1, 8, -9], [0, 8, -8], [1, 7, -8], [0, 7, -7], [1, 6, -7], [0, 6, -6], [1, 5, -6], [0, 5, -5], [1, 4, -5], [0, 4, -4], [1, 3, -4], [0, 3, -3], [1, 2, -3], [0, 2, -2], [1, 1, -2], [0, 1, -1], [1, 0, -1], [0, 0, 0], [1, -1, 0], [0, -1, 1], [1, -2, 1], [0, -2, 2], [1, -3, 2], [0, -3, 3], [1, -4, 3], [0, -4, 4], [1, -5, 4], [0, -5, 5], [1, -6, 5], [0, -6, 6], [1, -7, 6], [0, -7, 7], [1, -8, 7], [0, -8, 8], [1, -9, 8], [0, -9, 9], [1, -10, 9], [0, -10, 10]],
    hex_7 = [[2, 9, -11], [3, 8, -11], [2, 8, -10], [3, 7, -10], [2, 7, -9], [3, 6, -9], [2, 6, -8], [3, 5, -8], [2, 5, -7], [3, 4, -7], [2, 4, -6], [3, 3, -6], [2, 3, -5], [3, 2, -5], [2, 2, -4], [3, 1, -4], [2, 1, -3], [3, 0, -3], [2, 0, -2], [3, -1, -2], [2, -1, -1], [3, -2, -1], [2, -2, 0], [3, -3, 0], [2, -3, 1], [3, -4, 1], [2, -4, 2], [3, -5, 2], [2, -5, 3], [3, -6, 3], [2, -6, 4], [3, -7, 4], [2, -7, 5], [3, -8, 5], [2, -8, 6], [3, -9, 6], [2, -9, 7], [3, -10, 7], [2, -10, 8], [3, -11, 8], [2, -11, 9]],
    hex_8 = [[4, 8, -12], [5, 7, -12], [4, 7, -11], [5, 6, -11], [4, 6, -10], [5, 5, -10], [4, 5, -9], [5, 4, -9], [4, 4, -8], [5, 3, -8], [4, 3, -7], [5, 2, -7], [4, 2, -6], [5, 1, -6], [4, 1, -5], [5, 0, -5], [4, 0, -4], [5, -1, -4], [4, -1, -3], [5, -2, -3], [4, -2, -2], [5, -3, -2], [4, -3, -1], [5, -4, -1], [4, -4, 0], [5, -5, 0], [4, -5, 1], [5, -6, 1], [4, -6, 2], [5, -7, 2], [4, -7, 3], [5, -8, 3], [4, -8, 4], [5, -9, 4], [4, -9, 5], [5, -10, 5], [4, -10, 6], [5, -11, 6], [4, -11, 7], [5, -12, 7], [4, -12, 8]],
    hex_9 = [[6, 7, -13], [7, 6, -13], [6, 6, -12], [7, 5, -12], [6, 5, -11], [7, 4, -11], [6, 4, -10], [7, 3, -10], [6, 3, -9], [7, 2, -9], [6, 2, -8], [7, 1, -8], [6, 1, -7], [7, 0, -7], [6, 0, -6], [7, -1, -6], [6, -1, -5], [7, -2, -5], [6, -2, -4], [7, -3, -4], [6, -3, -3], [7, -4, -3], [6, -4, -2], [7, -5, -2], [6, -5, -1], [7, -6, -1], [6, -6, 0], [7, -7, 0], [6, -7, 1], [7, -8, 1], [6, -8, 2], [7, -9, 2], [6, -9, 3], [7, -10, 3], [6, -10, 4], [7, -11, 4], [6, -11, 5], [7, -12, 5], [6, -12, 6], [7, -13, 6], [6, -13, 7]],
    hex_10 = [[8, 6, -14], [9, 5, -14], [8, 5, -13], [9, 4, -13], [8, 4, -12], [9, 3, -12], [8, 3, -11], [9, 2, -11], [8, 2, -10], [9, 1, -10], [8, 1, -9], [9, 0, -9], [8, 0, -8], [9, -1, -8], [8, -1, -7], [9, -2, -7], [8, -2, -6], [9, -3, -6], [8, -3, -5], [9, -4, -5], [8, -4, -4], [9, -5, -4], [8, -5, -3], [9, -6, -3], [8, -6, -2], [9, -7, -2], [8, -7, -1], [9, -8, -1], [8, -8, 0], [9, -9, 0], [8, -9, 1], [9, -10, 1], [8, -10, 2], [9, -11, 2], [8, -11, 3], [9, -12, 3], [8, -12, 4], [9, -13, 4], [8, -13, 5], [9, -14, 5], [8, -14, 6]],
    hex_11 = [[10, 5, -15], [11, 4, -15], [10, 4, -14], [11, 3, -14], [10, 3, -13], [11, 2, -13], [10, 2, -12], [11, 1, -12], [10, 1, -11], [11, 0, -11], [10, 0, -10], [11, -1, -10], [10, -1, -9], [11, -2, -9], [10, -2, -8], [11, -3, -8], [10, -3, -7], [11, -4, -7], [10, -4, -6], [11, -5, -6], [10, -5, -5], [11, -6, -5], [10, -6, -4], [11, -7, -4], [10, -7, -3], [11, -8, -3], [10, -8, -2], [11, -9, -2], [10, -9, -1], [11, -10, -1], [10, -10, 0], [11, -11, 0], [10, -11, 1], [11, -12, 1], [10, -12, 2], [11, -13, 2], [10, -13, 3], [11, -14, 3], [10, -14, 4], [11, -15, 4], [10, -15, 5]];
