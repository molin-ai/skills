---
name: python
description: Python package management with uv/uvx. Use when working with Python packages, running Python scripts, or managing dependencies.
---

# Python Package Management with uv

Prefer `uv` and `uvx` over `pip` — faster (10-100x), cleaner, and avoids global package pollution.

## Quick Reference

| Task               | Command                                                      |
| ------------------ | ------------------------------------------------------------ |
| Run CLI tool       | `uvx <tool> <args>`                                          |
| Script with deps   | `uv run --with "package" python3 script.py`                  |
| Inline with deps   | `uv run --with "pkg1" --with "pkg2" python3 -c "code"`       |
| Multiple deps      | `uv run --with "requests" --with "pandas" python3 script.py` |
| Persistent install | `uv pip install <package>`                                   |

## Common Usage

### CLI tools (no install)

```sh
uvx ruff check .    # format code
uvx pytest tests/   # run tests
uvx mypy script.py  # type check
uvx black .         # format with black
```

### Scripts with dependencies

```sh
# single package
uv run --with "requests" python3 fetch.py

# multiple packages
uv run --with "requests" --with "beautifulsoup4" python3 scraper.py

# specific version
uv run --with "pandas==2.0.0" python3 analyze.py

# from requirements.txt
uv run --with-requirements requirements.txt python3 script.py
```

### Inline Python

```sh
# web request
uv run --with "requests" python3 -c "
import requests
print(requests.get('https://api.example.com').json())
"

# data processing
uv run --with "pandas" python3 -c "
import pandas as pd
df = pd.read_csv('data.csv')
print(df.describe())
"
```

### Persistent venv (rarely needed)

```sh
uv venv                           # create .venv
source .venv/bin/activate         # activate
uv pip install requests pandas    # install packages
python3 script.py                 # run normally
```

## Version Pinning

```sh
uv run --with "requests==2.31.0" python3 script.py        # exact
uv run --with "pandas>=2.0,<3.0" python3 script.py        # range
uv run --with "numpy~=1.24" python3 script.py             # compatible
```

## Python Version Management

```sh
uv python list                    # list available versions
uv python install 3.12            # install Python 3.12
uv run --python 3.12 --with "requests" python3 -c "..."   # use specific version
```

## pip Migration

| Old (pip)                         | New (uv)                                                        |
| --------------------------------- | --------------------------------------------------------------- |
| `pip install pkg`                 | `uv pip install pkg` or `uv run --with "pkg" python3 script.py` |
| `pip install -r requirements.txt` | `uv pip install -r requirements.txt`                            |
| `pip list`                        | `uv pip list`                                                   |
| `pip freeze`                      | `uv pip freeze`                                                 |

## Why uv?

1. **10-100x faster** than pip (written in Rust)
2. **No global pollution** — `uvx` and `uv run` are isolated
3. **Better dependency resolution** — smarter conflict handling
4. **Cross-platform** — consistent behavior

## Official Docs

- https://docs.astral.sh/uv/
- https://github.com/astral-sh/uv
