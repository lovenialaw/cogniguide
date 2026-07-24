"""
Segment raw_data_compilation.csv into 2-second windows (100 samples × 6 channels)
for CNN-LSTM training input.
"""

from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
COMPILED = ROOT / "data" / "compiled" / "raw_data_compilation.csv"
OUT_DIR = ROOT / "data" / "processed"
WINDOW_SIZE = 100  # 2 s @ 50 Hz
STEP_SIZE = 50  # 50% overlap
CHANNELS = ["Ax", "Ay", "Az", "Gx", "Gy", "Gz"]


def load_sessions(path: Path) -> dict[str, list[dict]]:
    sessions: dict[str, list[dict]] = defaultdict(list)
    with path.open(encoding="utf-8") as f:
        for row in csv.DictReader(f):
            sessions[row["session_id"]].append(row)
    for sid in sessions:
        sessions[sid].sort(key=lambda r: int(r["sample_index"]))
    return sessions


def normalize_channel(values: np.ndarray) -> np.ndarray:
    std = values.std()
    if std < 1e-8:
        return values - values.mean()
    return (values - values.mean()) / std


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    sessions = load_sessions(COMPILED)
    window_rows: list[dict] = []
    window_id = 0

    for sid, rows in sorted(sessions.items()):
        label = rows[0]["activity_label"]
        volunteer = rows[0]["volunteer_id"]
        matrix = np.array([[float(r[c]) for c in CHANNELS] for r in rows])

        for start in range(0, len(matrix) - WINDOW_SIZE + 1, STEP_SIZE):
            window_id += 1
            chunk = matrix[start : start + WINDOW_SIZE]
            normed = np.stack([normalize_channel(chunk[:, i]) for i in range(6)], axis=1)

            row: dict = {
                "window_id": f"W{window_id:05d}",
                "session_id": sid,
                "volunteer_id": volunteer,
                "label": label,
                "start_sample": start,
                "end_sample": start + WINDOW_SIZE - 1,
            }
            for t in range(WINDOW_SIZE):
                for i, ch in enumerate(CHANNELS):
                    row[f"t{t:03d}_{ch}"] = round(float(normed[t, i]), 6)
            window_rows.append(row)

    out_path = OUT_DIR / "windowed_dataset.csv"
    if not window_rows:
        print("No windows generated.")
        return

    fields = list(window_rows[0].keys())
    with out_path.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fields)
        w.writeheader()
        w.writerows(window_rows)

    label_counts: dict[str, int] = defaultdict(int)
    for r in window_rows:
        label_counts[r["label"]] += 1

    summary = {
        "window_size_samples": WINDOW_SIZE,
        "window_duration_s": WINDOW_SIZE / 50,
        "step_size_samples": STEP_SIZE,
        "overlap_percent": round(100 * (1 - STEP_SIZE / WINDOW_SIZE), 1),
        "total_windows": len(window_rows),
        "windows_per_label": dict(label_counts),
        "output_file": out_path.name,
    }
    with (OUT_DIR / "window_summary.json").open("w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    print(f"Generated {len(window_rows)} windows -> {out_path}")


if __name__ == "__main__":
    main()
