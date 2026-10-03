"""Package the static build for Cloudflare Pages dashboard upload."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED

build = Path('dist')
if not (build / 'index.html').is_file():
    raise SystemExit('Run npm run build first.')
destination = Path('.local/cloudflare-pages.zip')
destination.parent.mkdir(exist_ok=True)
with ZipFile(destination, 'w', ZIP_DEFLATED) as archive:
    for path in sorted(build.rglob('*')):
        if path.is_file():
            archive.write(path, path.relative_to(build))
print(f'{destination.resolve()} ({destination.stat().st_size:,} bytes)')
