"""Rebuilds the list of files the game keeps for offline use (inside sw.js).

Run this ONLY if you ADD or RENAME files (for example new photos):
    python tools/build_offline_list.py
Replacing a photo with the same file name does not need it, but do raise
the VERSION number at the top of sw.js so the iPad downloads the new photo.
"""
import os, re, json, time
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
keep = ('.html', '.css', '.js', '.jpg', '.jpeg', '.png', '.webp', '.woff2', '.webmanifest')
files = []
for folder, _, names in os.walk(root):
    if os.sep + 'tools' in folder: continue
    for n in sorted(names):
        if n.lower().endswith(keep) and n != 'sw.js':
            files.append(os.path.relpath(os.path.join(folder, n), root).replace(os.sep, '/'))
files.sort()
path = os.path.join(root, 'sw.js')
src = open(path, encoding='utf-8').read()
src = re.sub(r"const FILES = \[.*?\];", "const FILES = " + json.dumps(['./'] + files, indent=2) + ";", src, flags=re.S)
src = re.sub(r"const VERSION = '.*?';", "const VERSION = '" + time.strftime('%Y%m%d-%H%M') + "';", src)
open(path, 'w', encoding='utf-8').write(src)
print(len(files), 'files listed for offline use')
