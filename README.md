# HexChess

A hexagonal chess game with an AI opponent driven by evolutionary algorithms.

![HexChess Game](https://github.com/gddickinson/hexChess/raw/main/screenshot.png)

## Live Demo

Try it now: [https://gddickinson.github.io/hexChess/](https://gddickinson.github.io/hexChess/)

## Description

HexChess is a variant of chess played on a hexagonal grid. This implementation features:

- A fully functional hexagonal chess board with custom pieces
- Standard chess pieces with adapted movement rules for a hexagonal grid
- An AI opponent that learns and evolves through gameplay
- Parameter-based evolutionary algorithm that improves piece movement strategies

## Game Pieces

HexChess includes all standard chess pieces with adapted movements for hexagonal geometry:

- **Pawns**: Move forward and capture diagonally
- **Knights**: Jump in an extended L-pattern
- **Bishops**: Move diagonally along hex grid lines
- **Rooks**: Move in straight lines along hex grid axes
- **Queen**: Combines rook and bishop movement patterns
- **King**: Moves one hex in any direction
- **Dragon**: A special piece with extended movement capabilities

## How to Play

1. White moves first
2. Click on a piece to select it (available moves will be highlighted in yellow)
3. Click on a highlighted hex to move your piece
4. Capture opponent pieces by moving onto their position
5. Win by capturing the opponent's king

### Controls

- **Undo Move**: Reverses the last move
- **Reset Game**: Starts a new game
- **Show Board**: Refreshes the board display
- **Computer Makes Move**: Forces the AI to make its next move
- **Auto Play On/Off**: Toggles automatic play mode
- **Save/Load File**: Manages game state
- **Mutate & Play**: Introduces mutations to the AI parameters
- **Get Points**: Displays current score
- **Reset Parameter Files**: Resets AI learning parameters

## AI and Evolutionary Algorithm

The HexChess AI uses a sophisticated evolutionary algorithm to improve its gameplay:

- The AI evaluates potential moves based on multiple weighted parameters
- Parameters include board position, piece value, attack/defense potential, etc.
- When games conclude, successful strategies have their parameters saved
- The "Mutate & Play" function introduces random variations to parameters
- Over time, the AI evolves more effective playing strategies

### Parameter Categories

The AI considers many factors when choosing moves:

- Early/mid/late game strategies
- Piece-specific movement preferences
- Capture and defense values
- King safety parameters
- Piece coordination ("flocking")
- Pawn promotion incentives
- Danger avoidance

## Development

### Technologies Used

- Vanilla JavaScript
- HTML5 Canvas for rendering
- CSS for styling

### Project Structure

- `index.html`: Main game page
- `script.js`: Core game logic and AI
- `style.css`: Game styling
- `hexPositionTable.js`: Hex grid coordinate calculations
- `params.js`: Parameter management for the evolutionary algorithm
- `parameterFile.txt` and `parameterFile_b.txt`: Saved AI parameters

## Future Enhancements

- Network multiplayer capabilities
- Additional hex chess variants
- Enhanced AI visualization tools
- Improved UI/UX with game history and notation
- Mobile-friendly responsive design

## Contributing

Contributions to HexChess are welcome! Please feel free to submit pull requests or open issues to suggest improvements.

## License

This project is available under an open source license.

## Credits

Developed by G.D. Dickinson

---

*HexChess - Chess reinvented on hexagons with evolving AI*
