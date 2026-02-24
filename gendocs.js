const {
    Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
    HeadingLevel, AlignmentType, BorderStyle, WidthType, ShadingType,
    LevelFormat, PageBreak, ExternalHyperlink, UnderlineType
} = require('docx');
const fs = require('fs');

const ACCENT   = "7B2FBE";
const DARK     = "1A1A2E";
const MID      = "2D2D44";
const LIGHT_BG = "F3EEF9";
const CODE_BG  = "1E1E2E";
const WHITE    = "FFFFFF";
const GRAY     = "6B7280";
const GREEN    = "16A34A";
const RED      = "DC2626";
const AMBER    = "D97706";

const border = { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 360, after: 160 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: ACCENT, space: 6 } },
        children: [
            new TextRun({ text, bold: true, size: 36, color: DARK, font: "Arial" })
        ]
    });
}

function h2(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
        children: [
            new TextRun({ text, bold: true, size: 28, color: ACCENT, font: "Arial" })
        ]
    });
}

function h3(text) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 80 },
        children: [
            new TextRun({ text, bold: true, size: 24, color: DARK, font: "Arial" })
        ]
    });
}

function body(text, options = {}) {
    return new Paragraph({
        spacing: { before: 60, after: 60 },
        children: [
            new TextRun({ text, size: 22, color: options.color || "374151", font: "Arial", ...options })
        ]
    });
}

function para(runs) {
    return new Paragraph({
        spacing: { before: 60, after: 60 },
        children: runs
    });
}

function run(text, options = {}) {
    return new TextRun({ text, size: 22, color: "374151", font: "Arial", ...options });
}

function code(text) {
    return new TextRun({ text, font: "Courier New", size: 20, color: "C9D1D9" });
}

function codeBlock(lines) {
    return new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
            new TableRow({
                children: [
                    new TableCell({
                        borders: noBorders,
                        shading: { fill: CODE_BG, type: ShadingType.CLEAR },
                        margins: { top: 160, bottom: 160, left: 200, right: 200 },
                        width: { size: 9360, type: WidthType.DXA },
                        children: lines.map(line =>
                            new Paragraph({
                                spacing: { before: 20, after: 20 },
                                children: [new TextRun({ text: line, font: "Courier New", size: 19, color: "C9D1D9" })]
                            })
                        )
                    })
                ]
            })
        ]
    });
}

function inlineCode(text) {
    return new TextRun({ text: ` ${text} `, font: "Courier New", size: 20, color: ACCENT, highlight: "yellow" });
}

function spacer(lines = 1) {
    return Array.from({ length: lines }, () =>
        new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun("")] })
    );
}

function note(text, type = "info") {
    const colors = { info: "DBEAFE", warn: "FEF9C3", tip: "DCFCE7" };
    const textColors = { info: "1E40AF", warn: "92400E", tip: "166534" };
    const labels = { info: "ℹ️  NOTE", warn: "⚠️  WARNING", tip: "✅  TIP" };
    const fill = colors[type] || colors.info;
    const tc   = textColors[type] || textColors.info;
    return new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [new TableRow({
            children: [new TableCell({
                borders: noBorders,
                shading: { fill, type: ShadingType.CLEAR },
                margins: { top: 120, bottom: 120, left: 180, right: 180 },
                width: { size: 9360, type: WidthType.DXA },
                children: [
                    new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: labels[type], bold: true, size: 20, color: tc, font: "Arial" })] }),
                    new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text, size: 20, color: tc, font: "Arial" })] })
                ]
            })]
        })]
    });
}

function propTable(rows) {
    const colW = [2400, 1600, 5360];
    return new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: colW,
        rows: [
            new TableRow({
                tableHeader: true,
                children: [
                    ["Property", "Type", "Description"].map((label, i) =>
                        new TableCell({
                            borders,
                            shading: { fill: ACCENT, type: ShadingType.CLEAR },
                            margins: { top: 100, bottom: 100, left: 120, right: 120 },
                            width: { size: colW[i], type: WidthType.DXA },
                            children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: WHITE, font: "Arial" })] })]
                        })
                    )
                ]
            }),
            ...rows.map((row, ri) =>
                new TableRow({
                    children: row.map((cell, ci) =>
                        new TableCell({
                            borders,
                            shading: { fill: ri % 2 === 0 ? "FAFAFA" : WHITE, type: ShadingType.CLEAR },
                            margins: { top: 80, bottom: 80, left: 120, right: 120 },
                            width: { size: colW[ci], type: WidthType.DXA },
                            children: [new Paragraph({
                                children: [new TextRun({
                                    text: cell,
                                    size: 19,
                                    color: ci === 0 ? ACCENT : "374151",
                                    font: ci === 0 ? "Courier New" : "Arial",
                                    bold: ci === 0
                                })]
                            })]
                        })
                    )
                })
            )
        ]
    });
}

