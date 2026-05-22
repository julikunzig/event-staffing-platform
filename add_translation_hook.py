#!/usr/bin/env python3

# Read the file
with open('frontend/src/pages/EventDetailPage.tsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the line with "function CloseEventPanel" and add useTranslation after the opening brace
new_lines = []
for i, line in enumerate(lines):
    new_lines.append(line)
    if 'function CloseEventPanel' in line and '{' in line:
        # Find the next line that starts with "const [endTime"
        for j in range(i+1, min(i+5, len(lines))):
            if 'const [endTime' in lines[j]:
                # Insert useTranslation before this line
                indent = '  '
                new_lines.insert(len(new_lines)-1, f'{indent}const {{ t }} = useTranslation()\n')
                break

# Write the file back
with open('frontend/src/pages/EventDetailPage.tsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("✅ useTranslation hook added!")
