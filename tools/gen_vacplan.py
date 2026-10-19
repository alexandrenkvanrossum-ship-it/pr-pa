# Génère src/vacplan.js : le programme détaillé des vacances de la Toussaint 2026.
import json, re

F = dict(td2="fmux1s0gvo5wma", exva="fmux43vtekovhq", td1="fmuyczwk1haitw", tdal="fmv5ftph7uvrws",
         exal="fmv5fu6ej4nh1k", tdd="fmvf1o8pm8a5wy", exd="fmvf1oi870ofi7")
# (fichier, index, minutes, titre) — relevé dans l'app (énoncés lus par Gemini)
EX = {
 "td2": [(0,10,"Loi du quotient de variables exponentielles"),(1,15,"Densité d'un produit et loi normale"),(2,10,"Loi d'une partie entière"),(3,10,"Espérance via l'intégrale de survie"),(4,20,"Densité de Cauchy et transformation"),(5,15,"Covariance nulle et indépendance")],
 "exva": [(7,25,"Densité de la valeur absolue"),(8,20,"Partie entière d'une variable exponentielle"),(9,15,"Densité et bijection réciproque"),(10,22,"Théorème de transfert et bijection"),(11,25,"Minimum et maximum de variables indépendantes"),(12,30,"Somme et produit de variables à densité"),(16,25,"Caractérisation de la loi exponentielle"),(17,25,"Fonction Gamma d'Euler"),(18,25,"Fonction de répartition de la loi gamma"),(19,28,"Somme de variables exponentielles"),(20,30,"Application de la loi normale"),(21,25,"Loi du khi-deux")],
 "td1": [(0,25,"Espérance et probabilité de queue"),(2,25,"Fonction de répartition et maximum"),(3,20,"Transformation d'une loi normale"),(4,30,"Quotient de lois exponentielles"),(5,22,"Comparaison espérance et inverse"),(7,40,"Somme et produit géométriques")],
 "tdal": [(0,35,"Endomorphismes et noyaux emboîtés"),(1,10,"Puissances d'endomorphisme nilpotentes"),(2,25,"Rang d'une somme d'applications"),(3,30,"Espace commutant d'un endomorphisme"),(4,25,"Projecteurs et sommes directes"),(5,40,"Interpolation et applications linéaires")],
 "exal": [(0,20,"Somme directe de trois sous-espaces"),(5,10,"Matrice associée à un endomorphisme"),(6,25,"Endomorphisme de polynômes et changement de base"),(7,15,"Matrices semblables et endomorphismes"),(8,15,"Critères de similitude de matrices"),(9,30,"Étude des projecteurs"),(10,30,"Étude des symétries vectorielles")],
 "tdd": [(0,15,"Matrice de rang 1 et puissances"),(1,30,"Endomorphisme de composition à gauche"),(2,15,"Spectre de aIn + UtV"),(3,20,"Endomorphisme associé à la trace"),(4,30,"Commutateur AM − MA et diagonalisation"),(5,12,"Réduction d'une matrice nilpotente"),(6,25,"Opérateur de moyenne sur C0"),(7,45,"Sous-espaces stables et réduction")],
 "exd": [(0,15,"Suites récurrentes linéaires"),(1,20,"Puissances de matrices et décomposition"),(2,8,"Diagonalisabilité d'un polynôme de matrice"),(3,12,"Calculs de vecteurs et valeurs propres"),(4,7,"Injectivité et valeur propre nulle"),(5,20,"Endomorphismes nilpotents et spectre"),(6,15,"Éléments propres sur les polynômes"),(7,12,"Base de vecteurs propres"),(8,20,"Détermination du spectre et des sous-espaces propres"),(9,15,"Spectre d'une transposée et similitude"),(10,10,"Trace et sous-espaces propres"),(11,15,"Spectre par rang et trace"),(12,8,"Matrice à valeur propre unique"),(13,12,"Endomorphisme sans valeur propre réelle"),(14,18,"Polynôme annulateur et division euclidienne"),(15,15,"Spectre des projecteurs et symétries"),(16,15,"Polynômes interpolateurs et sous-espaces propres"),(17,10,"Exemples et contre-exemples de diagonalisabilité"),(18,8,"Cardinal du spectre et dimensions"),(19,25,"Diagonalisation et suites récurrentes"),(20,15,"Polynôme annulateur scindé à racines simples"),(21,5,"Restriction aux sous-espaces propres"),(22,10,"Sous-espaces stables par un endomorphisme"),(23,8,"Matrice diagonale par blocs"),(24,30,"Racine carrée d'une matrice"),(25,20,"Réduction par blocs d'endomorphismes")],
}
LBL = dict(td2="TD 2 VA densité", exva="Exos d'accompagnement VA densité", td1="TD 1 VA densité", tdal="TD algèbre linéaire",
           exal="Exos d'accompagnement algèbre linéaire", tdd="TD diagonalisation", exd="Exos d'accompagnement diagonalisation")
