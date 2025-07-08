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

Interactivity

1. Visual Feedback on Proximity

This is the easiest step towards a "snap" feature. When a dragged piece is close to its "correct" solution position, you can change its appearance, like making its stroke glow.

    Logic: In the handlePointerMove function, calculate the distance between the piece's current x, y and its final solutionX, solutionY.

    Implementation: If the distance is below a certain threshold (e.g., 20 pixels), add a .is-close class to the piece's div. Style this class in your CSS, perhaps with a different stroke color or a subtle glow.

2. A "Snap into Place" Feature

This is the most satisfying "juicy" feature you can add. When a user drops a piece close to its correct location, it automatically animates and locks into the perfect spot.

    Logic: In the handlePointerUp function, check the distance to the solution position, just like above.

    Implementation: If the distance is below your threshold, don't use the final drag coordinates. Instead, set the piece's x, y, and rotation directly to their solution values. The existing CSS transition on the transform property will create a smooth animation as it moves into place. You could also add a .is-snapped class to disable dragging for that piece.

3. Reset a Single Piece

Sometimes a user might get a piece stuck or rotated awkwardly. A simple reset button is a great quality-of-life feature.

    Logic: Add a "Reset Piece" button next to "Rotate" and "Flip".

    Implementation: The on:click handler for this button would find the activePiece in your pieces array and reset its x, y, and rotation to their initial starting values.

4. A "Solve" or "Hint" Button

For users who get stuck, a hint button that shows the final outline of the puzzle is very helpful.

    Logic: Create a new state variable, showHint = $state(false).

    Implementation: In your HTML, create a separate SVG that loops through the solution data and renders all the pieces with a simple, semi-transparent stroke style. Use an {#if showHint} block to toggle its visibility.
