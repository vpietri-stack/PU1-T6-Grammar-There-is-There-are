class TeachingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TeachingScene' });
    }

    preload() {
        // No external assets required!
    }

    create() {
        this.adjectiveData = [
            // --- SURPRISED (2 sets) ---
            { word: "surprised", clues: ["His friends shout 'Happy Birthday!'", "He did not know about the party.", "His mouth is open."] },
            { word: "surprised", clues: ["She sees a big present on her bed.", "She did not expect a gift.", "She says 'Wow! Really?'"] },

            // --- FRIGHTENED (2 sets) ---
            { word: "frightened", clues: ["She watches a scary movie.", "She puts her hands over her eyes.", "She does not want to look."] },
            { word: "frightened", clues: ["There is a very big dog barking.", "He runs away fast.", "He is shaking."] },

            // --- AFRAID (2 sets) ---
            { word: "afraid", clues: ["The lights go out.", "She does not like the dark.", "She thinks there is a monster under the bed."] },
            { word: "afraid", clues: ["He sees a big spider on his arm.", "He screams 'Help!'", "He hates spiders."] },

            // --- DIFFICULT (2 sets) ---
            { word: "difficult", clues: ["I cannot do this math homework.", "The problem is very hard.", "I need help."] },
            { word: "difficult", clues: ["This box is very heavy.", "I cannot lift it.", "It is hard to move."] },

            // --- EASY (2 sets) ---
            { word: "easy", clues: ["I finished the test in 5 minutes.", "I know all the answers.", "It is not hard."] },
            { word: "easy", clues: ["The video game is simple.", "Even a baby can do it.", "No problem!"] },

            // --- HUNGRY (2 sets) ---
            { word: "hungry", clues: ["I want a burger right now.", "My stomach makes a noise.", "I didn't eat breakfast."] },
            { word: "hungry", clues: ["Is dinner ready yet?", "I want to eat a whole pizza.", "I need food."] },

            // --- EXCITING (2 sets) ---
            { word: "exciting", clues: ["The football game is very fast.", "The score is 2-2 and there is one minute left.", "The fans are shouting loud."] },
            { word: "exciting", clues: ["We are going to Disneyland!", "It is a great adventure.", "It is going to be fun."] },

            // --- BORING (2 sets) ---
            { word: "boring", clues: ["The teacher talks for two hours.", "I want to sleep.", "It is not interesting."] },
            { word: "boring", clues: ["Nothing happens in this movie.", "It is very slow.", "I want to turn off the TV."] },

            // --- TIRED (2 sets) ---
            { word: "tired", clues: ["It is 11 PM.", "I want to go to bed.", "My eyes are closing."] },
            { word: "tired", clues: ["He ran for 10 kilometers.", "He has no energy.", "He needs to sit down."] },

            // --- THIRSTY (2 sets) ---
            { word: "thirsty", clues: ["It is very hot outside.", "My throat is dry.", "I need a glass of water."] },
            { word: "thirsty", clues: ["She played tennis for two hours.", "She wants some juice.", "She needs to drink."] },

            // --- DANGEROUS (2 sets) ---
            { word: "dangerous", clues: ["The road is very icy.", "Cars can slip and crash.", "Drive slowly!"] },
            { word: "dangerous", clues: ["There are big waves in the sea.", "You cannot swim here.", "It is not safe."] }
        ];

        this.currentRound = 1;
        this.starScore = 0;
        this.maxRounds = 5;

        // Colors matching original design
        this.COLORS = {
            bgGradient1: 0xE0F7FA,   // Light cyan
            bgGradient2: 0xE1BEE7,   // Light purple
            titlePurple: 0x6A1B9A,  // Deep purple
            textDark: 0x475569,     // Slate gray
            cardBg: 0xFFFAFA,       // Warm white
            cardBorder: 0xE2E8F0,   // Light gray
            pronounPurple: 0x805AD5, // Medium purple
            dropZoneBorder: 0x90A4AE, // Blue-gray
            dragItemBg: 0xFF8A65,   // Salmon/Coral
            dragItemBorder: 0xD84315, // Darker coral
            checkBtnBg: 0x8E24AA,   // Purple
            checkBtnBorder: 0x4A148C, // Dark purple
            correctGreen: 0x66BB6A,
            incorrectRed: 0xEF5350,
            starYellow: 0xD69E2E,
            feedbackBg: 0xFEF9C3
        };

        // Draw background gradient
        this.createBackground();

        // UI Setup
        this.createUI();

        // Game Container for round-specific elements
        this.mainContainer = this.add.container(0, 0);

        // Init Game
        this.initGame();
    }

    createBackground() {
        const width = this.scale.width;
        const height = this.scale.height;

        // Create a gradient-like background using multiple rectangles
        const g = this.add.graphics();

        // Top color (light cyan)
        g.fillStyle(this.COLORS.bgGradient1, 1);
        g.fillRect(0, 0, width, height / 2);

        // Bottom color (light purple)
        g.fillStyle(this.COLORS.bgGradient2, 1);
        g.fillRect(0, height / 2, width, height / 2);

        // Blend in middle
        for (let i = 0; i < 20; i++) {
            const alpha = i / 20;
            g.fillStyle(this.COLORS.bgGradient2, alpha);
            g.fillRect(0, height * 0.3 + (i * height * 0.02), width, height * 0.02);
        }
    }

    createUI() {
        const width = this.scale.width;

        // Header
        const headerY = 55;

        this.add.text(width / 2, headerY, 'Feelings Match! 🎭', {
            fontFamily: 'Fredoka', fontSize: '48px', color: '#6A1B9A', fontStyle: 'bold'
        }).setOrigin(0.5);

        this.add.text(width / 2, headerY + 45, 'How do they feel?', {
            fontFamily: 'Fredoka', fontSize: '24px', color: '#64748B'
        }).setOrigin(0.5);

        // Stats pills
        const statsY = headerY + 95;

        // Round pill
        this.drawPill(width / 2 - 100, statsY, 140, 44, 0xffffff, 0xE9D8FD);
        this.roundText = this.add.text(width / 2 - 100, statsY, 'Round: 1/5', {
            fontFamily: 'Fredoka', fontSize: '22px', color: '#805AD5', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Stars pill
        this.drawPill(width / 2 + 100, statsY, 140, 44, 0xffffff, 0xFDE68A);
        this.starText = this.add.text(width / 2 + 100, statsY, 'Stars: 0', {
            fontFamily: 'Fredoka', fontSize: '22px', color: '#D69E2E', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Feedback Panel (Hidden initially)
        this.feedbackContainer = this.add.container(width / 2, this.scale.height - 100).setDepth(300).setVisible(false);

        const fbBg = this.add.graphics();
        fbBg.fillStyle(0xFEF9C3, 1);
        fbBg.lineStyle(4, 0xFDE68A, 1);
        fbBg.fillRoundedRect(-250, -55, 500, 110, 24);
        fbBg.strokeRoundedRect(-250, -55, 500, 110, 24);

        this.feedbackText = this.add.text(0, -18, '', {
            fontFamily: 'Fredoka', fontSize: '32px', color: '#16a34a', fontStyle: 'bold', align: 'center'
        }).setOrigin(0.5);

        this.nextBtn = this.add.text(0, 28, 'Next Round ➡️', {
            fontFamily: 'Fredoka', fontSize: '22px', color: '#ffffff', backgroundColor: '#3b82f6',
            padding: { x: 24, y: 10 }
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.nextBtn.on('pointerdown', () => this.nextRound());

        this.feedbackContainer.add([fbBg, this.feedbackText, this.nextBtn]);
    }

    drawPill(x, y, w, h, fillColor, strokeColor) {
        const g = this.add.graphics();
        g.fillStyle(fillColor, 1);
        g.lineStyle(2, strokeColor, 1);
        g.fillRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
        g.strokeRoundedRect(x - w / 2, y - h / 2, w, h, h / 2);
        return g;
    }

    initGame() {
        this.currentRound = 1;
        this.starScore = 0;
        this.updateUI();
        this.loadRound();
    }

    updateUI() {
        this.roundText.setText(`Round: ${this.currentRound}/${this.maxRounds}`);
        this.starText.setText(`Stars: ${this.starScore}`);
    }

    loadRound() {
        if (this.currentRound > this.maxRounds) {
            this.scene.start('ArcadeScene', { stars: this.starScore });
            return;
        }

        this.feedbackContainer.setVisible(false);
        this.mainContainer.removeAll(true);
        this.checkBtn = null;
        this.hasAttemptedThisRound = false; // Track first attempt for star scoring

        // Remove old drag listeners
        this.input.off('dragstart');
        this.input.off('drag');
        this.input.off('dragend');

        // Pick 3 random distinct items
        let available = Array.from(this.adjectiveData);
        Phaser.Utils.Array.Shuffle(available);
        const selectedItems = available.slice(0, 3);

        const startY = 220;
        const gapY = 115;
        const cardWidth = 1000;
        const cardHeight = 90;

        let dropZones = [];
        let draggables = [];

        selectedItems.forEach((item, index) => {
            const yPos = startY + (index * gapY);
            const cardX = this.scale.width / 2;

            // Random clue
            const clue = Phaser.Utils.Array.GetRandom(item.clues);

            // Pronoun logic
            const situationAdjectives = ['exciting', 'boring', 'difficult', 'easy', 'dangerous'];
            let pronoun = "It's";
            if (!situationAdjectives.includes(item.word)) {
                const isFemale = /\b(she|her|hers)\b/i.test(clue);
                pronoun = isFemale ? "She's" : "He's";
            }

            // --- Draw Card Background ---
            const cardBg = this.add.graphics();
            cardBg.fillStyle(0xFFFFFF, 0.9);
            cardBg.lineStyle(2, 0xE2E8F0, 1);
            cardBg.fillRoundedRect(cardX - cardWidth / 2, yPos - cardHeight / 2, cardWidth, cardHeight, 16);
            cardBg.strokeRoundedRect(cardX - cardWidth / 2, yPos - cardHeight / 2, cardWidth, cardHeight, 16);
            // Subtle shadow effect
            const shadow = this.add.graphics();
            shadow.fillStyle(0x000000, 0.05);
            shadow.fillRoundedRect(cardX - cardWidth / 2 + 2, yPos - cardHeight / 2 + 4, cardWidth, cardHeight, 16);
            shadow.setDepth(-1);
            this.mainContainer.add([shadow, cardBg]);

            // --- Clue Text (left aligned in card) ---
            const clueText = this.add.text(cardX - cardWidth / 2 + 35, yPos, `"${clue}"`, {
                fontFamily: 'Fredoka', fontSize: '24px', color: '#334155',
                wordWrap: { width: 520 }
            }).setOrigin(0, 0.5);
            this.mainContainer.add(clueText);

            // --- Pronoun (pointing hand + text) ---
            const pronounX = cardX + 150;
            const pronounText = this.add.text(pronounX, yPos, `👉 ${pronoun}`, {
                fontFamily: 'Fredoka', fontSize: '24px', color: '#805AD5', fontStyle: 'bold'
            }).setOrigin(0, 0.5);
            this.mainContainer.add(pronounText);

            // --- Drop Zone ---
            const zoneX = cardX + 370;
            const zoneW = 160;
            const zoneH = 55;

            const zone = this.add.zone(zoneX, yPos, zoneW, zoneH).setRectangleDropZone(zoneW, zoneH);
            zone.setData('expected', item.word);
            zone.setData('filled', false);

            // Drop Zone Visual (rounded, dashed look simulated with softer border)
            const zoneGraphics = this.add.graphics();
            zoneGraphics.fillStyle(0xFFFFFF, 0.6);
            zoneGraphics.lineStyle(3, 0xBDBDBD, 1);
            zoneGraphics.fillRoundedRect(zoneX - zoneW / 2, yPos - zoneH / 2, zoneW, zoneH, 12);
            zoneGraphics.strokeRoundedRect(zoneX - zoneW / 2, yPos - zoneH / 2, zoneW, zoneH, 12);
            zone.setData('graphics', zoneGraphics);
            zone.setData('zoneX', zoneX);
            zone.setData('zoneY', yPos);
            zone.setData('zoneW', zoneW);
            zone.setData('zoneH', zoneH);

            this.mainContainer.add([zoneGraphics, zone]);
            dropZones.push(zone);

            draggables.push(item.word);
        });

        // --- Dock Area (bottom container) ---
        const dockY = 610;
        const dockBg = this.add.graphics();
        dockBg.fillStyle(0xFFFFFF, 0.6);
        dockBg.lineStyle(2, 0xFFFFFF, 1);
        dockBg.fillRoundedRect(this.scale.width / 2 - 450, dockY - 55, 900, 110, 28);
        this.mainContainer.add(dockBg);

        // --- Draggable Items ---
        Phaser.Utils.Array.Shuffle(draggables);
        const dockStartX = this.scale.width / 2 - 230;
        const dockGap = 230;

        draggables.forEach((word, i) => {
            const x = dockStartX + (i * dockGap);
            const itemWidth = 160;
            const itemHeight = 55;

            const itemContainer = this.add.container(x, dockY);

            // 3D effect: bottom border
            const borderBottom = this.add.graphics();
            borderBottom.fillStyle(0xD84315, 1);
            borderBottom.fillRoundedRect(-itemWidth / 2, -itemHeight / 2 + 5, itemWidth, itemHeight, 14);

            // Main button background
            const bg = this.add.graphics();
            bg.fillStyle(0xFF8A65, 1);
            bg.fillRoundedRect(-itemWidth / 2, -itemHeight / 2, itemWidth, itemHeight - 5, 14);

            // Text
            const text = this.add.text(0, -3, word, {
                fontFamily: 'Fredoka', fontSize: '24px', color: '#ffffff', fontStyle: 'bold'
            }).setOrigin(0.5);

            itemContainer.add([borderBottom, bg, text]);
            itemContainer.setSize(itemWidth, itemHeight);
            itemContainer.setInteractive({ draggable: true, useHandCursor: true });

            itemContainer.setData('word', word);
            itemContainer.setData('originX', x);
            itemContainer.setData('originY', dockY);
            itemContainer.setData('width', itemWidth);
            itemContainer.setData('height', itemHeight);

            this.input.setDraggable(itemContainer);
            this.mainContainer.add(itemContainer);
        });

        // Store dropZones for later
        this.currentDropZones = dropZones;

        // --- Drag Events ---
        this.input.on('dragstart', (pointer, gameObject) => {
            this.children.bringToTop(this.mainContainer);
            this.mainContainer.bringToTop(gameObject);
            gameObject.setScale(1.08);
            gameObject.setAlpha(0.9);
        });

        this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
            gameObject.x = dragX;
            gameObject.y = dragY;

            // Highlight drop zones when hovering
            dropZones.forEach(zone => {
                const dist = Phaser.Math.Distance.Between(dragX, dragY, zone.x, zone.y);
                const g = zone.getData('graphics');
                if (dist < 60 && !zone.getData('currentValue')) {
                    g.clear();
                    g.fillStyle(0xFFF9C4, 0.8);
                    g.lineStyle(3, 0xFFD54F, 1);
                    g.fillRoundedRect(zone.getData('zoneX') - zone.getData('zoneW') / 2, zone.getData('zoneY') - zone.getData('zoneH') / 2, zone.getData('zoneW'), zone.getData('zoneH'), 12);
                    g.strokeRoundedRect(zone.getData('zoneX') - zone.getData('zoneW') / 2, zone.getData('zoneY') - zone.getData('zoneH') / 2, zone.getData('zoneW'), zone.getData('zoneH'), 12);
                } else if (!zone.getData('currentValue')) {
                    g.clear();
                    g.fillStyle(0xFFFFFF, 0.6);
                    g.lineStyle(3, 0xBDBDBD, 1);
                    g.fillRoundedRect(zone.getData('zoneX') - zone.getData('zoneW') / 2, zone.getData('zoneY') - zone.getData('zoneH') / 2, zone.getData('zoneW'), zone.getData('zoneH'), 12);
                    g.strokeRoundedRect(zone.getData('zoneX') - zone.getData('zoneW') / 2, zone.getData('zoneY') - zone.getData('zoneH') / 2, zone.getData('zoneW'), zone.getData('zoneH'), 12);
                }
            });
        });

        this.input.on('dragend', (pointer, gameObject) => {
            gameObject.setScale(1);
            gameObject.setAlpha(1);

            let dropped = false;

            dropZones.forEach(zone => {
                const dist = Phaser.Math.Distance.Between(gameObject.x, gameObject.y, zone.x, zone.y);

                if (dist < 60 && !zone.getData('currentValue')) {
                    // Snap to zone center
                    gameObject.x = zone.x;
                    gameObject.y = zone.y;

                    zone.setData('currentValue', gameObject.getData('word'));
                    zone.setData('occupant', gameObject);
                    dropped = true;

                    // Update zone visual to "filled" state
                    const g = zone.getData('graphics');
                    g.clear(); // Hide the empty zone visual
                }
            });

            // Reset zone highlights
            dropZones.forEach(zone => {
                if (!zone.getData('currentValue')) {
                    const g = zone.getData('graphics');
                    g.clear();
                    g.fillStyle(0xFFFFFF, 0.6);
                    g.lineStyle(3, 0xBDBDBD, 1);
                    g.fillRoundedRect(zone.getData('zoneX') - zone.getData('zoneW') / 2, zone.getData('zoneY') - zone.getData('zoneH') / 2, zone.getData('zoneW'), zone.getData('zoneH'), 12);
                    g.strokeRoundedRect(zone.getData('zoneX') - zone.getData('zoneW') / 2, zone.getData('zoneY') - zone.getData('zoneH') / 2, zone.getData('zoneW'), zone.getData('zoneH'), 12);
                }
            });

            if (!dropped) {
                this.returnToDock(gameObject);
            } else {
                this.checkRoundComplete(dropZones);
            }
        });
    }

    returnToDock(gameObject) {
        this.tweens.add({
            targets: gameObject,
            x: gameObject.getData('originX'),
            y: gameObject.getData('originY'),
            duration: 300,
            ease: 'Back.out'
        });

        // Remove from any zone
        this.currentDropZones.forEach(z => {
            if (z.getData('occupant') === gameObject) {
                z.setData('currentValue', null);
                z.setData('occupant', null);
                // Redraw empty zone
                const g = z.getData('graphics');
                g.clear();
                g.fillStyle(0xFFFFFF, 0.6);
                g.lineStyle(3, 0xBDBDBD, 1);
                g.fillRoundedRect(z.getData('zoneX') - z.getData('zoneW') / 2, z.getData('zoneY') - z.getData('zoneH') / 2, z.getData('zoneW'), z.getData('zoneH'), 12);
                g.strokeRoundedRect(z.getData('zoneX') - z.getData('zoneW') / 2, z.getData('zoneY') - z.getData('zoneH') / 2, z.getData('zoneW'), z.getData('zoneH'), 12);
            }
        });
    }

    checkRoundComplete(zones) {
        const filledCount = zones.filter(z => z.getData('currentValue')).length;

        if (filledCount === 3) {
            if (!this.checkBtn) {
                // Create pretty check button
                const btnX = this.scale.width / 2;
                const btnY = 610;
                const btnW = 260;
                const btnH = 60;

                const btnContainer = this.add.container(btnX, btnY);

                // Button shadow/border
                const btnBorder = this.add.graphics();
                btnBorder.fillStyle(0x4A148C, 1);
                btnBorder.fillRoundedRect(-btnW / 2, -btnH / 2 + 6, btnW, btnH, 30);

                // Button main
                const btnBg = this.add.graphics();
                btnBg.fillStyle(0x8E24AA, 1);
                btnBg.fillRoundedRect(-btnW / 2, -btnH / 2, btnW, btnH - 6, 30);

                const btnText = this.add.text(0, -4, 'Check Answers ✅', {
                    fontFamily: 'Fredoka', fontSize: '26px', color: '#ffffff', fontStyle: 'bold'
                }).setOrigin(0.5);

                btnContainer.add([btnBorder, btnBg, btnText]);
                btnContainer.setSize(btnW, btnH);
                btnContainer.setInteractive({ useHandCursor: true });

                btnContainer.on('pointerdown', () => this.validateAnswer(zones));

                this.checkBtn = btnContainer;
                this.mainContainer.add(btnContainer);
            }
            this.checkBtn.setVisible(true);
            this.mainContainer.bringToTop(this.checkBtn);
        } else {
            if (this.checkBtn) this.checkBtn.setVisible(false);
        }
    }

    validateAnswer(zones) {
        let correctCount = 0;

        zones.forEach(zone => {
            const val = zone.getData('currentValue');
            const expected = zone.getData('expected');
            const occupant = zone.getData('occupant');

            // Check correctness (allowing interchange for frightened/afraid)
            let isCorrect = val === expected;
            if ((val === 'frightened' && expected === 'afraid') || (val === 'afraid' && expected === 'frightened')) {
                isCorrect = true;
            }

            if (isCorrect) {
                correctCount++;
                // Green highlight on the draggable item
                if (occupant) {
                    const bg = occupant.list[1]; // The main background
                    bg.clear();
                    bg.fillStyle(0x66BB6A, 1);
                    bg.fillRoundedRect(-occupant.getData('width') / 2, -occupant.getData('height') / 2, occupant.getData('width'), occupant.getData('height') - 4, 12);

                    const border = occupant.list[0]; // The bottom border
                    border.clear();
                    border.fillStyle(0x2E7D32, 1);
                    border.fillRoundedRect(-occupant.getData('width') / 2, -occupant.getData('height') / 2 + 4, occupant.getData('width'), occupant.getData('height'), 12);
                }
            } else {
                // Red highlight and shake
                if (occupant) {
                    const bg = occupant.list[1];
                    bg.clear();
                    bg.fillStyle(0xEF5350, 1);
                    bg.fillRoundedRect(-occupant.getData('width') / 2, -occupant.getData('height') / 2, occupant.getData('width'), occupant.getData('height') - 4, 12);

                    const border = occupant.list[0];
                    border.clear();
                    border.fillStyle(0xC62828, 1);
                    border.fillRoundedRect(-occupant.getData('width') / 2, -occupant.getData('height') / 2 + 4, occupant.getData('width'), occupant.getData('height'), 12);

                    // Shake animation
                    this.tweens.add({
                        targets: occupant,
                        x: occupant.x - 5,
                        duration: 50,
                        yoyo: true,
                        repeat: 3,
                        onComplete: () => {
                            this.time.delayedCall(300, () => {
                                this.returnToDock(occupant);
                                // Reset colors
                                bg.clear();
                                bg.fillStyle(0xFF8A65, 1);
                                bg.fillRoundedRect(-occupant.getData('width') / 2, -occupant.getData('height') / 2, occupant.getData('width'), occupant.getData('height') - 4, 12);
                                border.clear();
                                border.fillStyle(0xD84315, 1);
                                border.fillRoundedRect(-occupant.getData('width') / 2, -occupant.getData('height') / 2 + 4, occupant.getData('width'), occupant.getData('height'), 12);
                            });
                        }
                    });
                }
            }
        });

        if (correctCount === 3) {
            // Only award star on first try
            if (!this.hasAttemptedThisRound) {
                this.starScore++;
                this.updateUI();
            }
            this.playSound('correct');
            this.showFeedback(!this.hasAttemptedThisRound); // Show different message based on first try
            if (this.checkBtn) this.checkBtn.setVisible(false);
        } else {
            this.hasAttemptedThisRound = true; // Mark that player has attempted
            this.playSound('wrong');
            if (this.checkBtn) this.checkBtn.setVisible(false);
        }
    }

    showFeedback(earnedStar) {
        this.feedbackContainer.setVisible(true);
        if (earnedStar) {
            this.feedbackText.setText('Excellent! ⭐ +1 Star!');
            this.feedbackText.setColor('#16a34a');
        } else {
            this.feedbackText.setText('Correct! Good job!');
            this.feedbackText.setColor('#3b82f6');
        }
    }

    nextRound() {
        this.currentRound++;
        this.updateUI();
        this.loadRound();
    }

    playSound(type) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        if (!this.sndCtx) this.sndCtx = new AudioContext();
        if (this.sndCtx.state === 'suspended') this.sndCtx.resume();
        const now = this.sndCtx.currentTime;

        const osc = this.sndCtx.createOscillator();
        const gain = this.sndCtx.createGain();
        osc.connect(gain);
        gain.connect(this.sndCtx.destination);

        if (type === 'correct') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.1);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        } else {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.linearRampToValueAtTime(100, now + 0.2);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0, now + 0.2);
        }
        osc.start(now);
        osc.stop(now + 0.3);
    }
}
