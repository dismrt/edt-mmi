# EDT MMI
Code source de bot Discord permettant de fournir l'emploi du temps des étudiants en MMI à Mulhouse !

## Installation

Installer les dépendances :
```
npm install
```

Créer un bot discord et obtenir son token : https://discord.com/developers/applications \
Pour fonctionner correctement, le bot doit pouvoir :
- Envoyer des messages
- Lire le contenu des messages

Créer un fichier config.json et ajouter ceci à l'intérieur :
```
{
  "token": "TOKEN-DU-BOT-DISCORD"
}
```

Démarrer le bot avec la commande :
```
npm start
```

## Utilisation
```
!edt <groupe>
!edt <groupe> <date>
```
exemple :
```
!edt SCI
!edt CNA 24/10/2022
```

## TO DO
- Notification régulière de l'emploi du temps
- Ajouter les emplois du temps des étudiants en première année
