# Génère src/grange-data.json : sujets, oraux, rapports et meilleures copies (HGG, CSH, anglais LV2, allemand LV1).
# Relevé sur Major Prépa et Mister Prépa (octobre 2026). Langues : ELVi depuis la réforme de 2023 seulement.
import json
M = "https://major-prepa.com"; MU = M + "/wp-content/uploads/"
P = "https://misterprepa.net"; PU = P + "/wp-content/uploads/"
G = []
def e(s, t, c, y, ti, u, q=None, pdf=None, n=None, src=None, co=None, ra=None, kw=None, dur=None):
    d = dict(s=s, t=t, c=c, y=y, ti=ti, u=u)
    for k, v in dict(q=q, pdf=pdf, n=n, src=src, co=co, ra=ra, kw=kw, dur=dur).items():
        if v: d[k] = v
    if not src: d["src"] = "Mister Prépa" if u.startswith(P) else ("Ecricome" if "ecricome.org" in u else "Major Prépa")
    G.append(d)

# ---------------- HGG : sujets d'écrit ----------------
H = [
 (2026,"ESCP","/geopolitique/sujet-hgg-geopolitique-escp-2026/","Nouvelles convoitises étrangères et reconfigurations des alliances internationales en Afrique.",MU+"2026/03/hgg-escp-sujet-2026.pdf",None),
 (2026,"ESSEC","/geopolitique/sujet-geopolitique-essec-2026/","Vers une désoccidentalisation du monde ?",None,None),
 (2026,"Ecricome","/geopolitique/sujet-geopolitique-ecricome-2026/",None,MU+"2026/04/05-HGGMC-2026.pdf","États-Unis Amérique du Nord Tiers-monde Sud global"),
 (2025,"ESCP","/geopolitique/geopo-escp-2025-sujet/","La Chine, puissance rattrapée par ses vulnérabilités ?",None,None),
 (2025,"ESSEC","/geopolitique/geopolitique-essec-2025-sujet/","Les arcs de crise dans le monde depuis le début de la guerre froide.",None,None),
 (2025,"Ecricome","/geopolitique/geopo-ecricome-2025-sujets/","Sujet 1 : L'eau douce, enjeu de développement durable et de paix ? Sujet 2 : Construire l'Europe de la défense depuis les années 1950.",None,None),
 (2024,"ESCP","/geopolitique/geopo-escp-2024-sujet/","Le changement climatique, facteur de la recomposition de la mondialisation.",None,None),
 (2024,"ESSEC","/geopolitique/geopo-essec-2024-sujet/","Globalisation et multiplication des frontières depuis les années 90 : un paradoxe ?",None,None),
 (2024,"GEM","/geopolitique/geopo-gem-2024-sujet/","Quelle place pour l'Union Européenne dans l'espace méditerranéen ?",None,None),
 (2024,"Ecricome","/geopolitique/geopo-ecricome-2024-sujets/","Sujet 1 : L'Afrique au 21ème : de nouvelles dépendances post-coloniales ? Sujet 2 : Sommes-nous entrés dans l'ère de la démondialisation ?",None,None),
 (2023,"ESCP","/geopolitique/geopo-escp-2023-sujet/","Instabilités et violences en Amérique latine.",None,None),
 (2023,"ESSEC","/geopolitique/geopo-essec-2023-sujet/","La France, puissance d'influence mondiale ?",None,None),
 (2023,"GEM","/geopolitique/geopo-gem-2023-sujet/","Une guerre économique permet elle de régler un différend international ?",None,None),
 (2023,"Ecricome","/geopolitique/geopo-ecricome-2023-sujets/",None,None,None),
 (2022,"ESCP","/geopolitique/geopo-escp-2022-sujet/","Vers un retour des frontières ?",None,None),
 (2022,"ESSEC","/geopolitique/geopo-essec-2022-sujet/","Le contrôle des routes stratégiques depuis 1913, vecteur de domination mondiale pour les États.",None,None),
 (2022,"GEM","/geopolitique/geopo-gem-2022-sujet/",None,None,None),
 (2022,"Ecricome","/geopolitique/geopo-ecricome-2022-sujets/",None,None,None),
 (2021,"ESCP","/geopolitique/geopo-escp-2021-sujet/","Mondialisation et mise en concurrence des pays et des territoires pour attirer les activités économiques.",None,None),
 (2021,"ESSEC","/geopolitique/geopolitique-essec-2021-sujet/","La maîtrise des espaces communs (maritime, aérien, extra-atmosphérique et numérique), enjeu de puissance par les États depuis 1945.",None,None),
 (2021,"GEM","/geopolitique/geopo-gem-2021-sujet/","La politique commerciale, vecteur de la puissance américaine ?",None,None),
 (2021,"Ecricome","/geopolitique/geopo-ecricome-2021-sujets/",None,None,None),
 (2020,"ESCP","/geopolitique/geopo-escp-2020-sujet/",None,None,None),
 (2020,"ESSEC","/geopolitique/geopo-essec-2020-sujet/",None,None,None),
 (2020,"GEM","/geopolitique/geopo-gem-2020-sujet/",None,None,None),
 (2020,"Ecricome","/geopolitique/geopo-ecricome-2020-sujets/",None,None,None),
 (2019,"ESCP","/geopolitique/geopo-escp-2019-sujet/",None,None,None),
 (2019,"ESSEC","/geopolitique/geopo-essec-2019-sujet/",None,None,None),
 (2019,"Ecricome","/geopolitique/geopo-ecricome-2019-sujets/",None,None,None),
]
for y, c, u, q, pdf, kw in H:
    e("hgg", "sujet", c, y, "Géopolitique "+c+" "+str(y)+(" (HEC / ESCP)" if c=="ESCP" else ""), M+u, q=q, pdf=pdf, kw=kw, dur="4 h")
