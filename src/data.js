/* Données de référence : matières, emploi du temps, pales, épreuves. */
var SUBJECTS = {
  maths: {id:"maths", name:"Maths", short:"Maths", cls:"s-maths", ic:"∑", blurb:"Séances à l'exercice près, quiz de cours, reprise espacée, DM du lundi."},
  hgg:   {id:"hgg",   name:"HGG", short:"HGG", cls:"s-hgg", ic:"HG", blurb:"Atelier HGG sur claude.ai, colles par quinzaine, plan détaillé du dimanche."},
  csh:   {id:"csh",   name:"CSH", short:"CSH", cls:"s-csh", ic:"Hu", blurb:"Thème de l'année : L'humanité. Une œuvre proposée chaque jour, des duos de références."},
  ang:   {id:"ang",   name:"Anglais", short:"Anglais", cls:"s-ang", ic:"EN", blurb:"CIVI, revue de presse du dimanche, essay, RAC, thème."},
  all:   {id:"all",   name:"Allemand", short:"Allemand", cls:"s-all", ic:"DE", blurb:"CIVI, revue de presse du dimanche, traduction hebdomadaire."},
  perso: {id:"perso", name:"Perso", short:"Perso", cls:"s-perso", ic:"•", blurb:"Rendez-vous et vie quotidienne."}
};
var SUBJECT_ORDER = ["maths","hgg","csh","ang","all"];

/* Emploi du temps des cours (ECG2 2026-2027). jour : 1 = lundi … 6 = samedi */
var COURSES = [
  {d:1,s:"08:15",e:"10:15",t:"Maths",sub:"maths"},
  {d:1,s:"10:30",e:"12:30",t:"HGG",sub:"hgg"},
  {d:1,s:"14:00",e:"15:00",t:"Philo",sub:"csh"},
  {d:1,s:"15:00",e:"16:00",t:"HGG",sub:"hgg"},
  {d:2,s:"08:15",e:"10:15",t:"Philo",sub:"csh"},
  {d:2,s:"10:30",e:"12:30",t:"Forum",sub:"neutral",forum:true},
  {d:2,s:"14:00",e:"15:00",t:"Allemand",sub:"all"},
  {d:2,s:"15:00",e:"16:00",t:"Info",sub:"neutral"},
  {d:2,s:"16:00",e:"18:00",t:"Anglais",sub:"ang"},
  {d:3,s:"08:15",e:"10:15",t:"TD Maths",sub:"maths"},
  {d:3,s:"10:30",e:"12:30",t:"Allemand",sub:"all"},
  {d:3,s:"14:00",e:"15:00",t:"Maths",sub:"maths"},
  {d:3,s:"15:00",e:"16:00",t:"Français",sub:"csh"},
  {d:3,s:"16:00",e:"17:00",t:"Anglais",sub:"ang"},
  {d:4,s:"08:15",e:"10:15",t:"Maths",sub:"maths"},
  {d:4,s:"10:30",e:"12:30",t:"Sport",sub:"neutral"},
  {d:5,s:"08:15",e:"10:15",t:"Maths",sub:"maths"},
  {d:5,s:"10:30",e:"12:30",t:"HGG",sub:"hgg"},
  {d:6,s:"08:15",e:"10:15",t:"Français",sub:"csh"},
  {d:6,s:"10:30",e:"12:30",t:"HGG",sub:"hgg"}
];
var FORUM_REF = "2026-09-29"; /* un mardi sur deux à partir de cette date */

/* Pales (DST) et concours blanc */
var PALES = [
  {date:"2026-10-03",t:"HGG",sub:"hgg",s:"13:30",e:"17:30"},
  {date:"2026-10-10",t:"Dissertation (CSH)",sub:"csh",s:"13:30",e:"17:30"},
  {date:"2026-11-07",t:"Allemand",sub:"all",s:"13:30",e:"15:15"},
  {date:"2026-11-14",t:"HGG",sub:"hgg",s:"13:30",e:"17:30"},
  {date:"2026-11-21",t:"Maths",sub:"maths",s:"13:30",e:"17:30"},
  {date:"2026-11-28",t:"Synthèse",sub:"csh",s:"13:30",e:"17:30"},
  {date:"2026-12-05",t:"Anglais",sub:"ang",s:"13:30",e:"15:00"},
  {date:"2026-12-15",t:"Concours blanc · Dissertation",sub:"csh",s:"13:30",e:"17:30",cb:true},
  {date:"2026-12-16",t:"Concours blanc · Maths 1",sub:"maths",s:"08:00",e:"12:00",cb:true},
  {date:"2026-12-16",t:"Concours blanc · Anglais",sub:"ang",s:"13:30",e:"17:30",cb:true},
  {date:"2026-12-17",t:"Concours blanc · Maths 2",sub:"maths",s:"08:00",e:"12:00",cb:true},
  {date:"2026-12-17",t:"Concours blanc · HGG",sub:"hgg",s:"13:30",e:"17:30",cb:true},
  {date:"2026-12-18",t:"Concours blanc · Synthèse",sub:"csh",s:"13:30",e:"17:30",cb:true},
  {date:"2026-12-19",t:"Concours blanc · Allemand",sub:"all",s:"08:00",e:"12:00",cb:true},
  {date:"2027-01-09",t:"Entretiens type ESCP",sub:"neutral",s:"13:30",e:"17:30"},
  {date:"2027-01-16",t:"Anglais",sub:"ang",s:"13:30",e:"17:30"},
  {date:"2027-01-23",t:"Maths",sub:"maths",s:"13:30",e:"17:30"},
  {date:"2027-01-30",t:"Allemand",sub:"all",s:"13:30",e:"17:30"},
  {date:"2027-02-06",t:"HGG (matin)",sub:"hgg",s:"08:00",e:"12:00"},
  {date:"2027-03-06",t:"Dissertation (CSH)",sub:"csh",s:"13:30",e:"17:30"},
  {date:"2027-03-13",t:"Maths",sub:"maths",s:"13:30",e:"17:30"},
  {date:"2027-03-18",t:"LVA toutes langues (allemand)",sub:"all",s:"13:30",e:"17:30"},
  {date:"2027-03-20",t:"HGG",sub:"hgg",s:"13:30",e:"17:30"}
];
var EVENTS_SCHOOL = [
  {date:"2026-10-17",t:"Cours, pas de pale"},
  {date:"2026-12-12",t:"Révisions"},
  {date:"2027-02-04",t:"Match Ginette–Hoche"},
  {date:"2027-02-27",t:"Pélé Night"}
];
/* Vacances confirmées (les autres périodes restent à préciser) */
var VACANCES = [
  {from:"2026-10-18",to:"2026-11-01",name:"Toussaint"}
];

