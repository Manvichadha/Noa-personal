import re

with open('src/app/login/login.css', 'r') as f:
    content = f.read()

# Replace panel backgrounds
content = content.replace('background: #ffffff;', 'background: #050505;') # right panel
content = content.replace('background: #111;', 'background: #000000;') # success bg
content = content.replace('background: #fff;', 'background: #111111;') # inputs, buttons

# Text colors
content = content.replace('color: #1d1d1f;', 'color: #ffffff;') # titles, labels
content = content.replace('color: #374151;', 'color: #ffffff;') # roles
content = content.replace('color: #86868b;', 'color: #a1a1aa;') # hints
content = content.replace('color: #fff;', 'color: #050505;') # btn submit flip

# Button flips
content = content.replace('background: #000;', 'background: #ffffff;') # btn submit
content = content.replace('background: #333;', 'background: #e4e4e7;') # btn submit hover
content = content.replace('color: #050505;\n  font-weight: 800;', 'color: #ffffff;\n  font-weight: 800;') # Logo fix
content = content.replace('color: #050505;\n  line-height: 1.1;', 'color: #ffffff;\n  line-height: 1.1;') # Headline fix

# Exceptions
content = content.replace('color: #050505;\n  font-weight: 500;\n  margin-bottom: 16px;', 'color: #ffffff;\n  font-weight: 500;\n  margin-bottom: 16px;') # success text

# Borders & Backgrounds
content = content.replace('border: 1px solid #d2d2d7;', 'border: 1px solid #27272a;')
content = content.replace('border-color: #000;', 'border-color: #333;')
content = content.replace('border: 2px solid #e5e7eb;', 'border: 2px solid #27272a;')
content = content.replace('background: #f3f4f6;', 'background: #27272a;')
content = content.replace('background: #e5e5ea;', 'background: #27272a;')
content = content.replace('background: #fafafa;', 'background: #1a1a1a;')

with open('src/app/login/login.css', 'w') as f:
    f.write(content)
print("Done")
