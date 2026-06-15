import bulbIcon from "../assets/bulb.svg";
import chatIcon from "../assets/chat.svg";
import crownIcon from "../assets/crown.svg";
import lightningIcon from "../assets/lightning-bolt.svg";
import pencilIcon from "../assets/pencil.svg";
import robotIcon from "../assets/robot.svg";

export const CORE_FEATURES = [
  {
    title: "Simulation tarifaire AfCFTA",
    description:
      "Estimez droits, TVA et taxes préférentielles en quelques clics selon l'origine et la destination.",
    iconUrl: pencilIcon,
  },
  {
    title: "Règles d'origine intelligentes",
    description:
      "Vérifiez l'éligibilité ZLECAf et le seuil de valeur ajoutée locale pour vos produits.",
    iconUrl: bulbIcon,
  },
  {
    title: "Classification HS assistée",
    description:
      "Identifiez le bon code douanier grâce à l'IA, avec un indice de confiance transparent.",
    iconUrl: robotIcon,
  },
  {
    title: "Comparaison multi-destinations",
    description:
      "Comparez le coût fiscal de vos expéditions vers plusieurs pays africains en un seul écran.",
    iconUrl: chatIcon,
  },
  {
    title: "Exports et certificats pro-forma",
    description:
      "Générez des synthèses PDF et TXT prêtes à partager avec vos partenaires logistiques.",
    iconUrl: crownIcon,
  },
  {
    title: "Traitement par lot",
    description:
      "Importez vos catalogues CSV ou Excel pour simuler des centaines de lignes en une passe.",
    iconUrl: lightningIcon,
  },
];

export const TOOL_TABS = [
  {
    id: "simulator",
    label: "Simulateur tarifaire",
    lightImage: "/landing/tab-image/tab-image-1.jpg",
    darkImage: "/landing/tab-image/tab-image-1-dark.jpg",
    title: "Le moyen le plus simple d'estimer vos droits",
    description:
      "Saisissez origine, destination, valeur et code HS pour obtenir une ventilation claire des taxes applicables.",
  },
  {
    id: "classifier",
    label: "Classification HS",
    lightImage: "/landing/tab-image/tab-image-2.jpg",
    darkImage: "/landing/tab-image/tab-image-2-dark.jpg",
    title: "Classifiez vos produits avec l'IA",
    description:
      "Décrivez votre marchandise en langage naturel et obtenez une proposition de nomenclature harmonisée.",
  },
  {
    id: "afcfta",
    label: "Règles ZLECAf",
    lightImage: "/landing/tab-image/tab-image-3.jpg",
    darkImage: "/landing/tab-image/tab-image-3-dark.jpg",
    title: "Vérifiez l'éligibilité préférentielle",
    description:
      "Analysez les calendiers de démantèlement tarifaire et les exclusions sensibles par année.",
  },
  {
    id: "batch",
    label: "Traitement par lot",
    lightImage: "/landing/tab-image/tab-image-4.jpg",
    darkImage: "/landing/tab-image/tab-image-4-dark.jpg",
    title: "Traitez vos catalogues en masse",
    description:
      "Chargez un fichier structuré et lancez des simulations groupées pour toute votre gamme produits.",
  },
  {
    id: "checklist",
    label: "Checklist Cameroun",
    lightImage: "/landing/tab-image/tab-image-5.jpg",
    darkImage: "/landing/tab-image/tab-image-5-dark.jpg",
    title: "Guidez vos imports étape par étape",
    description:
      "Suivez le parcours e-GUCE / CAMCIS avec une checklist interactive adaptée aux PME.",
  },
];

export const FAQ_ITEMS = [
  {
    id: 1,
    question: "RegTech remplace-t-il CAMCIS ou SIMPA ?",
    answer:
      "Non. RegTech fournit des estimations et des analyses d'aide à la décision. Seule la liquidation effectuée sur les systèmes douaniers officiels fait foi.",
  },
  {
    id: 2,
    question: "Quels pays sont couverts ?",
    answer:
      "La plateforme couvre les marchés AfCFTA avec des données de référence multi-pays, des comparaisons multi-destinations et un module fiscal dédié au Cameroun.",
  },
  {
    id: 3,
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui. Vous pouvez passer à un plan supérieur depuis l'espace Abonnements. Le paiement Mobile Money via PawaPay est disponible dans les pays couverts.",
  },
  {
    id: 4,
    question: "Que comprend le plan gratuit ?",
    answer:
      "Le plan Free permet de découvrir le simulateur et la classification HS avec des quotas mensuels limités, idéal pour tester l'outil avant de s'abonner.",
  },
  {
    id: 5,
    question: "Mes données sont-elles sécurisées ?",
    answer:
      "L'authentification est gérée par Clerk. Les simulations et l'historique sont associés à votre compte et les échanges API sont chiffrés en transit.",
  },
];

export const TESTIMONIALS = [
  {
    id: 1,
    name: "Aminata Diallo",
    company: "AgroExport Sénégal",
    image: "/landing/users/user-1.png",
    testimonial:
      "Nous comparons trois destinations en quelques minutes. RegTech nous fait gagner un temps précieux avant chaque expédition.",
  },
  {
    id: 2,
    name: "Kwame Mensah",
    company: "Accra Trade Hub",
    image: "/landing/users/user-2.png",
    testimonial:
      "La classification HS assistée nous a permis de corriger des codes erronés sur tout notre catalogue textile.",
  },
  {
    id: 3,
    name: "Fatou Ndiaye",
    company: "Dakar Logistics",
    image: "/landing/users/user-3.png",
    testimonial:
      "Le traitement par lot est devenu indispensable pour nos devis clients. Interface claire et résultats exploitables.",
  },
  {
    id: 4,
    name: "Jean-Pierre Nkomo",
    company: "Douala Import PME",
    image: "/landing/users/user-4.png",
    testimonial:
      "La checklist Cameroun structure notre équipe sur le parcours e-GUCE. Un vrai assistant pour les premiers imports.",
  },
  {
    id: 5,
    name: "Grace Okafor",
    company: "Lagos Commodities Ltd",
    image: "/landing/users/user-1.png",
    testimonial:
      "Les certificats pro-forma facilitent nos échanges avec la banque et nos transitaires partenaires.",
  },
  {
    id: 6,
    name: "Samuel Ebot",
    company: "CEMAC Freight",
    image: "/landing/users/user-2.png",
    testimonial:
      "Enfin un outil AfCFTA pensé pour les PME africaines, avec des tarifs accessibles en Mobile Money.",
  },
];
