class LogicGate {
    constructor(type, x, y, id) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.id = id;
        this.width = 80;
        this.height = 60;
        this.inputs = this.getInputCount();
        this.outputs = 1;
        this.inputValues = new Array(this.inputs).fill(0);
        this.outputValue = 0;
        this.selected = false;
        
        // ピンの位置を計算
        this.inputPins = this.calculateInputPins();
        this.outputPins = this.calculateOutputPins();
    }

    getInputCount() {
        switch(this.type) {
            case 'AND':
            case 'OR':
                return 2;
            case 'NOT':
                return 1;
            case 'INPUT':
                return 0;
            case 'OUTPUT':
                return 1;
            default:
                return 0;
        }
    }

    calculateInputPins() {
        const pins = [];
        for(let i = 0; i < this.inputs; i++) {
            const y = this.y + (this.height / (this.inputs + 1)) * (i + 1);
            pins.push({x: this.x, y: y});
        }
        return pins;
    }

    calculateOutputPins() {
        if(this.type === 'INPUT') {
            return [{x: this.x + this.width, y: this.y + this.height/2}];
        } else if(this.type === 'OUTPUT') {
            return [];
        } else {
            return [{x: this.x + this.width, y: this.y + this.height/2}];
        }
    }

    calculate() {
        switch(this.type) {
            case 'AND':
                this.outputValue = this.inputValues.every(v => v === 1) ? 1 : 0;
                break;
            case 'OR':
                this.outputValue = this.inputValues.some(v => v === 1) ? 1 : 0;
                break;
            case 'NOT':
                if(this.inputValues.length > 0) {
                    this.outputValue = (this.inputValues[0] === 1) ? 0 : 1;
                } else {
                    this.outputValue = 1; // Default to 1 when no input (floating input)
                }
                break;
            case 'INPUT':
                // 入力回路は手動で値を設定（outputValueがそのまま出力）
                break;
            case 'OUTPUT':
                // 出力回路は入力値をそのまま表示
                if(this.inputValues.length > 0) {
                    this.outputValue = (this.inputValues[0] !== undefined) ? this.inputValues[0] : 0;
                } else {
                    this.outputValue = 0; // Default to 0 when no input
                }
                break;
        }
    }

    draw(ctx) {
        const baseColor = this.getGateColor();

        // 選択状態のハイライト
        if(this.selected) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#1e90ff';
            ctx.strokeStyle = '#1e90ff';
            ctx.lineWidth = 4;
            ctx.strokeRect(this.x - 5, this.y - 5, this.width + 10, this.height + 10);
            ctx.shadowBlur = 0;
        }

        // 回路本体 - グラデーションで立体感
        const gradient = ctx.createLinearGradient(this.x, this.y, this.x, this.y + this.height);
        gradient.addColorStop(0, this.lightenColor(baseColor, 20));
        gradient.addColorStop(1, baseColor);

        ctx.fillStyle = gradient;
        ctx.shadowBlur = 5;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 3;

        // 角丸の四角形
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 8);
        ctx.fill();

        // 境界線
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = this.darkenColor(baseColor, 20);
        ctx.lineWidth = 2;
        this.roundRect(ctx, this.x, this.y, this.width, this.height, 8);
        ctx.stroke();

        // ラベル
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.shadowBlur = 2;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.fillText(this.getLabel(), this.x + this.width/2, this.y + this.height/2);
        ctx.shadowBlur = 0;

        // 入力ピン
        this.inputPins.forEach((pin, i) => {
            const isHovered = hoveredPin && hoveredGate === this && hoveredPin.type === 'input' && hoveredPin.index === i;
            this.drawPin(ctx, pin.x, pin.y, this.inputValues[i], isHovered);
        });

        // 出力ピン
        this.outputPins.forEach((pin, i) => {
            const isHovered = hoveredPin && hoveredGate === this && hoveredPin.type === 'output' && hoveredPin.index === i;
            this.drawPin(ctx, pin.x, pin.y, this.outputValue, isHovered);
        });

        // 入力値表示（INPUTの場合）
        if(this.type === 'INPUT') {
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(this.outputValue.toString(), this.x + this.width/2, this.y - 15);
        }

        // 出力値表示（OUTPUTの場合）
        if(this.type === 'OUTPUT') {
            ctx.fillStyle = '#1f2937';
            ctx.font = 'bold 20px sans-serif';
            ctx.fillText(this.outputValue.toString(), this.x + this.width/2, this.y - 15);
        }
    }

    // 角丸の四角形を描画
    roundRect(ctx, x, y, width, height, radius) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    // 色を明るくする
    lightenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
    }

    // 色を暗くする
    darkenColor(color, percent) {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, ((num >> 8) & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return "#" + ((1 << 24) + (R << 16) + (G << 8) + B).toString(16).slice(1);
    }

    // ピンの描画
    drawPin(ctx, x, y, value, isHovered) {
        const radius = isHovered ? 9 : 7;

        // 外側の円（ベース）
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = value === 1 ? '#1e90ff' : '#e5e7eb';
        ctx.fill();

        // 境界線
        ctx.strokeStyle = isHovered ? '#fbbf24' : (value === 1 ? '#1873cc' : '#9ca3af');
        ctx.lineWidth = isHovered ? 3 : 2;
        ctx.stroke();

        // 内側のハイライト（値が1の時）
        if(value === 1) {
            ctx.beginPath();
            ctx.arc(x - 1, y - 1, radius - 3, 0, 2 * Math.PI);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.fill();
        }
    }

    getGateColor() {
        switch(this.type) {
            case 'AND': return '#1e90ff';  // 青（メインカラー）
            case 'OR': return '#4aa3ff';   // 明るい青
            case 'NOT': return '#1873cc';  // 濃い青
            case 'INPUT': return '#06b6d4'; // シアン
            case 'OUTPUT': return '#0891b2'; // ティール
            default: return '#64748b';     // スレートグレー
        }
    }

    getLabel() {
        return this.type;
    }

    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    getClickedPin(x, y) {
        // クリック判定半径を大きくして使いやすく（15px）
        const clickRadius = 15;

        // 入力ピンをチェック
        for(let i = 0; i < this.inputPins.length; i++) {
            const pin = this.inputPins[i];
            const dist = Math.sqrt((x - pin.x) ** 2 + (y - pin.y) ** 2);
            if(dist <= clickRadius) {
                return {type: 'input', index: i, pin: pin};
            }
        }

        // 出力ピンをチェック
        for(let i = 0; i < this.outputPins.length; i++) {
            const pin = this.outputPins[i];
            const dist = Math.sqrt((x - pin.x) ** 2 + (y - pin.y) ** 2);
            if(dist <= clickRadius) {
                return {type: 'output', index: i, pin: pin};
            }
        }

        return null;
    }
}

class Connection {
    constructor(fromGate, fromPin, toGate, toPin) {
        this.fromGate = fromGate;
        this.fromPin = fromPin;
        this.toGate = toGate;
        this.toPin = toPin;
        this.signal = 0;
    }

    draw(ctx) {
        const fromPos = this.fromGate.outputPins[this.fromPin];
        const toPos = this.toGate.inputPins[this.toPin];

        // 信号値に応じて色とスタイルを変更（青テーマ）
        if(this.signal === 1) {
            ctx.strokeStyle = '#1e90ff'; // 青（信号あり）
            ctx.lineWidth = 4;
            ctx.shadowBlur = 8;
            ctx.shadowColor = 'rgba(30, 144, 255, 0.5)';
        } else {
            ctx.strokeStyle = '#94a3b8'; // グレー（信号なし）
            ctx.lineWidth = 2;
            ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        ctx.moveTo(fromPos.x, fromPos.y);

        // ベジェ曲線で滑らかな接続線
        const cpx1 = fromPos.x + 50;
        const cpx2 = toPos.x - 50;
        ctx.bezierCurveTo(cpx1, fromPos.y, cpx2, toPos.y, toPos.x, toPos.y);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // 信号値の表示（オプション）
        if(simulator.showSignalValues) {
            const midX = (fromPos.x + toPos.x) / 2;
            const midY = (fromPos.y + toPos.y) / 2;

            // 背景の円
            ctx.fillStyle = this.signal === 1 ? '#1e90ff' : '#94a3b8';
            ctx.beginPath();
            ctx.arc(midX, midY, 12, 0, 2 * Math.PI);
            ctx.fill();

            // 信号値のテキスト
            ctx.fillStyle = 'white';
            ctx.font = 'bold 14px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.signal.toString(), midX, midY);
        }

        // 信号の流れを示すアニメーション（シミュレーション中）
        if(simulator.isRunning && this.signal === 1) {
            const t = (Date.now() % 1000) / 1000;
            const animX = fromPos.x + (toPos.x - fromPos.x) * t;
            const animY = fromPos.y + (toPos.y - fromPos.y) * t;

            ctx.fillStyle = '#fbbf24';
            ctx.beginPath();
            ctx.arc(animX, animY, 5, 0, 2 * Math.PI);
            ctx.fill();
        }
    }

    updateSignal() {
        this.signal = this.fromGate.outputValue;
        if(this.toGate.inputValues && this.toPin >= 0 && this.toPin < this.toGate.inputValues.length) {
            this.toGate.inputValues[this.toPin] = (this.signal !== undefined) ? this.signal : 0;
        }
    }

    containsPoint(x, y) {
        // 接続線をクリックできるように当たり判定を追加
        const fromX = this.from.pin.x;
        const fromY = this.from.pin.y;
        const toX = this.to.pin.x;
        const toY = this.to.pin.y;
        
        // 簡易的な線分との距離計算
        const A = x - fromX;
        const B = y - fromY;
        const C = toX - fromX;
        const D = toY - fromY;
        
        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        
        if (lenSq === 0) return false;
        
        const param = dot / lenSq;
        
        let xx, yy;
        if (param < 0) {
            xx = fromX;
            yy = fromY;
        } else if (param > 1) {
            xx = toX;
            yy = toY;
        } else {
            xx = fromX + param * C;
            yy = fromY + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy) <= 10;
    }
}

class Simulator {
    constructor() {
        this.gates = new Map();
        this.connections = [];
        this.nextGateId = 1;
        this.selectedGateType = null;
        this.isConnecting = false;
        this.connectionStart = null;
        this.isRunning = false;
        this.step = 0;
        this.history = [];
        this.showSignalValues = true;
    }