e("hgg","annale","Ecricome",2025,"Annales officielles HGGMC Ecricome 2025 : sujets, corrigés et rapport du jury","https://www.ecricome.org/wp-content/uploads/2025/10/ANNALES-PREPA_2025-HGGMC.pdf",kw="eau douce Europe de la défense corrigé rapport",dur="4 h")
e("hgg","rapport","ESCP",2025,"Rapport du jury HGG ESCP / HEC 2025",M+"/geopolitique/rapport-de-jury-hgg-escp-bs/",pdf=MU+"2025/07/266-Hist-geo-ESCP-BS-2025.pdf",kw="Chine vulnérabilités")
e("hgg","rapport","ESSEC",2025,"Rapport du jury HGG ESSEC 2025",M+"/geopolitique/rapport-de-jury-hgg-essec/",pdf=MU+"2025/07/265-Hist-geo-ESSEC-2025.pdf",kw="arcs de crise")
e("hgg","rapport","GEM",2024,"Rapport du jury HGG GEM 2024",M+"/geopolitique/rapport-de-jury-hgg-gem/",pdf=MU+"2025/07/267-Hist-geo-GEM.pdf",kw="Méditerranée Union européenne")

# ---------------- HGG : copies notées 20/20 ----------------
C = [
 ("ESCP",2025,M+"/geopolitique/copie-hgg-hec-escp-note-2020/",MU+"2026/02/HGG-Hec.pdf","20/20","Chine vulnérabilités"),
 ("ESSEC",2025,M+"/geopolitique/copie-dhgg-essec-2025-notee-20-20/",MU+"2025/11/copie-lisa-hgg-essec-20.pdf","20/20","arcs de crise"),
 ("ESSEC",2025,M+"/geopolitique/copie-hgg-essec-note-2020/",MU+"2026/02/Copie-Noe-ESSEC-HGGMC-_-2025.pdf","20/20","arcs de crise"),
 ("ESSEC",2025,M+"/geopolitique/copie-hgg-essec-note-2020-2/",MU+"2026/02/Copie-0265-00010-108898-2025.pdf","20/20","arcs de crise"),
 ("ESSEC",2025,P+"/geopolitique-essec-2025-bonne-copie-20/",PU+"2026/01/Copie-BCE-2025-geopo-ESSEC-Leane-20-.pdf","20/20","arcs de crise"),
 ("Ecricome",2026,P+"/geopolitique-ecricome-2026-bonne-copie-20/",PU+"2026/08/Copie-ECRICOME-2026-Noah-Geopo-sujet-1-20.pdf","20/20","États-Unis Amérique du Nord"),
 ("Ecricome",2025,M+"/geopolitique/copie-de-geopolitique-ecricome-2025-notee-20/",MU+"2025/07/Copie-hgg-ecricome-20_20.pdf","20/20",None),
 ("Ecricome",2025,M+"/geopolitique/copie-de-geopolitique-ecricome-2025-notee-20-copy/",MU+"2025/07/Ecricome-Copie-1500602800.pdf","20/20",None),
 ("Ecricome",2025,P+"/bonne-copie-geopolitique-ecricome-2025-20/",PU+"2025/11/Copie-ECRICOME-2025-Bianca-Geopo-20.pdf","20/20",None),
 ("Ecricome",2025,P+"/hgg-ecricome-2025-bonne-copie-20/",PU+"2025/07/Ecricome-2025-HGGMC-2020.pdf","20/20",None),
 ("ESSEC",2024,M+"/geopolitique/copie-de-geopolitique-essec-2024-notee-20/",MU+"2024/11/HGG-ESSEC.pdf","20/20","frontières globalisation"),
 ("ESSEC",2024,M+"/geopolitique/copie-de-geopolitique-essec-2024-notee-20-2/",MU+"2024/11/HGG-ESSEC-BCE.pdf","20/20","frontières globalisation"),
 ("ESSEC",2024,M+"/geopolitique/copie-de-geopolitique-essec-2024-notee-20-3/",MU+"2024/12/Copie-0265-00006-929867-2024.pdf","20/20","frontières globalisation"),
 ("Ecricome",2024,M+"/geopolitique/copie-de-geopolitique-ecricome-2024-notee-20-20/",MU+"2024/11/HGG-Ecricome.pdf","20/20",None),
 ("Ecricome",2024,P+"/bonne-copie-hgg-ecricome-2024-20-2/",PU+"2024/08/Ecricome_Copie_Alix_HGG20-1.pdf","20/20",None),
 ("Ecricome",2024,P+"/bonne-copie-hgg-ecricome-2024-20/",PU+"2024/07/Ecricome_Copie_Charles_HGG20-1.pdf","20/20",None),
 ("ESCP",2023,P+"/bonne-copie-hgg-escp-2023/",PU+"2023/10/Bonne-copie-HGG-ESCP-2023-Bruno-20-20_removed.pdf","20/20","Amérique latine instabilités violences"),
 ("GEM",2023,P+"/belle-copie-hgg-gem-2023/",PU+"2023/10/Bonne-copie-HGG-GEM-2023-Robin-20-20.pdf","20/20","guerre économique"),
 ("ESCP",2022,P+"/geopolitique-escp-bonne-copie-romane-20/",None,"20/20","retour des frontières"),
 ("ESSEC",2022,P+"/bonne-copie-geopolitique-essec/",None,"20/20","routes stratégiques"),
 ("ESCP",2021,P+"/geopolitique-escp-2021-copie-de-jean-20-20/",PU+"2021/10/copie-geopo-2021-escp.pdf","20/20","mondialisation mise en concurrence"),
 ("ESCP",2021,M+"/geopolitique/copie-hggmc-escp-hec-2021-notee-20-20/",None,"20/20","mondialisation mise en concurrence"),
]
for c, y, u, pdf, n, kw in C:
    e("hgg","copie",c,y,"Copie de géopolitique "+c+" "+str(y),u,pdf=pdf,n=n,kw=kw)