def ex(f, i, redo=False):
    m, t = next((m, t) for j, m, t in EX[f] if j == i)
    if redo:  # déjà fait en cours : à refaire sans le corrigé (case propre à ce créneau)
        return dict(lab="À refaire sans aide · Ex. %d · %s (%s)" % (i+1, t, LBL[f]), min=max(10, m), sub="maths")
    return dict(lab="Ex. %d · %s (%s)" % (i+1, t, LBL[f]), min=max(10, m), sub="maths", ref=dict(k="exo", id="%s#%d" % (F[f], i)), star=True)
def it(lab, m, sub, **kw):
    d = dict(lab=lab, min=m, sub=sub); d.update(kw); return d

TASK = dict(eval="tmv5g2fwspye98", anki_m="tmv9yzvict3lbg", dst1="tmvaqej01jdohe", concepts="tmv52wg5ah49y8",
            klemp="tmv52w9aqvr9n4", coal="tmv5fo7slr0dxn", csh4="tmv84mu445hwls", hggall="tmv9ofe1iqtqf7", cshref="tmv9ofx3v2kmup")

# ---------- file d'attente des maths ----------
Q1 = [it("Correction de l'éval de cours", 60, "maths", task=TASK["eval"]),
      it("Intégrales généralisées · relire le cours : critères de convergence, comparaison, Riemann, changement de variable", 45, "maths"),
      it("Intégrales généralisées · refaire sans aide les exemples et exercices faits en cours", 60, "maths"),
      it("Anki maths : procédés et techniques classiques", 20, "maths", task=TASK["anki_m"])]
Q1 += [ex("td2", i) for i in (1, 2, 3, 4, 5)] + [ex("exva", i) for i in (9, 10, 18, 21)] + [ex("td1", i) for i in (2, 5)]
Q1 += [ex("exva", i, True) for i in (7, 8, 11, 12, 16, 17, 19, 20)] + [ex("td1", i, True) for i in (0, 4, 7)] + [ex("td2", 0, True)]
Q1 += [it("Livre blanc · VA à densité : 2 ou 3 exercices classiques non faits", 60, "maths")]
Q1 += [ex("tdal", i) for i in range(6)] + [ex("exal", i) for i in (8, 9, 10)]
Q1 += [ex("exal", i, True) for i in (0, 5, 6, 7)]
Q1 += [it("Livre blanc · algèbre linéaire (sommes directes, rang, matrices semblables)", 60, "maths"),
       it("Livre blanc · révisions d'analyse (suites, séries, équivalents)", 60, "maths"),
       it("Livre blanc · intégrales généralisées", 45, "maths"),
       it("Reprise : refaire sans aide 2 exercices ratés cette semaine", 45, "maths")]
Q2 = [it("Diagonalisation · cours : définitions, théorèmes et démonstrations, relecture active (fiche méthode à la fin)", 60, "maths"),
      it("Diagonalisation · refaire seul les exemples du cours", 45, "maths")]
exd = [ex("exd", i) for i in range(26)]; tdd = [ex("tdd", i) for i in range(8)]
Q2 += exd[:10] + tdd[:3] + exd[10:18] + tdd[3:6] + exd[18:] + tdd[6:]
Q2 += [it("TD de l'autre classe · partie %d (dépose-le dans Maths, type TD : chaque exercice aura sa case)" % k, 60, "maths") for k in (1, 2, 3, 4, 5)]
Q2 += [it("Reprise espacée : refaire sans aide 2 exos de VA à densité de la semaine 1", 45, "maths"),
       it("Reprise espacée : refaire sans aide 2 exos d'algèbre linéaire de la semaine 1", 45, "maths"),
       it("Fiche méthodes diagonalisation (une page) et refaire les exos ratés", 60, "maths")]
LB = [it("Livre blanc · diagonalisation : exercice %d" % k, 45, "maths") for k in range(1, 9)]
QUEUES = {"Q1": Q1, "Q2": Q2, "LB": LB}