    addGate(type, x, y) {
        const gate = new LogicGate(type, x, y, this.nextGateId++);
        this.gates.set(gate.id, gate);
        this.updateCounts();
        return gate;
    }

    addConnection(fromGate, fromPin, toGate, toPin) {
        // 既存の接続をチェック（重複防止）
        const existing = this.connections.find(c => 
            c.toGate.id === toGate.id && c.toPin === toPin
        );
        if(existing) {
            return false; // 既に接続されている
        }

        const connection = new Connection(fromGate, fromPin, toGate, toPin);
        this.connections.push(connection);
        this.updateCounts();
        return true;
    }

    removeGate(gateId) {
        // 関連する接続を削除
        this.connections = this.connections.filter(c => 
            c.fromGate.id !== gateId && c.toGate.id !== gateId
        );
        this.gates.delete(gateId);
        this.updateCounts();
    }

    clear() {
        this.gates.clear();
        this.connections = [];
        this.nextGateId = 1;
        this.isRunning = false;
        this.updateCounts();
    }

    simulate() {
        if(this.gates.size === 0) return;

        this.isRunning = true;
        this.step = 0;
        this.history = [];
        this.detailedSteps = [];

        // 初期状態をリセット
        this.reset();
        
        // 詳細シミュレーション表示を開始
        this.startDetailedSimulation();
        
        // 状態を保存
        this.saveState();

        // シミュレーション実行（複数ステップで安定化）
        for(let i = 0; i < 5; i++) {
            this.executeStep();
        }
        
        draw();
    }

    startDetailedSimulation() {
        // 詳細表示エリアを表示
        document.getElementById('simulationDetails').classList.remove('hidden');
        document.getElementById('simulationSteps').innerHTML = '';
        currentSimulationStep = 0;

        // 初期状態を記録
        this.recordDetailedStep('初期状態', '入力値の設定と回路のリセット');
        this.updateSimulationDisplay();
    }

    recordDetailedStep(title, description) {
        const stepData = {
            step: this.detailedSteps.length,
            title: title,
            description: description,
            gateStates: new Map(),
            connectionStates: [],
            calculations: [],
            signalChanges: [],
            timestamp: Date.now()
        };

        // 各回路の状態を記録
        for(let [id, gate] of this.gates) {
            const previousState = this.detailedSteps.length > 0 ? 
                this.detailedSteps[this.detailedSteps.length - 1].gateStates.get(id) : null;
            
            const currentState = {
                type: gate.type,
                inputValues: [...gate.inputValues],
                outputValue: gate.outputValue,
                x: gate.x,
                y: gate.y,
                changed: false
            };

            // 状態変化を検出
            if (previousState) {
                const inputChanged = !this.arraysEqual(previousState.inputValues, currentState.inputValues);
                const outputChanged = previousState.outputValue !== currentState.outputValue;
                currentState.changed = inputChanged || outputChanged;
                
                if (currentState.changed) {
                    stepData.signalChanges.push({
                        gateId: id,
                        type: gate.type,
                        previousInputs: previousState.inputValues,
                        currentInputs: currentState.inputValues,
                        previousOutput: previousState.outputValue,
                        currentOutput: currentState.outputValue,
                        inputChanged: inputChanged,
                        outputChanged: outputChanged
                    });
                }
            }

            stepData.gateStates.set(id, currentState);
        }

        // 接続の状態を記録
        stepData.connectionStates = this.connections.map(conn => {
            const previousStep = this.detailedSteps.length > 0 ? 
                this.detailedSteps[this.detailedSteps.length - 1] : null;
            const previousConn = previousStep ? 
                previousStep.connectionStates.find(c => 
                    c.fromGateId === conn.fromGate.id && c.toGateId === conn.toGate.id) : null;
            
            return {
                fromGateId: conn.fromGate.id,
                toGateId: conn.toGate.id,
                signal: conn.signal,
                fromType: conn.fromGate.type,
                toType: conn.toGate.type,
                signalChanged: previousConn ? previousConn.signal !== conn.signal : true
            };
        });

        // 論理演算の詳細を記録
        for(let [id, gate] of this.gates) {
            if (gate.type !== 'INPUT' && gate.type !== 'OUTPUT') {
                const calculation = this.getGateCalculationDetails(gate);
                if (calculation) {
                    stepData.calculations.push({
                        gateId: id,
                        gateType: gate.type,
                        ...calculation
                    });
                }
            }
        }

        this.detailedSteps.push(stepData);
    }

    arraysEqual(a, b) {
        if (a.length !== b.length) return false;
        return a.every((val, i) => val === b[i]);
    }

    getGateCalculationDetails(gate) {
        const inputs = gate.inputValues.filter(val => val !== null);
        if (inputs.length === 0) return null;

        let calculation = '';
        let result = gate.outputValue;

        switch(gate.type) {
            case 'AND':
                calculation = inputs.join(' AND ');
                return {
                    operation: 'AND',
                    inputs: [...inputs],
                    formula: calculation,
                    result: result,
                    explanation: `${inputs.join(' × ')} = ${result}`
                };
            case 'OR':
                calculation = inputs.join(' OR ');
                return {
                    operation: 'OR',
                    inputs: [...inputs],
                    formula: calculation,
                    result: result,
                    explanation: `${inputs.join(' + ')} = ${result}`
                };
            case 'NOT':
                return {
                    operation: 'NOT',
                    inputs: [...inputs],
                    formula: `NOT ${inputs[0]}`,
                    result: result,
                    explanation: `¬${inputs[0]} = ${result}`
                };
        }
        return null;
    }

    executeStep() {
        // 信号伝播ステップを記録
        this.recordDetailedStep(`ステップ ${this.step + 1} - 信号伝播`, '接続を通じて信号を伝播');
        
        // まず接続を通じて信号を伝播
        for(let connection of this.connections) {
            connection.updateSignal();
        }

        // 回路計算ステップを記録
        this.recordDetailedStep(`ステップ ${this.step + 1} - 回路計算`, '各論理回路で演算を実行');

        // 次に全ての回路を計算
        for(let gate of this.gates.values()) {
            gate.calculate();
        }

        this.step++;
        this.saveState();
    }

    saveState() {
        const state = {
            step: this.step,
            gates: new Map(),
            connections: []
        };

        // 回路の状態を保存
        for(let [id, gate] of this.gates) {
            state.gates.set(id, {
                inputValues: [...gate.inputValues],
                outputValue: gate.outputValue
            });
        }

        // 接続の状態を保存
        state.connections = this.connections.map(c => ({
            signal: c.signal
        }));

        this.history.push(state);
    }

    stepForward() {
        if(this.step < this.history.length - 1) {
            this.step++;
            this.restoreState(this.history[this.step]);
        } else {
            this.executeStep();
        }
    }

    stepBackward() {
        if(this.step > 0) {
            this.step--;
            this.restoreState(this.history[this.step]);
        }
    }

    restoreState(state) {
        for(let [id, gateState] of state.gates) {
            const gate = this.gates.get(id);
            if(gate) {
                gate.inputValues = [...gateState.inputValues];
                gate.outputValue = gateState.outputValue;
            }
        }

        for(let i = 0; i < this.connections.length; i++) {
            if(state.connections[i]) {
                this.connections[i].signal = state.connections[i].signal;
            }
        }
    }

