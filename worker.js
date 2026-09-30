<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Luau Obfuscator</title>

<style>
    * {
        box-sizing: border-box;
    }

    body {
        margin: 0;
        min-height: 100vh;
        background: #09090b;
        color: #f4f4f5;
        font-family: Inter, Arial, sans-serif;
    }

    .app {
        width: min(1400px, 94%);
        margin: 35px auto;
    }

    h1 {
        margin: 0;
        font-size: 30px;
        font-weight: 750;
    }

    .subtitle {
        color: #a1a1aa;
        margin: 8px 0 24px;
    }

    .toolbar {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin-bottom: 15px;
    }

    button {
        border: 0;
        border-radius: 10px;
        padding: 11px 16px;
        background: #27272a;
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: .15s;
    }

    button:hover {
        background: #3f3f46;
    }

    .primary {
        background: #ffffff;
        color: #09090b;
        font-weight: 700;
    }

    .primary:hover {
        background: #e4e4e7;
    }

    .layout {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 15px;
    }

    .panel {
        background: #111113;
        border: 1px solid #27272a;
        border-radius: 14px;
        overflow: hidden;
    }

    .panel-header {
        padding: 12px 15px;
        border-bottom: 1px solid #27272a;
        color: #a1a1aa;
        font-size: 13px;
    }

    textarea {
        display: block;
        width: 100%;
        min-height: 620px;
        resize: vertical;
        border: 0;
        outline: none;
        padding: 16px;
        background: #0d0d0f;
        color: #e4e4e7;
        font-family: Consolas, Monaco, monospace;
        font-size: 14px;
        line-height: 1.55;
        tab-size: 4;
    }

    .options {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        margin: 15px 0;
        padding: 14px;
        background: #111113;
        border: 1px solid #27272a;
        border-radius: 14px;
    }

    label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #d4d4d8;
        font-size: 14px;
        cursor: pointer;
    }

    input[type="checkbox"] {
        accent-color: white;
    }

    .status {
        margin-top: 12px;
        color: #71717a;
        font-size: 13px;
    }

    @media (max-width: 900px) {
        .layout {
            grid-template-columns: 1fr;
        }

        textarea {
            min-height: 400px;
        }
    }
</style>
</head>

<body>

<div class="app">

    <h1>Luau Obfuscator</h1>
    <div class="subtitle">
        Локальный обфускатор Luau — всё работает прямо в браузере.
    </div>

    <div class="options">
        <label>
            <input id="renameLocals" type="checkbox" checked>
            Переименовывать local
        </label>

        <label>
            <input id="encodeStrings" type="checkbox" checked>
            Кодировать строки
        </label>

        <label>
            <input id="removeComments" type="checkbox" checked>
            Удалять комментарии
        </label>

        <label>
            <input id="minify" type="checkbox" checked>
            Минифицировать
        </label>
    </div>

    <div class="toolbar">
        <button class="primary" onclick="obfuscate()">
            Обфусцировать
        </button>

        <button onclick="copyOutput()">
            Копировать
        </button>

        <button onclick="downloadOutput()">
            Скачать .lua
        </button>

        <button onclick="clearAll()">
            Очистить
        </button>
    </div>

    <div class="layout">

        <div class="panel">
            <div class="panel-header">
                Исходный Luau
            </div>

            <textarea id="input" spellcheck="false" placeholder="Вставь сюда Luau-код..."></textarea>
        </div>

        <div class="panel">
            <div class="panel-header">
                Обфусцированный Luau
            </div>

            <textarea id="output" spellcheck="false" readonly placeholder="Здесь появится результат..."></textarea>
        </div>

    </div>

    <div class="status" id="status">
        Готово.
    </div>

</div>

<script>
/*
    ============================================
        Luau Obfuscator
    ============================================

    Возможности:
    - удаление комментариев
    - переименование local-переменных
    - кодирование строк через string.char(...)
    - минификация
*/

// --------------------------------------------
// Luau keywords
// --------------------------------------------

const KEYWORDS = new Set([
    "and",
    "break",
    "do",
    "else",
    "elseif",
    "end",
    "false",
    "for",
    "function",
    "if",
    "in",
    "local",
    "nil",
    "not",
    "or",
    "repeat",
    "return",
    "then",
    "true",
    "until",
    "while",

    // Luau
    "continue",
    "type",
    "export",
    "typeof"
]);