def take(qname, cap):
    q = QUEUES[qname]; out = []; used = 0
    while q:
        k = next((j for j in range(min(4, len(q))) if used + q[j]["min"] <= cap), None)
        if k is None: break
        x = q.pop(k); out.append(x); used += x["min"]
    if cap - used >= 10:
        fill = {"Q1": "Livre blanc · exercices au choix sur le chapitre du jour", "Q2": "Livre blanc · diagonalisation", "LB": "Livre blanc · diagonalisation"}[qname]
        if qname == "Q2" and not q and QUEUES["LB"]: return out + take("LB", cap - used)
        out.append(it(fill, cap - used, "maths", filler=True))
    return out

def mins(a, b):
    h1, m1 = map(int, a.split(":")); h2, m2 = map(int, b.split(":")); return h2*60+m2-h1*60-m1

# ---------- contenus ----------
HCH = {"q1#0": "La France : un modèle entre héritages, crises et transformations", "q1#1": "La France : une puissance mondiale et maritime",
       "q1#2": "La France : une puissance européenne (souveraineté)", "q1#3": "Identités et diversités en Europe",
       "q1#4": "La construction européenne depuis les années 1950", "q1#5": "Territoires et aménagements face à la mondialisation",
       "q1#6": "Les villes en France et en Europe", "q2#0": "États-nations et construction européenne", "q2#1": "L'Europe monétaire",
       "q2#2": "L'énergie en Europe", "q2#3": "Démographie et migrations", "q2#4": "L'industrie en Europe",
       "q2#5": "L'espace européen : intégration, cohésion et disparités", "q2#6": "L'espace rhénan", "q2#7": "Agriculture et campagnes européennes"}
def chap(k, m):
    return it("HGG · reprendre « %s » : plan du cours, notions, 5 exemples et chiffres clés, puis feuille blanche" % HCH[k], m, "hgg", g="hggch")
def anki_h(m=20): return it("Anki HGG (toutes les cartes dues)", m, "hgg", g="ankih")
PLANS = {1: "La France est-elle encore une puissance mondiale ?",
         2: "L'Union européenne : une construction politique inachevée ?",
         3: "États-nations et construction européenne : une intégration sans fusion ?",
         4: "L'euro a-t-il fait de l'Union européenne une puissance ?"}
def plan(n, m=90): return it("Plan détaillé HGG n° %d : « %s » (problématique, 3 parties, exemples datés et chiffrés)" % (n, PLANS[n]), m, "hgg", g="plan")
TXT = [0]
def texte(m=25):
    TXT[0] += 1
    return it("Dossier éducation (DST d'allemand du 7 nov.) · texte %d : lecture, idées clés et faits à retenir" % TXT[0], m, "all", g="txt")
THEME = {"ang": [0], "all": [0]}
def theme(l):
    THEME[l][0] += 1
    return it("Thème d'%s n° %d (40 min chrono, puis correction)" % ("anglais" if l == "ang" else "allemand", THEME[l][0]), 40, l, g="theme")
OEUVRES = [("Sophocle, Antigone — premier chœur (« Polla ta deina »)", 1, "Le propre de l'homme"),
           ("Pic de la Mirandole, De la dignité de l'homme", 1, "Le propre de l'homme"),
           ("Montaigne, « De la cruauté » (Essais, II, 11)", 2, "Humanité et animalité"),
           ("Vercors, Les Animaux dénaturés", 2, "Humanité et animalité"),
           ("Homère, Iliade, chant XXIV (Priam et Achille)", 3, "La déshumanisation / Reconnaître son semblable"),
           ("Simone Weil, « L'Iliade ou le poème de la force »", 3, "La déshumanisation / Reconnaître son semblable"),
           ("Kafka, « Rapport pour une académie »", 4, "Se faire humain"),
           ("Kant, Réflexions sur l'éducation", 4, "Se faire humain"),
           ("Hugo, L'Homme qui rit", 5, "Les marges"),
           ("Shakespeare, La Tempête (Caliban)", 5, "Les marges"),
           ("Pascal, Pensées (grandeur et misère)", 6, "Misère et chute / Le tragique et l'absurde"),
           ("Camus, Le Mythe de Sisyphe", 6, "Misère et chute / Le tragique et l'absurde"),
           ("Descartes, Discours de la méthode, V (l'animal-machine)", 7, "Humanité et machine"),
           ("La Mettrie, L'Homme-machine", 7, "Humanité et machine")]