    reset() {
        this.isRunning = false;
        this.step = 0;
        this.history = [];

        // 全ての回路をリセット（INPUTは除く）
        for(let gate of this.gates.values()) {
            if(gate.type !== 'INPUT') {
                gate.inputValues.fill(0);
                gate.outputValue = 0;
            }
        }

        // 全ての接続をリセット
        for(let connection of this.connections) {
            connection.signal = 0;
        }

        // 入力値を各回路に反映
        for(let connection of this.connections) {
            if(connection.fromGate.type === 'INPUT') {
                connection.signal = connection.fromGate.outputValue;
                connection.toGate.inputValues[connection.toPin] = connection.signal;
            }
        }
    }

    updateCounts() {
        document.getElementById('gateCount').textContent = this.gates.size;
        document.getElementById('connectionCount').textContent = this.connections.length;
    }

    updateCircuit() {
        // リアルタイムで回路を更新（入力変更時に使用）
        const maxIterations = 10;
        let stable = false;
        
        for(let iteration = 0; iteration < maxIterations && !stable; iteration++) {
            // 現在の値を保存して安定性をチェック
            const oldValues = new Map();
            for(let gate of this.gates.values()) {
                oldValues.set(gate.id, gate.outputValue);
            }
            
            // 接続を通じて信号を伝播
            for(let connection of this.connections) {
                connection.updateSignal();
            }

            // 全ての回路を計算
            for(let gate of this.gates.values()) {
                gate.calculate();
            }
            
            // 安定性をチェック
            stable = true;
            for(let gate of this.gates.values()) {
                if(oldValues.get(gate.id) !== gate.outputValue) {
                    stable = false;
                    break;
                }
            }
        }
    }

    draw(ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // ズーム変換を適用
        ctx.save();
        ctx.scale(zoomLevel, zoomLevel);

        // 接続を描画
        for(let connection of this.connections) {
            connection.draw(ctx);
        }

        // 回路を描画
        for(let gate of this.gates.values()) {
            gate.draw(ctx);
        }

        // 接続モード時のプレビュー
        if(this.isConnecting && this.connectionStart) {
            ctx.strokeStyle = '#fbbf24';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(this.connectionStart.pin.x, this.connectionStart.pin.y);
            ctx.lineTo(mouseX / zoomLevel, mouseY / zoomLevel);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        ctx.restore();

        // シミュレーション詳細を非表示
        document.getElementById('simulationDetails').classList.add('hidden');
        if (autoStepInterval) {
            clearInterval(autoStepInterval);
            autoStepInterval = null;
        }
    }

    updateSimulationDisplay() {
        const stepsContainer = document.getElementById('simulationSteps');
        const currentStepInfo = document.getElementById('currentStepInfo');
        
        if (!this.detailedSteps) return;
        
        stepsContainer.innerHTML = '';
        
        this.detailedSteps.forEach((stepData, index) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = `simulation-step ${index === currentSimulationStep ? 'active' : ''}`;
            
            let stepHTML = `
                <div class="step-title">${stepData.title}</div>
                <div style="margin-bottom: 10px; color: #6b7280;">${stepData.description}</div>
            `;

            // 信号変化のハイライト表示
            if (stepData.signalChanges && stepData.signalChanges.length > 0) {
                stepHTML += '<div style="margin-bottom: 15px; background: #fef3c7; padding: 10px; border-radius: 6px; border: 1px solid #f59e0b;"><strong>🔄 変化した信号:</strong><br>';
                stepData.signalChanges.forEach((change) => {
                    const changeIcon = change.outputChanged ? '🔄' : '📥';
                    stepHTML += `
                        <div style="margin: 5px 0; padding: 5px; background: white; border-radius: 4px;">
                            <span style="font-weight: bold;">${changeIcon} ${change.type}-${change.gateId}</span><br>
                            ${change.inputChanged ? `入力: [${change.previousInputs.join(', ')}] → [${change.currentInputs.join(', ')}]<br>` : ''}
                            ${change.outputChanged ? `出力: ${change.previousOutput} → ${change.currentOutput}` : ''}
                        </div>
                    `;
                });
                stepHTML += '</div>';
            }

            // 詳細な論理演算の表示
            if (stepData.calculations && stepData.calculations.length > 0) {
                stepHTML += '<div style="margin-bottom: 15px;"><strong>📊 論理演算の詳細:</strong><br>';
                stepData.calculations.forEach((calc) => {
                    const operationIcon = calc.gateType === 'AND' ? '∧' : calc.gateType === 'OR' ? '∨' : '¬';
                    stepHTML += `
                        <div class="gate-calculation" style="margin: 8px 0; background: #f0f9ff; border: 1px solid #0ea5e9;">
                            <div style="font-weight: bold; color: #0369a1;">${operationIcon} ${calc.gateType}-${calc.gateId}</div>
                            <div style="margin: 5px 0;">
                                <span style="color: #64748b;">入力:</span> [${calc.inputs.join(', ')}]
                            </div>
                            <div style="margin: 5px 0;">
                                <span style="color: #64748b;">計算:</span> ${calc.explanation}
                            </div>
                            <div style="margin: 5px 0; font-weight: bold;">
                                <span style="color: #064e3b;">結果:</span> 
                                <span class="signal-value ${calc.result ? 'signal-high' : 'signal-low'}" style="margin-left: 5px;">${calc.result}</span>
                            </div>
                        </div>
                    `;
                });
                stepHTML += '</div>';
            }
            
            // 入力回路の状態を表示
            const inputGates = Array.from(stepData.gateStates.entries()).filter(([id, state]) => state.type === 'INPUT');
            if (inputGates.length > 0) {
                stepHTML += '<div style="margin-bottom: 10px;"><strong>📥 入力値:</strong><br>';
                inputGates.forEach(([id, state]) => {
                    const changeIndicator = state.changed ? '🔄' : '';
                    stepHTML += `
                        <div class="signal-flow">
                            <span>INPUT-${id}: ${changeIndicator}</span>
                            <div class="signal-value ${state.outputValue ? 'signal-high' : 'signal-low'}">${state.outputValue}</div>
                        </div>
                    `;
                });
                stepHTML += '</div>';
            }
            
            // 接続の信号状態を表示（変化があったもののみハイライト）
            if (stepData.connectionStates.length > 0) {
                stepHTML += '<div style="margin-bottom: 10px;"><strong>🔗 信号の流れ:</strong><br>';
                stepData.connectionStates.forEach((connState) => {
                    const changeClass = connState.signalChanged ? 'style="background: #fef3c7; padding: 3px; border-radius: 3px;"' : '';
                    const changeIcon = connState.signalChanged ? '⚡' : '';
                    stepHTML += `
                        <div class="signal-flow" ${changeClass}>
                            <span>${connState.fromType}-${connState.fromGateId}</span>
                            <div class="signal-value ${connState.signal ? 'signal-high' : 'signal-low'}">${connState.signal}</div>
                            <span class="signal-arrow">→ ${changeIcon}</span>
                            <span>${connState.toType}-${connState.toGateId}</span>
                        </div>
                    `;
                });
                stepHTML += '</div>';
            }
            
            // 出力回路の状態を表示
            const outputGates = Array.from(stepData.gateStates.entries()).filter(([id, state]) => state.type === 'OUTPUT');
            if (outputGates.length > 0) {
                stepHTML += '<div style="margin-bottom: 10px;"><strong>📤 出力値:</strong><br>';
                outputGates.forEach(([id, state]) => {
                    const changeIndicator = state.changed ? '🔄' : '';
                    stepHTML += `
                        <div class="signal-flow">
                            <span>OUTPUT-${id}: ${changeIndicator}</span>
                            <div class="signal-value ${state.outputValue ? 'signal-high' : 'signal-low'}">${state.outputValue}</div>
                        </div>
                    `;
                });
                stepHTML += '</div>';
            }
            
            stepDiv.innerHTML = stepHTML;
            
            // クリックで該当ステップに移動
            stepDiv.addEventListener('click', () => {
                currentSimulationStep = index;
                this.updateSimulationDisplay();
                this.highlightCurrentStep();
            });
            
            stepsContainer.appendChild(stepDiv);
        });
        
        // 現在のステップ情報を更新
        if (this.detailedSteps[currentSimulationStep]) {
            currentStepInfo.textContent = `ステップ ${currentSimulationStep}: ${this.detailedSteps[currentSimulationStep].title}`;
        }
        
        // ボタンの状態を更新
        document.getElementById('stepForward').disabled = currentSimulationStep >= this.detailedSteps.length - 1;
        document.getElementById('stepBackward').disabled = currentSimulationStep <= 0;
    }
    
