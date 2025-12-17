# Conditional Field Rules - JSONForms Demo

This project now supports dynamic enable/disable of form fields based on conditions!

## How It Works

The UI Schema (uischema.json) defines **rules** that control field visibility and enabled state based on other field values.

## Rule Effects

- **ENABLE**: Field is visible but disabled until condition is met
- **DISABLE**: Field is enabled until condition is met (opposite of ENABLE)
- **SHOW**: Field is hidden until condition is met
- **HIDE**: Field is visible until condition is met (opposite of SHOW)

## Example Rules

### 1. Age-Based Enable (Currently Active)

```json
{
  "type": "Control",
  "scope": "#/properties/profilePicture",
  "rule": {
    "effect": "ENABLE",
    "condition": {
      "scope": "#/properties/age",
      "schema": {
        "minimum": 18
      }
    }
  }
}
```

**Behavior**: Profile Picture field is disabled until age ≥ 18

### 2. Conditional Visibility

```json
{
  "type": "Control",
  "scope": "#/properties/recurrence_interval",
  "rule": {
    "effect": "HIDE",
    "condition": {
      "type": "LEAF",
      "scope": "#/properties/recurrence",
      "expectedValue": "Never"
    }
  }
}
```

**Behavior**: Recurrence interval is hidden when recurrence is "Never"

### 3. Multiple Conditions (AND)

```json
{
  "type": "Control",
  "scope": "#/properties/advancedOptions",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "type": "AND",
      "conditions": [
        {
          "scope": "#/properties/age",
          "schema": { "minimum": 18 }
        },
        {
          "scope": "#/properties/name",
          "schema": { "minLength": 3 }
        }
      ]
    }
  }
}
```

**Behavior**: Shows advanced options when age ≥ 18 AND name has at least 3 characters

### 4. Multiple Conditions (OR)

```json
{
  "type": "Control",
  "scope": "#/properties/specialField",
  "rule": {
    "effect": "ENABLE",
    "condition": {
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
  }
}
```

**Behavior**: Enables special field when age ≥ 21 OR hasPermission is true

### 5. Enum/Value Check

```json
{
  "type": "Control",
  "scope": "#/properties/stateProvince",
  "rule": {
    "effect": "ENABLE",
    "condition": {
      "scope": "#/properties/country",
      "schema": {
        "enum": ["USA", "Canada"]
      }
    }
  }
}
```

**Behavior**: State/Province field enabled only for USA or Canada

### 6. Boolean Check

```json
{
  "type": "Control",
  "scope": "#/properties/additionalInfo",
  "rule": {
    "effect": "SHOW",
    "condition": {
      "scope": "#/properties/wantsMoreInfo",
      "schema": {
        "const": true
      }
    }
  }
}
```

**Behavior**: Additional info field shown when checkbox is checked

## Condition Types

### Simple Condition (JSON Schema based)

```json
{
  "scope": "#/properties/fieldName",
  "schema": {
    "minimum": 18,
    "maximum": 100,
    "minLength": 3,
    "const": "specificValue",
    "enum": ["option1", "option2"]
  }
}
```

### Leaf Condition (Exact value match)

```json
{
  "type": "LEAF",
  "scope": "#/properties/fieldName",
  "expectedValue": "exactValue"
}
```

### AND Condition

```json
{
  "type": "AND",
  "conditions": [
    {
      /* condition 1 */
    },
    {
      /* condition 2 */
    }
  ]
}
```

### OR Condition

```json
{
  "type": "OR",
  "conditions": [
    {
      /* condition 1 */
    },
    {
      /* condition 2 */
    }
  ]
}
```

## How to Use

1. Edit the **JSON Schema** (left panel) to define your form fields
2. Edit the **UI Schema** (left panel) to add rules for conditional behavior
3. Click "Format & Save" buttons to apply changes
4. The form will automatically update with conditional logic
5. Test by entering values that trigger the conditions

## Tips

- Use `ENABLE`/`DISABLE` when you want the field visible but grayed out
- Use `SHOW`/`HIDE` when you want to completely show/hide the field
- Combine multiple conditions with `AND`/`OR` for complex logic
- Use JSON Schema validation keywords (minimum, maximum, const, enum, etc.) for conditions
- The form validates in real-time as you type

## Live Example

Try entering an age less than 18 - the Profile Picture field will be disabled!
Change the age to 18 or higher - the field becomes enabled.