# ---------------- HGG : oraux ----------------
e("hgg","oral","HEC",None,"Sujets et rapports du jury des oraux HEC : géopolitique, triptyque et CSH",M+"/geopolitique/sujets-et-rapport-de-jury-des-oraux-hec-geopolitique-triptyque-et-csh/")
e("hgg","oral","HEC",2023,"Oral HEC 2023 : sujet traité",M+"/geopolitique/croissance-decroissance-deux-visions-economiques-2000/",q="La croissance et la décroissance : deux visions économiques depuis le début des années 2000")
e("hgg","oral","HEC",2023,"Oral HEC 2023 : sujet traité",M+"/geopolitique/origines-internet-developpement-oral-hec-2023/",q="Les origines d'Internet et son développement")
e("hgg","oral","HEC",None,"Comment décrocher 20/20 à l'oral HGG HEC",M+"/geopolitique/comment-decrocher-20-oral-hgg-hec/",kw="méthode conseils")
e("hgg","oral","HEC",None,"Comment travailler l'oral de géopolitique à HEC",M+"/geopolitique/comment-travailler-oral-geopolitique-hec/",kw="méthode conseils")

# ---------------- CSH : culture générale ----------------
CG = [
 (2026,"HEC / emlyon","/culture-generale/sujet-culture-generale-hec-emlyon-2026/","À trop juger.",None),
 (2026,"ESSEC / EDHEC","/culture-generale/sujet-cg-culture-generale-essec-edhec-2026/","Juger en toute liberté",None),
 (2026,"Ecricome","/culture-generale/sujet-culture-generale-cg-ecricome-2026/","Sujet 1 : De quoi ne peut-on juger ?",None),
 (2026,"Audencia (filière ECT)","/culture-generale/sujet-cg-culture-generale-audencia-2026/","Le poids du jugement",None),
 (2026,"Excelia (filière ECT)","/culture-generale/sujet-culture-generale-excelia-2026/","Sujet 1 : Juger, est-ce un acte de courage ?",None),
 (2025,"HEC / emlyon","/culture-generale/culture-generale-hec-emlyon-2025-sujet/","Sauver les images.",None),
 (2025,"ESSEC / EDHEC","/culture-generale/culture-generale-essec-edhec-sujet-2025/","Le mystère des images",None),
 (2025,"Ecricome","/culture-generale/culture-generale-ecricome-2025/","Sujet 1 : Qu'est-ce qui apparaît dans l'image ? Sujet 2 (hors thème) : L'inhumain",None),
 (2025,"Audencia (filière ECT)","/culture-generale/culture-generale-audencia-2025-sujet/","Les images, c'est la vie.",None),
 (2025,"Excelia (filière ECT)","/culture-generale/culture-generale-excelia-2025-sujet/","L'image peut-elle être une représentation fidèle de la réalité ?",None),
 (2024,"HEC / emlyon","/culture-generale/culture-generale-hec-emlyon-2024-sujet/","Sois sage, Ô ma violence.",None),
 (2024,"ESSEC / EDHEC","/culture-generale/culture-generale-essec-edhec-sujet-2024/","La violence peut-elle être mesurée ?",None),
 (2024,"Ecricome","/culture-generale/culture-generale-ecricome-2024-sujet/","Sujet 1 : Y a-t-il une violence rationnelle ? Sujet 2 : Nécessité fait loi",None),
 (2024,"Audencia (filière ECT)","/culture-generale/culture-generale-audencia-2024-sujet/","Résister à la violence.",None),
 (2024,"Excelia (filière ECT)","/culture-generale/culture-generale-excelia-2024-sujet/","Est-il naturel d'être violent ?",None),
 (2023,"HEC / emlyon","/culture-generale/culture-generale-hec-emlyon-2023-sujet/","L'épreuve du monde",MU+"2026/03/sujet-culture-generale-hec-emlyon.pdf"),
 (2023,"ESSEC / EDHEC","/culture-generale/culture-generale-essec-edhec-sujet-2023/","Le nouveau monde",None),
 (2023,"Ecricome","/culture-generale/culture-generale-ecricome-2023/","Sujet 1 : Être hors du monde. Sujet 2 : Avoir de l'esprit",None),
 (2023,"Audencia (filière ECT)","/culture-generale/culture-generale-audencia-2023-sujet/","Le Monde est-il assez grand ?",None),
 (2023,"Excelia (filière ECT)","/culture-generale/culture-generale-excelia-2023-sujet/","Sujet 1 : Avons nous chacun notre monde ?",None),
 (2022,"HEC / emlyon","/culture-generale/culture-generale-hec-emlyon-2022-sujet/","Aimer, est-ce se perdre ?",None),
 (2022,"ESSEC / EDHEC","/culture-generale/culture-generale-edhec-essec-sujet-2022/","Pensez-vous, comme l'a écrit La Rochefoucauld, qu'« il y a des gens qui n'auraient jamais été amoureux s'ils n'avaient jamais entendu parler de l'amour » ?",None),
 (2022,"Ecricome","/culture-generale/culture-generale-ecricome-2022/","Sujet 1 : Peut-on ne rien aimer ? Sujet 2 : Qu'est-ce que perdre son temps ?",None),
 (2022,"Excelia (filière ECT)","/culture-generale/culture-generale-excelia-2022-sujet/","Ne peut-on aimer que ce qui nous échappe ?",None),
 (2021,"HEC / emlyon","/culture-generale/culture-generale-hec-emlyon-2021-sujet/","Dire l'animal",None),
 (2021,"ESSEC / EDHEC","/culture-generale/culture-generale-edhec-essec-sujet-2021/","La communication animale est-elle un langage ?",None),
 (2021,"Ecricome","/culture-generale/culture-generale-ecricome-2021/","Sujet 1 : Qu'est-ce qu'une vie animale ? Sujet 2 : Les droits de l'État.",None),
 (2020,"HEC / emlyon","/culture-generale/culture-generale-hec-emlyon-2020-sujet/",None,None),
 (2020,"ESSEC / EDHEC","/culture-generale/culture-generale-edhec-essec-sujet/",None,None),
 (2020,"Ecricome","/culture-generale/culture-generale-ecricome-2020-sujet/",None,None),
 (2019,"HEC / emlyon","/culture-generale/culture-generale-hec-emlyon-2019-sujet/",None,None),
 (2019,"ESSEC / EDHEC","/culture-generale/culture-generale-edhec-essec-2019/",None,None),
 (2019,"Ecricome","/culture-generale/culture-generale-ecricome-2019-sujet/",None,None),
]
THEME = {2026:"juger jugement",2025:"l'image images",2024:"la violence",2023:"le monde",2022:"aimer amour",2021:"l'animal animal",2020:"le désir",2019:"le corps"}
for y, c, u, q, pdf in CG:
    e("csh","sujet",c,y,"Culture générale "+c+" "+str(y),M+u,q=q,pdf=pdf,kw="dissertation CG thème "+THEME.get(y,""),dur="4 h")
