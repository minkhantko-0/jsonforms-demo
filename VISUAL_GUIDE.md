# Conditional Fields - Visual Guide

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├──────────────┬──────────────────────────┬──────────────────────┤
│              │                          │                      │
│   EDITORS    │      RENDERED FORM       │     LIVE DATA        │
│   (Input)    │       (Preview)          │     (Output)         │
│              │                          │                      │
├──────────────┤                          │                      │
│              │  ┌────────────────────┐  │  {                   │
│ JSON Schema  │  │ Name: [______]     │  │    "name": "John",   │
│ ┌──────────┐ │  │ Age:  [__18___]    │  │    "age": 18,        │
│ │{         │ │  │                    │  │    "profile": "..."  │
│ │ "age": { │ │  │ Profile Picture:   │  │  }                   │
│ │  "type": │ │  │ [Upload] ✓ Enabled │  │                      │
│ │  "number"│ │  │                    │  │                      │
│ │ }        │ │  └────────────────────┘  │                      │
│ └──────────┘ │           ▲              │                      │
│              │           │              │                      │
├──────────────┤           │              │                      │
│              │    Rule Applied          │                      │
│  UI Schema   │           │              │                      │
│ ┌──────────┐ │           │              │                      │
│ │ "rule": {│ │───────────┘              │                      │
│ │  "effect"│ │                          │                      │
│ │  "ENABLE"│ │  Condition Met:          │                      │
│ │  "condi- │ │  age >= 18 → Enable!     │                      │
│ │   tion"  │ │                          │                      │
│ │ }        │ │                          │                      │
│ └──────────┘ │                          │                      │
│              │                          │                      │
└──────────────┴──────────────────────────┴──────────────────────┘
```

## Flow Diagram

```
User Input → Condition Check → Effect Applied → UI Updates

Example 1: Age < 18
┌──────────┐    ┌───────────────┐    ┌──────────────┐    ┌────────────────┐
│ Age: 15  │ →  │ Check: 15≥18? │ →  │ Result: No   │ →  │ Field Disabled │
└──────────┘    └───────────────┘    └──────────────┘    └────────────────┘

Example 2: Age ≥ 18
┌──────────┐    ┌───────────────┐    ┌──────────────┐    ┌────────────────┐
│ Age: 18  │ →  │ Check: 18≥18? │ →  │ Result: Yes  │ →  │ Field Enabled  │
└──────────┘    └───────────────┘    └──────────────┘    └────────────────┘
```

## Rule Structure Breakdown

```
┌─────────────────── RULE ───────────────────┐
│                                             │
│  ┌─────── EFFECT ─────┐                   │
│  │                    │                    │
│  │  What happens?     │                    │
│  │  • ENABLE          │                    │
│  │  • SHOW            │                    │
│  │  • DISABLE         │                    │
│  │  • HIDE            │                    │
│  └────────────────────┘                    │
│             │                               │
│             ▼                               │
│  ┌─────── CONDITION ─────┐                │
│  │                        │                │
│  │  When does it happen?  │                │
│  │                        │                │
│  │  ┌──── SCOPE ────┐    │                │
│  │  │ Which field?  │    │                │
│  │  │ #/properties  │    │                │
│  │  │     /age      │    │                │
│  │  └───────────────┘    │                │
│  │         │              │                │
│  │         ▼              │                │
│  │  ┌──── SCHEMA ───┐    │                │
│  │  │ What value?   │    │                │
│  │  │ minimum: 18   │    │                │
│  │  └───────────────┘    │                │
│  └────────────────────────┘                │
└─────────────────────────────────────────────┘
```

## Effect Types Comparison

```
┌──────────┬─────────────────┬─────────────────┬──────────────────┐
│ Effect   │ Initial State   │ Condition False │ Condition True   │
├──────────┼─────────────────┼─────────────────┼──────────────────┤
│ ENABLE   │ 🔒 Disabled     │ 🔒 Disabled     │ ✅ Enabled       │
│          │ 👁️ Visible      │ 👁️ Visible      │ 👁️ Visible       │
├──────────┼─────────────────┼─────────────────┼──────────────────┤
│ SHOW     │ 🚫 Hidden       │ 🚫 Hidden       │ 👁️ Visible       │
│          │                 │                 │ ✅ Enabled       │
├──────────┼─────────────────┼─────────────────┼──────────────────┤
│ DISABLE  │ ✅ Enabled      │ ✅ Enabled      │ 🔒 Disabled      │
│          │ 👁️ Visible      │ 👁️ Visible      │ 👁️ Visible       │
├──────────┼─────────────────┼─────────────────┼──────────────────┤
│ HIDE     │ 👁️ Visible      │ 👁️ Visible      │ 🚫 Hidden        │
│          │ ✅ Enabled      │ ✅ Enabled      │                  │
└──────────┴─────────────────┴─────────────────┴──────────────────┘
```

## Real-World Examples

### Example 1: Adult Content Access

```
┌─────────────────────────────────────────┐
│ Are you 18 or older?  [  ] Yes          │
│                                         │
│ ╔═══════════════════════════════════╗  │
│ ║ Adult Content Section             ║  │ ← Hidden until
│ ║ [Content here...]                 ║  │   checkbox checked
│ ╚═══════════════════════════════════╝  │
└─────────────────────────────────────────┘

Rule:
{
  "effect": "SHOW",
  "condition": {
    "scope": "#/properties/isAdult",
    "schema": { "const": true }
  }
}
```

### Example 2: Location-Based Fields

```
┌─────────────────────────────────────────┐
│ Country: [USA ▼]                        │
│                                         │
│ State:   [California ▼] ✓ Enabled      │ ← Enabled for
│                                         │   USA/Canada only
│ ZIP Code: [_____]                       │
└─────────────────────────────────────────┘

Rule:
{
  "effect": "ENABLE",
  "condition": {
    "scope": "#/properties/country",
    "schema": { "enum": ["USA", "Canada"] }
  }
}
```

### Example 3: Age-Based Features

```
┌─────────────────────────────────────────┐
│ Age: [15]                               │
│                                         │
│ Profile Picture: [Upload] 🔒 Disabled   │ ← age < 18
│                                         │
│ Age: [18]                               │
│                                         │
│ Profile Picture: [Upload] ✓ Enabled    │ ← age ≥ 18
│                                         │
│ Age: [21]                               │
│                                         │
│ Profile Picture: [Upload] ✓ Enabled    │ ← age ≥ 18
│                                         │
│ Alcohol Consent: [✓] ✓ Visible         │ ← age ≥ 21
└─────────────────────────────────────────┘

Rules:
{
  "effect": "ENABLE",
  "condition": {
    "scope": "#/properties/age",
    "schema": { "minimum": 18 }
  }
}

{
  "effect": "SHOW",
  "condition": {
    "scope": "#/properties/age",
    "schema": { "minimum": 21 }
  }
}
```

## Complex Conditions

### AND Logic (All must be true)

```
     Condition 1          Condition 2
     ┌─────────┐          ┌─────────┐
     │ Age≥18  │   AND    │ US/CA   │  →  Enable Field
     └─────────┘          └─────────┘
         ✓                    ✓            ✅ Enabled
         ✓                    ✗            🔒 Disabled
         ✗                    ✓            🔒 Disabled
         ✗                    ✗            🔒 Disabled
```

### OR Logic (Any can be true)

```
     Condition 1          Condition 2
     ┌─────────┐          ┌─────────┐
     │ Age≥21  │    OR    │ HasPass │  →  Enable Field
     └─────────┘          └─────────┘
         ✓                    ✓            ✅ Enabled
         ✓                    ✗            ✅ Enabled
         ✗                    ✓            ✅ Enabled
         ✗                    ✗            🔒 Disabled
```

## Quick Reference Card

```
╔══════════════════════════════════════════════════════════╗
║              CONDITIONAL FIELDS CHEAT SHEET              ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  📝 Effects:                                             ║
║     ENABLE  → Unlock when true                          ║
║     SHOW    → Reveal when true                          ║
║     DISABLE → Lock when true                            ║
║     HIDE    → Conceal when true                         ║
║                                                          ║
║  🎯 Conditions:                                          ║
║     minimum/maximum  → Number range                     ║
║     const            → Exact value                      ║
║     enum             → One of many                      ║
║     minLength        → String length                    ║
║                                                          ║
║  🔗 Logic:                                               ║
║     AND → All conditions must be true                   ║
║     OR  → Any condition must be true                    ║
║                                                          ║
║  💡 Tip: Use ENABLE to show but gray out fields         ║
║         Use SHOW to completely hide fields              ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```

## Legend

```
✅ Enabled   - User can interact
🔒 Disabled  - Grayed out, cannot interact
👁️ Visible   - Field is shown
🚫 Hidden    - Field is not shown
✓ True       - Condition met
✗ False      - Condition not met
```
