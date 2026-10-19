"""Assemble l'app : dist/ (PWA complète) et preview/app.html (aperçu artifact)."""
import json, pathlib
from PIL import Image, ImageDraw, ImageFont

root = pathlib.Path(__file__).parent
src = root / "src"
css = (src / "styles.css").read_text()
inl = "".join("var %s=%s;\n" % (v, json.dumps(json.loads((src / f).read_text()), ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")) for v, f in [("METHODO", "methodo-data.json"), ("HGG_PROG", "hgg-data.json"), ("MATHS_DRIVE", "maths-data.json")])
js = inl + "\n".join((src / f).read_text() for f in ["data.js", "vacplan.js", "core.js", "sync.js", "bj.js", "files.js", "annales.js", "agenda.js", "plan.js", "app.js"] if (src / f).exists())
js = js.replace('if(typeof module!=="undefined") module.exports={parseTask:parseTask, iso:iso, parseISO:parseISO, norm:norm};', "")

head = """<title>Prépa ECG2</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>
<script src="https://cdn.jsdelivr.net/npm/morphdom@2.7.4/dist/morphdom-umd.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
<script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"></script>
<style>
""" + css + "\n</style>\n"
body = '<div id="root"></div>\n<script>\n' + js + "\n</script>\n"

# Aperçu (le squelette est ajouté à la publication)
(root / "preview").mkdir(exist_ok=True)
(root / "preview" / "app.html").write_text(head + body)

# PWA complète
dist = root / "dist"
dist.mkdir(exist_ok=True)
pwa_head = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#F5F5F7">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Prépa">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png?v=2">
<link rel="icon" href="icons/favicon-64.png?v=2">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
"""
(dist / "index.html").write_text(pwa_head + head + "</head><body>\n" + body + "</body></html>\n")
(dist / "manifest.webmanifest").write_text(json.dumps({
    "name": "Prépa ECG2", "short_name": "Prépa", "lang": "fr",
    "start_url": "./", "scope": "./", "display": "standalone",
    "background_color": "#F5F5F7", "theme_color": "#F5F5F7",
    "icons": [
        {"src": "icons/icon-192.png?v=2", "sizes": "192x192", "type": "image/png"},
        {"src": "icons/icon-512.png?v=2", "sizes": "512x512", "type": "image/png"},
        {"src": "icons/icon-512-maskable.png?v=2", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
    ]
}, ensure_ascii=False, indent=2))
(dist / "sw.js").write_text("""const C='prepa-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.webmanifest'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request)));});
""")

# Icônes : la chouette diplômée sous les étoiles (src/icon.svg, src/icon-maskable.svg)
import io, cairosvg
icons = dist / "icons"
icons.mkdir(exist_ok=True)
def render(svg, size):
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(), output_width=size * 4, output_height=size * 4))).convert("RGBA").resize((size, size), Image.LANCZOS)
def rounded(im):
    W = im.size[0]; m = Image.new("L", (W * 4, W * 4), 0)
    ImageDraw.Draw(m).rounded_rectangle([0, 0, W * 4 - 1, W * 4 - 1], radius=int(W * 4 * 0.225), fill=255)
    im.putalpha(m.resize((W, W), Image.LANCZOS)); return im
svg = (src / "icon.svg").read_text(); svgm = (src / "icon-maskable.svg").read_text()
render(svg, 180).convert("RGB").save(icons / "icon-180.png")   # iOS arrondit lui-même
rounded(render(svg, 192)).save(icons / "icon-192.png")
rounded(render(svg, 512)).save(icons / "icon-512.png")
render(svgm, 512).convert("RGB").save(icons / "icon-512-maskable.png")
rounded(render(svg, 64)).save(icons / "favicon-64.png")
print("ok", len(head + body) // 1024, "Ko")
