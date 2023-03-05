# PocPwa

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 14.2.5.

## ✨ Principales commandes :

1. Lancer les commandes pour démarrer les serveurs :

- Serveur de base de données : `npm run json-server`
- Serveur http : `npm run server`

2.1 Mode PWA :

builder ses sources : `ng build`
puis go : `https://localhost:8080`

Variables d'environnement chargées : `appsettings.prod.json`

2.2 Mode pas PWA :

compile et lance le site : `ng serve -o`
url de l'app : `https://localhost:2022`

Variables d'environnement chargées : `appsettings.dev.json`

## Development server

Run `ng serve` for a dev server. Navigate to `https://localhost:2022/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Update Angular CLI version Globally

npm uninstall -g angular-cli
npm cache verify (if npm > 5)
npm install -g @angular/cli@latest
https://www.angularjswiki.com/angular/update-angular-cli-version-ng-update-to-latest-6-7-versions/#:~:text=Steps%20To%20update%20Angular%20CLI,angular%2Fcli%40latest%20command.

## Doc Angular sur le sujet

https://angular.io/guide/service-worker-getting-started

## Install IndexedDb package dexie 

npm i dexie

https://www.npmjs.com/package/dexie

Tutos : 
https://dexie.org/docs/Tutorial/Angular
https://stackblitz.com/edit/angular-ivy-4666q1?file=src%2Fapp%2Fapp.module.ts

## ❌ Test package ngx-indexed-db

npm i ngx-indexed-db

Example : https://stackblitz.com/edit/angular-indexdb-demo-n4bjwa?devtoolsheight=33&file=src%2Fapp%2Fapp.module.ts

https://www.npmjs.com/package/ngx-indexed-db

## Install package http-server

npm i http-server

http-server: a simple static HTTP server

https://www.npmjs.com/package/http-server


## base de données à partir d'un fichier json

Install package json-server : `npm install -g json-server`

Lancer le serveur de base de données:

Run `npm run json-server` ou `json-server --watch C:\Users\nicos\Dev\poc\poc-pwa\src\assets\ressources\db.json`

Fichiers ressources en public, dossier : `src\assets\ressources`

Visiter `http://localhost:3000` pour voir/accéder à la base

## Launch server

Run before : `ng build`

PWA : Lancer le serveur :

http version
Run `npm run server` ou `http-server -p 8080 -c-1 dist/poc-pwa` to launch the local server

https version :
Run `http-server -p 8080 -c-1 dist/poc-pwa --cors --ssl -C .ssl/localhost.crt -K .ssl/localhost.key`

=> => => => go sur `https://localhost:8080`

- changement dans le code puis ng build
- génère le livrable dans le dossier dist/ -> le serveur pointe vers ce dossier donc c'est comme s'il y avait eu livraison
- si l'utilisateur redémarre l'appli la version en cache sera chargée et lui demande s'il veut mettre à jour l'app
- sinon l'app peut checker toutes les x minutes s'il y a une nouvelle version de l'app

## Create CRUD API point :

https://crudcrud.com/