# Dynamic Conditional Form Fields

## Overview

This JSONForms demo now supports **dynamic enable/disable of form fields** based on conditions! Fields can be shown, hidden, enabled, or disabled based on values in other fields.

## Features

✅ **Age-based restrictions** - Disable fields for users under 18  
✅ **Location-based rules** - Enable state field only for USA/Canada  
✅ **Boolean conditions** - Show/hide fields based on checkboxes  
✅ **Value-based rules** - Hide recurrence interval when "Never" is selected  
✅ **Multiple conditions** - Combine AND/OR logic for complex scenarios  
✅ **Live editing** - Edit both JSON Schema and UI Schema in real-time

## How to Use

### 1. Start the Application

The app should already be running. Navigate to the form interface.

### 2. Understanding the Three Panels

- **Left Panel (JSON Schema)**: Define your form structure and validation rules
- **Left Panel (UI Schema)**: Define conditional rules for field visibility/enablement
- **Middle Panel**: The rendered form with live conditional logic
- **Right Panel**: Current form data in JSON format

### 3. Try the Default Example

The current form demonstrates:

- **Profile Picture** field is disabled until age ≥ 18
- **Recurrence Interval** is hidden when recurrence is set to "Never"

### 4. Test the Conditional Logic

1. Enter an age less than 18 → Profile Picture is disabled (grayed out)
2. Enter an age of 18 or more → Profile Picture becomes enabled
3. Set Recurrence to "Never" → Recurrence Interval field disappears
4. Set Recurrence to "Daily" → Recurrence Interval field appears

## Advanced Examples

### Example 1: Load Advanced Schema with More Rules

Copy the contents from these files into the editors:

- `src/data/schema-example-advanced.json` → JSON Schema editor
- `src/data/uischema-example-advanced.json` → UI Schema editor

Then click "Format & Save" on each.

This demonstrates:

- State field enabled only for USA/Canada
- Driving license enabled at age 16+
- Alcohol consent shown at age 21+
- Credit card shown when "I am 18 or older" is checked

### Example 2: Create Your Own Rule

#### Step 1: Add a New Field to JSON Schema

```json
{
  "properties": {
    "hasLicense": {
      "type": "boolean",
      "title": "I have a driver's license"
    },
    "carType": {
      "type": "string",
      "title": "What type of car do you drive?",
      "enum": ["Sedan", "SUV", "Truck", "Sports Car"]
    }
  }
}
```

#### Step 2: Add a Rule to UI Schema

```json
{
  "type": "Control",
  "scope": "#/properties/carType",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "scope": "#/properties/hasLicense",
      "schema": {
        "const": true
      }
    }
  }
}
```

This will only show the car type field when the user has a license.

## Rule Types

### Effect Types

| Effect    | Behavior                                                |
| --------- | ------------------------------------------------------- |
| `ENABLE`  | Field is visible but disabled until condition is met    |
| `DISABLE` | Field is enabled until condition is met (then disables) |
| `SHOW`    | Field is hidden until condition is met                  |
| `HIDE`    | Field is visible until condition is met (then hides)    |

### Condition Types

#### 1. Schema-Based (Recommended)

Uses JSON Schema validation keywords:

```json
{
  "scope": "#/properties/age",
  "schema": {
    "minimum": 18,
    "maximum": 65
  }
}
```

**Available keywords:**

- `minimum` / `maximum` - Numeric ranges
- `minLength` / `maxLength` - String lengths
- `const` - Exact value match
- `enum` - One of multiple values
- `pattern` - Regex pattern match

#### 2. Leaf Condition (Legacy)

Exact value matching:

```json
{
  "type": "LEAF",
  "scope": "#/properties/country",
  "expectedValue": "USA"
}
```

#### 3. AND Condition

All conditions must be true:

```json
{
  "type": "AND",
  "conditions": [
    {
      "scope": "#/properties/age",
      "schema": { "minimum": 18 }
    },
    {
      "scope": "#/properties/country",
      "schema": { "const": "USA" }
    }
  ]
}
```

#### 4. OR Condition

Any condition must be true:

```json
{
  "type": "OR",
  "conditions": [
    {
      "scope": "#/properties/age",
      "schema": { "minimum": 21 }
    },
    {
      "scope": "#/properties/hasPermission",
      "schema": { "const": true }
    }
  ]
}
```

## Common Use Cases

### Age Verification

```json
{
  "type": "Control",
  "scope": "#/properties/ageRestrictedContent",
  "rule": {
    "effect": "ENABLE",
    "condition": {
      "scope": "#/properties/age",
      "schema": { "minimum": 18 }
    }
  }
}
```

### Country-Specific Fields

```json
{
  "type": "Control",
  "scope": "#/properties/zipCode",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "scope": "#/properties/country",
      "schema": { "const": "USA" }
    }
  }
}
```

### Dependent Dropdowns

```json
{
  "type": "Control",
  "scope": "#/properties/specificOption",
  "rule": {
    "effect": "HIDE",
    "condition": {
      "scope": "#/properties/category",
      "schema": { "const": "General" }
    }
  }
}
```

### Multiple Conditions

```json
{
  "type": "Control",
  "scope": "#/properties/advancedFeatures",
  "rule": {
    "effect": "ENABLE",
    "condition": {
      "type": "AND",
      "conditions": [
        {
          "scope": "#/properties/age",
          "schema": { "minimum": 18 }
        },
        {
          "scope": "#/properties/acceptedTerms",
          "schema": { "const": true }
        }
      ]
    }
  }
}
```

## Tips

1. **Use ENABLE vs SHOW**:

   - Use `ENABLE` when you want users to see the field but not interact with it
   - Use `SHOW` when you want to completely hide the field

2. **Validation**: Fields that are disabled or hidden are still validated unless they're completely removed from the data

3. **Real-time Updates**: The form updates instantly as you type - no need to click anything

4. **Error Messages**: Use `errorMessage` in the schema to provide helpful feedback

5. **Format & Save**: Always click "Format & Save" after editing schemas to apply changes

## Troubleshooting

### Field Not Updating?

- Make sure you clicked "Format & Save Schema" and "Format & Save UI Schema"
- Check that your condition scope matches the exact property path
- Verify the schema syntax is valid JSON

### Field Always Disabled?

- Check that your condition can actually be met
- Verify the field name in `scope` matches the schema property
- Ensure the condition logic is correct (e.g., minimum value)

### Changes Not Persisting?

- The form uses Zustand store - changes are kept during the session
- Click "Clear data" to reset the form to its initial state

## Further Reading

- [JSONForms Documentation](https://jsonforms.io/)
- [JSONForms Rules](https://jsonforms.io/docs/uischema/rules)
- [JSON Schema Validation](https://json-schema.org/understanding-json-schema/reference/validation.html)

## Support

See `CONDITIONAL_RULES.md` for more detailed examples and rule syntax.
