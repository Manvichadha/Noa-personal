import os
import glob

replacements = {
    # page.tsx specific
    "background: '#fff'": "background: '#0a0a0a'",
    "background: '#f8faff'": "background: '#050505'",
    
    # Generic backgrounds
    "background: '#ffffff'": "background: 'var(--bg-card)'",
    "background: '#fafafa'": "background: '#111111'",
    "background: '#f7f7f7'": "background: '#141414'",
    "background: '#f9fafb'": "background: '#141414'",
    "background: '#f3f4f6'": "background: '#1f1f22'",
    "background: '#fef2f2'": "background: '#3f1111'",
    "background: '#fff0f0'": "background: '#331111'",
    "background: '#d1fae5'": "background: '#064e3b'",
    "background: '#fee2e2'": "background: '#450a0a'",
    
    # Generic Borders
    "border: '1px solid #e0e0e0'": "border: '1px solid var(--border)'",
    "border: '1px solid #eaeaea'": "border: '1px solid var(--border)'",
    "border: '1px solid #e5e7eb'": "border: '1px solid var(--border)'",
    "border: '1px solid #f0f0f0'": "border: '1px solid var(--border)'",
    "border: '1.5px solid #f5f5f5'": "border: '1.5px solid var(--border)'",
    "border: '1px solid #e8e8e8'": "border: '1px solid var(--border)'",
    "border: '1px solid #fca5a5'": "border: '1px solid #7f1d1d'",
    "border: '1px solid #fecaca'": "border: '1px solid #7f1d1d'",
    
    # Text colors
    "color: '#1a1a2e'": "color: '#ffffff'",
    "color: '#111'": "color: '#ffffff'",
    "color: '#333'": "color: '#e4e4e7'",
    "color: '#444'": "color: '#e4e4e7'",
    "color: '#6b7280'": "color: 'var(--text-secondary)'",
    "color: '#374151'": "color: 'var(--text-primary)'",
    "color: '#8e8e93'": "color: 'var(--text-secondary)'",
    "color: '#9ca3af'": "color: 'var(--text-tertiary)'",
    "color: '#ef4444'": "color: '#f87171'", # lighter red for dark mode
    "color: '#dc2626'": "color: '#f87171'",
    "color: '#991b1b'": "color: '#fca5a5'",
    "color: '#059669'": "color: '#34d399'",
}

files = glob.glob('src/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r') as f:
        content = f.read()
    
    new_content = content
    for old, new in replacements.items():
        new_content = new_content.replace(old, new)
        
    # page.module.css updates
    if 'page.module.css' in file:
        continue

    if new_content != content:
        with open(file, 'w') as f:
            f.write(new_content)
        print(f"Updated {file}")
        
print("Component inline styles updated.")
