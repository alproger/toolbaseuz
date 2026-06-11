# Uzbek spell-check dictionary

`uz-wordlist.js` is the local browser lexicon used by ToolBase.uz imlo checker.

Current bundled version is a lightweight seed dictionary generated from:
- ToolBase.uz Uzbek pages
- curated common Uzbek vocabulary
- the tool's existing apostrophe/correction dictionary

For a much larger production dictionary, use:

```bash
python scripts/import_uz_hunspell_dictionary.py
```

Suggested upstream source:
- `u2b3k/uz-hunspell` on GitHub
- `uz_UZ.dic` contains 90k+ Uzbek entries with Hunspell rules according to the upstream README.

Important: check upstream license before bundling the full dictionary in a commercial production build.