for y, u in [(2026,"/synthese-textes-escp-hec-sujet-2026/"),(2025,"/sujet-synthese-textes-escp-hec-paris-2025/"),(2024,"/synthese-texte-escp-hec-sujet-2024/"),(2023,"/synthese-escp-hec-2023-sujet/")]:
    e("csh","sujet","ESCP / HEC",y,"Synthèse de textes ESCP / HEC "+str(y),P+u,kw="synthèse de textes dossier",dur="4 h")
for y, u in [(2024,"/synthese-textes-escp-hec-2024-analyse/"),(2023,"/synthese-escp-hec-2023-analyse-sujet/")]:
    e("csh","rapport","ESCP / HEC",y,"Synthèse de textes ESCP / HEC "+str(y)+" : analyse du sujet",P+u,kw="synthèse analyse")
CC = [
 ("HEC / emlyon",2025,M+"/culture-generale/copie-culture-gnrale-hec-emlyon-2025-note-2020/",MU+"2026/02/Copie-Philo-Louis-Pogu-notee-20_20.pdf","Sauver les images"),
 ("HEC / emlyon",2025,M+"/culture-generale/copie-culture-gnrale-hec-emlyon-2025-note-2020-2/",MU+"2026/02/Philo-HEC.pdf","Sauver les images"),
 ("HEC / emlyon",2025,P+"/culture-generale-emlyon-hec-paris-2025-bonne-copie-20/",PU+"2025/12/Copie-BCE-2025-Allan-Culture-generale-EM-HEC-2020.pdf","Sauver les images"),
 ("HEC / emlyon",2025,P+"/dissertation-cg-emlyon-hec-paris-2025-bonne-copie-20/",PU+"2025/11/Copie-BCE-2025-Dissertation-CG-em-hec-20.pdf","Sauver les images"),
 ("HEC / emlyon",2024,P+"/culture-generale-hec-emylon-bonne-copie-20/",PU+"2025/06/Copie-BCE-2024-Culture-generale-HEC-2020-2.pdf","violence"),
 ("HEC / emlyon",2024,P+"/culture-generale-hec-emlyon-2024-bonne-copie-20-3/",PU+"2025/02/Copie-BCE-2024-20_20-2.pdf","violence"),
 ("HEC / emlyon",2024,P+"/culture-generale-hec-emlyon-2024-bonne-copie-20-2/",PU+"2025/01/Copie-BCE-2024-20_20.pdf","violence"),
 ("HEC / emlyon",2024,P+"/culture-generale-hec-emlyon-2024-bonne-copie-20/",PU+"2024/12/Copie-BCE-2024-20_20-.pdf","violence"),
 ("HEC / emlyon",2024,P+"/culture-generale-hec-emlyon-2024-meilleure-copie-20/",PU+"2024/10/COPIE-HEC-EMLYON-2024-2020.pdf","violence"),
 ("HEC / emlyon",2023,P+"/meilleure-copie-cg-emlyon-hec-2023-2/",PU+"2023/10/Bonne-copie-de-CG-emlyon-_-HEC-2023-Barthelemy-20_20.pdf","épreuve du monde"),
 ("HEC / emlyon",2022,P+"/culture-generale-hec-eml-2022-copie-de-tom-20/",PU+"2022/11/COPIE-de-Tom-CG-HEC-20.pdf","aimer"),
 ("HEC / emlyon",2021,P+"/culture-generale-hec-emlyon-2021-bonne-copie-20/",PU+"2021/11/Copie-Philosophie-EMHEC-2021-2020.pdf","dire l'animal"),
 ("HEC / emlyon",2021,P+"/culture-generale-hec-em-lyon-2021-bonne-copie/",PU+"2021/11/Bonne-copie-2021-CG.pdf","dire l'animal"),
 ("ESSEC / EDHEC",2021,P+"/culture-generale-essec-2021-excellente-copie/",PU+"2021/10/Copie-CG-ESSEC-Agathe-2020.pdf","communication animale"),
 ("Ecricome",2025,M+"/culture-generale/copie-culture-generale-ecricome-2025-notee-20/",MU+"2025/07/Ecricome-Copie-1501943200.pdf","image"),
 ("Ecricome",2024,P+"/bonne-copie-culture-generale-ecricome-20/",PU+"2024/11/Copie-Ilhan-ECRICOME-2024-20_20.pdf","violence"),
 ("Ecricome",2024,P+"/bonne-copie-culture-generale-ecricome-2024-20-3/",PU+"2024/08/Ecricome_Copie_Melvine_CG20-1.pdf","violence"),
 ("Ecricome",2024,P+"/bonne-copie-culture-generale-ecricome-2024-20-2/",PU+"2024/07/Ecricome_Copie_Maxime_CG20-1.pdf","violence"),
 ("Ecricome",2023,M+"/culture-generale/copie-culture-generale-ecricome-2023-notee-20-20/",MU+"2023/07/Ecricome-Copie-15021250200.pdf","monde"),
 ("Ecricome",2023,M+"/culture-generale/copie-culture-generale-ecricome-2023-notee-20-20-2/",MU+"2023/07/copie-philo-ecricome-.pdf","monde"),
 ("Ecricome",2023,P+"/bonne-copie-ecricome-2023-culture-generale-20-florian/",PU+"2023/08/CG-ECRICOME-2023-La-copie-de-Florian-20-Audencia.pdf","monde"),
 ("Ecricome",2023,P+"/bonne-copie-ecricome-2023-culture-generale-20-julien-essec/",PU+"2023/08/CG-ECRICOME-2023-La-copie-de-Julien-20-ESSEC.pdf","monde"),
 ("Ecricome",2023,P+"/bonne-copie-ecricome-2023-culture-generale-20/",PU+"2023/08/CG-ECRICOME-2023-La-copie-de-Nicolas-20.pdf","monde"),
 ("Ecricome",2023,P+"/bonne-copie-ecricome-2023-culture-generale-20-illona/",PU+"2023/08/BONNE-COPIE-2023-CULTURE-G-ECRICOME-20.pdf","monde"),
 ("Ecricome",2023,P+"/bonne-copie-ecricome-2023-culture-generale-20-rayane/",PU+"2023/08/Ecricome-BONNE-COPIE-CG-20-RAYANE.pdf","monde"),
 ("Ecricome",2023,P+"/bonne-copie-ecricome-2023-culture-generale-20-alexis/",PU+"2023/08/Ecricome-BONNE-COPIE-2023-CG-ALEXIS-20.pdf","monde"),
 ("Audencia (filière ECT)",2024,P+"/dissertation-culture-generale-audencia-2024-bonne-copie-20/",PU+"2025/04/Bonne-copie-BCE-2024-2020.pdf","violence"),
]
for c, y, u, pdf, kw in CC:
    e("csh","copie",c,y,"Copie de culture générale "+c+" "+str(y),u,pdf=pdf,n="20/20",kw="dissertation CG "+kw)
