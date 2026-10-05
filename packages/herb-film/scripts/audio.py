"""Original, deterministic soft tones, page rustles and water for the 30s film."""
import math
import random
import struct
import sys
import wave

rate = 48000
random.seed(1919)
chords = [(130.81, 164.81, 196.00), (110, 130.81, 164.81),
          (87.31, 130.81, 174.61), (98, 146.83, 196)]
turns = [3.5, 10, 15, 20, 26]
previous = 0
with wave.open(sys.argv[1], 'wb') as out:
    out.setparams((1, 2, rate, 0, 'NONE', 'not compressed'))
    for second in range(30):
        block = bytearray()
        for i in range(rate):
            t = second + i / rate
            chord = chords[int(t // 7.5) % len(chords)]
            beat = t % 2.5
            frequency = chord[int(t / 2.5) % 3] * 4
            pad = sum(math.sin(2 * math.pi * f * t) for f in chord) * 0.012
            bell = math.sin(2 * math.pi * frequency * t) * math.exp(-beat * 2.8) * min(1, beat * 70) * 0.045
            noise = random.uniform(-1, 1)
            rustle = sum(math.sin(math.pi * (t - s) / .8) ** 2 if 0 <= t-s <= .8 else 0 for s in turns)
            water = max(0, min(1, (t-10.5)*3, (14.3-t)*3))
            previous = previous * .82 + noise * .18
            fx = (noise - previous) * rustle * .035 + previous * water * .09
            fade = min(1, t / 1.3, (30-t) / 1.5)
            value = max(-1, min(1, (pad + bell + fx) * fade))
            block.extend(struct.pack('<h', int(value * 32767)))
        out.writeframes(block)
