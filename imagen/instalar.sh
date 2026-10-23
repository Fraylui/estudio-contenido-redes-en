#!/usr/bin/env bash
# Instala el generador de imágenes (SD-Turbo de Stability AI) en imagen/.venv, aparte del resto del proyecto.
# Funciona sin tarjeta gráfica (CPU): de 20 a 60 s por imagen. Necesita uv.
# Licencia del modelo: Stability AI Community License (uso comercial gratis con ingresos menores a 1 millón de
# dólares al año; para uso comercial hay que registrarse gratis en https://stability.ai/community-license).
set -euo pipefail
cd "$(dirname "$0")"
uv venv -p 3.11 .venv
uv pip install --python .venv/bin/python \
  --index-url https://pypi.org/simple --extra-index-url https://download.pytorch.org/whl/cpu \
  --index-strategy unsafe-best-match \
  "torch==2.6.0+cpu" "diffusers==0.35.1" "transformers==4.46.3" "accelerate==1.2.1" "rembg[cpu]" safetensors pillow
echo "Listo. Genera con: imagen/.venv/bin/python imagen/generar.py \"descripción\" salida.png"
