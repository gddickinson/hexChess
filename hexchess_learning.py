"""Learning module for HexChess AI -- handles parameter persistence and adaptation."""

import json
import os
import random
import logging
from typing import Dict, Any, Optional
from collections import deque, Counter

logger = logging.getLogger('hexchess.ai')


class LearningModule:
    def __init__(self, initial_params: Dict[str, float] = None):
        self.params = initial_params or {
            'piece_values': {'P': 1, 'N': 3, 'B': 3, 'R': 5, 'Q': 9, 'K': 100, 'D': 15, 'C': 2},
            'aggression': 0.5,
            'center_control': 0.6,
            'king_safety': 0.7,
            'pawn_structure': 0.5,
            'mobility': 0.6,
            'defensive': 0.5,
            'piece_protection': 0.5,
            'pawn_promotion': 0.7,
            'material_advantage': 0.8,
            'piece_development': 0.6,
            'board_control': 0.7,
            'piece_coordination': 0.6,
            'tempo': 0.5,
            'endgame_preparedness': 0.5,
        }
        self.learning_rate = 0.1
        self.games_played = 0
        self.wins = 0
        self.learning_history = []

        # Attributes for loop prevention
        self.position_history = deque(maxlen=10)
        self.move_history = deque(maxlen=20)
        self.repetition_threshold = 2
        self.diversity_bonus = 0.1

    def update_params(self, result: float, game_stats: Dict[str, Any]):
        self.games_played += 1
        if result > 0.5:
            self.wins += 1

        for param, value in game_stats.items():
            if param in self.params:
                current_value = self.params[param]
                new_value = current_value + self.learning_rate * (value - current_value) * result
                self.params[param] = max(0, min(1, new_value))

        self.learning_history.append({
            'games_played': self.games_played,
            'win_rate': self.wins / self.games_played,
            'params': self.params.copy()
        })

    def _update_param(self, param: str, game_value: float, result: float) -> float:
        current_value = self.params[param]
        change = self.learning_rate * (game_value - current_value) * result
        change += random.uniform(-0.01, 0.01)
        new_value = current_value + change
        return max(0, min(1, new_value))

    def save_params(self, filename: str):
        try:
            data = {
                'params': self.params,
                'games_played': self.games_played,
                'wins': self.wins,
                'learning_history': self.learning_history
            }
            with open(filename, 'w') as f:
                json.dump(data, f)
            logger.info(f"AI parameters saved to {filename}")
        except (IOError, OSError) as e:
            logger.error(f"Error saving AI parameters to {filename}: {str(e)}")

    def load_params(self, filename: str):
        try:
            if os.path.exists(filename):
                with open(filename, 'r') as f:
                    data = json.load(f)
                if not self._validate_params(data):
                    logger.warning(f"Invalid parameter data in {filename}, using defaults")
                    return False
                self.params = data['params']
                self.games_played = data['games_played']
                self.wins = data['wins']
                self.learning_history = data['learning_history']
                logger.info(f"AI parameters loaded from {filename}")
                return True
            else:
                logger.info(f"No existing parameter file found at {filename}")
                return False
        except (json.JSONDecodeError, KeyError, TypeError) as e:
            logger.error(f"Corrupted parameter file {filename}: {str(e)}")
            return False
        except (IOError, OSError) as e:
            logger.error(f"Error loading AI parameters from {filename}: {str(e)}")
            return False

    def _validate_params(self, data: Dict[str, Any]) -> bool:
        """Validate AI parameter JSON to prevent crashes from corrupted files."""
        required_keys = ['params', 'games_played', 'wins', 'learning_history']
        if not all(key in data for key in required_keys):
            return False
        if not isinstance(data['params'], dict):
            return False
        if not isinstance(data['games_played'], (int, float)):
            return False
        if not isinstance(data['wins'], (int, float)):
            return False
        if not isinstance(data['learning_history'], list):
            return False
        return True

    def get_save_data(self) -> Dict[str, Any]:
        return {
            'params': self.params,
            'games_played': self.games_played,
            'wins': self.wins,
            'learning_history': self.learning_history
        }

    def load_save_data(self, data: Dict[str, Any]) -> None:
        if not self._validate_params(data):
            logger.warning("Invalid save data, keeping current parameters")
            return
        self.params = data['params']
        self.games_played = data['games_played']
        self.wins = data['wins']
        self.learning_history = data['learning_history']
