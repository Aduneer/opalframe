"""Render one original, quiet sound sketch for review; nothing is wired to the site.

Requires Python 3, NumPy, and ffmpeg. Run from any directory.
The composition and exported audio share the repository's MIT license.
"""

import json
import math
from pathlib import Path
import subprocess
import tempfile

import numpy as np


ROOT = Path(__file__).resolve().parents[2]
OUTPUT = ROOT / "artifacts/audio"
RATE = 44100
SECONDS = 72
TARGET_LUFS = -29.0
RNG = np.random.default_rng(20261004)


def ffmpeg(*args):
    result = subprocess.run(
        ["ffmpeg", "-hide_banner", "-nostdin", "-y", *map(str, args)],
        capture_output=True,
        text=True,
    )
    if result.returncode:
        raise RuntimeError(result.stderr)
    return result


def measure(path):
    result = ffmpeg(
        "-i", path, "-af", "loudnorm=I=-29:TP=-9:LRA=11:print_format=json",
        "-f", "null", "-",
    )
    data = json.JSONDecoder().raw_decode(result.stderr[result.stderr.rfind("{"):])[0]
    return {
        "integrated_lufs": float(data["input_i"]),
        "true_peak_dbtp": float(data["input_tp"]),
        "loudness_range_lu": float(data["input_lra"]),
    }


def synthesize():
    time = np.arange(RATE * SECONDS, dtype=np.float64) / RATE
    angle = 2 * np.pi * time / SECONDS
    mix = np.zeros((len(time), 2), dtype=np.float64)

    # Open Dmaj9 / Bm11 / Gmaj9 / Asus voicings, blending over eighteen seconds.
    chords = [
        {50, 57, 61, 64, 66},
        {47, 57, 62, 64, 66},
        {43, 54, 57, 62, 66},
        {45, 57, 59, 62, 64},
    ]
    weights = np.stack([
        np.exp(2.4 * np.cos(angle - index * np.pi / 2))
        for index in range(4)
    ])
    weights /= weights.sum(axis=0)

    for note in sorted(set().union(*chords)):
        envelope = sum(weights[i] for i, chord in enumerate(chords) if note in chord)
        frequency = 440 * 2 ** ((note - 69) / 12)
        amplitude = 0.085 if note < 50 else 0.12
        for detune, pan in [(-0.13, -0.65), (0.0, 0.0), (0.13, 0.65)]:
            # Integer cycles make carriers, modulation, and the master periodic.
            cycles = round((frequency + detune) * SECONDS)
            phase = RNG.uniform(0, 2 * np.pi)
            carrier = cycles * angle + phase + 0.11 * np.sin(2 * angle + phase)
            tone = np.sin(carrier) + 0.11 * np.sin(2 * carrier + 0.4)
            tone += 0.025 * np.sin(3 * carrier + 1.1)
            tone *= envelope * amplitude / 3
            mix[:, 0] += tone * math.sqrt((1 - pan) / 2)
            mix[:, 1] += tone * math.sqrt((1 + pan) / 2)

    # A handful of distant, soft blooms, with no percussive attack or tempo.
    for index, note in enumerate([81, 78, 76, 85, 78]):
        center = 6 + index * 13.7
        distance = (time - center + SECONDS / 2) % SECONDS - SECONDS / 2
        bloom = np.exp(-0.5 * (distance / 3.5) ** 2)
        cycles = round(440 * 2 ** ((note - 69) / 12) * SECONDS)
        shimmer = (np.sin(cycles * angle) + 0.12 * np.sin(2 * cycles * angle))
        shimmer *= bloom * 0.014
        pan = 0.5 * math.sin(index * 2.2)
        mix[:, 0] += shimmer * math.sqrt((1 - pan) / 2)
        mix[:, 1] += shimmer * math.sqrt((1 + pan) / 2)

    # Seeded, band-limited air; no samples, field recordings, or outside assets.
    frequencies = np.fft.rfftfreq(len(time), 1 / RATE)
    shape = (frequencies / 700) ** 2 * np.exp(-frequencies / 420)
    shape[0] = 0
    for channel in range(2):
        spectrum = shape * np.exp(1j * RNG.uniform(0, 2 * np.pi, len(shape)))
        air = np.fft.irfft(spectrum, n=len(time))
        air /= np.sqrt(np.mean(air ** 2))
        mix[:, channel] += air * 0.0016 * (0.8 + 0.2 * np.sin(angle + channel))

    # Circular stereo diffusion keeps the authored loop seam continuous.
    dry = mix.copy()
    for delay, gain in [(0.19, 0.16), (0.43, 0.12), (0.79, 0.09), (1.37, 0.06)]:
        mix += np.roll(dry[:, ::-1], round(delay * RATE), axis=0) * gain
    mix -= mix.mean(axis=0)
    assert np.isfinite(mix).all()
    return mix