// --------------------------------------------
// Tokenizer
// --------------------------------------------

function tokenize(code) {
    const tokens = [];

    let i = 0;

    while (i < code.length) {

        const c = code[i];

        // Whitespace
        if (/\s/.test(c)) {
            let start = i;

            while (i < code.length && /\s/.test(code[i])) {
                i++;
            }

            tokens.push({
                type: "ws",
                value: code.slice(start, i)
            });

            continue;
        }

        // Comments
        if (c === "-" && code[i + 1] === "-") {

            // Long comment
            if (code[i + 2] === "[") {

                const match = code.slice(i + 2).match(/^\[(=*)\[/);

                if (match) {

                    const eq = match[1].length;
                    const closing = "]" + "=".repeat(eq) + "]";

                    const start = i;
                    const end = code.indexOf(closing, i + 2 + match[0].length);

                    if (end !== -1) {

                        const finish = end + closing.length;

                        tokens.push({
                            type: "comment",
                            value: code.slice(start, finish)
                        });

                        i = finish;
                        continue;
                    }
                }
            }

            // Normal comment
            const start = i;

            while (i < code.length && code[i] !== "\n") {
                i++;
            }

            tokens.push({
                type: "comment",
                value: code.slice(start, i)
            });

            continue;
        }

        // Strings
        if (c === "'" || c === '"') {

            const quote = c;
            const start = i;

            i++;

            while (i < code.length) {

                if (code[i] === "\\") {
                    i += 2;
                    continue;
                }

                if (code[i] === quote) {
                    i++;
                    break;
                }

                i++;
            }

            tokens.push({
                type: "string",
                value: code.slice(start, i)
            });

            continue;
        }

        // Long strings
        if (c === "[") {

            const match = code.slice(i).match(/^\[(=*)\[/);

            if (match) {

                const eq = match[1].length;
                const closing = "]" + "=".repeat(eq) + "]";

                const start = i;
                const contentStart = i + match[0].length;

                const end = code.indexOf(closing, contentStart);

                if (end !== -1) {

                    const finish = end + closing.length;

                    tokens.push({
                        type: "longstring",
                        value: code.slice(start, finish)
                    });

                    i = finish;
                    continue;
                }
            }
        }

        // Identifier
        if (/[A-Za-z_]/.test(c)) {

            const start = i;

            i++;

            while (
                i < code.length &&
                /[A-Za-z0-9_]/.test(code[i])
            ) {
                i++;
            }

            const value = code.slice(start, i);

            tokens.push({
                type: "identifier",
                value
            });

            continue;
        }

        // Number
        if (/[0-9]/.test(c)) {

            const start = i;

            i++;

            while (
                i < code.length &&
                /[A-Za-z0-9_.]/.test(code[i])
            ) {
                i++;
            }

            tokens.push({
                type: "number",
                value: code.slice(start, i)
            });

            continue;
        }

        // Operators / punctuation
        let op = c;

        const three = code.slice(i, i + 3);
        const two = code.slice(i, i + 2);

        if (
            three === "..." ||
            three === "//=" ||
            three === "<<=" ||
            three === ">>="
        ) {
            op = three;
        }
        else if (
            [
                "==",
                "~=",
                "<=",
                ">=",
                "..",
                "//",
                "+=",
                "-=",
                "*=",
                "/=",
                "%=",
                "^=",
                "&=",
                "|=",
                "<<",
                ">>",
                "::",
                "->"
            ].includes(two)
        ) {
            op = two;
        }

        tokens.push({
            type: "symbol",
            value: op
        });

        i += op.length;
    }

    return tokens;
}


// --------------------------------------------
// Decode normal Lua/Luau string
// --------------------------------------------

function decodeLuaString(raw) {

    if (raw.length < 2) {
        return raw;
    }

    const quote = raw[0];
    let s = raw.slice(1, -1);

    s = s.replace(
        /\\(\\|'|"|a|b|f|n|r|t|v|0|x[0-9a-fA-F]{2}|[0-9]{1,3})/g,
        (full, escape) => {

            switch (escape) {

                case "\\":
                    return "\\";

                case "'":
                    return "'";

                case '"':
                    return '"';

                case "a":
                    return "\x07";

                case "b":
                    return "\b";

                case "f":
                    return "\f";

                case "n":
                    return "\n";

                case "r":
                    return "\r";

                case "t":
                    return "\t";

                case "v":
                    return "\v";

                case "0":
                    return "\0";
            }

            // \xFF
            if (escape.startsWith("x")) {
                return String.fromCharCode(
                    parseInt(escape.slice(1), 16)
                );
            }

            // \123
            if (/^\d+$/.test(escape)) {
                return String.fromCharCode(
                    parseInt(escape, 10)
                );
            }

            return escape;
        }
    );

    return s;
}


// --------------------------------------------
// Encode string to string.char(...)
// --------------------------------------------

function encodeString(token) {

    // Normal string
    if (token.type === "string") {

        try {

            const decoded = decodeLuaString(token.value);

            const bytes = new TextEncoder().encode(decoded);

            if (bytes.length === 0) {
                return 'string.char()';
            }

            return `string.char(${Array.from(bytes).join(",")})`;

        } catch {
            return token.value;
        }
    }

    // Long string
    if (token.type === "longstring") {

        const match = token.value.match(/^\[(=*)\[(.*)\]\1\]$/s);

        if (!match) {
            return token.value;
        }

        try {

            const content = match[2];
            const bytes = new TextEncoder().encode(content);

            if (bytes.length === 0) {
                return 'string.char()';
            }

            return `string.char(${Array.from(bytes).join(",")})`;

        } catch {
            return token.value;
        }
    }

    return token.value;
}


// --------------------------------------------
// Generate random variable name
// --------------------------------------------

function randomName(index) {

    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    let name = "_";

    let n = index;

    do {
        name += alphabet[n % alphabet.length];
        n = Math.floor(n / alphabet.length) - 1;
    }
    while (n >= 0);

    return name + Math.floor(Math.random() * 900 + 100);
}


// --------------------------------------------
// Collect local variable names
// --------------------------------------------

function collectLocals(tokens) {

    const locals = new Set();

    for (let i = 0; i < tokens.length; i++) {

        const t = tokens[i];

        if (
            t.type === "identifier" &&
            t.value === "local"
        ) {

            let j = i + 1;

            // local function foo(...)
            if (
                tokens[j] &&
                tokens[j].type === "identifier" &&
                tokens[j].value === "function"
            ) {

                j++;

                if (
                    tokens[j] &&
                    tokens[j].type === "identifier"
                ) {
                    locals.add(tokens[j].value);
                }

                continue;
            }

            // local a, b, c = ...
            while (j < tokens.length) {

                if (tokens[j].type === "ws" ||
                    tokens[j].type === "comment") {
                    j++;
                    continue;
                }

                if (
                    tokens[j].type === "identifier" &&
                    !KEYWORDS.has(tokens[j].value)
                ) {
                    locals.add(tokens[j].value);
                    j++;
                    continue;
                }

                if (
                    tokens[j].value === ","
                ) {
                    j++;
                    continue;
                }

                break;
            }
        }
    }

    return locals;
}


// --------------------------------------------
// Rename locals
// --------------------------------------------

function renameLocals(tokens) {

    const locals = collectLocals(tokens);

    const mapping = new Map();

    let counter = 0;

    for (const name of locals) {

        if (!mapping.has(name)) {
            mapping.set(
                name,
                randomName(counter++)
            );
        }
    }

    for (let i = 0; i < tokens.length; i++) {

        const t = tokens[i];

        if (t.type !== "identifier") {
            continue;
        }

        const oldName = t.value;

        if (!mapping.has(oldName)) {
            continue;
        }

        // Don't rename property access:
        // object.foo
        // object:foo
        const prev = previousMeaningful(tokens, i);

        if (
            prev &&
            (prev.value === "." || prev.value === ":")
        ) {
            continue;
        }

        t.value = mapping.get(oldName);
    }

    return mapping;
}


// --------------------------------------------
// Previous meaningful token
// --------------------------------------------

function previousMeaningful(tokens, index) {

    for (let i = index - 1; i >= 0; i--) {

        if (
            tokens[i].type !== "ws" &&
            tokens[i].type !== "comment"
        ) {
            return tokens[i];
        }
    }

    return null;
}


// --------------------------------------------
// Output reconstruction
// --------------------------------------------

function buildOutput(tokens, options) {

    let output = "";

    let previous = null;

    for (let i = 0; i < tokens.length; i++) {

        const token = tokens[i];

        // Comments
        if (token.type === "comment") {

            if (!options.removeComments) {
                output += token.value;
            }

            previous = token;
            continue;
        }

        // Whitespace
        if (token.type === "ws") {

            if (!options.minify) {
                output += token.value;
            }

            previous = token;
            continue;
        }

        let value = token.value;

        // Encode strings
        if (
            options.encodeStrings &&
            (
                token.type === "string" ||
                token.type === "longstring"
            )
        ) {
            value = encodeString(token);
        }

        if (
            options.minify &&
            previous &&
            previous.type !== "ws" &&
            previous.type !== "comment"
        ) {

            const prevValue = previous.value;

            // identifier + identifier
            const prevWord =
                /^[A-Za-z0-9_]$/.test(prevValue.slice(-1));

            const currWord =
                /^[A-Za-z0-9_]$/.test(value[0]);

            if (prevWord && currWord) {
                output += " ";
            }

            // Prevent "--" from becoming a comment
            if (
                prevValue.endsWith("-") &&
                value.startsWith("-")
            ) {
                output += " ";
            }

            // 1 . 2
            if (
                prevValue.endsWith(".") &&
                /^[0-9]/.test(value)
            ) {
                output += " ";
            }
        }

        output += value;

        previous = {
            type: token.type,
            value
        };
    }

    return output;
}


// --------------------------------------------
// Main obfuscation
// --------------------------------------------

function obfuscate() {

    const input = document.getElementById("input").value;

    if (!input.trim()) {

        document.getElementById("output").value = "";

        setStatus("Вставь Luau-код.");

        return;
    }

    const options = {
        renameLocals:
            document.getElementById("renameLocals").checked,

        encodeStrings:
            document.getElementById("encodeStrings").checked,

        removeComments:
            document.getElementById("removeComments").checked,

        minify:
            document.getElementById("minify").checked
    };

    try {

        const tokens = tokenize(input);

        if (options.renameLocals) {
            renameLocals(tokens);
        }

        const result = buildOutput(tokens, options);

        document.getElementById("output").value = result;

        setStatus(
            `Готово • исходник: ${input.length} символов • результат: ${result.length} символов`
        );

    } catch (error) {

        console.error(error);

        setStatus(
            "Ошибка: " + error.message
        );
    }
}


// --------------------------------------------
// Copy
// --------------------------------------------

async function copyOutput() {

    const output = document.getElementById("output").value;

    if (!output) {
        setStatus("Сначала обфусцируй код.");
        return;
    }

    try {

        await navigator.clipboard.writeText(output);

        setStatus("Скопировано в буфер обмена.");

    } catch {

        const area = document.getElementById("output");

        area.removeAttribute("readonly");
        area.select();

        document.execCommand("copy");

        area.setAttribute("readonly", "");

        setStatus("Скопировано.");
    }
}


// --------------------------------------------
// Download
// --------------------------------------------

function downloadOutput() {

    const output = document.getElementById("output").value;

    if (!output) {
        setStatus("Сначала обфусцируй код.");
        return;
    }

    const blob = new Blob(
        [output],
        {
            type: "text/plain;charset=utf-8"
        }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;
    a.download = "obfuscated.lua";

    document.body.appendChild(a);
    a.click();
    a.remove();

    URL.revokeObjectURL(url);

    setStatus("Файл скачан.");
}


// --------------------------------------------
// Clear
// --------------------------------------------

function clearAll() {

    document.getElementById("input").value = "";
    document.getElementById("output").value = "";

    setStatus("Очищено.");
}


// --------------------------------------------
// Status
// --------------------------------------------

function setStatus(text) {
    document.getElementById("status").textContent = text;
}
</script>

</body>
</html>