OE = [0]
def oeuvre(m, bonus=False):
    t, d, s = OEUVRES[OE[0]]; OE[0] += 1; n = 1 if OE[0] % 2 else 2
    return it("CSH · duo %d, œuvre %d : %s — parcours d'étude dans l'Atelier CSH (sous-thème : %s)" % (d, n, t, s), m, "csh", g="oeuvre", url="https://claude.ai/artifact/TA1xcsk7H5jfrj7vcYsfwV", **({"bonus": True} if bonus else {}))
def actu(m): return it("Actualité : titres de la presse (HGG, monde anglophone, Allemagne)", m, "neutral", g="actu")

def S(s, e, t, sub, items=None, kind="work", **kw):
    d = dict(s=s, e=e, t=t, sub=sub, kind=kind)
    if items is not None: d["items"] = items
    d.update(kw); return d
def F_(s, e, t): return S(s, e, t, "neutral", kind="fixed")
def M(s, e, q, quiz=False, t="Maths"):
    cap = mins(s, e); items = []
    if quiz: items.append(it("Quiz de cours (partie déjà vue)", 15, "maths", quiz=True)); cap -= 15
    return S(s, e, t, "maths", items + take(q, cap), crit=True)

P = {}
def day(d, lieu, note, obj, slots): P[d] = dict(lieu=lieu, note=note, obj=obj, slots=slots)

# ---------- semaine 1 : Bruxelles, voyage, retour ----------
day("2026-10-19", "Bruxelles", "Grosse journée de travail chez tes grands-parents, puis cinéma.",
    ["4 h de maths : éval de cours, intégrales généralisées, VA à densité", "HGG : Anki + le modèle français", "CSH : Antigone (duo 1)"], [
    M("10:45", "13:00", "Q1", quiz=True),
    F_("13:00", "14:00", "Déjeuner"),
    S("14:00", "15:05", "Allemand", "all", [theme("all"), texte()]),
    S("15:05", "16:15", "HGG", "hgg", [anki_h(), chap("q1#0", 50)]),
    S("16:15", "17:15", "CSH", "csh", [oeuvre(60)]),
    M("17:15", "19:00", "Q1"),
    F_("19:00", "22:30", "Cinéma puis dîner"),
    S("22:30", "22:50", "Actualité", "neutral", [actu(20)], actu=True)])
day("2026-10-20", "Bruxelles", "Réveil 8 h. Journée complète, fin à 20 h.",
    ["4 h 20 de maths : fin de VA à densité", "Plan HGG n° 1 et la France puissance mondiale", "CSH : Pic de la Mirandole (fin du duo 1)"], [
    M("08:30", "10:30", "Q1", quiz=True),
    F_("10:30", "10:40", "Pause"),
    M("10:40", "12:30", "Q1"),
    F_("12:30", "14:00", "Déjeuner"),
    S("14:00", "15:05", "Langues", "ang", [texte(), theme("ang")], subs=["ang", "all"]),
    S("15:05", "16:30", "HGG", "hgg", [anki_h(), chap("q1#1", 65)]),
    M("16:30", "17:00", "Q1"),
    F_("17:00", "17:30", "Pause"),
    S("17:30", "19:00", "HGG · plan", "hgg", [plan(1)]),
    S("19:00", "20:00", "CSH", "csh", [oeuvre(60)]),
    S("21:15", "21:45", "Actualité", "neutral", [actu(30)], actu=True)])
trip_ch = {"2026-10-21": "q1#2", "2026-10-22": "q1#3", "2026-10-23": "q1#4", "2026-10-24": "q1#5"}
for d, k in trip_ch.items():
    last = d == "2026-10-24"
    extra = [theme("all")] if d == "2026-10-21" else []
    day(d, "Voyage en famille", ("Retour en France. " if last else "") + "Horaires indicatifs : envoie-moi le programme et je cale les créneaux. Minimum : 3 h de maths + 1 h 30.",
        ["3 h de maths", "HGG : Anki + « %s »" % HCH[k], "Allemand : un texte du dossier"], [
        M("09:00", "12:00", "Q1", quiz=True),
        S("16:30", "17:45", "CSH (si le programme le permet)", "csh", [oeuvre(75, bonus=True)], bonus=True),
        S("18:00", "19:30" if not extra else "20:10", "HGG + allemand", "hgg", [anki_h(), chap(k, 45), texte()] + extra, subs=["hgg", "all"]),
        S("21:30", "22:00", "Actualité", "neutral", [actu(30)], actu=True)])
