import unittest
import logging
from hexchess_game import HexChess
from hexchess_ai import BasicAI
import sys
import time

logging.basicConfig(level=logging.INFO, filename='full_game_test.log', filemode='w',
                    format='%(asctime)s - %(levelname)s - %(message)s')

class TestFullGameSimulation(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()
        self.white_ai = BasicAI(self.game, 'w')
        self.black_ai = BasicAI(self.game, 'b')

    def test_full_game_simulation(self):
        move_count = 0
        max_moves = 1000  # Prevent infinite loops

        logging.info("Starting new game simulation")

        while not self.game.is_game_over() and move_count < max_moves:
            current_ai = self.white_ai if self.game.current_player == 'w' else self.black_ai

            logging.info(f"Move {move_count + 1}: {self.game.current_player}'s turn")

            try:
                move = current_ai.make_move()
                if move:
                    from_q, from_r, to_q, to_r = move
                    piece = self.game.board.get_cell(from_q, from_r)
                    target = self.game.board.get_cell(to_q, to_r)

                    logging.info(f"Chosen move: {move}")
                    logging.info(f"Moving piece: {piece}")
                    logging.info(f"Target cell: {target}")

                    move_made = self.game.make_move(*move)
                    if move_made:
                        logging.info("Move successfully made")
                        if target and target[1] == 'K':
                            logging.info("King captured!")
                    else:
                        logging.error("Failed to make move")
                        self.fail("Failed to make a valid move")
                else:
                    logging.error("AI failed to choose a move")
                    self.fail("AI failed to choose a move")
            except Exception as e:
                logging.error(f"An error occurred during the move: {str(e)}")
                self.fail(f"An error occurred during the move: {str(e)}")

            move_count += 1

            # Add a small delay to prevent potential infinite loops
            time.sleep(0.01)

        logging.info("Final board state:")
        logging.info(self.game.print_board())

        if self.game.is_game_over():
            winner = self.game.get_winner()
            logging.info(f"Game over. Winner: {winner}")
        else:
            logging.info("Game stopped due to move limit")

        self.assertTrue(self.game.is_game_over(), "Game should be over")
        self.assertIsNotNone(self.game.get_winner(), "There should be a winner")

    def tearDown(self):
        del self.game
        del self.white_ai
        del self.black_ai

def run_tests(num_games):
    for i in range(num_games):
        logging.info(f"Starting game {i+1} of {num_games}")
        suite = unittest.TestLoader().loadTestsFromTestCase(TestFullGameSimulation)
        result = unittest.TextTestRunner(verbosity=2).run(suite)
        if not result.wasSuccessful():
            logging.error(f"Test failed in game {i+1}")
            return False
        logging.info(f"Game {i+1} completed successfully")
    return True

if __name__ == '__main__':
    num_games = 10  # Default number of games to run
    if len(sys.argv) > 1:
        try:
            num_games = int(sys.argv[1])
        except ValueError:
            print("Invalid argument. Using default value of 10 games.")

    print(f"Running {num_games} game simulations...")
    success = run_tests(num_games)
    if success:
        print("All game simulations completed successfully.")
    else:
        print("Some game simulations failed. Check the log for details.")