function pill(text, fill, textColor = WHITE) {
    return new Table({
        width: { size: 1400, type: WidthType.DXA },
        columnWidths: [1400],
        rows: [new TableRow({
            children: [new TableCell({
                borders: noBorders,
                shading: { fill, type: ShadingType.CLEAR },
                margins: { top: 40, bottom: 40, left: 100, right: 100 },
                width: { size: 1400, type: WidthType.DXA },
                children: [new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [new TextRun({ text, bold: true, size: 18, color: textColor, font: "Arial" })]
                })]
            })]
        })]
    });
}

const doc = new Document({
    styles: {
        default: {
            document: { run: { font: "Arial", size: 22, color: "374151" } }
        },
        paragraphStyles: [
            { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 36, bold: true, font: "Arial", color: DARK },
              paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
            { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 28, bold: true, font: "Arial", color: ACCENT },
              paragraph: { spacing: { before: 300, after: 120 }, outlineLevel: 1 } },
            { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
              run: { size: 24, bold: true, font: "Arial", color: DARK },
              paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
        ]
    },
    numbering: {
        config: [
            { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } }, run: { color: ACCENT } } }] },
            { reference: "subbullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "◦", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1080, hanging: 360 } } } }] },
        ]
    },
    sections: [{
        properties: {
            page: {
                size: { width: 12240, height: 15840 },
                margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
            }
        },
        children: [

            // ─── COVER ───────────────────────────────────────────────
            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [9360],
                rows: [new TableRow({
                    children: [new TableCell({
                        borders: noBorders,
                        shading: { fill: DARK, type: ShadingType.CLEAR },
                        margins: { top: 600, bottom: 600, left: 480, right: 480 },
                        width: { size: 9360, type: WidthType.DXA },
                        children: [
                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "🔑", size: 80 })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "JunkieHub", bold: true, size: 72, color: WHITE, font: "Arial" })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: "Configuration Documentation", size: 32, color: "A78BFA", font: "Arial" })] }),
                            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120, after: 0 }, children: [new TextRun({ text: "Key System Library — Setup & Reference Guide", size: 22, color: "9CA3AF", font: "Arial" })] }),
                        ]
                    })]
                })]
            }),

            ...spacer(2),

            // ─── OVERVIEW ────────────────────────────────────────────
            h1("Overview"),
            body("JunkieHub is a Roblox key system UI library. It is loaded externally via loadstring and configured entirely from your own script — no need to modify the library itself. When a user successfully redeems a key, the library sets a global variable (getgenv().LOAD = true) that your script waits on before executing."),
            ...spacer(1),

            note("The library is hosted on a CDN and loaded remotely. You only need to write a loader script with your config — stefan handles the library internals.", "tip"),
            ...spacer(1),

            h2("How It Works"),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [run("Your script loads the library via "), run("loadstring(game:HttpGet(LIBRARY_URL))()", { font: "Courier New", color: ACCENT, bold: true }), run(", which returns a Hub object.")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [run("You pass a Config table to "), run("Hub.new(Config)", { font: "Courier New", color: ACCENT, bold: true }), run(" and call "), run("hub:Init()", { font: "Courier New", color: ACCENT, bold: true }), run(" to display the UI.")] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [run("Your script then waits in a loop: "), run("while not getgenv().LOAD do task.wait(1) end", { font: "Courier New", color: ACCENT, bold: true })] }),
            new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { before: 60, after: 60 }, children: [run("Once a valid key is redeemed, the library sets "), run("getgenv().LOAD = true", { font: "Courier New", color: ACCENT, bold: true }), run(" and your code below the loop executes.")] }),

            ...spacer(1),

            h2("Minimal Loader Template"),
            codeBlock([
                "local system = loadstring(game:HttpGet(\"LIBRARY_URL\"))()",
                "",
                "local Config = {",
                "    -- ... your config here ...",
                "}",
                "",
                "local hub = system.new(Config)",
                "hub:Init()",
                "",
                "while not getgenv().LOAD do",
                "    task.wait(1)",
                "end",
                "",
                "-- Your game script runs here after key is accepted",
            ]),

            ...spacer(2),
            new Paragraph({ children: [new PageBreak()] }),

            // ─── JUNKIE CONFIG ────────────────────────────────────────
            h1("Junkie_Configs"),
            body("Controls the Junkie SDK integration — key validation, webhook relay, and provider setup."),
            ...spacer(1),

            propTable([
                ["UseJunkie",      "boolean", "Set to true to load the Junkie SDK and validate keys in real-time. Set to false to accept any key as-is (for testing)."],
                ["Junkie_Webhook", "string",  "Your Junkie relay webhook URL. Used to notify you when a key is redeemed. Leave blank (\"\") to disable."],
                ["Service",        "string",  "Your service name from the Junkie dashboard. Must match exactly — used for key validation."],
                ["Identifier",     "string",  "Your user/dashboard identifier from Junkie."],
                ["Provider",       "string",  "The provider name configured in your Junkie dashboard."],
                ["MaxKeyAttempts", "number",  "How many failed key attempts are allowed before the UI force-closes. Recommended: 5."],
                ["Premium",        "boolean", "Set to true to load the Premium script URL from GameSupport instead of the Free URL."],
            ]),

            ...spacer(2),

            h2("Providers"),
            body("An array of key provider buttons shown in the UI. Each provider can be shown or hidden, and one can be pinned to the top."),
            ...spacer(1),

            propTable([
                ["Name",     "string",  "Display name shown on the provider button."],
                ["Icon",     "string",  "rbxassetid for the button icon. Use \"rbxassetid://0\" to fall back to the built-in default icon for that provider name."],
                ["Url",      "string",  "URL opened or copied when the user clicks this provider. Used as fallback if get_key_link() returns nil."],
                ["Show",     "boolean", "true = visible in the UI. false = hidden entirely."],
                ["IsJunkie", "boolean", "Must be true on exactly ONE provider — the Junkie provider. This enables the SDK's get_key_link() flow for that button."],
                ["Pinned",   "boolean", "true = always rendered first with a highlight border."],
            ]),

            ...spacer(1),
            note("Only one provider should have IsJunkie = true. If none have it set, or if UseJunkie = false, all providers are shown as regular URL buttons.", "warn"),
            ...spacer(1),

            h2("GameSupport"),
            body("Maps Roblox Place IDs to script URLs. After a key is accepted, the library loads the matching script. A Universal fallback is used for any game not listed."),
            ...spacer(1),

            codeBlock([
                "GameSupport = {",
                "    [2788229376] = {",
                "        Name    = \"Da Hood\",",
                "        Free    = \"https://api.jnkie.com/.../DAHOOD_FREE_HASH/download\",",
                "        Premium = \"https://api.jnkie.com/.../DAHOOD_PREMIUM_HASH/download\",",
                "    },",
                "    Universal = {",
                "        Name    = \"Universal\",",
                "        Free    = \"https://api.jnkie.com/.../UNIVERSAL_FREE_HASH/download\",",
                "        Premium = \"https://api.jnkie.com/.../UNIVERSAL_PREMIUM_HASH/download\",",
                "    },",
                "}",
            ]),

            ...spacer(1),
            note("Replace all HASH placeholders with your actual Junkie script hashes from the dashboard. The Universal entry is required as a fallback.", "warn"),

            ...spacer(2),
            new Paragraph({ children: [new PageBreak()] }),

            // ─── UI CONFIG ────────────────────────────────────────────
            h1("UI_Configs"),
            body("Controls the visual appearance and behaviour of the key system UI."),
            ...spacer(1),

            h2("General"),
            propTable([
                ["Name",    "string", "Hub display name shown in the title section."],
                ["Version", "string", "Version string shown as a pill under the hub name (e.g. \"1.0\")."],
                ["Color",   "Color3", "Primary accent colour used throughout the UI — buttons, borders, glows, badges. Example: Color3.fromRGB(138, 43, 226)."],
                ["Text_Color", "Color3 / \"\"", "Text colour on top of coloured buttons. Leave as \"\" to auto-pick black or white based on the brightness of Color."],
                ["Icon",     "string", "rbxassetid for your hub logo shown in the title bar."],
                ["BadgeText","string", "Small badge label next to the icon in the title bar (e.g. \"KEY SYSTEM\")."],
                ["CustomFont", "string", "rbxassetid of a custom font asset. Leave as \"\" to use the built-in Gotham family."],
                ["ShowOutline", "boolean", "true = accent-coloured border around the main panel."],
            ]),

            ...spacer(1),
            h2("Background & Overlay"),
            propTable([
                ["GradientAnimated",       "boolean", "true = the background gradient slowly rotates."],
                ["GradientAnimationSpeed", "number",  "Duration in seconds for one full gradient rotation. Lower = faster."],
                ["GlassOpacity",           "number",  "How transparent the main panel is. 0 = fully opaque, 1 = invisible. 0.18 gives a frosted glass look."],
                ["SlideInEnabled",         "boolean", "true = panel slides up from below on open. false = appears instantly."],
                ["BlurEnabled",            "boolean", "true = applies a BlurEffect to Lighting while the UI is open."],
                ["BlurSize",               "number",  "Strength of the blur effect (0–56). Higher = more blurred."],
                ["OverlayOpacity",         "number",  "How dark the background overlay is. 0 = invisible, 1 = fully black. 0.65 = noticeably dimmed."],
            ]),

            ...spacer(1),
            h2("Snow"),
            propTable([
                ["SnowEnabled", "boolean",     "true = falling snowflake particles over the background."],
                ["SnowDensity", "number",      "Multiplier for snowflake count. 0.5 = half, 2.0 = double. Default: 1.0."],
                ["SnowColor",   "Color3",      "Colour of each snowflake. Default: Color3.fromRGB(220, 235, 255)."],
                ["SnowSize",    "{Min, Max}",  "Min and max snowflake diameter in pixels. Example: {Min=3, Max=7}."],
            ]),

            ...spacer(1),
            h2("Key System"),
            propTable([
                ["KeySystemLabel",       "string",  "Label text shown above the key input box."],
                ["KeySystemPlaceholder", "string",  "Animated placeholder that types itself in when the box is empty."],
                ["KeyFile",              "string",  "Filename used to save and load the verified key locally. Change per-hub to keep keys separate."],
                ["CloseOnSuccess",       "boolean", "true = UI auto-closes after a successful redeem."],
                ["SuccessMessage",       "string",  "Toast message shown on successful redeem. Example: \"✓ Access Granted!\"."],
            ]),

            ...spacer(1),
            h2("Discord"),
            propTable([
                ["Discord",         "string",  "Your Discord invite code (the part after discord.gg/). Used for the Join Discord button and live member count fetch."],
                ["ShowMemberCount", "boolean", "true = fetches and displays live Discord member and online count."],
            ]),

            ...spacer(2),
            new Paragraph({ children: [new PageBreak()] }),

            // ─── SOCIALS ─────────────────────────────────────────────
            h1("Socials, AppLinks & Instructions"),

            h2("Socials"),
            body("An array of social platform links shown in the side panel and footer strip. Each entry can be shown, hidden, or pinned."),
            ...spacer(1),
            propTable([
                ["Name",   "string",  "Display name of the social (e.g. \"Discord\", \"Twitter\"). Used to auto-resolve the icon if Icon is \"rbxassetid://0\"."],
                ["Icon",   "string",  "rbxassetid for the social icon."],
                ["Link",   "string",  "URL copied to clipboard when the user clicks this social."],
                ["Show",   "boolean", "true = visible in the UI."],
                ["Pinned", "boolean", "true = rendered first with a highlight border."],
            ]),
            ...spacer(1),
            note("Supported auto-icons (set Icon to \"rbxassetid://0\" to use them): Discord, Twitter, YouTube, TikTok, Instagram, Telegram, Reddit, GitHub, Guilded, Patreon, Ko-fi, Twitch, V3rm, Website, Linkvertise, LootLabs, Work.ink, Shrtfly, Lockr, Cuty, ShrinkEarn, Rinku.", "info"),

            ...spacer(1),
            h2("AppLinks"),
            body("Pill-shaped chip buttons shown below the socials grid in the side panel. Same structure as Socials."),
            ...spacer(1),
            propTable([
                ["Name",   "string",  "Display name on the chip."],
                ["Icon",   "string",  "rbxassetid for the chip icon."],
                ["Link",   "string",  "URL copied to clipboard on click."],
                ["Show",   "boolean", "true = visible."],
                ["Pinned", "boolean", "true = rendered first with a highlight border."],
            ]),

            ...spacer(1),
            h2("Instructions"),
            body("Step cards shown on the How-To page (opened with the ? button). Each card has a title and a body description."),
            ...spacer(1),
            codeBlock([
                "Instructions = {",
                "    { Title = \"Open Junkie\",        Body = \"Click the Junkie Development button to open your key link.\" },",
                "    { Title = \"Complete the Steps\", Body = \"Finish all checkpoints on the Junkie page to unlock your key.\" },",
                "    { Title = \"Paste & Redeem\",     Body = \"Copy your jnk- key, paste it in the box above and hit Redeem.\" },",
                "},",
            ]),

            ...spacer(2),
            new Paragraph({ children: [new PageBreak()] }),

            // ─── CHANGELOG ───────────────────────────────────────────
            h1("Changelog"),
            body("The changelog is shown when users click the ★ button in the title bar. Each version entry has a tag that controls the pill colour and bullet colour."),
            ...spacer(1),

            propTable([
                ["Show",     "boolean",      "true = shows the ★ changelog button in the title bar."],
                ["Title",    "string",       "Header text shown at the top of the changelog page."],
                ["Versions", "array",        "Array of version entries (see below)."],
            ]),

            ...spacer(1),
            h3("Version Entry"),
            propTable([
                ["Version", "string", "Version string displayed in the version pill (e.g. \"1.2\")."],
                ["Date",    "string", "Optional date string shown right-aligned on the version card (e.g. \"Feb 2026\")."],
                ["Tag",     "string", "One tag per version. Controls the pill colour. See tag table below."],
                ["Notes",   "array",  "Array of strings — each becomes a bullet point on that version card."],
            ]),

            ...spacer(1),
            h3("Available Tags"),

            new Table({
                width: { size: 9360, type: WidthType.DXA },
                columnWidths: [1800, 2400, 5160],
                rows: [
                    new TableRow({
                        tableHeader: true,
                        children: [["Tag", "Colour", "Meaning"].map((label, i) =>
                            new TableCell({
                                borders, shading: { fill: ACCENT, type: ShadingType.CLEAR },
                                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                                width: { size: [1800,2400,5160][i], type: WidthType.DXA },
                                children: [new Paragraph({ children: [new TextRun({ text: label, bold: true, size: 20, color: WHITE, font: "Arial" })] })]
                            })
                        )]
                    }),
                    ...[ ["NEW",      "45, 185, 100 (Green)",  "New feature or addition"],
                         ["FIX",      "215, 70, 70 (Red)",     "Bug fix or correction"],
                         ["IMPROVED", "70, 145, 235 (Blue)",   "Enhancement to existing feature"],
                         ["REMOVED",  "185, 85, 45 (Orange)",  "Feature removed"],
                         ["SECURITY", "195, 155, 35 (Amber)",  "Security-related change"],
                    ].map(([tag, col, desc], ri) =>
                        new TableRow({ children: [tag, col, desc].map((cell, ci) =>
                            new TableCell({
                                borders,
                                shading: { fill: ri % 2 === 0 ? "FAFAFA" : WHITE, type: ShadingType.CLEAR },
                                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                                width: { size: [1800,2400,5160][ci], type: WidthType.DXA },
                                children: [new Paragraph({ children: [new TextRun({ text: cell, size: 19, font: ci === 0 ? "Courier New" : "Arial", color: ci === 0 ? ACCENT : "374151", bold: ci === 0 })] })]
                            })
                        )})
                    )
                ]
            }),

            ...spacer(2),
            new Paragraph({ children: [new PageBreak()] }),

            // ─── FULL EXAMPLE ─────────────────────────────────────────
            h1("Full Config Example"),
            body("A complete, working example you can copy and customise:"),
            ...spacer(1),

            codeBlock([
                "getgenv().LOAD = nil",
                "",
                "local Junkie_Configs = {",
                "    UseJunkie      = true,",
                "    Junkie_Webhook = \"https://jnkie.com/api/v1/webhooks/relay/YOUR_ID/send\",",
                "    Service        = \"My Hub\",",
                "    Identifier     = \"1234\",",
                "    Provider       = \"My Hub\",",
                "    Providers = {",
                "        {",
                "            Name     = \"Junkie Development\",",
                "            Icon     = \"rbxassetid://0\",",
                "            Url      = \"https://jnkie.com/junkiehub\",",
                "            Show     = true,",
                "            IsJunkie = true,",
                "            Pinned   = true,",
                "        },",
                "        {",
                "            Name   = \"Linkvertise\",",
                "            Icon   = \"rbxassetid://0\",",
                "            Url    = \"https://linkvertise.com/yourhub\",",
                "            Show   = true,",
                "            Pinned = false,",
                "        },",
                "    },",
                "    MaxKeyAttempts = 5,",
                "    Premium        = false,",
                "    GameSupport = {",
                "        Universal = {",
                "            Name    = \"Universal\",",
                "            Free    = \"https://api.jnkie.com/.../HASH/download\",",
                "            Premium = \"https://api.jnkie.com/.../HASH/download\",",
                "        },",
                "    },",
                "}",
                "",
                "local UI_Configs = {",
                "    Name                   = \"My Hub\",",
                "    Version                = \"1.0\",",
                "    Color                  = Color3.fromRGB(138, 43, 226),",
                "    Text_Color             = \"\",",
                "    GradientAnimated       = true,",
                "    GradientAnimationSpeed = 4,",
                "    Icon                   = \"rbxassetid://YOUR_ICON_ID\",",
                "    BadgeText              = \"KEY SYSTEM\",",
                "    CustomFont             = \"\",",
                "    ShowOutline            = true,",
                "    KeySystemLabel         = \"Enter Key\",",
                "    KeySystemPlaceholder   = \"jnk-XXXXXXXXXXXXXXXX\",",
                "    ShowMemberCount        = true,",
                "    SnowEnabled            = true,",
                "    SnowDensity            = 1.0,",
                "    SnowColor              = Color3.fromRGB(220, 235, 255),",
                "    SnowSize               = {Min = 3, Max = 7},",
                "    GlassOpacity           = 0.18,",
                "    SlideInEnabled         = true,",
                "    BlurEnabled            = true,",
                "    BlurSize               = 30,",
                "    OverlayOpacity         = 0.65,",
                "    CloseOnSuccess         = true,",
                "    SuccessMessage         = \"✓ Access Granted!\",",
                "    KeyFile                = \"myhub_key.txt\",",
                "    Discord                = \"your_invite_code\",",
                "    Socials = {",
                "        { Name=\"Discord\", Icon=\"rbxassetid://0\", Link=\"https://discord.gg/your\", Show=true, Pinned=true },",
                "        { Name=\"YouTube\", Icon=\"rbxassetid://0\", Link=\"https://youtube.com/@you\",  Show=true, Pinned=false },",
                "    },",
                "    AppLinks = {",
                "        { Name=\"Discord App\", Icon=\"rbxassetid://0\", Link=\"https://discord.gg/your\", Show=true, Pinned=true },",
                "    },",
                "    Instructions = {",
                "        { Title=\"Open Junkie\",        Body=\"Click the Junkie button to open your key link.\" },",
                "        { Title=\"Complete the Steps\", Body=\"Finish all checkpoints to get your key.\" },",
                "        { Title=\"Paste & Redeem\",     Body=\"Paste your key in the box above and hit Redeem.\" },",
                "    },",
                "    Changelog = {",
                "        Show  = true,",
                "        Title = \"What's New\",",
                "        Versions = {",
                "            { Version=\"1.0\", Date=\"Feb 2026\", Tag=\"NEW\", Notes={ \"Initial release.\" } },",
                "        },",
                "    },",
                "}",
                "",
                "-- Build Config from both tables",
                "local Config = { ... } -- merge Junkie_Configs + UI_Configs here",
                "",
                "-- Load and display the UI",
                "local system = loadstring(game:HttpGet(\"LIBRARY_URL\"))()",
                "local hub    = system.new(Config)",
                "hub:Init()",
                "",
                "-- Wait for key acceptance",
                "while not getgenv().LOAD do",
                "    task.wait(1)",
                "end",
                "",
                "-- YOUR GAME SCRIPT STARTS HERE",
            ]),

            ...spacer(2),

            // ─── FOOTER NOTE ──────────────────────────────────────────
            note("The library itself does not need to be modified. All customisation happens in your loader script through the Config table. Only modify the library if stefan instructs you to.", "info"),

            ...spacer(1),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 200, after: 0 },
                children: [new TextRun({ text: "JunkieHub Configuration Docs  •  Junkie Development", size: 18, color: GRAY, font: "Arial" })]
            }),
        ]
    }]
});

Packer.toBuffer(doc).then(buf => {
    fs.writeFileSync("/home/claude/JunkieHub_Docs.docx", buf);
    console.log("Done");
});
