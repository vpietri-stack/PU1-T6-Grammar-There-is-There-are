// ==========================================
// ARCADE SCENE (Phaser 3)
// ==========================================
class ArcadeScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ArcadeScene' });
    }

    init() {
        this.stars = this.registry.get('stars') || 0;
        // 1 star = 2 lives, minimum 1 life
        this.lives = Math.max(1, this.stars * 2);
        this.score = 0;

        // Time based on stars: 0=30s, 1+=40s, 3+=50s, 5+=60s
        if (this.stars >= 5) {
            this.timeLeft = 60;
        } else if (this.stars >= 3) {
            this.timeLeft = 50;
        } else if (this.stars >= 1) {
            this.timeLeft = 40;
        } else {
            this.timeLeft = 30;
        }
        this.gameActive = false;
    }

    create() {
        this.scale.on('resize', this.handleResize, this);

        this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);

        // Starfield
        // Starfield background
        this.createStarfield();

        // Player
        this.player = this.add.text(this.scale.width / 2, this.scale.height - 50, '🚀', { fontSize: '40px' }).setOrigin(0.5);
        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);
        this.player.body.setImmovable(true);
        this.player.body.setCircle(15, 5, 5);

        this.bullets = this.add.group({ runChildUpdate: true });
        this.enemies = this.add.group({ runChildUpdate: true });

        this.input.on('pointermove', (pointer) => {
            if (!this.gameActive) return;
            const oldX = this.player.x;
            this.player.x = Phaser.Math.Clamp(pointer.x, 20, this.scale.width - 20);
            if (Math.abs(this.player.x - oldX) > 20) this.playSound('move');
        });

        this.configureShip();
        this.createUI();
        this.createStartScreen();

        // Initial layout set
        this.handleResize(this.scale);
    }

    handleResize(gameSize) {
        const width = gameSize.width;
        const height = gameSize.height;

        this.cameras.main.setViewport(0, 0, width, height);
        this.physics.world.setBounds(0, 0, width, height);

        if (this.player) {
            this.player.y = height - 50;
            this.player.x = Phaser.Math.Clamp(this.player.x, 20, width - 20);
        }

        if (this.scoreText) {
            this.scoreText.setPosition(20, 20);
            this.livesText.setPosition(width / 2, 20);
            this.timeText.setPosition(width - 20, 20);
        }

        if (this.startContainer && this.startContainer.visible) {
            this.updateContainerPositions(this.startContainer, width, height);
        }

        if (this.endContainer && this.endContainer.visible) {
            this.updateContainerPositions(this.endContainer, width, height);
        }
    }

    updateContainerPositions(container, width, height) {
        const children = container.list;
        // Background usually at index 0
        if (children[0] instanceof Phaser.GameObjects.Rectangle) {
            children[0].setSize(width, height);
            children[0].setPosition(width / 2, height / 2);
        }

        // Title/labels are centered usually
        children.forEach(child => {
            if (child.type === 'Text') {
                child.x = width / 2;
                // Keep relative vertical spacing if it was designed for e.g. 600 height
                // or just keep them centered grouped.
            }
        });
    }

    createStarfield() {
        for (let i = 0; i < 50; i++) {
            const star = this.add.rectangle(
                Phaser.Math.Between(0, this.scale.width),
                Phaser.Math.Between(0, this.scale.height),
                Phaser.Math.Between(1, 3),
                Phaser.Math.Between(1, 3),
                0xffffff
            );
            star.alpha = Phaser.Math.FloatBetween(0.2, 0.8);
            this.tweens.add({
                targets: star,
                y: { from: star.y, to: 2000 }, // Travel far beyond screen
                duration: Phaser.Math.Between(4000, 10000),
                repeat: -1,
                onRepeat: () => {
                    star.y = -10;
                    star.x = Phaser.Math.Between(0, this.scale.width);
                }
            });
        }
    }

    configureShip() {
        // Default: basic ship
        this.fireRate = 400;
        this.bulletCount = 1;
        this.hasShield = false;

        // 1+ stars: Rapid Fire
        if (this.stars >= 1) {
            this.fireRate = 200;
        }
        // 3+ stars: Double Blasters
        if (this.stars >= 3) {
            this.bulletCount = 2;
        }
        // 5+ stars: Triple Blasters + Energy Shield
        if (this.stars >= 5) {
            this.bulletCount = 3;
            this.hasShield = true;
        }

        if (this.hasShield) {
            this.shieldCircle = this.add.graphics();
            this.shieldCircle.lineStyle(2, 0x64C8FF, 0.8);
            this.shieldCircle.strokeCircle(0, 0, 40);
        }
    }

    createUI() {
        const hudStyle = { fontFamily: 'Fredoka', fontSize: '20px', color: '#ffffff', stroke: '#000000', strokeThickness: 3 };
        this.scoreText = this.add.text(20, 20, 'SCORE: 0', { ...hudStyle, color: '#FACC15' });
        this.livesText = this.add.text(this.scale.width / 2, 20, '❤️ ' + this.lives, { ...hudStyle, color: '#F87171' }).setOrigin(0.5, 0);
        this.timeText = this.add.text(this.scale.width - 20, 20, 'TIME: ' + this.timeLeft, { ...hudStyle, color: '#60A5FA' }).setOrigin(1, 0);
    }

    createStartScreen() {
        this.startContainer = this.add.container(0, 0);
        const bg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.8).setInteractive();

        const title = this.add.text(this.scale.width / 2, 80, 'GALAXY DEFENDER', {
            fontFamily: 'Fredoka', fontSize: '48px', color: '#ff00ff', fontStyle: 'bold', stroke: '#ffffff', strokeThickness: 2
        }).setOrigin(0.5);

        const upgrades = `Stars: ${this.stars}\nLives: ${this.lives}\nTime: ${this.timeLeft}s\n\nUpgrades:\n` +
            (this.stars >= 1 ? '⚡ Rapid Fire\n' : '') +
            (this.stars >= 3 ? '🔫 Double Blasters\n' : '') +
            (this.stars >= 5 ? '🛡️ Triple Blasters + Shield\n' : '');

        const info = this.add.text(this.scale.width / 2, 220, upgrades || 'Basic Ship', {
            fontFamily: 'Fredoka', fontSize: '18px', color: '#ffffff', align: 'center'
        }).setOrigin(0.5);

        const btn = this.add.text(this.scale.width / 2, 380, 'LAUNCH SHIP 🚀', {
            fontFamily: 'Fredoka', fontSize: '32px', color: '#ffffff', backgroundColor: '#16a34a', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            this.startContainer.destroy();
            this.startContainer = null;
            this.startGame();
        });

        this.startContainer.add([bg, title, info, btn]);
        this.handleResize(this.scale); // Update positions immediately
    }

    startGame() {
        this.gameActive = true;
        this.physics.resume();

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.timeLeft--;
                this.timeText.setText('TIME: ' + this.timeLeft);
                if (this.timeLeft <= 0) this.endGame();
            },
            loop: true
        });

        this.spawnEvent = this.time.addEvent({
            delay: 800,
            callback: this.spawnEnemy,
            callbackScope: this,
            loop: true
        });

        this.shootEvent = this.time.addEvent({
            delay: this.fireRate,
            callback: this.shoot,
            callbackScope: this,
            loop: true
        });
    }

    shoot() {
        if (!this.gameActive) return;

        const offsets = [];
        if (this.bulletCount === 1) offsets.push(0);
        else if (this.bulletCount === 2) offsets.push(-15, 15);
        else offsets.push(0, -20, 20);

        offsets.forEach(off => {
            const b = this.add.text(this.player.x + off, this.player.y - 20, '•', { fontSize: '40px', color: '#FFD700' }).setOrigin(0.5);
            this.physics.add.existing(b);
            b.body.setVelocityY(-400);
            b.body.setCircle(5, 5, 5);
            this.bullets.add(b);
        });

        this.bullets.children.each(b => {
            if (b.y < -50) b.destroy();
        });
    }

    spawnEnemy() {
        if (!this.gameActive) return;

        const size = Phaser.Math.Between(30, 60);
        const x = Phaser.Math.Between(size, this.scale.width - size);
        const type = Math.random() > 0.5 ? '👾' : '🪨';
        const speed = Phaser.Math.Between(100, 250);
        const hp = Math.floor(size / 15);

        const e = this.add.text(x, -50, type, { fontSize: size + 'px' }).setOrigin(0.5);
        e.setData('hp', hp);

        this.physics.add.existing(e);
        e.body.setVelocityY(speed);
        e.body.setSize(size, size);

        this.enemies.add(e);
    }

    update() {
        if (!this.gameActive) return;

        if (this.hasShield && this.shieldCircle) {
            this.shieldCircle.x = this.player.x;
            this.shieldCircle.y = this.player.y;
        }

        this.physics.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);
        this.physics.overlap(this.player, this.enemies, this.hitPlayer, null, this);

        this.enemies.children.each(e => {
            if (e.y > this.scale.height + 50) {
                this.damagePlayer();
                e.destroy();
            }
        });
    }

    hitEnemy(bullet, enemy) {
        bullet.destroy();
        let hp = enemy.getData('hp');
        hp--;
        enemy.setData('hp', hp);

        enemy.setTint(0xff0000);
        this.time.delayedCall(100, () => enemy.clearTint());

        if (hp <= 0) {
            this.score += 100;
            this.scoreText.setText('SCORE: ' + this.score);
            this.spawnExplosion(enemy.x, enemy.y);
            this.playSound('explosion');
            enemy.destroy();
        } else {
            this.playSound('hit');
        }
    }

    hitPlayer(player, enemy) {
        enemy.destroy();
        this.damagePlayer();
    }

    damagePlayer() {
        this.lives--;
        this.livesText.setText('❤️ ' + this.lives);
        this.cameras.main.shake(100, 0.01);
        this.playSound('damage');

        if (this.lives <= 0) {
            this.endGame();
        }
    }

    spawnExplosion(x, y) {
        const emitter = this.add.text(x, y, '💥', { fontSize: '40px' }).setOrigin(0.5);
        this.tweens.add({
            targets: emitter,
            scale: 1.5,
            alpha: 0,
            duration: 300,
            onComplete: () => emitter.destroy()
        });
    }

    endGame() {
        this.gameActive = false;
        this.physics.pause();
        if (this.timerEvent) this.timerEvent.remove();
        if (this.spawnEvent) this.spawnEvent.remove();
        if (this.shootEvent) this.shootEvent.remove();

        // Create End Screen Container
        this.endContainer = this.add.container(0, 0).setDepth(1000);

        const bg = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.9).setInteractive();

        const txt = this.add.text(this.scale.width / 2, 120, 'MISSION COMPLETE', {
            fontFamily: 'Fredoka', fontSize: '40px', color: '#ffffff'
        }).setOrigin(0.5);

        const scoreLabel = this.add.text(this.scale.width / 2, 200, 'FINAL SCORE', {
            fontFamily: 'Fredoka', fontSize: '24px', color: '#60A5FA'
        }).setOrigin(0.5);

        const finalScore = this.add.text(this.scale.width / 2, 270, this.score + '', {
            fontFamily: 'Fredoka', fontSize: '80px', color: '#FACC15', fontStyle: 'bold'
        }).setOrigin(0.5);

        const btn = this.add.text(this.scale.width / 2, 400, 'Play Again 🔄', {
            fontFamily: 'Fredoka', fontSize: '32px', color: '#ffffff', backgroundColor: '#2563eb', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        btn.on('pointerdown', () => {
            resetGame();
        });

        this.endContainer.add([bg, txt, scoreLabel, finalScore, btn]);
    }

    playSound(type) {
        if (!window.AudioContext && !window.webkitAudioContext) return;
        if (!this.sndCtx) {
            this.sndCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (this.sndCtx.state === 'suspended') this.sndCtx.resume();
        const now = this.sndCtx.currentTime;

        const osc = this.sndCtx.createOscillator();
        const gain = this.sndCtx.createGain();
        osc.connect(gain);
        gain.connect(this.sndCtx.destination);

        if (type === 'hit') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        } else if (type === 'explosion') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(100, now);
            osc.frequency.linearRampToValueAtTime(10, now + 0.2);
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'move') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.linearRampToValueAtTime(300, now + 0.1);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        } else if (type === 'damage') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(50, now + 0.4);

            // LFO effect
            const lfo = this.sndCtx.createOscillator();
            lfo.frequency.value = 20;
            const lfoGain = this.sndCtx.createGain();
            lfoGain.gain.value = 500;
            lfo.connect(lfoGain);
            lfoGain.connect(osc.frequency);
            lfo.start(now);
            lfo.stop(now + 0.4);

            gain.gain.setValueAtTime(0.3, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.4);
            osc.start(now);
            osc.stop(now + 0.4);
        }
    }
}
