function saveFile(){
    var saveStr = 'var previousScore = ' + previousScore + ';' +
    'var param_early = ' + param_early + ';' +
    'var param_late = ' + param_late + ';' +
    'var param_capture_1 = ' + param_capture_1 + ';' +
    'var param_capture_2 = ' + param_capture_2 + ';' +
    'var param_capture_3 = ' + param_capture_3 + ';'  +
    'var param_defend_1 = ' + param_defend_1 + ';' +
    'var param_defend_2 = ' + param_defend_2 + ';' +
    'var param_defend_3 = ' + param_defend_3 + ';' +
    'var param_flock_1 = ' + param_flock_1 + ';' +
    'var param_flock_2 = ' + param_flock_2 + ';'  +
    'var param_flock_3 = ' + param_flock_3 + ';' +
    'var pawn_1 = ' + pawn_1 + ';' +
    'var pawn_2 = ' + pawn_2 + ';'  + 
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
    'var king_1 = '+ king_1 + ';' +
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
    'var param_avoidDanger_3 = ' + param_avoidDanger_3 + ';'
    
    download('parameterFile.js', saveStr);
}