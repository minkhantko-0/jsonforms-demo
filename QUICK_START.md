# Quick Start: Conditional Form Fields

## 🚀 Try It Now (2 minutes)

### Test #1: Age-Based Enable

1. Look at the form in the middle panel
2. Find the **Age** field
3. Enter a number **less than 18**
4. Notice the **Profile Picture** field is disabled (grayed out)
5. Change age to **18 or higher**
6. **Profile Picture** becomes enabled! ✅

### Test #2: Conditional Hide

1. Find the **Recurrence** dropdown
2. Select **"Never"**
3. Notice **Recurrence Interval** field disappears
4. Select **"Daily"** or **"Weekly"**
5. **Recurrence Interval** field appears! ✅

## 📚 Learn More

Want to create your own rules?

### Load Advanced Examples

1. Open `src/data/schema-example-advanced.json`
2. Copy all contents (Ctrl+A, Ctrl+C)
3. Paste into **JSON Schema** editor (left panel, top)
4. Click **"Format & Save Schema"**
5. Open `src/data/uischema-example-advanced.json`
6. Copy all contents
7. Paste into **UI Schema (Rules)** editor (left panel, bottom)
8. Click **"Format & Save UI Schema"**
9. Test the new conditional logic!

**Advanced examples include:**

- State field enabled only for USA/Canada
- Driving license at age 16+
- Alcohol consent at age 21+
- Credit card shown when "I am 18+" is checked

## 🎯 Create Your Own Rule

### Example: Show discount code field when checkbox is checked

#### Step 1: Add fields to JSON Schema

```json
{
  "properties": {
    "wantsDiscount": {
      "type": "boolean",
      "title": "I have a discount code"
    },
    "discountCode": {
      "type": "string",
      "title": "Enter your discount code"
    }
  }
}
```

#### Step 2: Add rule to UI Schema

```json
{
  "type": "Control",
  "scope": "#/properties/wantsDiscount"
},
{
  "type": "Control",
  "scope": "#/properties/discountCode",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "scope": "#/properties/wantsDiscount",
      "schema": {
        "const": true
      }
    }
  }
}
```

#### Step 3: Save and test!

1. Add the fields to your schemas
2. Click both "Format & Save" buttons
3. Toggle the checkbox and watch the field appear/disappear

## 📖 Full Documentation

- **User Guide**: `CONDITIONAL_FIELDS_GUIDE.md` - Complete guide with use cases
- **Technical Reference**: `CONDITIONAL_RULES.md` - All rule types and syntax
- **Implementation Details**: `IMPLEMENTATION_SUMMARY.md` - How it was built

## 🔑 Key Concepts

### Effect Types

- `ENABLE` - Disabled → Enabled when condition is true
- `SHOW` - Hidden → Visible when condition is true
- `DISABLE` - Enabled → Disabled when condition is true
- `HIDE` - Visible → Hidden when condition is true

### Common Conditions

```json
// Age check
{ "scope": "#/properties/age", "schema": { "minimum": 18 } }

// Exact value
{ "scope": "#/properties/country", "schema": { "const": "USA" } }

// One of many
{ "scope": "#/properties/country", "schema": { "enum": ["USA", "Canada"] } }

// Boolean check
{ "scope": "#/properties/accepted", "schema": { "const": true } }
```

## 💡 Tips

1. **ENABLE vs SHOW**: Use ENABLE to gray out fields, SHOW to completely hide them
2. **Test as you go**: Changes apply immediately after clicking "Format & Save"
3. **Check syntax**: Invalid JSON will show an error message
4. **Clear data**: Click "Clear data" button to reset the form

## ❓ Troubleshooting

**Field not changing?**

- Did you click "Format & Save UI Schema"?
- Check that property names in `scope` match your JSON Schema
- Verify the condition can actually be met

**Syntax error?**

- Check for missing commas or brackets
- Use the examples as templates
- JSON must be valid (no trailing commas, quotes around keys)

## 🎉 That's It!

You now have dynamic conditional forms. Experiment with the examples and create your own rules!

**Happy form building!** 🚀