day("2026-10-25", "Chez toi, puis départ pour l'abbaye", "Train Paris-Est 16 h 36 → 17 h 44. Travail le soir après l'installation.",
    ["Plan HGG n° 2 (construction européenne)", "Maths : fin des révisions de la semaine 1", "Thème d'anglais n° 2"], [
    S("08:30", "10:00", "HGG · plan", "hgg", [plan(2)]),
    M("10:00", "11:30", "Q1", quiz=True),
    F_("11:30", "13:30", "Déjeuner"),
    S("13:30", "14:30", "Anglais + HGG", "ang", [theme("ang"), anki_h(20)], subs=["ang", "hgg"]),
    F_("14:30", "15:30", "Valise"),
    F_("15:30", "16:36", "Trajet jusqu'à Paris-Est"),
    F_("16:36", "17:44", "Train"),
    F_("17:44", "18:45", "Taxi et installation"),
    M("19:00", "21:15", "Q1"),
    S("21:15", "22:00", "Allemand + actu", "all", [texte(), actu(20)], subs=["all"])])

# ---------- semaine 2 : abbaye ----------
def abbaye(d, obj, lang, hgg, cshA, soir):
    day(d, "Abbaye", "Horaires monastiques : lever tôt, petit-déjeuner 7 h 45, au travail à 8 h 15.", obj, [
        F_("07:45", "08:15", "Petit-déjeuner"),
        M("08:15", "10:15", "Q2", quiz=True),
        F_("10:15", "10:25", "Pause"),
        M("10:25", "12:30", "Q2"),
        F_("12:30", "13:30", "Déjeuner"),
        lang, hgg,
        F_("16:30", "16:45", "Pause") if hgg["e"] == "16:30" else None,
        cshA,
        F_("18:15", "19:15", "Dîner"),
        S("19:15", "20:00", "Actualité", "neutral", [actu(45)], actu=True)] + soir)
def lang_std(l):
    return S("13:30", "15:00", "Langues", "all", [texte(), texte(), theme(l)], subs=["all", "ang"])
def hgg_std(k): return S("15:00", "16:30", "HGG", "hgg", [anki_h(), chap(k, 70)])
def csh_slot(s, e): return S(s, e, "CSH", "csh", [oeuvre(mins(s, e))])

abbaye("2026-10-26", ["Diagonalisation : cours + premiers exercices", "CSH : duo 4 complet (Kafka, Kant)", "HGG : les villes"],
       lang_std("ang"), hgg_std("q1#6"), csh_slot("16:45", "18:15"),
       [csh_slot("20:00", "21:15"), M("21:15", "22:00", "LB")])
abbaye("2026-10-27", ["Diagonalisation : exercices", "RAC n° 1 d'anglais", "Plan HGG n° 3"],
       S("13:30", "15:30", "RAC d'anglais", "ang", [it("RAC n° 1 : sujet ELVi LVB anglais 2025 (résumé analytique comparatif + essai, 2 h chrono)", 120, "ang", g="rac", url="https://misterprepa.net/sujet-anglais-lv2-elvi-2025/")]),
       S("15:30", "16:45", "HGG", "hgg", [anki_h(15), chap("q2#0", 60)]), csh_slot("16:45", "18:15"),
       [S("20:00", "21:30", "HGG · plan", "hgg", [plan(3)]), S("21:30", "22:00", "Allemand", "all", [texte()])])
abbaye("2026-10-28", ["Diagonalisation : exercices et TD", "Entraînement de synthèse (idées seulement)", "HGG : l'Europe monétaire"],
       lang_std("all"), hgg_std("q2#1"),
       S("16:45", "18:15", "Synthèse de textes", "csh", [it("Synthèse ESCP-HEC 2025 : seulement la prise en charge du dossier (problème, thèse de chaque auteur, chaînage logique, plan), sans rédiger ; puis comparer avec la copie notée 19", 90, "csh", g="synth", url="https://misterprepa.net/synthese-textes-escp-hec-2025-bonne-copie-19-2/")]),
       [csh_slot("20:00", "21:15"), M("21:15", "22:00", "LB")])
abbaye("2026-10-29", ["Diagonalisation : TD + TD de l'autre classe", "CSH : duo 6 complet (Pascal, Camus)", "HGG : l'énergie en Europe"],
       lang_std("ang"), hgg_std("q2#2"), csh_slot("16:45", "18:15"),
       [csh_slot("20:00", "21:15"), M("21:15", "22:00", "LB")])