/* Épreuves (Notes et Méthodo) : coefficients HEC, ECG maths approfondies, option HGG */
var EPREUVES = {
  ecrit:[
    {id:"e-maths",name:"Maths",sub:"maths",coef:10,coefTxt:"5 + 5 (Maths I et II)"},
    {id:"e-hgg",name:"HGG",sub:"hgg",coef:6},
    {id:"e-dissert",name:"CSH dissertation",sub:"csh",coef:4},
    {id:"e-synth",name:"Synthèse",sub:"csh",coef:3},
    {id:"e-ang",name:"Anglais",sub:"ang",coef:3,types:["Essay","RAC","Thème"]},
    {id:"e-all",name:"Allemand",sub:"all",coef:4,types:["Essay","Version / Thème","Contraction"]}
  ],
  oral:[
    {id:"o-maths",name:"Maths",sub:"maths",coef:9},
    {id:"o-hgg",name:"HGG",sub:"hgg",coef:8},
    {id:"o-csh",name:"CSH",sub:"csh",coef:6},
    {id:"o-entretien",name:"Entretiens de personnalité",sub:"neutral",coef:0,coefTxt:"autres écoles"},
    {id:"o-trip",name:"Triptyque",sub:"neutral",coef:6},
    {id:"o-ang",name:"Anglais",sub:"ang",coef:3},
    {id:"o-all",name:"Allemand",sub:"all",coef:4}
  ]
};
var BARRE_HEC = 15.29;

/* CSH : sous-thèmes et œuvres de départ */
var SOUS_THEMES = [
  ["I","Les sens du mot"],["I","Le propre de l'homme"],["I","Se faire humain"],["I","Humanité et animalité"],["I","Humanité et machine"],["I","Les marges"],["I","Un genre humain, des cultures"],
  ["II","Instincts, pulsions, passions"],["II","Misère et chute"],["II","L'inhumanité de l'humanité"],["II","La déshumanisation"],["II","Le tragique et l'absurde"],
  ["III","Reconnaître son semblable"],["III","L'humanité par l'humanité"],["III","Le genre humain comme communauté"],["III","Grandeur et progrès"],["III","L'art, patrimoine et refuge"],["III","Dépasser ou préserver l'humanité"]
];
var CSH_PICKS = [
  {t:"Sophocle, Antigone — premier chœur (« Polla ta deina »)", a:"L'homme, la plus deinos des merveilles : merveilleux et terrible à la fois. La symétrie de la perfectibilité en un seul mot.", st:"original", sous:["Le propre de l'homme","L'inhumanité de l'humanité"]},
  {t:"Simone Weil, « L'Iliade ou le poème de la force »", a:"La force fait une chose de celui qui la subit. Partenaire idéal d'Homère, au cœur du dossier 2.", st:"original", sous:["La déshumanisation","L'inhumanité de l'humanité"]},
  {t:"Kafka, « Rapport pour une académie »", a:"Un singe devenu homme par imitation forcée, en quête d'une issue plutôt que de la liberté. Objection à Rousseau.", st:"original", sous:["Se faire humain","Humanité et animalité"]},
  {t:"Montaigne, « De la cruauté » (Essais, II, 11)", a:"Nos devoirs envers les bêtes : sortir de l'éternel « Des cannibales ».", st:"original", sous:["Humanité et animalité","Reconnaître son semblable"]},
  {t:"Vercors, Les Animaux dénaturés", a:"Un procès pour savoir si les « tropis » sont humains. Tout le sous-thème animalité en un roman.", st:"original", sous:["Humanité et animalité","Le propre de l'homme"]},
  {t:"Rousseau, Discours sur l'origine de l'inégalité", a:"Perfectibilité, pitié, amour-propre : le contrepoint nécessaire de toutes les copies.", st:"noyau", sous:["Le propre de l'homme","Se faire humain"]},
  {t:"Hugo, L'Homme qui rit", a:"Un visage mutilé, une dignité intacte. Se prépare avec le dossier 4 (Hugo et Balzac).", st:"original", sous:["Les marges","Reconnaître son semblable"]}
];