def main():
    OUTPUT.mkdir(parents=True, exist_ok=True)
    master = OUTPUT / "quiet-01-loop.flac"
    listen = OUTPUT / "quiet-01.m4a"
    preview = OUTPUT / "quiet-01-preview.mp4"
    mix = synthesize()
    with tempfile.TemporaryDirectory(prefix="opalframe-audio-") as directory:
        raw = Path(directory) / "sketch.f32"
        mix.astype("<f4").tofile(raw)
        reference = Path(directory) / "reference.wav"
        ffmpeg("-f", "f32le", "-ar", RATE, "-ac", 2, "-i", raw, reference)
        before = measure(reference)
        gain_db = TARGET_LUFS - before["integrated_lufs"]
        if before["true_peak_dbtp"] + gain_db > -12:
            raise RuntimeError("The requested audition level would exceed the peak ceiling")
        ffmpeg(
            "-f", "f32le", "-ar", RATE, "-ac", 2, "-i", raw,
            "-af", f"volume={gain_db}dB", "-c:a", "flac", "-sample_fmt", "s32", master,
        )
    ffmpeg(
        "-i", master, "-af", "afade=t=in:d=3,afade=t=out:st=68:d=4",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", listen,
    )
    web = ROOT / "apps/docs/public/audio/quiet-01.flac"
    web.parent.mkdir(parents=True, exist_ok=True)
    ffmpeg(
        "-i", master, "-af", "aresample=osf=s16:dither_method=triangular",
        "-c:a", "flac", "-compression_level", 12, web,
    )
    ffmpeg(
        "-stream_loop", "-1", "-i",
        ROOT / "artifacts/presentation/light-response-charcoal.mp4",
        "-i", master, "-t", 24, "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-af", "afade=t=in:d=3,afade=t=out:st=20:d=4",
        "-movflags", "+faststart", preview,
    )
    gain = 10 ** (gain_db / 20)
    report = {
        "duration_seconds": SECONDS,
        "sample_rate_hz": RATE,
        "seed": 20261004,
        "master": measure(master),
        "listening_export": measure(listen),
        "seam_step_dbfs": round(20 * math.log10(np.max(np.abs(mix[-1] - mix[0])) * gain), 2),
        "largest_sample_step_dbfs": round(20 * math.log10(np.max(np.abs(np.diff(mix, axis=0))) * gain), 2),
        "web_export": measure(web),
        "web_export_bytes": web.stat().st_size,
    }
    if abs(report["master"]["integrated_lufs"] - TARGET_LUFS) > 0.2:
        raise RuntimeError("Master loudness is outside the audition target")
    if max(report[key]["true_peak_dbtp"] for key in ["master", "listening_export"]) > -12:
        raise RuntimeError("An export exceeds the audition peak ceiling")
    if report["seam_step_dbfs"] > report["largest_sample_step_dbfs"]:
        raise RuntimeError("The loop boundary has an excessive sample step")
    (OUTPUT / "quiet-01-analysis.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
