import re

with open('src/app/landing.css', 'r') as f:
    content = f.read()

# Backgrounds
content = content.replace('rgba(255,255,255,0.82)', 'rgba(5,5,5,0.82)')
content = content.replace('rgba(255,255,255,0.8)', 'rgba(20,20,20,0.8)')
content = content.replace('#FFFDFD', '#050505')
content = content.replace('#f8faff', '#050505')
content = content.replace('background: #fff;', 'background: #0a0a0a;')
content = content.replace('background: #111827;', 'background: #ffffff;') # btn-cta
content = content.replace('background: #111;', 'background: #000;') # btn-primary, dark section

# Text Colors
content = content.replace('color: #111827;', 'color: #ffffff;')
content = content.replace('color: #111;', 'color: #ffffff;')
content = content.replace('color: #4b5563;', 'color: #a1a1aa;')
content = content.replace('color: #6b7280;', 'color: #a1a1aa;')
content = content.replace('color: #374151;', 'color: #e4e4e7;')
content = content.replace('color: #86868b;', 'color: #a1a1aa;')
content = content.replace('color: #1d1d1f;', 'color: #ffffff;')
content = content.replace('color: #0f172a;', 'color: #ffffff;')
content = content.replace('color: #fff;', 'color: #050505;') # button text needs to flip
content = content.replace('color: #9ca3af;', 'color: #52525b;')
content = content.replace('color: #d1d5db;', 'color: #a1a1aa;')
content = content.replace('color: #e2e8f0;', 'color: #e4e4e7;')

# Button overrides (fixing the flip)
content = content.replace('color: #050505;\n  font-size: 14px;\n  font-weight: 600;\n  padding: 9px 20px;', 'color: #000000;\n  font-size: 14px;\n  font-weight: 600;\n  padding: 9px 20px;') # cta
content = content.replace('color: #050505;\n  font-size: 15px;\n  font-weight: 700;', 'color: #000000;\n  font-size: 15px;\n  font-weight: 700;') # btn-primary

# Exception for secondary button (it's blue, text should be white)
content = content.replace('background: #2B3CE3;\n  color: #050505;', 'background: #2B3CE3;\n  color: #ffffff;') 

# Borders
content = content.replace('border: 1px solid #e5e7eb;', 'border: 1px solid #27272a;')
content = content.replace('border-bottom: 1px solid rgba(229,231,235,0.6);', 'border-bottom: 1px solid rgba(39,39,42,0.6);')
content = content.replace('border-top: 1px solid #f3f4f6;', 'border-top: 1px solid #27272a;')
content = content.replace('border: 1px solid rgba(0,0,0,0.05);', 'border: 1px solid rgba(255,255,255,0.1);')
content = content.replace('background: #d1d5db;', 'background: #3f3f46;')

# Hovers
content = content.replace('background: #1f2937;', 'background: #e4e4e7;') # btn primary hover
content = content.replace('background: #f3f4f6;', 'background: #27272a;') # btn login hover
content = content.replace('color: #111827; background: #27272a', 'color: #ffffff; background: #27272a')

# Box shadows
content = content.replace('rgba(0,0,0,0.03)', 'rgba(0,0,0,0.5)')
content = content.replace('rgba(0,0,0,0.06)', 'rgba(0,0,0,0.7)')
content = content.replace('rgba(0,0,0,0.18)', 'rgba(0,0,0,0.8)')
content = content.replace('rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)')
content = content.replace('rgba(0,0,0,0.08)', 'rgba(0,0,0,0.6)')

# Specific purple button fix
content = content.replace('.lp-btn-purple {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  background: #2B3CE3;\n  color: #050505;', '.lp-btn-purple {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n  background: #2B3CE3;\n  color: #ffffff;')

with open('src/app/landing.css', 'w') as f:
    f.write(content)
print("Done")
