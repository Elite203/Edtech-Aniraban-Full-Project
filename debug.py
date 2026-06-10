with open(r"e:\Anirban Full backend\final\src\pages\SetQuestions.jsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

# Find problematic lines
problem_lines = []
for i, line in enumerate(lines):
    if "quillHindiContentRef" in line or "quillEnglishContentRef" in line:
        problem_lines.append((i+1, line.strip()))

print("Lines with undefined refs:")
for ln, content in problem_lines:
    print(f"{ln}: {content}")

# Show context around line 887
print("\n\nContext around line 887:")
for i in range(880, min(920, len(lines))):
    print(f"{i+1:4d}→{lines[i]}", end="")
