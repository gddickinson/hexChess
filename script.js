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


//var offBoard = ""

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








//create class for piece positions///////////////////////////////////////////////////
class PieceList {
    constructor(whitePawns, whiteKnights, whiteRooks, whiteBishops, whiteQueen, whiteKing,
        blackPawns, blackKnights, blackRooks, blackBishops, blackQueen, blackKing) {
        this.whitePawns = whitePawns;
        this.whiteKnights = whiteKnights;
        this.whiteRooks = whiteRooks;
        this.whiteBishops = whiteBishops;
        this.whiteQueen = whiteQueen;
        this.whiteKing = whiteKing;
        this.blackPawns = blackPawns;
        this.blackKnights = blackKnights;
        this.blackRooks = blackRooks;
        this.blackBishops = blackBishops;
        this.blackQueen = blackQueen;
        this.blackKing = blackKing;

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
        this.kingValue = 100;

        this.pieceSymbolList = ['P', 'R', 'N', 'B', 'Q', 'K'];



    }



    get whitePieceList() {
        var whiteList = [this.whitePawns, this.whiteKnights, this.whiteRooks, this.whiteBishops, this.whiteQueen, this.whiteKing];
        return whiteList;
        
    }

   get whiteHexsOccupied() {
       //console.log(this.whitePieceList);
       var ans = [];
       for (var i = 0; i < this.whitePieceList.length; i++){
           var subList = this.whitePieceList[i];
           subList = subList.split(';');
           for (var j = 0; j < subList.length; j++){
               if(subList[j].length > 3){
                    ans.push(subList[j])
               }
               
           }
       } 
       return ans;
   }
    
    get blackHexsOccupied() {
       var ans = [];
       for (var i = 0; i < this.blackPieceList.length; i++){
           var subList = this.blackPieceList[i];
           subList = subList.split(';');
           for (var j = 0; j < subList.length; j++){
               if(subList[j].length > 3){
                    ans.push(subList[j])
               }
               
           }
       } 
       return ans;
   } 
    
    
    get blackPieceList() {
        var blackList = [this.blackPawns, this.blackKnights, this.blackRooks, this.blackBishops, this.blackQueen, this.blackKing];
        return blackList;
    }

    allPieces() {
        var allList = [this.whitePawns, this.whiteKnights, this.whiteRooks, this.whiteBishops, this.whiteQueen, this.whiteKing, this.blackPawns, this.blackKnights, this.blackRooks, this.blackBishops, this.blackQueen, this.blackKing];
        return allList;
    }

    get whiteImageList() {
        return ['wP', 'wN', 'wR', 'wB', 'wQ', 'wK'];
    }

    get blackImageList() {
        return ['bP', 'bN', 'bR', 'bB', 'bQ', 'bK'];
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

        //console.log(piece)
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

    }

    removewhitePiece(replaceStr) {
        this.whitePawns = this.whitePawns.replace(replaceStr, "");
        this.whiteKnights = this.whiteKnights.replace(replaceStr, "");
        this.whiteRooks = this.whiteRooks.replace(replaceStr, "");
        this.whiteBishops = this.whiteBishops.replace(replaceStr, "");
        this.whiteQueen = this.whiteQueen.replace(replaceStr, "");
        this.whiteKing = this.whiteKing.replace(replaceStr, "");

    }

    pawnPromoteTest(colour, x, y) {
        var searchStr = "(" + x + "," + y + ")";
        if (colour == "w") {
            return whitePawnPromoHexs.includes(searchStr);
        } else {
            return blackPawnPromoHexs.includes(searchStr);
        }
    }

    promoteWhitePawn(x, y) {
        var replaceStr = "(" + x + "," + y + ")";
        this.whitePawns = this.whitePawns.replace(replaceStr, "");
        this.whiteQueen = this.whiteQueen + replaceStr;

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
        this.blackQueen = this.blackQueen + replaceStr;

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

        //console.log("piece", piece);
        //console.log("oldStr", oldStr);
        //console.log("replaceStr", replaceStr);

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

    }

