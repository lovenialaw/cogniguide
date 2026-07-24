# COGNIGUIDE — CNN-LSTM Raw Training Data

Raw MPU6050 sensor compilation for fall detection model training.

## Quick Start

```bash
cd CNN
python scripts/generate_raw_compilation.py   # regenerate raw data
python scripts/preprocess_windows.py         # create 100×6 windows
```

## Dataset Structure

```
CNN/
├── data/
│   ├── raw/                          # Individual session CSVs
│   ├── compiled/
│   │   ├── raw_data_compilation.csv  # ★ Master merged dataset
│   │   ├── session_labels.csv        # Labels per session
│   │   └── activity_summary.csv      # Stats per activity
│   ├── processed/
│   │   ├── windowed_dataset.csv      # 100×6 CNN-LSTM inputs
│   │   └── window_summary.json
│   └── metadata/
│       └── sessions_manifest.json
├── docs/
│   └── TRAINING_PIPELINE.md          # Full pipeline for judges
└── scripts/
    ├── generate_raw_compilation.py
    └── preprocess_windows.py
```

## Master File: `raw_data_compilation.csv`

| Column | Description |
|--------|-------------|
| `session_id` | Recording session (e.g. S001) |
| `volunteer_id` | V01, V02, V03 |
| `activity_label` | Walking, Fall_Forward, etc. |
| `time_s` | Seconds from session start |
| `Ax`–`Gz` | MPU6050 readings |

**Sample rate:** 50 Hz · **Volunteers:** 3 · **Activities:** 10 · **Sessions:** 99

## For Judges

See **`docs/TRAINING_PIPELINE.md`** for the complete AI lifecycle explanation.

**One-line answer:** *"We collected labeled accelerometer and gyroscope data from volunteers at 50 Hz, windowed it into 100×6 tensors, trained a CNN-LSTM, validated on held-out sessions, and exported to TFLite for on-device inference."*