    highlightCurrentStep() {
        // キャンバス上で現在のステップの状態をハイライト
        if (this.detailedSteps && this.detailedSteps[currentSimulationStep]) {
            const stepData = this.detailedSteps[currentSimulationStep];
            
            // 回路の状態を一時的に更新
            for(let [id, state] of stepData.gateStates) {
                const gate = this.gates.get(id);
                if (gate) {
                    gate.inputValues = [...state.inputValues];
                    gate.outputValue = state.outputValue;
                }
            }
            
            // 接続の状態を一時的に更新
            stepData.connectionStates.forEach((connState, index) => {
                if (this.connections[index]) {
                    this.connections[index].signal = connState.signal;
                }
            });
            
            draw();
        }
    }
}

// グローバル変数
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const simulator = new Simulator();
let mouseX = 0, mouseY = 0;
let isDragging = false;
let draggedGate = null;
let dragOffset = {x: 0, y: 0};
let deleteMode = false;
let dragMode = true; // デフォルトはドラッグモード
let zoomLevel = 1.0; // ズームレベル（1.0 = 100%）
let autoStepInterval = null;
let currentSimulationStep = 0;
let hoveredPin = null;
let hoveredGate = null;
let mouseDownTime = 0;
let isDragHold = false;

// テンプレート回路のデータ
const circuitTemplates = {
    // 既存テンプレート
    half_adder: {
        name: "半加算器",
        description: "2つの1ビット数を加算し、和(Sum)とキャリー(Carry)を出力。A⊕B=Sum, A∧B=Carry",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 100, outputValue: 0},
            {id: 2, type: "INPUT", x: 50, y: 200, outputValue: 0},
            {id: 3, type: "AND", x: 250, y: 80, outputValue: 0},
            {id: 4, type: "OR", x: 250, y: 180, outputValue: 0},
            {id: 5, type: "NOT", x: 400, y: 120, outputValue: 0},
            {id: 6, type: "AND", x: 550, y: 140, outputValue: 0},
            {id: 7, type: "OUTPUT", x: 700, y: 140, outputValue: 0}, // Sum出力
            {id: 8, type: "OUTPUT", x: 700, y: 80, outputValue: 0}   // Carry出力
        ],
        connections: [
            // Carry回路: A AND B
            {fromGateId: 1, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 3, toPin: 1},
            {fromGateId: 3, fromPin: 0, toGateId: 8, toPin: 0},
            
            // Sum回路: A XOR B = (A OR B) AND NOT(A AND B)
            {fromGateId: 1, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 4, toPin: 1},
            {fromGateId: 3, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 6, toPin: 0},
            {fromGateId: 5, fromPin: 0, toGateId: 6, toPin: 1},
            {fromGateId: 6, fromPin: 0, toGateId: 7, toPin: 0}
        ]
    },
    full_adder: {
        name: "全加算器",
        description: "3つの1ビット数(A,B,Cin)を加算し、和(Sum)とキャリー(Cout)を出力",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 80, outputValue: 0},   // A
            {id: 2, type: "INPUT", x: 50, y: 140, outputValue: 0},  // B  
            {id: 3, type: "INPUT", x: 50, y: 200, outputValue: 0},  // Cin
            
            // 第1段半加算器（A⊕B）
            {id: 4, type: "OR", x: 180, y: 60, outputValue: 0},
            {id: 5, type: "AND", x: 180, y: 100, outputValue: 0},
            {id: 6, type: "NOT", x: 280, y: 80, outputValue: 0},
            {id: 7, type: "AND", x: 380, y: 80, outputValue: 0},    // A⊕B
            
            // 第2段半加算器（(A⊕B)⊕Cin）
            {id: 8, type: "OR", x: 480, y: 120, outputValue: 0},
            {id: 9, type: "AND", x: 480, y: 160, outputValue: 0},
            {id: 10, type: "NOT", x: 580, y: 140, outputValue: 0},
            {id: 11, type: "AND", x: 680, y: 140, outputValue: 0},  // Sum
            
            // キャリー計算
            {id: 12, type: "OR", x: 580, y: 200, outputValue: 0},   // Cout
            
            {id: 13, type: "OUTPUT", x: 780, y: 140, outputValue: 0}, // Sum出力
            {id: 14, type: "OUTPUT", x: 780, y: 200, outputValue: 0}  // Cout出力
        ],
        connections: [
            // 第1段半加算器: A⊕B
            {fromGateId: 1, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 4, toPin: 1},
            {fromGateId: 1, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 5, toPin: 1},
            {fromGateId: 5, fromPin: 0, toGateId: 6, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 7, toPin: 0},
            {fromGateId: 6, fromPin: 0, toGateId: 7, toPin: 1},
            
            // 第2段半加算器: (A⊕B)⊕Cin
            {fromGateId: 7, fromPin: 0, toGateId: 8, toPin: 0},
            {fromGateId: 3, fromPin: 0, toGateId: 8, toPin: 1},
            {fromGateId: 7, fromPin: 0, toGateId: 9, toPin: 0},
            {fromGateId: 3, fromPin: 0, toGateId: 9, toPin: 1},
            {fromGateId: 9, fromPin: 0, toGateId: 10, toPin: 0},
            {fromGateId: 8, fromPin: 0, toGateId: 11, toPin: 0},
            {fromGateId: 10, fromPin: 0, toGateId: 11, toPin: 1},
            
            // キャリー: (A∧B) ∨ (Cin∧(A⊕B))
            {fromGateId: 5, fromPin: 0, toGateId: 12, toPin: 0},
            {fromGateId: 9, fromPin: 0, toGateId: 12, toPin: 1},
            
            // 出力
            {fromGateId: 11, fromPin: 0, toGateId: 13, toPin: 0},
            {fromGateId: 12, fromPin: 0, toGateId: 14, toPin: 0}
        ]
    },
    mux2to1: {
        name: "2-to-1マルチプレクサ",
        description: "セレクト信号により2つの入力のうち1つを選択",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 80, outputValue: 0},
            {id: 2, type: "INPUT", x: 50, y: 160, outputValue: 0},
            {id: 3, type: "INPUT", x: 50, y: 240, outputValue: 0},
            {id: 4, type: "NOT", x: 200, y: 240, outputValue: 0},
            {id: 5, type: "AND", x: 350, y: 100, outputValue: 0},
            {id: 6, type: "AND", x: 350, y: 200, outputValue: 0},
            {id: 7, type: "OR", x: 500, y: 150, outputValue: 0},
            {id: 8, type: "OUTPUT", x: 650, y: 150, outputValue: 0}
        ],
        connections: [
            {fromGateId: 3, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 1, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 5, toPin: 1},
            {fromGateId: 2, fromPin: 0, toGateId: 6, toPin: 0},
            {fromGateId: 3, fromPin: 0, toGateId: 6, toPin: 1},
            {fromGateId: 5, fromPin: 0, toGateId: 7, toPin: 0},
            {fromGateId: 6, fromPin: 0, toGateId: 7, toPin: 1},
            {fromGateId: 7, fromPin: 0, toGateId: 8, toPin: 0}
        ]
    },
    decoder2to4: {
        name: "2-to-4デコーダ",
        description: "2ビット入力を4つの出力線にデコード",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 100, outputValue: 0},
            {id: 2, type: "INPUT", x: 50, y: 200, outputValue: 0},
            {id: 3, type: "NOT", x: 150, y: 100, outputValue: 0},
            {id: 4, type: "NOT", x: 150, y: 200, outputValue: 0},
            {id: 5, type: "AND", x: 300, y: 80, outputValue: 0},
            {id: 6, type: "AND", x: 300, y: 140, outputValue: 0},
            {id: 7, type: "AND", x: 300, y: 200, outputValue: 0},
            {id: 8, type: "AND", x: 300, y: 260, outputValue: 0},
            {id: 9, type: "OUTPUT", x: 450, y: 80, outputValue: 0},
            {id: 10, type: "OUTPUT", x: 450, y: 140, outputValue: 0},
            {id: 11, type: "OUTPUT", x: 450, y: 200, outputValue: 0},
            {id: 12, type: "OUTPUT", x: 450, y: 260, outputValue: 0}
        ],
        connections: [
            {fromGateId: 1, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 3, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 5, toPin: 1},
            {fromGateId: 1, fromPin: 0, toGateId: 6, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 6, toPin: 1},
            {fromGateId: 3, fromPin: 0, toGateId: 7, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 7, toPin: 1},
            {fromGateId: 1, fromPin: 0, toGateId: 8, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 8, toPin: 1},
            {fromGateId: 5, fromPin: 0, toGateId: 9, toPin: 0},
            {fromGateId: 6, fromPin: 0, toGateId: 10, toPin: 0},
            {fromGateId: 7, fromPin: 0, toGateId: 11, toPin: 0},
            {fromGateId: 8, fromPin: 0, toGateId: 12, toPin: 0}
        ]
    },
    sr_latch: {
        name: "SRラッチ",
        description: "セット・リセット機能を持つ基本的なラッチ回路",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 100, outputValue: 0},
            {id: 2, type: "INPUT", x: 50, y: 200, outputValue: 0},
            {id: 3, type: "OR", x: 200, y: 120, outputValue: 0},
            {id: 4, type: "OR", x: 200, y: 180, outputValue: 0},
            {id: 5, type: "NOT", x: 350, y: 120, outputValue: 0},
            {id: 6, type: "NOT", x: 350, y: 180, outputValue: 0},
            {id: 7, type: "OUTPUT", x: 500, y: 120, outputValue: 0},
            {id: 8, type: "OUTPUT", x: 500, y: 180, outputValue: 0}
        ],
        connections: [
            {fromGateId: 1, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 4, toPin: 1},
            {fromGateId: 3, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 6, toPin: 0},
            {fromGateId: 6, fromPin: 0, toGateId: 3, toPin: 1},
            {fromGateId: 5, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 5, fromPin: 0, toGateId: 7, toPin: 0},
            {fromGateId: 6, fromPin: 0, toGateId: 8, toPin: 0}
        ]
    },
    
    // スクリーンショットから追加する新しいテンプレート
    circuit_pattern_a: {
        name: "論理回路パターンA",
        description: "OR-AND-NOT の複合回路パターン",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 80, outputValue: 0},   // A
            {id: 2, type: "INPUT", x: 50, y: 160, outputValue: 0},  // B
            {id: 3, type: "OR", x: 180, y: 120, outputValue: 0},
            {id: 4, type: "AND", x: 320, y: 120, outputValue: 0},
            {id: 5, type: "NOT", x: 180, y: 220, outputValue: 0},
            {id: 6, type: "OUTPUT", x: 480, y: 120, outputValue: 0} // X
        ],
        connections: [
            {fromGateId: 1, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 3, toPin: 1},
            {fromGateId: 3, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 5, fromPin: 0, toGateId: 4, toPin: 1},
            {fromGateId: 4, fromPin: 0, toGateId: 6, toPin: 0}
        ]
    },
    
    circuit_pattern_b: {
        name: "論理回路パターンB",
        description: "AND-OR の基本組み合わせ回路",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 80, outputValue: 0},   // A
            {id: 2, type: "INPUT", x: 50, y: 160, outputValue: 0},  // B
            {id: 3, type: "AND", x: 180, y: 80, outputValue: 0},
            {id: 4, type: "AND", x: 180, y: 160, outputValue: 0},
            {id: 5, type: "OR", x: 320, y: 120, outputValue: 0},
            {id: 6, type: "OUTPUT", x: 480, y: 120, outputValue: 0} // X
        ],
        connections: [
            {fromGateId: 1, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 3, toPin: 1},
            {fromGateId: 1, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 4, toPin: 1},
            {fromGateId: 3, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 5, toPin: 1},
            {fromGateId: 5, fromPin: 0, toGateId: 6, toPin: 0}
        ]
    },
    
    circuit_pattern_c: {
        name: "論理回路パターンC",
        description: "AND-NOT の単純な組み合わせ",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 80, outputValue: 0},   // A
            {id: 2, type: "INPUT", x: 50, y: 160, outputValue: 0},  // B
            {id: 3, type: "AND", x: 180, y: 120, outputValue: 0},
            {id: 4, type: "NOT", x: 320, y: 120, outputValue: 0},
            {id: 5, type: "OUTPUT", x: 480, y: 120, outputValue: 0} // X
        ],
        connections: [
            {fromGateId: 1, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 3, toPin: 1},
            {fromGateId: 3, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 5, toPin: 0}
        ]
    },
    
    circuit_pattern_d: {
        name: "論理回路パターンD",
        description: "NOT-OR-NOT の連続回路",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 80, outputValue: 0},   // A
            {id: 2, type: "INPUT", x: 50, y: 160, outputValue: 0},  // B
            {id: 3, type: "NOT", x: 180, y: 80, outputValue: 0},
            {id: 4, type: "NOT", x: 180, y: 160, outputValue: 0},
            {id: 5, type: "OR", x: 320, y: 120, outputValue: 0},
            {id: 6, type: "NOT", x: 460, y: 120, outputValue: 0},
            {id: 7, type: "OUTPUT", x: 600, y: 120, outputValue: 0} // X
        ],
        connections: [
            {fromGateId: 1, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 3, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 4, fromPin: 0, toGateId: 5, toPin: 1},
            {fromGateId: 5, fromPin: 0, toGateId: 6, toPin: 0},
            {fromGateId: 6, fromPin: 0, toGateId: 7, toPin: 0}
        ]
    },
    
    circuit_pattern_e: {
        name: "論理回路パターンE",
        description: "NOT-OR フィードバック回路",
        gates: [
            {id: 1, type: "INPUT", x: 50, y: 80, outputValue: 0},   // A
            {id: 2, type: "INPUT", x: 50, y: 200, outputValue: 0},  // B
            {id: 3, type: "NOT", x: 180, y: 200, outputValue: 0},
            {id: 4, type: "OR", x: 320, y: 140, outputValue: 0},
            {id: 5, type: "OUTPUT", x: 480, y: 140, outputValue: 0} // X
        ],
        connections: [
            {fromGateId: 1, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 3, fromPin: 0, toGateId: 4, toPin: 1},
            {fromGateId: 4, fromPin: 0, toGateId: 5, toPin: 0}
        ]
    },

    all_patterns_abcde: {
        name: "全パターン表示 (A-E)",
        description: "スクリーンショットの5つの回路パターンを一画面に配置",
        gates: [
            // パターンA (左上)
            {id: 1, type: "INPUT", x: 50, y: 50, outputValue: 0},   // A
            {id: 2, type: "INPUT", x: 50, y: 90, outputValue: 0},   // B
            {id: 3, type: "OR", x: 150, y: 70, outputValue: 0},
            {id: 4, type: "AND", x: 250, y: 70, outputValue: 0},
            {id: 5, type: "NOT", x: 150, y: 130, outputValue: 0},
            {id: 6, type: "OUTPUT", x: 350, y: 70, outputValue: 0}, // X

            // パターンB (右上)
            {id: 7, type: "INPUT", x: 450, y: 50, outputValue: 0},  // A
            {id: 8, type: "INPUT", x: 450, y: 90, outputValue: 0},  // B
            {id: 9, type: "AND", x: 550, y: 50, outputValue: 0},
            {id: 10, type: "AND", x: 550, y: 90, outputValue: 0},
            {id: 11, type: "OR", x: 650, y: 70, outputValue: 0},
            {id: 12, type: "OUTPUT", x: 750, y: 70, outputValue: 0}, // X

            // パターンC (左中央)
            {id: 13, type: "INPUT", x: 50, y: 200, outputValue: 0}, // A
            {id: 14, type: "INPUT", x: 50, y: 240, outputValue: 0}, // B
            {id: 15, type: "AND", x: 150, y: 220, outputValue: 0},
            {id: 16, type: "NOT", x: 250, y: 220, outputValue: 0},
            {id: 17, type: "OUTPUT", x: 350, y: 220, outputValue: 0}, // X

            // パターンD (右中央)
            {id: 18, type: "INPUT", x: 450, y: 200, outputValue: 0}, // A
            {id: 19, type: "INPUT", x: 450, y: 240, outputValue: 0}, // B
            {id: 20, type: "NOT", x: 550, y: 200, outputValue: 0},
            {id: 21, type: "NOT", x: 550, y: 240, outputValue: 0},
            {id: 22, type: "OR", x: 650, y: 220, outputValue: 0},
            {id: 23, type: "NOT", x: 750, y: 220, outputValue: 0},
            {id: 24, type: "OUTPUT", x: 850, y: 220, outputValue: 0}, // X

            // パターンE (中央下)
            {id: 25, type: "INPUT", x: 250, y: 350, outputValue: 0}, // A
            {id: 26, type: "INPUT", x: 250, y: 420, outputValue: 0}, // B
            {id: 27, type: "NOT", x: 350, y: 420, outputValue: 0},
            {id: 28, type: "OR", x: 450, y: 385, outputValue: 0},
            {id: 29, type: "OUTPUT", x: 550, y: 385, outputValue: 0} // X
        ],
        connections: [
            // パターンA接続
            {fromGateId: 1, fromPin: 0, toGateId: 3, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 3, toPin: 1},
            {fromGateId: 3, fromPin: 0, toGateId: 4, toPin: 0},
            {fromGateId: 2, fromPin: 0, toGateId: 5, toPin: 0},
            {fromGateId: 5, fromPin: 0, toGateId: 4, toPin: 1},
            {fromGateId: 4, fromPin: 0, toGateId: 6, toPin: 0},

            // パターンB接続
            {fromGateId: 7, fromPin: 0, toGateId: 9, toPin: 0},
            {fromGateId: 8, fromPin: 0, toGateId: 9, toPin: 1},
            {fromGateId: 7, fromPin: 0, toGateId: 10, toPin: 0},
            {fromGateId: 8, fromPin: 0, toGateId: 10, toPin: 1},
            {fromGateId: 9, fromPin: 0, toGateId: 11, toPin: 0},
            {fromGateId: 10, fromPin: 0, toGateId: 11, toPin: 1},
            {fromGateId: 11, fromPin: 0, toGateId: 12, toPin: 0},

            // パターンC接続
            {fromGateId: 13, fromPin: 0, toGateId: 15, toPin: 0},
            {fromGateId: 14, fromPin: 0, toGateId: 15, toPin: 1},
            {fromGateId: 15, fromPin: 0, toGateId: 16, toPin: 0},
            {fromGateId: 16, fromPin: 0, toGateId: 17, toPin: 0},

            // パターンD接続
            {fromGateId: 18, fromPin: 0, toGateId: 20, toPin: 0},
            {fromGateId: 19, fromPin: 0, toGateId: 21, toPin: 0},
            {fromGateId: 20, fromPin: 0, toGateId: 22, toPin: 0},
            {fromGateId: 21, fromPin: 0, toGateId: 22, toPin: 1},
            {fromGateId: 22, fromPin: 0, toGateId: 23, toPin: 0},
            {fromGateId: 23, fromPin: 0, toGateId: 24, toPin: 0},

            // パターンE接続
            {fromGateId: 25, fromPin: 0, toGateId: 28, toPin: 0},
            {fromGateId: 26, fromPin: 0, toGateId: 27, toPin: 0},
            {fromGateId: 27, fromPin: 0, toGateId: 28, toPin: 1},
            {fromGateId: 28, fromPin: 0, toGateId: 29, toPin: 0}
        ]
    }
};

