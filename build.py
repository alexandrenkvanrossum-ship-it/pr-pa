"""Assemble l'app : dist/ (PWA complète) et preview/app.html (aperçu artifact)."""
import json, pathlib
from PIL import Image, ImageDraw, ImageFont

root = pathlib.Path(__file__).parent
src = root / "src"
css = (src / "styles.css").read_text()
js = "\n".join((src / f).read_text() for f in ["data.js", "core.js", "sync.js", "bj.js", "agenda.js", "app.js"])
js = js.replace('if(typeof module!=="undefined") module.exports={parseTask:parseTask, iso:iso, parseISO:parseISO, norm:norm};', "")

head = """<title>Prépa ECG2</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap">
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js"></script>
<style>
""" + css + "\n</style>\n"
body = '<div id="root"></div>\n<script>\n' + js + "\n</script>\n"

# Aperçu (le squelette est ajouté à la publication)
(root / "preview").mkdir(exist_ok=True)
(root / "preview" / "app.html").write_text(head + body)

# PWA complète
dist = root
dist.mkdir(exist_ok=True)
pwa_head = """<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="theme-color" content="#F5F5F7">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="default">
<meta name="apple-mobile-web-app-title" content="Prépa">
<link rel="manifest" href="manifest.webmanifest">
<link rel="apple-touch-icon" href="icons/icon-180.png">
<link rel="icon" href="icons/icon-192.png">
<style>:root{padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}[hidden]{display:none!important}</style>
"""
(dist / "index.html").write_text(pwa_head + head + "</head><body>\n" + body + "</body></html>\n")
(dist / "manifest.webmanifest").write_text(json.dumps({
    "name": "Prépa ECG2", "short_name": "Prépa", "lang": "fr",
    "start_url": "./", "scope": "./", "display": "standalone",
    "background_color": "#F5F5F7", "theme_color": "#F5F5F7",
    "icons": [
        {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png"},
        {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png"},
        {"src": "icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"}
    ]
}, ensure_ascii=False, indent=2))
(dist / "sw.js").write_text("""const C='prepa-v1';
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(['./','index.html','manifest.webmanifest'])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r;}).catch(()=>caches.match(e.request)));});
""")

# Icônes : carré arrondi bleu, coche blanche
icons = dist / "icons"
icons.mkdir(exist_ok=True)
def icon(size, maskable=False):
    s = 4
    im = Image.new("RGBA", (size * s, size * s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    W = size * s
    if maskable:
        d.rectangle([0, 0, W, W], fill=(10, 122, 255))
    else:
        d.rounded_rectangle([0, 0, W - 1, W - 1], radius=int(W * 0.225), fill=(10, 122, 255))
    k = 0.62 if maskable else 1.0
    c = W / 2
    pts = [(c - 0.24 * W * k, c + 0.01 * W * k), (c - 0.06 * W * k, c + 0.19 * W * k), (c + 0.26 * W * k, c - 0.17 * W * k)]
    d.line(pts, fill="white", width=int(0.085 * W * k), joint="curve")
    for p in (pts[0], pts[2]):
        r = 0.0425 * W * k
        d.ellipse([p[0] - r, p[1] - r, p[0] + r, p[1] + r], fill="white")
    return im.resize((size, size), Image.LANCZOS)
icon(180).save(icons / "icon-180.png")
icon(192).save(icons / "icon-192.png")
icon(512).save(icons / "icon-512.png")
icon(512, True).save(icons / "icon-512-maskable.png")
print("ok", len(head + body) // 1024, "Ko")
