# コードスタイルとコンベンション

## JavaScript スタイル

### 命名規則
- **クラス名**: PascalCase（例: `LogicGate`, `Connection`, `Simulator`）
- **関数名・メソッド名**: camelCase（例: `calculateInputPins`, `getClickedPin`）
- **変数名**: camelCase（例: `draggedGate`, `currentSimulationStep`）
- **定数**: camelCase（例: `circuitTemplates`）

### コードパターン
- **ES6クラス構文**: `class ClassName { }`
- **アロー関数**: イベントハンドラーで使用
- **テンプレートリテラル**: 文字列結合で使用
- **const/let**: varは使用しない

### HTML構造
- **セマンティックHTML5**: `<div>`, `<button>`, `<canvas>`等を適切に使用
- **日本語UI**: ボタンやラベルは日本語表記
- **レスポンシブ対応**: モバイルファーストデザイン

### CSS設計
- **BEM風ネーミング**: `.tool-button`, `.gate-button`
- **Flexbox**: レイアウトの主要手法
- **CSS Grid**: 複雑なレイアウト
- **CSS変数**: 色やサイズの管理
- **モバイルファースト**: `@media`クエリによるレスポンシブ

### 設計原則
- **単一責任**: 各クラスは明確な役割を持つ
- **状態管理**: グローバル変数による状態管理
- **イベント駆動**: DOM操作はイベントハンドラーで処理
- **描画分離**: Canvas描画は専用メソッドで実装

### コメント
- **日本語コメント**: 機能説明は日本語
- **英語識別子**: 変数・関数名は英語
- **JSDoc風**: 複雑な関数には説明コメント