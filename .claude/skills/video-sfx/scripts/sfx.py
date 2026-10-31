#!/usr/bin/env python3
"""
sfx.py — Mezcla efectos de sonido sobre videos con ffmpeg.

Subcomandos (usa `python3 sfx.py <cmd> -h`):

  info           Datos del video (resolución, fps, duración, si tiene audio)
  lista-sonidos  Lista los efectos disponibles y cuándo usarlos
  sonidos        Mezcla efectos desde una lista de cues (JSON), alineando el punto de impacto
  zoom           Zoom in / punch-in en un tramo, con whoosh automático
  rebobinar      Efecto de retroceso (rewind) de un tramo, con su sonido
  fotogramas     Hoja de fotogramas para revisar visualmente en qué segundo pasa cada cosa
"""
import argparse, json, math, os, shutil, subprocess, sys, tempfile

from PIL import Image, ImageDraw, ImageFont

SKILL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SFX_DIR = os.path.join(SKILL, "assets", "sfx")
SFX = json.load(open(os.path.join(SFX_DIR, "sfx.json"), encoding="utf-8"))


def fuente(tam=20):
    try:
        return ImageFont.load_default(size=tam)
    except TypeError:
        return ImageFont.load_default()


def run(cmd):
    p = subprocess.run(cmd, capture_output=True, text=True)
    if p.returncode != 0:
        sys.stderr.write(p.stderr[-3000:])
        raise SystemExit(f"ffmpeg falló: {' '.join(cmd[:6])} ...")
    return p.stdout