// イベントリスナー
document.querySelectorAll('.gate-button').forEach(button => {
    button.addEventListener('click', () => {
        // 前の選択を解除
        document.querySelectorAll('.gate-button').forEach(b => b.classList.remove('active'));
        
        // 新しい選択
        button.classList.add('active');
        simulator.selectedGateType = button.dataset.gate;
        simulator.isConnecting = false;
        dragMode = false;
        deleteMode = false;
        
        // 全てのモードボタンを通常状態に戻す
        resetModeButtons();
        
        updateModeIndicator();
    });
});

document.getElementById('dragMode').addEventListener('click', () => {
    dragMode = true;
    deleteMode = false;
    simulator.isConnecting = false;
    simulator.selectedGateType = null;
    simulator.connectionStart = null;
    
    // 全ての回路選択を解除
    document.querySelectorAll('.gate-button').forEach(b => b.classList.remove('active'));
    
    // 全てのモードボタンを通常状態に戻す
    resetModeButtons();
    
    // ドラッグボタンを選択状態にする
    const dragBtn = document.getElementById('dragMode');
    dragBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    dragBtn.textContent = 'ドラッグモード: ON';
    
    canvas.style.cursor = 'default';
    updateModeIndicator();
});

document.getElementById('connectMode').addEventListener('click', () => {
    simulator.isConnecting = !simulator.isConnecting;
    simulator.selectedGateType = null;
    simulator.connectionStart = null;
    dragMode = false;
    deleteMode = false;
    
    // 全ての回路選択を解除
    document.querySelectorAll('.gate-button').forEach(b => b.classList.remove('active'));
    
    // 全てのモードボタンを通常状態に戻す
    resetModeButtons();
    
    // 接続ボタンの状態を更新
    const connectBtn = document.getElementById('connectMode');
    if(simulator.isConnecting) {
        connectBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        connectBtn.textContent = '接続モード終了';
    } else {
        connectBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        connectBtn.textContent = '接続モード';
    }
    
    updateModeIndicator();
});