SC = [
 (2025,M+"/lettres/copie-de-synthse-de-texte-escp-hec-2025-note-2020/",MU+"2026/02/Copie-0304-00076-218511-2025-1.pdf","20/20"),
 (2023,P+"/tres-belle-copie-synthese-textes-escp-hec-2023/",PU+"2023/11/Bonne-copie-en-synthese-de-textes-ESCP-HEC-2023-Lola-20-20.pdf","20/20"),
 (2022,P+"/synthese-escp-2022-bonne-copie-20/",PU+"2023/05/Bonne-Copie-Synthese-ESCP-Nine-20.pdf","20/20"),
 (2021,P+"/bonne-copie-synthese-de-textes-escp-2021-20/",PU+"2022/01/Copie-Synthe%CC%80se-de-textes-ESCP-2021-2020.pdf","20/20"),
]
for y, u, pdf, n in SC:
    c = "ESCP / HEC" if y >= 2023 else "ESCP"
    e("csh","copie",c,y,"Copie de synthèse de textes "+c+" "+str(y),u,pdf=pdf,n=n,kw="synthèse de textes")
e("csh","oral","HEC",None,"Sujets et rapports du jury des oraux HEC : géopolitique, triptyque et CSH",M+"/geopolitique/sujets-et-rapport-de-jury-des-oraux-hec-geopolitique-triptyque-et-csh/")
for q, u in [("L'épopée","/culture-generale/oral-csh-hec-analyse-sujet-epopee/"),("L'exemple","/culture-generale/sujet-oral-hec-csh-exemple/"),("L'éloge de la vitesse","/culture-generale/oral-csh-hec-vitesse-analyse-corrige-detaille/"),("Le barbare","/culture-generale/oral-culture-generale-hec-le-barbare-exemple-sujet-traite/")]:
    e("csh","oral","HEC",None,"Oral de CSH HEC : sujet analysé et corrigé",M+u,q=q)

