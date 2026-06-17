"""Make the hyphenated CLI script importable as `image_to_inline`.

The helper script is named `image-to-inline.py` (the CLI path other parts of the
skill reference), but Python module names cannot contain hyphens. The tests import
it as `image_to_inline`; this conftest loads the hyphenated file under that name so
the import in the test module resolves.
"""
import importlib.util, sys
from pathlib import Path

_path = Path(__file__).parent / "image-to-inline.py"
if _path.exists() and "image_to_inline" not in sys.modules:
    _spec = importlib.util.spec_from_file_location("image_to_inline", _path)
    _mod = importlib.util.module_from_spec(_spec)
    sys.modules["image_to_inline"] = _mod
    _spec.loader.exec_module(_mod)