document.getElementById('clearAll').addEventListener('click', () => {
    if(confirm('全ての回路と接続を削除しますか？')) {
        simulator.clear();
        draw();
    }
});

document.getElementById('simulate').addEventListener('click', () => {
    simulator.simulate();
    document.getElementById('stepForward').disabled = false;
    document.getElementById('stepBackward').disabled = false;
    document.getElementById('autoStep').disabled = false;
});

document.getElementById('stepForward').addEventListener('click', () => {
    simulator.stepForward();
    draw();
});

document.getElementById('stepBackward').addEventListener('click', () => {
    simulator.stepBackward();
    draw();
});

document.getElementById('resetSim').addEventListener('click', () => {
    simulator.reset();
    document.getElementById('stepForward').disabled = true;
    document.getElementById('stepBackward').disabled = true;
    draw();
});

// 信号値表示の切り替え
document.getElementById('toggleSignalDisplay').addEventListener('click', () => {
    simulator.showSignalValues = !simulator.showSignalValues;
    const button = document.getElementById('toggleSignalDisplay');
    
    if(simulator.showSignalValues) {
        button.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        button.textContent = '信号値表示: ON';
    } else {
        button.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        button.textContent = '信号値表示';
    }
    
    draw();
});

// 詳細シミュレーション用のイベントリスナー
document.getElementById('stepForward').addEventListener('click', () => {
    if (simulator.detailedSteps && currentSimulationStep < simulator.detailedSteps.length - 1) {
        currentSimulationStep++;
        simulator.updateSimulationDisplay();
        simulator.highlightCurrentStep();
    }
});

document.getElementById('stepBackward').addEventListener('click', () => {
    if (simulator.detailedSteps && currentSimulationStep > 0) {
        currentSimulationStep--;
        simulator.updateSimulationDisplay();
        simulator.highlightCurrentStep();
    }
});

document.getElementById('autoStep').addEventListener('click', () => {
    if (autoStepInterval) return;
    
    autoStepInterval = setInterval(() => {
        if (simulator.detailedSteps && currentSimulationStep < simulator.detailedSteps.length - 1) {
            currentSimulationStep++;
            simulator.updateSimulationDisplay();
            simulator.highlightCurrentStep();
        } else {
            clearInterval(autoStepInterval);
            autoStepInterval = null;
            document.getElementById('autoStep').disabled = false;
            document.getElementById('pauseAuto').disabled = true;
        }
    }, 1500);
    
    document.getElementById('autoStep').disabled = true;
    document.getElementById('pauseAuto').disabled = false;
});

document.getElementById('pauseAuto').addEventListener('click', () => {
    if (autoStepInterval) {
        clearInterval(autoStepInterval);
        autoStepInterval = null;
        document.getElementById('autoStep').disabled = false;
        document.getElementById('pauseAuto').disabled = true;
    }
});

// 削除モードのイベントリスナー
document.getElementById('deleteMode').addEventListener('click', () => {
    deleteMode = !deleteMode;
    simulator.isConnecting = false;
    simulator.selectedGateType = null;
    simulator.connectionStart = null;
    dragMode = false;
    
    // 全ての回路選択を解除
    document.querySelectorAll('.gate-button').forEach(b => b.classList.remove('active'));
    
    // 全てのモードボタンを通常状態に戻す
    resetModeButtons();
    
    // 削除ボタンの状態を更新
    const deleteBtn = document.getElementById('deleteMode');
    if(deleteMode) {
        deleteBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        deleteBtn.textContent = '削除モード終了';
        canvas.style.cursor = 'crosshair';
    } else {
        deleteBtn.style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
        deleteBtn.textContent = '削除モード';
        canvas.style.cursor = 'default';
    }
    
    updateModeIndicator();
});

// 保存機能
document.getElementById('saveCircuit').addEventListener('click', () => {
    const circuitData = {
        gates: Array.from(simulator.gates.entries()).map(([id, gate]) => ({
            id: id,
            type: gate.type,
            x: gate.x,
            y: gate.y,
            outputValue: gate.outputValue
        })),
        connections: simulator.connections.map(conn => ({
            fromGateId: conn.fromGate.id,
            fromPin: conn.fromPin,
            toGateId: conn.toGate.id,
            toPin: conn.toPin
        }))
    };
    
    const dataStr = JSON.stringify(circuitData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logic_circuit.json';
    link.click();
    URL.revokeObjectURL(url);
});

// 読み込み機能
document.getElementById('loadCircuit').addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const circuitData = JSON.parse(event.target.result);
                loadCircuitData(circuitData);
            } catch (error) {
                alert('ファイルの読み込みに失敗しました。');
            }
        };
        reader.readAsText(file);
    };
    input.click();
});

// デバッグ用: グローバルスコープにテンプレートをアクセス可能にする
window.debugTemplates = () => {
    console.log('circuitTemplates:', circuitTemplates);
    console.log('Keys:', Object.keys(circuitTemplates));
    console.log('all_patterns_abcde exists:', 'all_patterns_abcde' in circuitTemplates);
};

// テンプレート読み込み機能
document.getElementById('loadTemplate').addEventListener('click', () => {
    const templateSelect = document.getElementById('templateSelect');
    const templateName = templateSelect.value;

    console.log('選択されたテンプレート名:', templateName);
    console.log('利用可能なテンプレート:', Object.keys(circuitTemplates));

    if (!templateName) {
        alert('テンプレートを選択してください。');
        return;
    }

    const template = circuitTemplates[templateName];
    console.log('テンプレートオブジェクト:', template);

    if (!template) {
        alert(`選択されたテンプレート「${templateName}」が見つかりません。\n利用可能: ${Object.keys(circuitTemplates).join(', ')}`);
        return;
    }
    
    if (simulator.gates.size > 0) {
        if (!confirm(`現在の回路を削除して「${template.name}」を読み込みますか？\n\n説明: ${template.description}`)) {
            return;
        }
    }
    
    loadCircuitData(template);
    templateSelect.value = '';
    
    alert(`テンプレート「${template.name}」を読み込みました！\n\n説明: ${template.description}\n\n入力回路をクリックして値を変更し、シミュレートボタンで動作を確認してください。`);
});

