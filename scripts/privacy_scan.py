#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "dist", ".venv", "__pycache__", ".pytest_cache"}
SKIP_FILES = {"package-lock.json"}
FORBIDDEN_EXTENSIONS = {".xlsx", ".xls", ".pdf", ".docx", ".pptx"}
ALLOWED_URL_PREFIXES = ("http://localhost", "http://127.0.0.1", "http://api:")
SOURCE_SKU_PATTERN = re.compile(r"\b[125789][MNOPQ][0-9A-Z]{7,13}\b", re.IGNORECASE)
URL_PATTERN = re.compile(r"https?://[^\s)\]>'\"]+")
LOCAL_DENYLIST = ROOT / ".privacy-denylist.local"


def iter_files():
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.name in SKIP_FILES or any(part in SKIP_DIRS for part in path.parts):
            continue
        yield path


def load_denylist() -> list[str]:
    if not LOCAL_DENYLIST.exists():
        return []
    return [line.strip() for line in LOCAL_DENYLIST.read_text(encoding="utf-8").splitlines() if line.strip() and not line.startswith("#")]


def main() -> int:
    failures: list[str] = []
    denylist = load_denylist()
    for path in iter_files():
        relative = path.relative_to(ROOT)
        if path.suffix.lower() in FORBIDDEN_EXTENSIONS:
            failures.append(f"forbidden binary: {relative}")
            continue
        if path.stat().st_size > 5_000_000:
            failures.append(f"large file requires review: {relative}")
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for token in denylist:
            if token.casefold() in text.casefold():
                failures.append(f"local denylist match in {relative}")
        if SOURCE_SKU_PATTERN.search(text):
            failures.append(f"source-like SKU in {relative}")
        for url in URL_PATTERN.findall(text):
            if not url.startswith(ALLOWED_URL_PREFIXES):
                failures.append(f"external URL requires review in {relative}: {url}")
    if failures:
        print("Privacy scan failed:")
        for failure in sorted(set(failures)):
            print(f"- {failure}")
        return 1
    print("Privacy scan passed: no forbidden documents, source-like SKUs, denylist terms, or unreviewed external URLs.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