# ---------------- Anglais LV2 (ELVi depuis 2023) ----------------
for y, u, a, pdf in [(2026,"/anglais/sujet-langue-lv2-anglais-elvi-2026/","/anglais/analyse-sujet-langue-lv2-anglais-elvi-2026/",MU+"2026/03/anglais-2026-lvb.pdf"),(2025,"/anglais/lv2-anglais-elvi-2025-sujet/","/anglais/lv2-anglais-elvi-2025-analyse-du-sujet/",None),(2024,"/anglais/lv2-anglais-elvi-2024-sujet/","/anglais/lv2-anglais-elvi-2024-analyse-du-sujet/",None),(2023,"/anglais/lv2-anglais-elvi-2023-sujet/","/anglais/lv2-anglais-elvi-2023-analyse-du-sujet/",None)]:
    e("ang","sujet","ELVi LVB",y,"Anglais LV2 ELVi "+str(y)+" (RAC, essai, thème)",M+u,pdf=pdf,co=M+a,kw="RAC résumé analytique comparatif essai thème LVB",dur="3 h")
e("ang","rapport","ELVi LVB",2023,"Rapport du jury anglais LVB ELVi 2023","https://www.hec.edu/sites/default/files/documents/76%20-%20LVB%20ELVI%20anglais%202023.pdf",kw="RAC culture wars cancel culture",src="HEC")
e("ang","rapport","ELVi LVB",2025,"Rapport du jury anglais LVB ELVi 2025",M+"/anglais/rapport-de-jury-elvi-anglais-lvb/",kw="RAC méthode")
e("ang","copie","ELVi LVB",2024,"Copie d'anglais LV2 ELVi 2024",P+"/anglais-lv2-elvi-2024-bonne-copie-17/",pdf=PU+"2025/01/Copie-Silas-BCE-2024-171.pdf",n="17,1/20 · meilleure note publiée",kw="RAC essai thème")
e("ang","oral","HEC",None,"Oral d'anglais HEC : le plan qui a mené au 20/20",M+"/anglais/oral-danglais-hec-le-plan-qui-ma-mene-au-20-20/",n="20/20",kw="Trump garde nationale Los Angeles")
e("ang","oral","Toutes écoles",None,"Les sujets d'oral d'anglais à réviser",M+"/anglais/sujets-oral-anglais/",kw="environnement COP thèmes")
e("ang","oral","EDHEC",None,"Oral d'anglais EDHEC : méthode et analyse d'un sujet",M+"/anglais/oral-anglais-edhec-methode-analyse-sujet/")
e("ang","oral","EDHEC",None,"Sujet tombé à l'oral de l'EDHEC et son corrigé",M+"/anglais/companies-deforestation/",kw="deforestation companies")