// ドラッグ&ドロップのマウスイベント
canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    mouseDownTime = Date.now();
    isDragHold = false;

    console.log('マウスダウン:', {x, y, deleteMode, isConnecting: simulator.isConnecting, selectedGateType: simulator.selectedGateType});

    if (deleteMode) {
        handleDelete(x, y);
        return;
    }

    // ピンがクリックされた場合は即座に接続モードに
    if (hoveredPin && hoveredGate) {
        activateConnectionMode();
        handleConnectionClick(x, y);
        return;
    }

    if (simulator.isConnecting) {
        handleConnectionClick(x, y);
        return;
    }

    // 回路をクリックしたかチェック
    let gateClicked = false;
    for (let gate of simulator.gates.values()) {
        if (gate.containsPoint(x, y)) {
            gateClicked = true;
            console.log('回路がクリックされました:', gate.type, gate.id);
            
            if (simulator.selectedGateType) {
                // 配置モードの場合は何もしない（新しい回路を配置するため）
                console.log('配置モードのため、ドラッグをスキップ');
                break;
            } else {
                // ドラッグ開始の準備（即座には開始しない）
                draggedGate = gate;
                dragOffset.x = x - gate.x;
                dragOffset.y = y - gate.y;
                
                // 入力回路の値変更
                if (gate.type === 'INPUT') {
                    gate.outputValue = gate.outputValue === 1 ? 0 : 1;
                    console.log('入力値変更:', gate.outputValue);
                    // 即座に回路を更新
                    simulator.updateCircuit();
                    draw();
                }
                return;
            }
        }
    }

    // 回路配置
    if (simulator.selectedGateType && !gateClicked) {
        console.log('新しい回路を配置:', simulator.selectedGateType);
        simulator.addGate(simulator.selectedGateType, x - 40, y - 30);
        draw();
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) / zoomLevel;
    mouseY = (e.clientY - rect.top) / zoomLevel;

    // ホバー状態をチェック
    let pinFound = false;
    hoveredPin = null;
    hoveredGate = null;

    for (let gate of simulator.gates.values()) {
        const pin = gate.getClickedPin(mouseX, mouseY);
        if (pin) {
            hoveredPin = pin;
            hoveredGate = gate;
            pinFound = true;
            break;
        }
    }

    // カーソルスタイルを更新
    if (pinFound) {
        canvas.style.cursor = 'pointer';
    } else if (isDragging && draggedGate) {
        canvas.style.cursor = 'move';
    } else if (draggedGate && !isDragHold) {
        // クリックしてから少し時間が経ったらドラッグモードに
        const holdTime = Date.now() - mouseDownTime;
        if (holdTime > 100) { // 100ms後にドラッグ開始
            isDragging = true;
            isDragHold = true;
            canvas.style.cursor = 'move';
        }
    } else {
        canvas.style.cursor = 'default';
    }

    if (isDragging && draggedGate) {
        draggedGate.x = mouseX - dragOffset.x;
        draggedGate.y = mouseY - dragOffset.y;
        
        // ピンの位置を更新
        draggedGate.inputPins = draggedGate.calculateInputPins();
        draggedGate.outputPins = draggedGate.calculateOutputPins();
        
        draw();
    } else if (simulator.isConnecting) {
        draw();
    } else if (pinFound || hoveredPin) {
        draw(); // ホバー効果を表示するために再描画
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
    draggedGate = null;
    isDragHold = false;
    mouseDownTime = 0;
});

// 接続モードを有効化する関数
function activateConnectionMode() {
    if (!simulator.isConnecting) {
        simulator.isConnecting = true;
        simulator.selectedGateType = null;
        simulator.connectionStart = null;
        dragMode = false;
        deleteMode = false;
        
        // 全ての回路選択を解除
        document.querySelectorAll('.gate-button').forEach(b => b.classList.remove('active'));
        
        // 全てのモードボタンを通常状態に戻す
        resetModeButtons();
        
        // 接続ボタンを有効状態にする
        const connectBtn = document.getElementById('connectMode');
        connectBtn.style.background = 'linear-gradient(135deg, #dc2626, #b91c1c)';
        connectBtn.textContent = '接続モード終了';
        
        updateModeIndicator();
    }
}

// 削除機能
function handleDelete(x, y) {
    // 回路を削除
    for (let gate of simulator.gates.values()) {
        if (gate.containsPoint(x, y)) {
            simulator.removeGate(gate.id);
            draw();
            return;
        }
    }

    // 接続を削除
    for (let connection of simulator.connections) {
        if (connection.containsPoint && connection.containsPoint(x, y)) {
            simulator.connections = simulator.connections.filter(c => c !== connection);
            simulator.updateCounts();
            draw();
            return;
        }
    }
}

// 回路データの読み込み
function loadCircuitData(circuitData) {
    simulator.clear();
    
    // 回路を復元
    circuitData.gates.forEach(gateData => {
        const gate = new LogicGate(gateData.type, gateData.x, gateData.y, gateData.id);
        gate.outputValue = gateData.outputValue || 0;
        simulator.gates.set(gateData.id, gate);
    });
    
    // 接続を復元
    circuitData.connections.forEach(connData => {
        const fromGate = simulator.gates.get(connData.fromGateId);
        const toGate = simulator.gates.get(connData.toGateId);
        if (fromGate && toGate) {
            simulator.addConnection(fromGate, connData.fromPin, toGate, connData.toPin);
        }
    });
    
    simulator.nextGateId = Math.max(...circuitData.gates.map(g => g.id)) + 1;
    draw();
    
    // 真理値表を更新
    updateTruthTableIfNeeded();
}


function handleConnectionClick(x, y) {
    let clickedPin = null;
    let clickedGate = null;

    // どの回路のどのピンがクリックされたかを検出
    for(let gate of simulator.gates.values()) {
        const pin = gate.getClickedPin(x, y);
        if(pin) {
            clickedPin = pin;
            clickedGate = gate;
            break;
        }
    }

    if(!clickedPin) {
        console.log('ピンがクリックされませんでした');
        return;
    }

    console.log('クリックされたピン:', clickedPin.type, 'ゲート:', clickedGate.type);

    if(!simulator.connectionStart) {
        // 接続開始（出力ピンのみ）
        if(clickedPin.type === 'output') {
            simulator.connectionStart = {
                gate: clickedGate,
                pin: clickedPin,
                pinIndex: clickedPin.index
            };
            console.log('接続開始:', clickedGate.type, 'の出力ピン');
            updateModeIndicator();
        } else {
            console.log('出力ピンを最初にクリックしてください');
        }
    } else {
        // 接続完了（入力ピンのみ）
        if(clickedPin.type === 'input' && clickedGate.id !== simulator.connectionStart.gate.id) {
            const success = simulator.addConnection(
                simulator.connectionStart.gate,
                simulator.connectionStart.pinIndex,
                clickedGate,
                clickedPin.index
            );
            
            if(success) {
                console.log('接続が完了しました');
            } else {
                alert('このピンは既に接続されています。');
            }
        } else if(clickedPin.type !== 'input') {
            console.log('入力ピンをクリックしてください');
        } else {
            console.log('同じゲートには接続できません');
        }
        
        simulator.connectionStart = null;
        updateModeIndicator();
        draw();
    }
}

function handleGateClick(x, y) {
    for(let gate of simulator.gates.values()) {
        if(gate.containsPoint(x, y)) {
            if(gate.type === 'INPUT') {
                // 入力値を切り替え
                gate.outputValue = gate.outputValue === 1 ? 0 : 1;
                // 即座に回路を更新
                simulator.updateCircuit();
                draw();
            }
            break;
        }
    }
}

// モードボタンをリセットする関数
function resetModeButtons() {
    document.getElementById('dragMode').style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    document.getElementById('dragMode').textContent = 'ドラッグモード';
    document.getElementById('connectMode').style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    document.getElementById('connectMode').textContent = '接続モード';
    document.getElementById('deleteMode').style.background = 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
    document.getElementById('deleteMode').textContent = '削除モード';
}

function updateModeIndicator() {
    const indicator = document.getElementById('modeIndicator');
    if(deleteMode) {
        indicator.textContent = '削除モード: 削除する回路や接続をクリック';
        indicator.style.background = '#fef2f2';
        indicator.style.borderColor = '#ef4444';
    } else if(simulator.isConnecting) {
        if(simulator.connectionStart) {
            indicator.textContent = '接続モード: 入力ピン（左側の●）をクリック';
            indicator.style.background = '#ecfdf5';
            indicator.style.borderColor = '#10b981';
        } else {
            indicator.textContent = '接続モード: 出力ピン（右側の●）をクリック';
            indicator.style.background = '#fef3c7';
            indicator.style.borderColor = '#f59e0b';
        }
    } else if(simulator.selectedGateType) {
        indicator.textContent = `配置モード: ${simulator.selectedGateType}回路`;
        indicator.style.background = '#dcfce7';
        indicator.style.borderColor = '#22c55e';
    } else if(dragMode) {
        indicator.textContent = 'ドラッグモード: 回路をドラッグで移動、入力回路をクリックで値変更';
        indicator.style.background = '#eff6ff';
        indicator.style.borderColor = '#3b82f6';
    } else {
        indicator.textContent = 'ドラッグモード: 回路をドラッグで移動、入力回路をクリックで値変更';
        indicator.style.background = '#eff6ff';
        indicator.style.borderColor = '#3b82f6';
    }
}

