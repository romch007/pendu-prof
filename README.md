# API pendu

C'est une API pour jouer au pendu, ça fait pas le café mais c'est pas mal.

Installer les dépendances: `yarn`

Pour lancer: `yarn dev`

On peut jouer à plusieurs sur l'API, chaque nouvelle partie génère un cookie de session qui permet d'identifier le joueur et gérer sa game de façon adéquate.

Vu que j'ai pas relié le front et le back, j'ai codé un petit client en ligne de commande dans `client.mjs`.
