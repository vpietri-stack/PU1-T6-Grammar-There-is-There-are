// ==========================================
// PHASER 3 GAME INITIALIZATION
// ==========================================

let phaserGame = null;

// Called from teaching.js when all rounds complete
function launchPhaserArcade() {
    // Hide the HTML teaching game
    document.getElementById('grammar-game-ui').style.display = 'none';

    // Show Phaser container
    const phaserContainer = document.getElementById('phaser-container');
    phaserContainer.style.display = 'flex';
    phaserContainer.style.justifyContent = 'center';
    phaserContainer.style.alignItems = 'center';
    phaserContainer.style.background = '#000';

    // Create Phaser game config
    const config = {
        type: Phaser.AUTO,
        parent: 'phaser-container',
        scale: {
            mode: Phaser.Scale.RESIZE,
            autoCenter: Phaser.Scale.CENTER_BOTH,
            width: '100%',
            height: '100%'
        },
        backgroundColor: '#000000',
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        },
        scene: [ArcadeScene]
    };

    phaserGame = new Phaser.Game(config);
    phaserGame.registry.set('stars', totalStarScore);
}

// Called from ArcadeScene when "Play Again" is clicked
function resetGame() {
    // Destroy Phaser game
    if (phaserGame) {
        phaserGame.destroy(true);
        phaserGame = null;
    }

    // Show HTML teaching game
    document.getElementById('grammar-game-ui').style.display = 'flex';
    document.getElementById('phaser-container').style.display = 'none';
    document.getElementById('phaser-container').innerHTML = '';

    // Reset game state
    initGame();
}
