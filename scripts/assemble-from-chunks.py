#!/usr/bin/env python3
import json, hashlib, os, pathlib, shutil
root = pathlib.Path("_assembly")
if not root.exists():
    print("no _assembly"); raise SystemExit(0)
for manifest_path in root.glob("**/manifest.json"):
    m = json.loads(manifest_path.read_text())
    parts_dir = manifest_path.parent / "parts"
    data = "".join((parts_dir / f"{i:04d}.txt").read_text() for i in range(m["chunks"]))
    digest = hashlib.sha256(data.encode()).hexdigest()
    if digest != m["sha256"]:
        raise SystemExit(f"hash mismatch for {m['path']}: {digest} != {m['sha256']}")
    out = pathlib.Path(m["path"])
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(data)
    print("wrote", out, len(data))
# cleanup assembly dir after success
shutil.rmtree(root)
print("cleaned _assembly")
