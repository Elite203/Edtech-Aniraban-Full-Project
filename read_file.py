import os
import sys

filepath = r"e:\Anirban Full backend\final\src\pages\SetQuestions.jsx"
if not os.path.exists(filepath):
    print(f"File not found: {filepath}")
    sys.exit(1)

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Print lines 880-920
print("Context around line 887:\n")
for i in range(879, min(920, len(lines))):
    print(f"{i+1}: {lines[i]}", end='')