# ---------------- Allemand LV1 (ELVi depuis 2023) ----------------
for y, u, a, pdf in [(2026,"/allemand/sujet-langue-lv1-allemand-elvi-2026/","/allemand/analyse-sujet-langue-lv1-allemand-elvi-2026/",MU+"2026/04/Allemand-sujet-2026.pdf"),(2025,"/allemand/lv1-allemand-elvi-2025-sujet/","/allemand/lv1-allemand-elvi-2025-analyse-du-sujet/",None),(2024,"/allemand/lv1-allemand-elvi-2024-sujet/","/allemand/lv1-allemand-elvi-2024-analyse-du-sujet/",MU+"2024/04/ELVI-LVA-Allemand-2024-SUJET.pdf"),(2023,"/allemand/lv1-allemand-elvi-2023-sujet/","/allemand/lv1-allemand-elvi-2023-analyse-du-sujet/",None)]:
    e("all","sujet","ELVi LVA",y,"Allemand LV1 ELVi "+str(y),M+u,pdf=pdf,co=M+a,kw="LVA essai version thème synthèse",dur="3 h")
e("all","oral","Toutes écoles",None,"Corrigé d'oral d'allemand",M+"/allemand/corrige-oral-allemand/",pdf=MU+"2017/05/03a-texte_oral.pdf")
e("all","oral","Toutes écoles",None,"Réussir l'oral d'allemand des écoles de commerce",M+"/allemand/reussir-oral-allemand-ecoles-de-commerce/",kw="méthode")
e("all","oral","Toutes écoles",None,"Références littéraires et cinématographiques à utiliser à l'oral",M+"/allemand/references-litteraires-cinematographiques-utiliser-oral/",kw="références films littérature")

# relie chaque copie au libellé de son sujet (même matière, même école, même année) pour la recherche
SQ = {(x["s"], x["c"], x["y"]): x.get("q", "") for x in G if x["t"] == "sujet" and x.get("q")}
for x in G:
    if x["t"] == "copie":
        q = SQ.get((x["s"], x["c"], x["y"]))
        if q: x["kw"] = ((x.get("kw") or "") + " " + q).strip(); x["sq"] = q
json.dump(G, open("src/grange-data.json","w"), ensure_ascii=False, separators=(",",":"))
from collections import Counter
print(len(G), Counter((x["s"],x["t"]) for x in G))
