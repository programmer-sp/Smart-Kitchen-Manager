# -*- coding: utf-8 -*-
"""
Created on Thu Aug 15 18:29:39 2024

@author: Amitr
"""

import subprocess
import sys

def generate_requirements():
    """
    Generates the requirements.txt file by using pip to freeze the current environment's packages.
    """
    try:
        # Generate the requirements.txt file
        with open('requirements.txt', 'w') as f:
            subprocess.check_call([sys.executable, '-m', 'pip', 'freeze'], stdout=f)
        print("requirements.txt generated successfully.")
    except Exception as e:
        print(f"An error occurred while generating requirements.txt: {e}")

if __name__ == "__main__":
    generate_requirements()
