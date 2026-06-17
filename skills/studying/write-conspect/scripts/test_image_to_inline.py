import base64, io, sys
from pathlib import Path
from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
import image_to_inline as m  # noqa: E402


def _make_png(tmp_path, w=2000, h=1000, color=(200, 60, 60, 255)):
    p = tmp_path / "src.png"
    Image.new("RGBA", (w, h), color).save(p, format="PNG")
    return str(p)


def test_outputs_webp_data_uri(tmp_path):
    uri, size = m.to_webp_data_uri(_make_png(tmp_path))
    assert uri.startswith("data:image/webp;base64,")
    raw = base64.b64decode(uri.split(",", 1)[1])
    assert size == len(raw)
    assert Image.open(io.BytesIO(raw)).format == "WEBP"


def test_resizes_down_to_max_width(tmp_path):
    uri, _ = m.to_webp_data_uri(_make_png(tmp_path, w=2000, h=1000), max_width=1200)
    raw = base64.b64decode(uri.split(",", 1)[1])
    assert Image.open(io.BytesIO(raw)).width == 1200


def test_does_not_upscale(tmp_path):
    uri, _ = m.to_webp_data_uri(_make_png(tmp_path, w=400, h=300), max_width=1200)
    raw = base64.b64decode(uri.split(",", 1)[1])
    assert Image.open(io.BytesIO(raw)).width == 400


def test_cli_local_file(tmp_path, capsys):
    rc = m.main([_make_png(tmp_path, w=800, h=600), "--max-width", "640"])
    out = capsys.readouterr()
    assert rc == 0
    assert out.out.strip().startswith("data:image/webp;base64,")
    assert "KB" in out.err


def test_cli_missing_file(capsys):
    assert m.main(["/no/such/file.png"]) == 2
