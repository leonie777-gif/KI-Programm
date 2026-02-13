{
  "name": "Patient",
  "type": "object",
  "properties": {
    "first_name": {
      "type": "string",
      "description": "Patient's first name"
    },
    "last_name": {
      "type": "string",
      "description": "Patient's last name"
    },
    "date_of_birth": {
      "type": "string",
      "format": "date",
      "description": "Patient's date of birth"
    },
    "patient_id": {
      "type": "string",
      "description": "Unique patient identifier"
    },
    "gruppe_id": {
      "type": "string",
      "description": "ID der zugewiesenen Gruppe"
    },
    "eltern_vorname": {
      "type": "string",
      "description": "Vorname der Eltern/Erziehungsberechtigten"
    },
    "eltern_nachname": {
      "type": "string",
      "description": "Nachname der Eltern/Erziehungsberechtigten"
    },
    "phone": {
      "type": "string",
      "description": "Telefon der Eltern/Erziehungsberechtigten"
    },
    "insurance_number": {
      "type": "string",
      "description": "Insurance number"
    },
    "email": {
      "type": "string",
      "description": "Contact email"
    },
    "notes": {
      "type": "string",
      "description": "Additional notes about the patient"
    },
    "diagnosis": {
      "type": "string",
      "description": "Primary diagnosis"
    }
  },
  "required": [
    "first_name",
    "last_name"
  ]
}