    availableForSelection(x, y, colour) {
        // check on board
        if (board.hexInBoard(x, y) == false) {
            return false;
        } else {
            var searchStr = "(" + x + "," + y + ")";
            if (colour == 'w') {
                var allAvailable = this.whitePawns + this.whiteKnights + this.whiteRooks + this.whiteBishops + this.whiteQueen + this.whiteKing;
                return allAvailable.includes(searchStr);
            }
            if (colour == 'b') {
                var allAvailable = this.blackPawns + this.blackKnights + this.blackRooks + this.blackBishops + this.blackQueen + this.blackKing;
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
            var allUnavailable = this.whitePawns + this.whiteKnights + this.whiteRooks + this.whiteBishops + this.whiteQueen + this.whiteKing + offBoard + currentHex;
            var searchStr = "(" + x + "," + y + ")";
            if (allUnavailable.includes(searchStr) == true) {
                return false;
            } else {
                return true;
            }
        } else {
            var currentHex = "(" + this.oldX + "," + this.oldY + ")";
            var allUnavailable = this.blackPawns + this.blackKnights + this.blackRooks + this.blackBishops + this.blackQueen + this.blackKing + offBoard + currentHex;
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
        //console.log("Available moves: " + this.availableMovesForCurrentPiece);
        return;
    }



    getAvailableMoves(x, y, testPiece, colour) {
        var hexsToActivate = [];
        var availableMoves = [];

        var unSplitPiece = colour + testPiece

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


        for (var i = 0; i < hexsToActivate.length; i++) {
            var testX = hexsToActivate[i][0];
            var testY = hexsToActivate[i][1];

            //this.setPieceSelected(testX, testY);

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
        //console.log(diffY);



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
                    //console.log(listOfHexs);
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
                    //console.log(diffY + "list of hexs" + listOfHexs)
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
                        if (diffX == 1 && diffY == 3) {
                            var intHex = "(" + (x1 - 1) + "," + (y1 + 1) + ");";
                            var intHex2 = "(" + (x1 - 1) + "," + (y1 + 2) + ");";
                            listOfHexs = listOfHexs + intHex + intHex2;
                            return listOfHexs;
                        }
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


    jumpNeeded(x1, y1, x2, y2, piece) {
        //if knight ignore jumps and return false
        var testPiece = piece.split("")[1];

        if (testPiece == "N") {
            return false;


        } else {

            var intermediates = this.getIntermediateHexs(x1, y1, x2, y2).split(";");


            if (intermediates == "") {
                //console.log("No intermediates: " + x2 + "," + y2)
                return false;
            }


            //console.log("intermediates" + intermediates);

            var occupied = this.whitePawns + this.whiteKnights + this.whiteRooks + this.whiteBishops + this.whiteQueen + this.whiteKing + this.blackPawns + this.blackKnights + this.blackRooks + this.blackBishops + this.blackQueen + this.blackKing + offBoard;

            //console.log("occupied" + occupied);
            for (var i = 0; i < intermediates.length; i++) {
                //console.log(i,intermediates[i]);
                if (occupied.includes(intermediates[i]) && intermediates[i] != "") {
                    //console.log("occupied includes: " + intermediates[i]);
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
        var newTurn = [this.turnNumber, this.sideToMove, this.whitePawns, this.whiteKnights, this.whiteRooks, this.whiteBishops, this.whiteQueen, this.whiteKing, this.blackPawns, this.blackKnights, this.blackRooks, this.blackBishops, this.blackQueen, this.blackKing];

        this.gameRecord.push(newTurn);
        //console.log(this.gameRecord);

    }

    redrawBoard() {
        var lastRecord = this.gameRecord[this.turnNumber - 1];
        console.log(lastRecord);

        this.whitePawns = lastRecord[2];
        this.whiteKnights = lastRecord[3];
        this.whiteRooks = lastRecord[4];
        this.whiteBishops = lastRecord[5];
        this.whiteQueen = lastRecord[6];
        this.whiteKing = lastRecord[7];
        this.blackPawns = lastRecord[8];
        this.blackKnights = lastRecord[9];
        this.blackRooks = lastRecord[10];
        this.blackBishops = lastRecord[11];
        this.blackQueen = lastRecord[12];
        this.blackKing = lastRecord[13];

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
        if (colour == 'w'){
            var testColour = 'b';
        }
        if (colour == 'b'){
            var testColour = 'w';
        }
               
        var oppositionMoves = this.getAllMovesForTurn(testColour);
        
        for (var i = 0; i < posList.length; i++) {
            for (var j = 0; j < oppositionMoves.length; j++){
                var test1 = posList[i][2];
                var test2 = oppositionMoves[j][2];
                        
                if (test1[0] == test2[0] && test1[1] == test2[1]){
                    console.log('danger');   
                    posList[i][3] = posList[i][3] - (5 * this.getPieceScore(posList[i][0]));
                    //console.log((5 * this.getPieceScore(posList[i][0])));

                }
            }           
        }
        
        return posList;
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
            var promoHexs = ["(4,38)", "(5,38)", "(6,38)", "(7,38)", "(8,38)"];
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
        }
        if (colour == 'w') {
            var promoHexs = ["(4,38)", "(5,38)", "(6,38)", "(7,38)", "(8,38)"];
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
        }

        if (piecesList.length < 1) {
            console.log('No pieces error!');
            return [];
        }
        //console.log(piece);
        for (var i = 0; i < piecesList.length; i++) {
            currentPosition = piecesList[i].split(",")

            if (currentPosition[0].length > 1) {
                x = Number(currentPosition[0].replace("(", ""));
                y = Number(currentPosition[1].replace(")", ""));

                possiblePositions = this.getAvailableMoves(x, y, piece, colour);
                possiblePositionsIfColourDif = this.getAvailableMoves(x, y, piece, otherColour);

                for (var j = 0; j < possiblePositions.length; j++) {
                    var score = initialScore;
                    var hexContent = this.getHexContent(possiblePositions[j][0], possiblePositions[j][1]);
                    var hexContent2 = this.getHexContent(possiblePositionsIfColourDif[j][0], possiblePositionsIfColourDif[j][1]);

                    //console.log(hexContent);

                    //capture if possible
                    if (hexContent != 'none') {
                        score = score + 1 + (2 * (this.getPieceScore(hexContent.split("")[1])));
                    }

                    //defend own pieces if possible
                    if (hexContent2 != 'none') {
                        //score = score + (this.getPieceScore(hexContent2.split("")[1]));
                        score = score + 1;
                    }
                    
                    //flock together
                    //console.log('white hexs', this.whiteHexsOccupied);
                    
                    if (colour == 'w'){
                        var ownedHexPos =  this.whiteHexsOccupied;   
                    }
                    if (colour == 'b'){
                        var ownedHexPos =  this.blackHexsOccupied; 
                    }
                    
                    if (ownedHexPos.length > 3){
                    
                    //head toward white owned hexs
                    var ownedScore = 0;
                        for (var z = 0; z < ownedHexPos.length; z++) {
                            var hexPos = this.strToCordinates(ownedHexPos[z]);
                            var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], hexPos[0], hexPos[1]);
                            if (distanceToHex > 0){
                            var newScore = Math.ceil(1 / distanceToHex);
                            if (newScore > ownedScore) {
                                ownedScore = newScore;
                            }
                            }

                        }
                        score = score + ownedScore;
                    }
                    
                    
                    

                    //avoid capture if possibe
                    //TODO

                    //add piece specific scoring here

                    //pawns
                    //move early
                    if (piece == 'P') {
                        if (this.turnNumber < 50) {
                            score = score + 1;
                        }

                        //head toward queening hexs
                        var promoScore = 0;
                        for (var z = 0; z < promoHexs.length; z++) {
                            var hexPos = this.strToCordinates(promoHexs[z]);

                            var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], hexPos[0], hexPos[1]);
                            var posScore = Math.ceil(1 / distanceToHex);
                            if (posScore > promoScore) {
                                promoScore = posScore;
                            }

                        }
                        score = score + promoScore;

                    } ///end pawns

                    //Knights
                    //move early
                    //console.log(piece);
                    if (piece == 'N') {
                        if (this.turnNumber < 50) {
                            score = score + 2;
                        }


                    } ///end Knights


                    //Bishops
                    //move early
                    //console.log(piece);
                    if (piece == 'B') {
                        if (this.turnNumber < 50) {
                            score = score + 2;
                        }


                    } ///end Bishops

                    //Rooks
                    //move medium
                    //console.log(piece);
                    if (piece == 'R') {
                        if (this.turnNumber > 100) {
                            score = score + 2;
                        }


                    } ///end Rooks

                    //Queen
                    //move late
                    //console.log(piece);
                    if (piece == 'Q') {
                        if (this.turnNumber > 150) {
                            score = score + 3;
                        }


                    } ///end Queen


                    //king capture              
                    if (colour == 'w') {
                        var kingPos = this.strToCordinates(this.blackKing);
                    }
                    if (colour == 'b') {
                        var kingPos = this.strToCordinates(this.whiteKing);
                    }
                    var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], kingPos[0], kingPos[1]);
                    var posScore = Math.ceil(1 / distanceToHex);
                    score = score + posScore;

                    if (this.turnNumber > 150) {
                        if (colour == 'w') {
                            var kingPos = this.strToCordinates(this.blackKing);
                        }
                        if (colour == 'b') {
                            var kingPos = this.strToCordinates(this.whiteKing);
                        }
                        var distanceToHex = this.distanceBetweenTwoHexs(possiblePositions[j][0], possiblePositions[j][1], kingPos[0], kingPos[1]);
                        var posScore = Math.ceil(1 / distanceToHex);
                        score = score + posScore;

                    }



                    var listRow = [piece, piecesList[i], possiblePositions[j], score];
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



} ///////////////end of class//////////////////////////////////////////////



//set start positions
//white in play
var whitePawns = "(4,36);(4,35);(5,36);(5,35);(6,34);(6,35);(7,36);(7,35);(8,36);(5,34);(5,33);(6,33);(7,34)";
var whiteKnights = "(4,37);(7,37)";
var whiteRooks = "(4,38);(8,38)";
var whiteBishops = "(6,36);(6,37);(7,38)";
var whiteQueen = "(5,37)";
var whiteKing = "(6,38)"

//black in play
var blackPawns = "(4,4);(4,5);(5,4);(5,5);(6,6);(6,5);(7,4);(7,5);(8,4);(5,6);(5,7);(6,7);(7,6)";
var blackKnights = "(4,3);(7,3)";
var blackRooks = "(4,2);(8,2)";
var blackBishops = "(5,2);(5,3);(6,4)";
var blackQueen = "(6,3)";
var blackKing = "(6,2)";


//pawn promotion hexs
var whitePawnPromoHexs = "(4,2);(4,3);(5,2);(5,3);(6,2);(6,3);(7,2);(7,3);(8,2)";
var blackPawnPromoHexs = "(4,38);(4,37);(5,38);(5,37);(6,38);(6,37);(7,38);(7,37);(8,38)";


//create board object
const board = new Gameboard(height, width, rad, offBoard)
board.drawBoard()

//create game object
const game = new PieceList(whitePawns, whiteKnights, whiteRooks, whiteBishops, whiteQueen, whiteKing, blackPawns, blackKnights, blackRooks, blackBishops, blackQueen, blackKing);

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

// Create function for position on canvas
/*function getPos(p) {
    var rect = c.getBoundingClientRect();
    var xPos = (p.pageX - rect.left) / 0.8;
    var yPos = (p.pageY - rect.top) / 0.8;

    if (xPos < rect.left || yPos < rect.top - height * 0.2 || xPos > rect.right + width * 0.25 || yPos > rect.bottom + height * 0.2) {
        info.innerHTML = 'Off Board';
    } else {
        if ((xPos % 67) < 34) {
            info.innerHTML = 'Position X : ' + (Math.floor(xPos / 67)) + '<br />Position Y : ' + ((Math.floor(yPos / 39)) * 2);
        } else {
            info.innerHTML = 'Position X : ' + (Math.floor(xPos / 67)) + '<br />Position Y : ' + (((Math.floor((yPos + 20) / 39) - 1) * 2) + 1);
        }
    }
}*/

function updateMessageBox(x, y) {
    info.innerHTML = 'Side to move: ' + game.sideToMove + '<br />Position X: ' + x + '<br />Position Y: ' + y + '<br />Piece: ' + game.getHexContent(x, y) + '<br />Turn #: ' + game.turnNumber;
}

function displayWinnerMessage() {
    info.innerHTML = game.winner + ' Wins!'+ '<br />Turn #: ' + game.turnNumber;
}

function selectPiece(p) {
    if (game.gameOver == false) {

        if (game.computerPlayer == 'Auto') {
            //loop if auto on - every 500ms
            setInterval(function () {
                if (game.computerPlayer == 'Auto') {
                    computerMoves();
                }
            }, 500);

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
    game.blackPawns = blackPawns;
    game.blackKnights = blackKnights;
    game.blackRooks = blackRooks;
    game.blackBishops = blackBishops;
    game.blackQueen = blackQueen;
    game.blackKing = blackKing;

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
        console.log(lastRecord);

        game.whitePawns = lastRecord[2];
        game.whiteKnights = lastRecord[3];
        game.whiteRooks = lastRecord[4];
        game.whiteBishops = lastRecord[5];
        game.whiteQueen = lastRecord[6];
        game.whiteKing = lastRecord[7];
        game.blackPawns = lastRecord[8];
        game.blackKnights = lastRecord[9];
        game.blackRooks = lastRecord[10];
        game.blackBishops = lastRecord[11];
        game.blackQueen = lastRecord[12];
        game.blackKing = lastRecord[13];

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
        //console.log(game.sideToMove)
        game.colourSelected = game.sideToMove;
        var allMovesAvailable = game.getAllMovesForTurn(game.sideToMove);
        
        //score dangerous moves
        allMovesAvailable = game.isMoveDangerous(allMovesAvailable,game.sideToMove);
            
        //console.log("All Moves 1st: ", allMovesAvailable[0])

        var sortedList = allMovesAvailable.sort(function (a, b) {
            return a[3] < b[3] ? 1 : -1;
        })
        //console.log("Sorted ", sortedList.length);
        var max = sortedList[0][3];


        var filteredList = [];

        for (var i = 0; i < sortedList.length; i++) {
            if (sortedList[i][3] >= max) {
                filteredList.push(sortedList[i]);
            }
        }


        if (Math.random() > 0.1) {
            moveToMake = filteredList[Math.floor(Math.random() * filteredList.length)];
        } else {
            moveToMake = allMovesAvailable[Math.floor(Math.random() * allMovesAvailable.length)];
        }


        console.log("Move Choosen: ", moveToMake);


        //make move
        var currentPosition = moveToMake[1].split(",")
        xPos = Number(currentPosition[0].replace("(", ""));
        yPos = Number(currentPosition[1].replace(")", ""));

        var newX = moveToMake[2][0];
        var newY = moveToMake[2][1];

        var pieceToMove = game.sideToMove + moveToMake[0];
        //console.log("Piece to move: ", pieceToMove);


        game.selectHex(xPos, yPos, 'blue');
        game.setPieceSelected(xPos, yPos);
        game.oldX = xPos;
        game.oldY = yPos;
        game.readyToMove = true;
        game.pieceToMoveHexSelected = true;

        game.movePiece(newX, newY, pieceToMove);

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


//add event listeners
//addEventListener('mousemove', getPos, false);
addEventListener('click', selectPiece, false);

//function mDown(obj) {
//    clickHex("blue");
//}
//
//function mUp(obj) {
//    clickHex("red")
//}



/////////////////////////////////////////////
/// Hex position table for distance calc
var hex_0 = [[-12, 16, -4],
[-11, 15, -4],
[-12, 15, -3],
[-11, 14, -3],
[-12, 14, -2],
[-11, 13, -2],
[-12, 13, -1],
[-11, 12, -1],
[-12, 12, 0],
[-11, 11, 0],
[-12, 11, 1],
[-11, 10, 1],
[-12, 10, 2],
[-11, 9, 2],
[-12, 9, 3],
[-11, 8, 3],
[-12, 8, 4],
[-11, 7, 4],
[-12, 7, 5],
[-11, 6, 5],
[-12, 6, 6],
[-11, 5, 6],
[-12, 5, 7],
[-11, 4, 7],
[-12, 4, 8],
[-11, 3, 8],
[-12, 3, 9],
[-11, 2, 9],
[-12, 2, 10],
[-11, 1, 10],
[-12, 1, 11],
[-11, 0, 11],
[-12, 0, 12],
[-11, -1, 12],
[-12, -1, 13],
[-11, -2, 13],
[-12, -2, 14],
[-11, -3, 14],
[-12, -3, 15],
[-11, -4, 15],
[-12, -4, 16]];

var hex_1 = [[-10, 15, -5],
[-9, 14, -5],
[-10, 14, -4],
[-9, 13, -4],
[-10, 13, -3],
[-9, 12, -3],
[-10, 12, -2],
[-9, 11, -2],
[-10, 11, -1],
[-9, 10, -1],
[-10, 10, 0],
[-9, 9, 0],
[-10, 9, 1],
[-9, 8, 1],
[-10, 8, 2],
[-9, 7, 2],
[-10, 7, 3],
[-9, 6, 3],
[-10, 6, 4],
[-9, 5, 4],
[-10, 5, 5],
[-9, 4, 5],
[-10, 4, 6],
[-9, 3, 6],
[-10, 3, 7],
[-9, 2, 7],
[-10, 2, 8],
[-9, 1, 8],
[-10, 1, 9],
[-9, 0, 9],
[-10, 0, 10],
[-9, -1, 10],
[-10, -1, 11],
[-9, -2, 11],
[-10, -2, 12],
[-9, -3, 12],
[-10, -3, 13],
[-9, -4, 13],
[-10, -4, 14],
[-9, -5, 14],
[-10, -5, 15]];

var hex_2 = [[-8, 14, -6],
[-7, 13, -6],
[-8, 13, -5],
[-7, 12, -5],
[-8, 12, -4],
[-7, 11, -4],
[-8, 11, -3],
[-7, 10, -3],
[-8, 10, -2],
[-7, 9, -2],
[-8, 9, -1],
[-7, 8, -1],
[-8, 8, 0],
[-7, 7, 0],
[-8, 7, 1],
[-7, 6, 1],
[-8, 6, 2],
[-7, 5, 2],
[-8, 5, 3],
[-7, 4, 3],
[-8, 4, 4],
[-7, 3, 4],
[-8, 3, 5],
[-7, 2, 5],
[-8, 2, 6],
[-7, 1, 6],
[-8, 1, 7],
[-7, 0, 7],
[-8, 0, 8],
[-7, -1, 8],
[-8, -1, 9],
[-7, -2, 9],
[-8, -2, 10],
[-7, -3, 10],
[-8, -3, 11],
[-7, -4, 11],
[-8, -4, 12],
[-7, -5, 12],
[-8, -5, 13],
[-7, -6, 13],
[-8, -6, 14]];

var hex_3 = [[-6, 13, -7],
[-5, 12, -7],
[-6, 12, -6],
[-5, 11, -6],
[-6, 11, -5],
[-5, 10, -5],
[-6, 10, -4],
[-5, 9, -4],
[-6, 9, -3],
[-5, 8, -3],
[-6, 8, -2],
[-5, 7, -2],
[-6, 7, -1],
[-5, 6, -1],
[-6, 6, 0],
[-5, 5, 0],
[-6, 5, 1],
[-5, 4, 1],
[-6, 4, 2],
[-5, 3, 2],
[-6, 3, 3],
[-5, 2, 3],
[-6, 2, 4],
[-5, 1, 4],
[-6, 1, 5],
[-5, 0, 5],
[-6, 0, 6],
[-5, -1, 6],
[-6, -1, 7],
[-5, -2, 7],
[-6, -2, 8],
[-5, -3, 8],
[-6, -3, 9],
[-5, -4, 9],
[-6, -4, 10],
[-5, -5, 10],
[-6, -5, 11],
[-5, -6, 11],
[-6, -6, 12],
[-5, -7, 12],
[-6, -7, 13]];

var hex_4 = [[-4, 12, -8],
[-3, 11, -8],
[-4, 11, -7],
[-3, 10, -7],
[-4, 10, -6],
[-3, 9, -6],
[-4, 9, -5],
[-3, 8, -5],
[-4, 8, -4],
[-3, 7, -4],
[-4, 7, -3],
[-3, 6, -3],
[-4, 6, -2],
[-3, 5, -2],
[-4, 5, -1],
[-3, 4, -1],
[-4, 4, 0],
[-3, 3, 0],
[-4, 3, 1],
[-3, 2, 1],
[-4, 2, 2],
[-3, 1, 2],
[-4, 1, 3],
[-3, 0, 3],
[-4, 0, 4],
[-3, -1, 4],
[-4, -1, 5],
[-3, -2, 5],
[-4, -2, 6],
[-3, -3, 6],
[-4, -3, 7],
[-3, -4, 7],
[-4, -4, 8],
[-3, -5, 8],
[-4, -5, 9],
[-3, -6, 9],
[-4, -6, 10],
[-3, -7, 10],
[-4, -7, 11],
[-3, -8, 11],
[-4, -8, 12]];

var hex_5 = [[-2, 11, -9],
[-1, 10, -9],
[-2, 10, -8],
[-1, 9, -8],
[-2, 9, -7],
[-1, 8, -7],
[-2, 8, -6],
[-1, 7, -6],
[-2, 7, -5],
[-1, 6, -5],
[-2, 6, -4],
[-1, 5, -4],
[-2, 5, -3],
[-1, 4, -3],
[-2, 4, -2],
[-1, 3, -2],
[-2, 3, -1],
[-1, 2, -1],
[-2, 2, 0],
[-1, 1, 0],
[-2, 1, 1],
[-1, 0, 1],
[-2, 0, 2],
[-1, -1, 2],
[-2, -1, 3],
[-1, -2, 3],
[-2, -2, 4],
[-1, -3, 4],
[-2, -3, 5],
[-1, -4, 5],
[-2, -4, 6],
[-1, -5, 6],
[-2, -5, 7],
[-1, -6, 7],
[-2, -6, 8],
[-1, -7, 8],
[-2, -7, 9],
[-1, -8, 9],
[-2, -8, 10],
[-1, -9, 10],
[-2, -9, 11]];

var hex_6 = [[0, 10, -10],
[1, 9, -10],
[0, 9, -9],
[1, 8, -9],
[0, 8, -8],
[1, 7, -8],
[0, 7, -7],
[1, 6, -7],
[0, 6, -6],
[1, 5, -6],
[0, 5, -5],
[1, 4, -5],
[0, 4, -4],
[1, 3, -4],
[0, 3, -3],
[1, 2, -3],
[0, 2, -2],
[1, 1, -2],
[0, 1, -1],
[1, 0, -1],
[0, 0, 0],
[1, -1, 0],
[0, -1, 1],
[1, -2, 1],
[0, -2, 2],
[1, -3, 2],
[0, -3, 3],
[1, -4, 3],
[0, -4, 4],
[1, -5, 4],
[0, -5, 5],
[1, -6, 5],
[0, -6, 6],
[1, -7, 6],
[0, -7, 7],
[1, -8, 7],
[0, -8, 8],
[1, -9, 8],
[0, -9, 9],
[1, -10, 9],
[0, -10, 10]];

var hex_7 = [[2, 9, -11],
[3, 8, -11],
[2, 8, -10],
[3, 7, -10],
[2, 7, -9],
[3, 6, -9],
[2, 6, -8],
[3, 5, -8],
[2, 5, -7],
[3, 4, -7],
[2, 4, -6],
[3, 3, -6],
[2, 3, -5],
[3, 2, -5],
[2, 2, -4],
[3, 1, -4],
[2, 1, -3],
[3, 0, -3],
[2, 0, -2],
[3, -1, -2],
[2, -1, -1],
[3, -2, -1],
[2, -2, 0],
[3, -3, 0],
[2, -3, 1],
[3, -4, 1],
[2, -4, 2],
[3, -5, 2],
[2, -5, 3],
[3, -6, 3],
[2, -6, 4],
[3, -7, 4],
[2, -7, 5],
[3, -8, 5],
[2, -8, 6],
[3, -9, 6],
[2, -9, 7],
[3, -10, 7],
[2, -10, 8],
[3, -11, 8],
[2, -11, 9]];

var hex_8 = [[4, 8, -12],
[5, 7, -12],
[4, 7, -11],
[5, 6, -11],
[4, 6, -10],
[5, 5, -10],
[4, 5, -9],
[5, 4, -9],
[4, 4, -8],
[5, 3, -8],
[4, 3, -7],
[5, 2, -7],
[4, 2, -6],
[5, 1, -6],
[4, 1, -5],
[5, 0, -5],
[4, 0, -4],
[5, -1, -4],
[4, -1, -3],
[5, -2, -3],
[4, -2, -2],
[5, -3, -2],
[4, -3, -1],
[5, -4, -1],
[4, -4, 0],
[5, -5, 0],
[4, -5, 1],
[5, -6, 1],
[4, -6, 2],
[5, -7, 2],
[4, -7, 3],
[5, -8, 3],
[4, -8, 4],
[5, -9, 4],
[4, -9, 5],
[5, -10, 5],
[4, -10, 6],
[5, -11, 6],
[4, -11, 7],
[5, -12, 7],
[4, -12, 8]];

var hex_9 = [[6, 7, -13],
[7, 6, -13],
[6, 6, -12],
[7, 5, -12],
[6, 5, -11],
[7, 4, -11],
[6, 4, -10],
[7, 3, -10],
[6, 3, -9],
[7, 2, -9],
[6, 2, -8],
[7, 1, -8],
[6, 1, -7],
[7, 0, -7],
[6, 0, -6],
[7, -1, -6],
[6, -1, -5],
[7, -2, -5],
[6, -2, -4],
[7, -3, -4],
[6, -3, -3],
[7, -4, -3],
[6, -4, -2],
[7, -5, -2],
[6, -5, -1],
[7, -6, -1],
[6, -6, 0],
[7, -7, 0],
[6, -7, 1],
[7, -8, 1],
[6, -8, 2],
[7, -9, 2],
[6, -9, 3],
[7, -10, 3],
[6, -10, 4],
[7, -11, 4],
[6, -11, 5],
[7, -12, 5],
[6, -12, 6],
[7, -13, 6],
[6, -13, 7]];

var hex_10 = [[8, 6, -14],
[9, 5, -14],
[8, 5, -13],
[9, 4, -13],
[8, 4, -12],
[9, 3, -12],
[8, 3, -11],
[9, 2, -11],
[8, 2, -10],
[9, 1, -10],
[8, 1, -9],
[9, 0, -9],
[8, 0, -8],
[9, -1, -8],
[8, -1, -7],
[9, -2, -7],
[8, -2, -6],
[9, -3, -6],
[8, -3, -5],
[9, -4, -5],
[8, -4, -4],
[9, -5, -4],
[8, -5, -3],
[9, -6, -3],
[8, -6, -2],
[9, -7, -2],
[8, -7, -1],
[9, -8, -1],
[8, -8, 0],
[9, -9, 0],
[8, -9, 1],
[9, -10, 1],
[8, -10, 2],
[9, -11, 2],
[8, -11, 3],
[9, -12, 3],
[8, -12, 4],
[9, -13, 4],
[8, -13, 5],
[9, -14, 5],
[8, -14, 6]];

var hex_11 = [[10, 5, -15],
[11, 4, -15],
[10, 4, -14],
[11, 3, -14],
[10, 3, -13],
[11, 2, -13],
[10, 2, -12],
[11, 1, -12],
[10, 1, -11],
[11, 0, -11],
[10, 0, -10],
[11, -1, -10],
[10, -1, -9],
[11, -2, -9],
[10, -2, -8],
[11, -3, -8],
[10, -3, -7],
[11, -4, -7],
[10, -4, -6],
[11, -5, -6],
[10, -5, -5],
[11, -6, -5],
[10, -6, -4],
[11, -7, -4],
[10, -7, -3],
[11, -8, -3],
[10, -8, -2],
[11, -9, -2],
[10, -9, -1],
[11, -10, -1],
[10, -10, 0],
[11, -11, 0],
[10, -11, 1],
[11, -12, 1],
[10, -12, 2],
[11, -13, 2],
[10, -13, 3],
[11, -14, 3],
[10, -14, 4],
[11, -15, 4],
[10, -15, 5]];
