var c = document.getElementById('canvas');
var ctx = c.getContext('2d');

var width = 700;
var height = 700;
var rad = width / (20 * 1.55);

//set board shape
var offBoard = "(0,0),(0,1),(0,2),(0,3),(0,4),(0,5),(0,6),(0,7),(0,8),(0,9),(0,10),(0,11),(0,12),(0,13),(0,14),(0,15),(0,16),(0,18),(0,19),(0,20),(0,21),(0,22),(0,24),(0,25),(0,26),(0,27),(0,28),(0,29),(0,30),(0,31),(0,32),(0,33),(0,34),(0,35),(0,36),(0,37),(0,38),(0,39)(1,0),(1,1),(1,2),(1,3),(1,4),(1,5),(1,6),(1,7),(1,8),(1,9),(1,10),(1,12),(1,20),(1,26),(1,28),(1,30),(1,31),(1,31),(1,32),(1,33),(1,34),(1,35),(1,36),(1,37),(1,38),(1,39),(2,0),(2,1),(2,2),(2,3),(2,4),(2,6),(2,34),(2,36),(2,37),(2,38),(2,39),(3,0),(3,1),(3,2),(3,3),(3,4),(3,5),(3,35),(3,36),(3,37),(3,38),(3,39),(4,0),(4,1),(4,39),(5,0),(5,1),(5,39),(6,0),(6,1),(6,39),(7,0),(7,1),(7,39),(8,0),(8,1),(8,3),(8,5),(8,35),(8,37),(8,39),(9,0),(9,1),(9,2),(9,3),(9,4),(9,36),(9,37),(9,38),(9,39),(10,0),(10,1),(10,2),(10,3),(10,4),(10,5),(10,6),(10,7),(10,9),(10,31),(10,33),(10,34),(10,35),(10,36),(10,37),(10,38),(10,39),(11,0),(11,1),(11,2),(11,3),(11,4),(11,5),(11,6),(11,7),(11,8),(11,9),(11,10),(11,11),(11,12),(11,13),(11,15),(11,19),(11,20),(11,21),(11,25),(11,27),(11,28),(11,29),(11,30),(11,31),(11,32),(11,33),(11,34),(11,35),(11,36),(11,37),(11,38),(11,39)";


//var offBoard = ""

//plot base board with white background
for (var x = 0; x < 12; x++) {
  for (var y = 0; y < 40; y++) {
 
      var searchStr = "(" + x + "," + y + ")";
      if(offBoard.includes(searchStr) == false){
      
        drawHex(
            (y % 2 ? rad * 2.5 : rad) + rad * 3 * x,
            rad + rad * Math.sin(Math.PI / 3) * y,
            rad,
            x + '' + y,
            "white",
            true,
            "none"    
            );
  }
}
}


//set start positions
//white in play
var whitePawns = "(4,36),(4,35),(5,36),(5,35),(6,34),(6,35),(7,36),(7,35),(8,36)";
var whiteKnights = "(4,37),(7,37)";
var whiteRooks = "(4,38)(8,38)";
var whiteBishops = "(6,36)(6,37)(7,38)";
var whiteQueen = "(5,37)";
var whiteKing = "(6,38)"

//black in play
var blackPawns = "(4,4),(4,5),(5,4),(5,5),(6,4),(6,5),(7,4),(7,5),(8,4)";
var blackKnights = "(4,3),(7,3)";
var blackRooks = "(4,2)(8,2)";
var blackBishops = "(5,2)(5,3)(6,4)";
var blackQueen = "(6,3)";
var blackKing = "(6,2)";

var whitePieceList = [whitePawns,whiteKnights,whiteRooks,whiteBishops,whiteQueen,whiteKing];
var whiteImageNames = ['wP','wN','wR','wB','wQ','wK'];
var blackPieceList = [blackPawns,blackKnights,blackRooks,blackBishops,blackQueen,blackKing];
var blackImageNames = ['bP','bN','bR','bB','bQ','bK'];

for (var i = 0; i < whitePieceList.length; i++){
    setPiece(whiteImageNames[i],whitePieceList[i]);
} 

for (i = 0; i < blackPieceList.length; i++){
    setPiece(blackImageNames[i],blackPieceList[i]);
} 


function setPiece(piece,positionList){
    for (var x = 0; x < 12; x++) {
      for (var y = 0; y < 40; y++) {

          var searchStr = "(" + x + "," + y + ")";
          if(offBoard.includes(searchStr) == false){

            if (positionList.includes(searchStr) == true){      
              
                drawHex(
                    (y % 2 ? rad * 2.5 : rad) + rad * 3 * x,
                    rad + rad * Math.sin(Math.PI / 3) * y,
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


function clickHex(colour){
    var newX = 0;
    var newY = 0;
    drawHex((newY % 2 ? rad * 2.5 : rad) + rad * 3 * newX,
      rad + rad * Math.sin(Math.PI / 3) * newY,
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
  ctx.font = "15px sans";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.textSize = 30;
  ctx.fillStyle = "#333";
  if(textOn){    
    ctx.fillText(n, x, y);
    }
    
  if (piece != 'none'){
      var img=document.getElementById(piece);
      ctx.drawImage(img,x-15,y-15,30,30);
  }          
}

// Get 'Info' id
var info = document.getElementById('info');

// Create function for position on canvas
function getPos(p){
  var rect = c.getBoundingClientRect();
  var xPos = p.pageX - rect.left;
  var yPos = p.pageY - rect.top;
  if (xPos < 0 || yPos <0 || xPos > 890 || yPos >800){
      info.innerHTML = 'Off Board';
  }    
  else{
      if((xPos % 67)<34){info.innerHTML = 'Position X : ' + (Math.floor(xPos/67)) + '<br />Position Y : ' + ((Math.floor(yPos/39))*2);
        }
    else{
        info.innerHTML = 'Position X : ' + (Math.floor(xPos/67)) + '<br />Position Y : ' + (((Math.floor((yPos+20)/39)-1)*2)+1);
    }    
      }
    //info.innerHTML = (xPos % 70);
}

//add event listeners
addEventListener('mousemove', getPos, false);

function mDown(obj) {
    clickHex("blue");
}

function mUp(obj) {
    clickHex("red")
}
