Déroulement du Jeu : Le Parcours Utilisateur

Voici le parcours typique d'un visiteur :

1. Scan du Premier QR Code :
    - Le visiteur scanne un QR code avec son téléphone.
    - Le navigateur s'ouvre sur une page de votre jeu (ex: votre-jeu.com/piece?id=3).
    - La page affiche l'image de la pièce de tangram débloquée, son nom, et l'histoire fascinante de l'œuvre du musée qui lui est associée. Un bouton "Ajouter à ma collection" apparaît.

2. Collection des Pièces :
    - En cliquant sur le bouton, le jeu sauvegarde l'ID de la pièce dans le localStorage du navigateur et redirige l'utilisateur vers une page "Ma Collection".
    - Cette page affiche toutes les pièces déjà collectées et des emplacements grisés pour celles qui manquent.

3. Déblocage des Puzzles :
    - Une fois que le localStorage indique que les 7 pièces ont été collectées, un message apparaît : "Félicitations, vous avez toutes les pièces ! Vous pouvez maintenant résoudre les puzzles."
    - Un nouveau bouton "Résoudre un puzzle" devient cliquable.

4. Résolution du Puzzle :
    - L'utilisateur arrive sur l'interface du jeu.
    - Sur l'écran, il voit :
        - La silhouette de la forme à recomposer.
        - Ses 7 pièces de tangram qu'il peut manipuler (glisser, tourner).
    - Il doit placer les 7 pièces pour qu'elles remplissent parfaitement la silhouette sans se chevaucher.
4. La Récompense Finale :
        - Une fois le puzzle résolu, une animation se déclenche.
        - La silhouette et les pièces s'effacent pour laisser apparaître la magnifique œuvre finale que vous avez conçue.
        - Un message de félicitations conclut l'expérience. Vous pouvez proposer plusieurs puzzles à résoudre.

---
