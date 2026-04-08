import unittest
import os
import json
from hexchess_game import HexChess
from hexchess_ai import BasicAI

class TestAILearning(unittest.TestCase):
    def setUp(self):
        self.game = HexChess()
        self.white_ai = BasicAI(self.game, 'w', f'ai_params_w_test_{self.id()}.json')
        self.black_ai = BasicAI(self.game, 'b', f'ai_params_b_test_{self.id()}.json')

    def tearDown(self):
        # Remove test files
        for ai in [self.white_ai, self.black_ai]:
            if os.path.exists(ai.get_filename()):
                os.remove(ai.get_filename())

    def test_save_learning_progress(self):
        self.white_ai.save_learning_progress()
        self.assertTrue(os.path.exists(self.white_ai.get_filename()), "White AI parameters file should be created")

        self.black_ai.save_learning_progress()
        self.assertTrue(os.path.exists(self.black_ai.get_filename()), "Black AI parameters file should be created")

    def test_load_learning_progress(self):
        # First, save some progress
        self.white_ai.learning_module.games_played = 10
        self.white_ai.save_learning_progress()

        # Create a new AI instance and load the progress
        new_white_ai = BasicAI(self.game, 'w', self.white_ai.get_filename())
        new_white_ai.load_learning_progress()

        self.assertEqual(new_white_ai.learning_module.games_played, 10, "Loaded games_played should match saved value")

    def test_learn_from_game(self):
        initial_games_played = self.white_ai.learning_module.games_played

        game_stats = {
            'total_moves': 40,
            'material_balance': 5,
            'center_control': 0.6,
            'king_safety': 0.7,
            'mobility': 20,
            'pawn_structure': 0.5,
            'piece_effectiveness': {'P': 0.5, 'N': 0.6, 'B': 0.7, 'R': 0.8, 'Q': 0.9, 'K': 1.0, 'D': 0.8}
        }
        self.white_ai.learn_from_game(1, game_stats)  # 1 represents a win

        self.assertEqual(self.white_ai.learning_module.games_played, initial_games_played + 1, "games_played should increase after learning")

        self.white_ai.save_learning_progress()
        self.assertTrue(os.path.exists(self.white_ai.get_filename()), "AI parameters file should be created after learning and saving")

    def test_file_content(self):
        self.white_ai.learning_module.games_played = 5
        self.white_ai.learning_module.wins = 3
        self.white_ai.save_learning_progress()

        with open(self.white_ai.get_filename(), 'r') as f:
            data = json.load(f)

        self.assertEqual(data['games_played'], 5, "Saved games_played should match")
        self.assertEqual(data['wins'], 3, "Saved wins should match")
        self.assertIn('params', data, "Saved data should include parameters")
        self.assertIn('learning_history', data, "Saved data should include learning history")

    def test_file_existence(self):
        self.white_ai.save_learning_progress()
        self.assertTrue(os.path.exists(self.white_ai.get_filename()), f"File should exist at {self.white_ai.get_filename()}")

    def test_file_persistence(self):
        self.white_ai.save_learning_progress()
        filename = self.white_ai.get_filename()
        full_path = os.path.abspath(filename)
        self.assertTrue(os.path.exists(full_path), f"File should exist at {full_path}")
        with open(full_path, 'r') as f:
            content = f.read()
        print(f"File contents: {content}")

        # Force a flush to disk
        os.fsync(os.open(full_path, os.O_RDONLY))

        # List directory contents
        print(f"Directory contents after save: {os.listdir('.')}")

        # Try to load the file
        load_success = self.white_ai.load_learning_progress()
        self.assertTrue(load_success, "Should be able to load the saved progress")

    def test_multiple_save_load_cycles(self):
        for i in range(3):  # Perform 3 save-load cycles
            # Learn from a game
            game_stats = {
                'total_moves': 40,
                'material_balance': 5,
                'center_control': 0.6,
                'king_safety': 0.7,
                'mobility': 20,
                'pawn_structure': 0.5,
                'piece_effectiveness': {'P': 0.5, 'N': 0.6, 'B': 0.7, 'R': 0.8, 'Q': 0.9, 'K': 1.0, 'D': 0.8}
            }
            self.white_ai.learn_from_game(1, game_stats)

            # Save progress
            self.white_ai.save_learning_progress()

            # Create a new AI instance and load progress
            new_ai = BasicAI(self.game, 'w', self.white_ai.get_filename())
            new_ai.load_learning_progress()

            # Compare parameters
            for param in self.white_ai.learning_module.params:
                if isinstance(self.white_ai.learning_module.params[param], dict):
                    for sub_param in self.white_ai.learning_module.params[param]:
                        self.assertAlmostEqual(
                            self.white_ai.learning_module.params[param][sub_param],
                            new_ai.learning_module.params[param][sub_param],
                            places=5,
                            msg=f"Cycle {i+1}: Loaded {param}.{sub_param} should match saved value"
                        )
                else:
                    self.assertAlmostEqual(
                        self.white_ai.learning_module.params[param],
                        new_ai.learning_module.params[param],
                        places=5,
                        msg=f"Cycle {i+1}: Loaded {param} should match saved value"
                    )

            # Update white_ai to the loaded state for the next cycle
            self.white_ai = new_ai

    @classmethod
    def tearDownClass(cls):
        # Print final directory contents
        print(f"Final directory contents: {os.listdir('.')}")

if __name__ == '__main__':
    unittest.main()
