#!/usr/bin/env bash
# Instala la voz (Chatterbox + revisor Whisper) en voz/.venv, aparte del resto del proyecto.
# Necesita: uv (https://docs.astral.sh/uv/) y ffmpeg. Funciona sin tarjeta gráfica (CPU).
set -euo pipefail
cd "$(dirname "$0")"
uv venv -p 3.11 .venv
uv pip install --python .venv/bin/python \
  --index-url https://pypi.org/simple --extra-index-url https://download.pytorch.org/whl/cpu \
  --index-strategy unsafe-best-match \
  "chatterbox-tts==0.1.7" "torch==2.6.0+cpu" "torchaudio==2.6.0+cpu" "setuptools<81" "faster-whisper==1.2.1" soundfile
echo "Listo. Pon la grabación de tu narradora en voz/referencias/ (ver voz/referencias/LEEME.md)."