function draw() {
    simulator.draw(ctx);
}

// 初期化
// ドラッグモードを初期状態で有効にする
document.getElementById('dragMode').style.background = 'linear-gradient(135deg, #10b981, #059669)';
document.getElementById('dragMode').textContent = 'ドラッグモード: ON';
updateModeIndicator();
draw();

// アニメーションループ（シミュレーション中の信号アニメーション用）
function animate() {
    if(simulator.isRunning) {
        draw();
    }
    requestAnimationFrame(animate);
}
animate();

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    switch(e.key) {
        case 'Delete':
        case 'Backspace':
            if (!deleteMode) {
                document.getElementById('deleteMode').click();
            }
            break;
        case 'Escape':
            // 全てのモードをリセット
            deleteMode = false;
            simulator.isConnecting = false;
            simulator.selectedGateType = null;
            simulator.connectionStart = null;
            dragMode = true; // デフォルトはドラッグモード
            document.querySelectorAll('.gate-button').forEach(b => b.classList.remove('active'));
            resetModeButtons();
            // ドラッグモードを有効状態に
            document.getElementById('dragMode').style.background = 'linear-gradient(135deg, #10b981, #059669)';
            document.getElementById('dragMode').textContent = 'ドラッグモード: ON';
            canvas.style.cursor = 'default';
            updateModeIndicator();
            break;
        case 'c':
        case 'C':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                document.getElementById('connectMode').click();
            }
            break;
        case 's':
        case 'S':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                document.getElementById('saveCircuit').click();
            }
            break;
        case 'o':
        case 'O':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                document.getElementById('loadCircuit').click();
            }
            break;
    }
});

// 動的真理値表生成機能
function generateDynamicTruthTable() {
    const inputGates = Array.from(simulator.gates.values()).filter(gate => gate.type === 'INPUT');
    const outputGates = Array.from(simulator.gates.values()).filter(gate => gate.type === 'OUTPUT');

    if (inputGates.length === 0 || outputGates.length === 0) {
        document.getElementById('dynamicTruthTable').classList.add('hidden');
        return;
    }

    // 入力が4つを超える場合は表示しない（テーブルが大きくなりすぎるため）
    if (inputGates.length > 4) {
        const truthTableDiv = document.getElementById('dynamicTruthTable');
        truthTableDiv.classList.remove('hidden');
        document.getElementById('truthTableContent').innerHTML = `
            <div class="truth-table-info">
                ⚠️ 入力数が多すぎます（${inputGates.length}個）。真理値表は入力数が4個以下の場合のみ表示されます。
            </div>
        `;
        return;
    }
    
    const numCombinations = Math.pow(2, inputGates.length);
    
    // 入力の全ての組み合わせを生成
    const combinations = [];
    for (let i = 0; i < numCombinations; i++) {
        const combination = [];
        for (let j = 0; j < inputGates.length; j++) {
            combination.push((i >> (inputGates.length - 1 - j)) & 1);
        }
        combinations.push(combination);
    }
    
    // 各組み合わせに対して回路をシミュレート
    const results = [];
    combinations.forEach(combination => {
        // 入力値を設定
        inputGates.forEach((gate, index) => {
            gate.outputValue = combination[index];
        });
        
        // 回路を安定化
        simulator.updateCircuit();
        
        // 出力値を取得
        const outputs = outputGates.map(gate => gate.outputValue);
        results.push({
            inputs: [...combination],
            outputs: outputs
        });
    });
    
    // HTMLテーブルを生成
    let tableHTML = '<div class="circuit-truth-table"><table>';
    
    // ヘッダー行
    tableHTML += '<tr>';
    inputGates.forEach((gate, index) => {
        tableHTML += `<th class="input-col">入力${index + 1}</th>`;
    });
    outputGates.forEach((gate, index) => {
        tableHTML += `<th class="output-col">出力${index + 1}</th>`;
    });
    tableHTML += '</tr>';
    
    // データ行
    results.forEach(result => {
        tableHTML += '<tr>';
        result.inputs.forEach(input => {
            tableHTML += `<td class="value-${input}">${input}</td>`;
        });
        result.outputs.forEach(output => {
            tableHTML += `<td class="value-${output}">${output}</td>`;
        });
        tableHTML += '</tr>';
    });
    
    tableHTML += '</table></div>';
    
    // 情報メッセージを追加
    const infoHTML = `
        <div class="truth-table-info">
            📋 現在の回路構成: 入力${inputGates.length}個、出力${outputGates.length}個
            <br>📊 真理値表の行数: ${numCombinations}行
        </div>
    `;
    
    // 表示
    document.getElementById('truthTableContent').innerHTML = infoHTML + tableHTML;
    document.getElementById('dynamicTruthTable').classList.remove('hidden');
}

// 回路変更時に真理値表を更新
function updateTruthTableIfNeeded() {
    // 少し遅延を入れて回路が安定してから更新
    setTimeout(() => {
        generateDynamicTruthTable();
    }, 100);
}

// 既存の関数に真理値表更新を追加
const originalAddGate = simulator.addGate;
simulator.addGate = function(type, x, y) {
    const result = originalAddGate.call(this, type, x, y);
    updateTruthTableIfNeeded();
    return result;
};

const originalRemoveGate = simulator.removeGate;
simulator.removeGate = function(gateId) {
    originalRemoveGate.call(this, gateId);
    updateTruthTableIfNeeded();
};

const originalAddConnection = simulator.addConnection;
simulator.addConnection = function(fromGate, fromPin, toGate, toPin) {
    const result = originalAddConnection.call(this, fromGate, fromPin, toGate, toPin);
    updateTruthTableIfNeeded();
    return result;
};

const originalClear = simulator.clear;
simulator.clear = function() {
    originalClear.call(this);
    document.getElementById('dynamicTruthTable').classList.add('hidden');
};

// ズーム機能
document.getElementById('zoomIn').addEventListener('click', () => {
    if (zoomLevel < 3.0) {
        zoomLevel += 0.1;
        draw();
    }
});

document.getElementById('zoomOut').addEventListener('click', () => {
    if (zoomLevel > 0.3) {
        zoomLevel -= 0.1;
        draw();
    }
});

document.getElementById('zoomReset').addEventListener('click', () => {
    zoomLevel = 1.0;
    draw();
});

// クイックスタートガイドの制御
document.getElementById('closeQuickStart').addEventListener('click', () => {
    document.getElementById('quickStartGuide').classList.add('hidden');
    localStorage.setItem('hideQuickStart', 'true');
});

// 初回訪問でない場合はクイックスタートを非表示
if (localStorage.getItem('hideQuickStart') === 'true') {
    document.getElementById('quickStartGuide').classList.add('hidden');
}

// ヘルプモーダルの制御
document.getElementById('showHelp').addEventListener('click', () => {
    document.getElementById('helpModal').classList.remove('hidden');
});

document.getElementById('closeHelp').addEventListener('click', () => {
    document.getElementById('helpModal').classList.add('hidden');
});

// モーダル外クリックで閉じる
document.getElementById('helpModal').addEventListener('click', (e) => {
    if (e.target.id === 'helpModal') {
        document.getElementById('helpModal').classList.add('hidden');
    }
});

// 教育パネルの折りたたみ
document.getElementById('toggleEducationPanel').addEventListener('click', () => {
    const content = document.getElementById('educationContent');
    const toggle = document.getElementById('educationPanelToggle');
    content.classList.toggle('hidden');
    toggle.textContent = content.classList.contains('hidden') ? '▶' : '▼';
});

// キーボードショートカット
document.addEventListener('keydown', (e) => {
    // Ctrl+Zで元に戻す（現時点では未実装）
    if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        // TODO: Undo機能を実装
        console.log('Undo機能は現在開発中です');
    }

    // Dキーでドラッグモード
    if (e.key === 'd' || e.key === 'D') {
        document.getElementById('dragMode').click();
    }

    // Cキーで接続モード
    if (e.key === 'c' || e.key === 'C') {
        document.getElementById('connectMode').click();
    }

    // ?キーでヘルプ表示
    if (e.key === '?') {
        document.getElementById('helpModal').classList.remove('hidden');
    }

    // Escキーでヘルプを閉じる
    if (e.key === 'Escape') {
        document.getElementById('helpModal').classList.add('hidden');
    }
});