abbaye("2026-10-30", ["Maths : TD de l'autre classe + livre blanc", "CSH : duo 7 complet (Descartes, La Mettrie)", "HGG : démographie et migrations"],
       lang_std("all"), hgg_std("q2#3"), csh_slot("16:45", "18:15"),
       [csh_slot("20:00", "21:15"), M("21:15", "22:00", "LB")])
# remplacer les None (pause absente)
for d in P: P[d]["slots"] = [x for x in P[d]["slots"] if x]
day("2026-10-31", "Abbaye, puis retour", "Train 15 h 22 → Paris 16 h 23, à la maison vers 17 h 30. Soirée libre après 20 h.",
    ["2 h de maths le matin", "HGG : l'industrie et l'espace européen", "Plan HGG n° 4"], [
    F_("07:45", "08:15", "Petit-déjeuner"),
    M("08:15", "10:15", "Q2", quiz=True),
    F_("10:15", "10:25", "Pause"),
    S("10:25", "12:30", "HGG", "hgg", [anki_h(), chap("q2#4", 50), chap("q2#5", 55)]),
    F_("12:30", "13:30", "Déjeuner"),
    S("13:30", "14:00", "HGG · concepts", "hgg", [it("Grands concepts HGG (choc chinois, souveraineté, sécurité économique, populisme, voisinage) : lexique et références", 30, "hgg", task=TASK["concepts"])]),
    F_("14:00", "15:22", "Départ et gare"),
    F_("15:22", "16:23", "Train"),
    F_("16:23", "17:30", "Retour à la maison"),
    S("18:00", "19:30", "HGG · plan", "hgg", [plan(4)]),
    S("19:30", "20:00", "Allemand + actu", "all", [texte(), actu(5)])])
day("2026-11-01", "Maison", "Dernier jour : du travail doux, pour arriver frais à la rentrée.",
    ["Bilan maths : fiche méthodes et exos ratés", "HGG : finir les chapitres (rhénan, agriculture) + corrigé du DST 1", "Allemand : derniers textes du dossier"], [
    M("09:30", "10:35", "Q2", t="Maths (léger)"),
    S("10:35", "12:00", "Allemand + HGG", "all", [texte(), texte(), anki_h(20), it("Anki anglais + allemand", 15, "ang")], subs=["all", "hgg", "ang"]),
    F_("12:00", "14:00", "Déjeuner"),
    S("14:00", "15:30", "HGG (léger)", "hgg", [chap("q2#6", 40), chap("q2#7", 50)], light=True),
    F_("15:30", "15:45", "Pause"),
    S("15:45", "17:15", "HGG · DST 1", "hgg", [it("Reprendre le corrigé du DST 1 (diaporama ; géopolitique des petites et moyennes puissances)", 90, "hgg", task=TASK["dst1"])], light=True),
    F_("17:15", "17:30", "Pause"),
    S("17:30", "18:30", "Allemand (léger)", "all", [texte(), it("Reprendre Viktor Klemperer : lexique nazi et lexique de l'AfD", 35, "all", task=TASK["klemp"])], light=True),
    S("18:30", "19:30", "Allemand · civi", "all", [it("Civi allemande : les coalitions précédentes et l'actuelle", 60, "all", task=TASK["coal"])], light=True),
    S("19:30", "20:00", "CSH + rentrée", "csh", [it("CSH : lire les textes du dossier 4 pour le prochain cours", 30, "csh", task=TASK["csh4"])], light=True)])

# vérifs
assert TXT[0] == 20, TXT[0]
assert OE[0] == 14, OE[0]
for d, v in P.items():
    for s in v["slots"]:
        if "items" in s and s["kind"] == "work":
            tot = sum(x["min"] for x in s["items"]); cap = mins(s["s"], s["e"])
            assert tot <= cap, (d, s["s"], s["t"], tot, cap)
left = {k: len(q) for k, q in QUEUES.items()}
mt = {d: sum(x["min"] for s in v["slots"] for x in s.get("items", []) if x["sub"] == "maths") for d, v in P.items()}
print("reste dans les files :", left, [x["lab"][:50] for x in Q1][:5])
print("maths/jour :", mt)
print("thèmes :", THEME)
open("src/vacplan.js", "w").write("/* Programme des vacances de la Toussaint (généré par tools/gen_vacplan.py) */\nvar VAC_PLAN=" + json.dumps(P, ensure_ascii=False, separators=(",", ":")) + ";\n")
