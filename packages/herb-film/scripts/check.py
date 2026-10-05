"""Validate the published film without requiring the macOS renderer."""
import json
from pathlib import Path
import subprocess

assets = Path(__file__).resolve().parent.parent / 'assets'
movie = assets / 'herb-keeper-single.mp4'
data = json.loads(subprocess.check_output([
    'ffprobe', '-v', 'error', '-show_streams', '-show_format', '-of', 'json', str(movie)
]))
video = next(s for s in data['streams'] if s['codec_type'] == 'video')
audio = next(s for s in data['streams'] if s['codec_type'] == 'audio')
assert video['codec_name'] == 'h264'
assert (video['width'], video['height']) == (1280, 720)
assert video['avg_frame_rate'] == '30/1'
assert abs(float(data['format']['duration']) - 30) < .1
assert audio['codec_name'] == 'aac'
assert (assets / 'herb-keeper-single-poster.png').read_bytes().startswith(b'\x89PNG\r\n\x1a\n')
subprocess.run(['ffmpeg', '-v', 'error', '-i', str(movie), '-f', 'null', '-'], check=True)
print('Film verified: 30s, 1280x720, 30fps, H.264 + AAC; full decode passed.')
