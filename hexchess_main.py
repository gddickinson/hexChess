"""Entry point for HexChess application."""

import sys
import os
from PyQt5.QtWidgets import QApplication
from hexchess_gui import MainWindow
import logging
import logging.config


def setup_logging(debug_mode=False):
    log_level = logging.DEBUG if debug_mode else logging.INFO

    # Ensure logs directory exists
    script_dir = os.path.dirname(os.path.abspath(__file__))
    logs_dir = os.path.join(script_dir, 'logs')
    os.makedirs(logs_dir, exist_ok=True)
    log_file = os.path.join(logs_dir, 'hexchess.log')

    logging.config.dictConfig({
        'version': 1,
        'disable_existing_loggers': False,
        'formatters': {
            'standard': {
                'format': '%(asctime)s [%(levelname)s] %(name)s: %(message)s'
            },
        },
        'handlers': {
            'default': {
                'level': log_level,
                'formatter': 'standard',
                'class': 'logging.StreamHandler',
                'stream': 'ext://sys.stdout',
            },
            'file': {
                'level': log_level,
                'formatter': 'standard',
                'class': 'logging.FileHandler',
                'filename': log_file,
                'mode': 'w',
            },
        },
        'loggers': {
            '': {
                'handlers': ['default', 'file'],
                'level': log_level,
                'propagate': True
            },
            'hexchess': {
                'handlers': ['default', 'file'],
                'level': log_level,
                'propagate': False
            },
            'hexchess.ai': {
                'handlers': ['default', 'file'],
                'level': log_level,
                'propagate': False
            },
        }
    })


def main():
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec_())

if __name__ == "__main__":
    setup_logging(debug_mode=True)
    main()