def probe(path):
    out = json.loads(run(["ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", path]))
    v = next((s for s in out["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in out["streams"] if s["codec_type"] == "audio"), None)
    d = {"duracion": float(out["format"].get("duration", 0)), "audio": a is not None}
    if v:
        n, dd = v.get("r_frame_rate", "30/1").split("/")
        rot = 0
        for sd in v.get("side_data_list", []) or []:
            rot = int(sd.get("rotation", 0) or 0)
        w, h = int(v["width"]), int(v["height"])
        if abs(rot) in (90, 270):
            w, h = h, w
        d.update(ancho=w, alto=h, fps=round(float(n) / float(dd), 3))
    return d


def audio_con_cues(duracion, cues, salida, base=None):
    """Crea una pista de audio (wav) de `duracion` con los cues mezclados sobre `base` (o silencio)."""
    ins = ["-f", "lavfi", "-t", f"{duracion:.3f}", "-i", "anullsrc=r=48000:cl=stereo"] if not base else ["-i", base]
    filtros, etiquetas = [], ["[0:a]"]
    if base:
        filtros.append("[0:a]aresample=48000,aformat=channel_layouts=stereo[b]")
        etiquetas = ["[b]"]
    for i, cue in enumerate(cues, start=1):
        s = SFX[cue["sfx"]]
        ins += ["-i", os.path.join(SFX_DIR, s["archivo"])]
        inicio = float(cue["t"]) - float(cue.get("impacto", s["impacto_s"]))
        db = float(cue.get("db", s["ganancia_db_sugerida"]))
        cadena = f"[{i}:a]aresample=48000,aformat=channel_layouts=stereo"
        if inicio < 0:
            cadena += f",atrim=start={-inicio:.3f},asetpts=PTS-STARTPTS"
            inicio = 0
        if cue.get("dur"):
            d = float(cue["dur"])
            cadena += f",atrim=duration={d:.3f},afade=t=out:st={max(0, d - .25):.3f}:d=0.25"
        ms = int(inicio * 1000)
        cadena += f",volume={db}dB,adelay={ms}|{ms}[s{i}]"
        filtros.append(cadena)
        etiquetas.append(f"[s{i}]")
    if len(etiquetas) == 1:
        filtros.append(f"{etiquetas[0]}anull[mix0]")
    else:
        filtros.append("".join(etiquetas) + f"amix=inputs={len(etiquetas)}:normalize=0:duration=first[mix0]")
    filtros.append(f"[mix0]alimiter=limit=0.95,atrim=duration={duracion:.3f}[out]")
    run(["ffmpeg", "-v", "error", "-y"] + ins + ["-filter_complex", ";".join(filtros), "-map", "[out]", "-c:a", "pcm_s16le", salida])


def juntar_audio(video, audio, salida):
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-i", audio, "-map", "0:v", "-map", "1:a", "-c:v", "copy",
         "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", salida])


def extraer_audio(video, tmp):
    info = probe(video)
    if not info["audio"]:
        return None
    wav = os.path.join(tmp, "base.wav")
    run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vn", "-ac", "2", "-ar", "48000", wav])
    return wav


def remezclar(video, cues, salida):
    """Mezcla cues sobre el audio de `video` (copia el video sin recodificar)."""
    info = probe(video)
    with tempfile.TemporaryDirectory() as tmp:
        base = extraer_audio(video, tmp)
        wav = os.path.join(tmp, "mix.wav")
        audio_con_cues(info["duracion"], cues, wav, base)
        juntar_audio(video, wav, salida)


# ---------------------------------------------------------------- sonidos
def cmd_sonidos(a):
    cues = json.load(open(a.cues, encoding="utf-8"))
    for c in cues:
        if c["sfx"] not in SFX:
            raise SystemExit(f"Sonido desconocido: {c['sfx']}. Disponibles: {', '.join(SFX)}")
    remezclar(a.video, cues, a.out)
    print(a.out)


def cmd_lista_sonidos(a):
    for k, s in SFX.items():
        print(f"{k:20s} {s['duracion_s']:>5.2f}s  {s['cuando_usar']}")


# ---------------------------------------------------------------- zoom / rebobinar
def cmd_zoom(a):
    info = probe(a.video)
    w, h = info["ancho"], info["alto"]
    z, i, f, tr = a.factor, a.ini, a.fin, a.transicion
    # z(t): 1 -> factor (ease) en [i, i+tr], se mantiene, vuelve en [f-tr, f] (o corte seco si tr=0)
    if tr <= 0:
        zexpr = f"if(between(t\\,{i}\\,{f})\\,{z}\\,1)"
    else:
        up = f"(1+({z}-1)*(1-pow(1-min(max((t-{i})/{tr}\\,0)\\,1)\\,3)))"
        dn = f"(1+({z}-1)*(1-pow(1-min(max(({f}-t)/{tr}\\,0)\\,1)\\,3)))"
        zexpr = f"if(lt(t\\,{i})\\,1\\,if(gt(t\\,{f})\\,1\\,min({up}\\,{dn})))"
    fx, fy = a.foco.split(",") if a.foco else ("0.5", "0.5")
    filtro = (f"scale=w='ceil(iw*{zexpr}/2)*2':h='ceil(ih*{zexpr}/2)*2':eval=frame,"
              f"crop={w}:{h}:x='(in_w-{w})*{fx}':y='(in_h-{h})*{fy}',setsar=1")
    tmp = tempfile.mkdtemp()
    mp4 = os.path.join(tmp, "z.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-vf", filtro, "-map", "0:v", "-map", "0:a?",
         "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "copy", mp4])
    cues = []
    if a.sonido != "ninguno":
        cues.append({"sfx": a.sonido, "t": i + (tr / 2 if tr > 0 else 0)})
        if a.sonido_salida:
            cues.append({"sfx": a.sonido, "t": f - (tr / 2 if tr > 0 else 0), "db": SFX[a.sonido]["ganancia_db_sugerida"] - 3})
    remezclar(mp4, cues, a.out) if cues else shutil.move(mp4, a.out)
    shutil.rmtree(tmp)
    print(a.out)


def cmd_rebobinar(a):
    """[0, fin] normal -> [ini, fin] al revés y acelerado (sin audio original, con 'rewind') -> [ini, final] normal."""
    info = probe(a.video)
    v = a.velocidad
    i, f = a.ini, a.fin
    dr = (f - i) / v
    tmp = tempfile.mkdtemp()
    tiene_audio = info["audio"]
    fc = (f"[0:v]trim=0:{f},setpts=PTS-STARTPTS[v1];"
          f"[0:v]trim={i}:{f},setpts=PTS-STARTPTS,reverse,setpts=PTS/{v},eq=saturation=0.75:contrast=1.08[v2];"
          f"[0:v]trim=start={i},setpts=PTS-STARTPTS[v3];")
    if tiene_audio:
        fc += (f"[0:a]atrim=0:{f},asetpts=PTS-STARTPTS[a1];"
               f"anullsrc=r=48000:cl=stereo,atrim=duration={dr:.3f}[a2];"
               f"[0:a]atrim=start={i},asetpts=PTS-STARTPTS[a3];"
               f"[a1]aresample=48000,aformat=channel_layouts=stereo[a1f];[a3]aresample=48000,aformat=channel_layouts=stereo[a3f];"
               "[v1][a1f][v2][a2][v3][a3f]concat=n=3:v=1:a=1[v][a]")
        mapa = ["-map", "[v]", "-map", "[a]"]
    else:
        fc += "[v1][v2][v3]concat=n=3:v=1:a=0[v]"
        mapa = ["-map", "[v]"]
    mp4 = os.path.join(tmp, "r.mp4")
    run(["ffmpeg", "-v", "error", "-y", "-i", a.video, "-filter_complex", fc] + mapa +
        ["-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", "-c:a", "aac", mp4])
    remezclar(mp4, [{"sfx": "rewind", "t": f, "impacto": SFX["rewind"]["impacto_s"], "dur": dr + .15}], a.out)
    shutil.rmtree(tmp)
    print(a.out)


def cmd_fotogramas(a):
    info = probe(a.video)
    d = info["duracion"]
    tiempos = [float(t) for t in a.tiempos.split(",")] if a.tiempos else [d * (k + .5) / a.n for k in range(a.n)]
    tmp = tempfile.mkdtemp()
    tiles = []
    for k, t in enumerate(tiempos):
        p = os.path.join(tmp, f"{k}.png")
        run(["ffmpeg", "-v", "error", "-y", "-ss", f"{t:.3f}", "-i", a.video, "-frames:v", "1", p])
        im = Image.open(p).convert("RGB")
        im.thumbnail((360, 360))
        tile = Image.new("RGB", (380, 410), (30, 30, 30))
        tile.paste(im, ((380 - im.width) // 2, 5))
        ImageDraw.Draw(tile).text((10, 380), f"t={t:.2f}s", font=fuente(20), fill=(255, 255, 255))
        tiles.append(tile)
    cols = min(4, len(tiles))
    filas = math.ceil(len(tiles) / cols)
    hoja = Image.new("RGB", (cols * 380, filas * 410), (0, 0, 0))
    for k, t in enumerate(tiles):
        hoja.paste(t, ((k % cols) * 380, (k // cols) * 410))
    hoja.save(a.out)
    shutil.rmtree(tmp)
    print(a.out)


def cmd_info(a):
    print(json.dumps(probe(a.video), ensure_ascii=False, indent=2))


# ---------------------------------------------------------------- CLI
def main():
    P = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    S = P.add_subparsers(dest="cmd", required=True)
    sonidos = list(SFX) + ["ninguno"]

    p = S.add_parser("info"); p.add_argument("video"); p.set_defaults(f=cmd_info)
    p = S.add_parser("lista-sonidos"); p.set_defaults(f=cmd_lista_sonidos)

    p = S.add_parser("sonidos"); p.add_argument("--video", required=True)
    p.add_argument("--cues", required=True, help='JSON: [{"sfx":"whoosh","t":2.5,"db":-8}]')
    p.add_argument("--out", required=True); p.set_defaults(f=cmd_sonidos)

    p = S.add_parser("zoom"); p.add_argument("--video", required=True)
    p.add_argument("--ini", type=float, required=True); p.add_argument("--fin", type=float, required=True)
    p.add_argument("--factor", type=float, default=1.25)
    p.add_argument("--transicion", type=float, default=.25, help="0 = punch-in seco")
    p.add_argument("--foco", help="x,y del punto a acercar en fracción (0.5,0.4)")
    p.add_argument("--sonido", default="whoosh", choices=sonidos)
    p.add_argument("--sonido-salida", action="store_true", help="Otro whoosh al volver del zoom")
    p.add_argument("--out", required=True); p.set_defaults(f=cmd_zoom)

    p = S.add_parser("rebobinar"); p.add_argument("--video", required=True)
    p.add_argument("--ini", type=float, required=True); p.add_argument("--fin", type=float, required=True)
    p.add_argument("--velocidad", type=float, default=3.0)
    p.add_argument("--out", required=True); p.set_defaults(f=cmd_rebobinar)

    p = S.add_parser("fotogramas"); p.add_argument("video"); p.add_argument("--n", type=int, default=8)
    p.add_argument("--tiempos", help="Lista de segundos separados por coma")
    p.add_argument("--out", required=True); p.set_defaults(f=cmd_fotogramas)

    a = P.parse_args()
    a.f(a)


if __name__ == "__main__":
    main()
