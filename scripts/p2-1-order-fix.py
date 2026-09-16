from pathlib import Path
import re

path = Path("index.html")
text = path.read_text(encoding="utf-8")

about = re.search(r'    <section id="apropos".*?</section>\n?', text, flags=re.S)
formation = re.search(r'    <section id="formation".*?</section>\n?', text, flags=re.S)

if about is None or formation is None:
    raise SystemExit("expected about and formation sections")

about_block = about.group(0).rstrip() + "\n"
text = text[: about.start()] + text[about.end() :]

formation = re.search(r'    <section id="formation".*?</section>\n?', text, flags=re.S)
if formation is None:
    raise SystemExit("formation section missing after about extraction")

text = text[: formation.end()] + "\n" + about_block + text[formation.end() :]
path.write_text(text, encoding="utf-8")
