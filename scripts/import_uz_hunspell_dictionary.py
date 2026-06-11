#!/usr/bin/env python3
"""
Import Uzbek Hunspell dictionary into ToolBase spell-checker wordlist.

Source:
  https://github.com/u2b3k/uz-hunspell
  Raw: https://raw.githubusercontent.com/u2b3k/uz-hunspell/master/uz_UZ.dic

Note:
  Check the dictionary license before bundling it in production.
  The upstream repository is GPL-3.0 at the time this helper was written.
"""
from __future__ import annotations

import json
import re
import sys
import urllib.request
from pathlib import Path

RAW_URL = "https://raw.githubusercontent.com/u2b3k/uz-hunspell/master/uz_UZ.dic"
OUT = Path(__file__).resolve().parents[1] / "tools" / "imlo-tekshirish" / "data" / "uz-wordlist.js"


def norm(word: str) -> str:
    word = word.strip().lower()
    word = word.replace("ʻ", "'").replace("‘", "'").replace("’", "'").replace("`", "'")
    # hunspell entries can have flags after slash: word/FLAGS
    word = word.split("/", 1)[0]
    word = word.strip("\ufeff \t\r\n.,;:!?()[]{}\"«»")
    return word


def valid(word: str) -> bool:
    if not (2 <= len(word) <= 36):
        return False
    if re.search(r"\d", word):
        return False
    # Latin Uzbek only for browser spell-checker v2
    return bool(re.fullmatch(r"[a-zA-Z'\-]+", word))


def main() -> int:
    print(f"Downloading: {RAW_URL}")
    with urllib.request.urlopen(RAW_URL, timeout=60) as resp:
        text = resp.read().decode("utf-8", errors="ignore")

    words = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        # first line in hunspell .dic is often word count
        if line.isdigit():
            continue
        w = norm(line)
        if valid(w):
            words.append(w)

    words = sorted(set(words))
    print(f"Imported {len(words):,} Latin Uzbek words")

    chunks = []
    for i in range(0, len(words), 8):
        chunks.append("  " + ", ".join(json.dumps(w, ensure_ascii=False) for w in words[i:i+8]))

    content = """'use strict';\n/* Auto-generated Uzbek wordlist from Hunspell dictionary. */\nvar UZ_WORDLIST = [\n""" + ",\n".join(chunks) + "\n];\n"
    OUT.write_text(content, encoding="utf-8")
    print(f"Written: {OUT}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
