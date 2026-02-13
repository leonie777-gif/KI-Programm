{
  "name": "Documentation",
  "type": "object",
  "properties": {
    "patient_id": {
      "type": "string",
      "description": "ID of the patient this documentation belongs to"
    },
    "documentation_type": {
      "type": "string",
      "enum": [
        "leg_gespraech",
        "eingewoehnungsgespraech",
        "vsg_beobachtungsbogen",
        "elterngespraech"
      ],
      "description": "Type of documentation"
    },
    "session_title": {
      "type": "string",
      "description": "Title of the therapy session"
    },
    "session_date": {
      "type": "string",
      "format": "date",
      "description": "Date of the therapy session"
    },
    "recording_method": {
      "type": "string",
      "enum": [
        "live_recording",
        "manual_input"
      ],
      "description": "Method used to create the documentation"
    },
    "content": {
      "type": "string",
      "description": "Main documentation content/transcript"
    },
    "status": {
      "type": "string",
      "enum": [
        "draft",
        "completed",
        "archived"
      ],
      "default": "draft",
      "description": "Status of the documentation"
    },
    "consent_given": {
      "type": "boolean",
      "default": false,
      "description": "Whether patient consent was given for recording"
    },
    "duration_minutes": {
      "type": "number",
      "description": "Duration of the session in minutes"
    },
    "uploaded_file_url": {
      "type": "string",
      "description": "URL of uploaded file if any"
    },
    "eingewoehnung_gefuehrt_von": {
      "type": "string",
      "description": "Staff member who led the conversation (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
    "eingewoehnung_gefuehrt_mit": {
      "type": "string",
      "description": "Guardians involved in the conversation (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
    "eingewoehnung_themen": {
      "type": "string",
      "description": "Topics discussed (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
},
    "eingewoehnung_elternwuensche": {
      "type": "string",
      "description": "Topics discussed (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
},
    "eingewoehnung_elternbedenken": {
      "type": "string",
      "description": "Topics discussed (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
    "eingewoehnung_kinderzaehlungen": {
      "type": "string",
      "description": "Topics discussed (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
    "eingewoehnung_absprachen": {
      "type": "string",
      "description": "Mutual agreements (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
    "eingewoehnung_nachbesprechung": {
      "type": "string",
      "description": "When agreements will be reviewed (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
    "eingewoehnung_folgetermin": {
      "type": "string",
      "description": "Next appointment date (Eingew\u00f6hnungsgespr\u00e4ch)"
    },
    "vsg_geburtsdatum": {
      "type": "string",
      "format": "date",
      "description": "Date of birth (VSG)"
    },
    "vsg_geschlecht": {
      "type": "string",
      "description": "Gender (VSG)"
    },
    "vsg_therapien": {
      "type": "string",
      "description": "Therapies (VSG)"
    },
    "vsg_therapien_seit": {
      "type": "string",
      "description": "Therapies since when (VSG)"
    },
    "vsg_assessments": {
      "type": "object",
      "description": "VSG Likert scale assessments",
      "additionalProperties": true
    },
    "vsg_bemerkungen": {
      "type": "string",
      "description": "Additional remarks (VSG)"
    }
  },
  "required": [
    "session_title",
    "session_date",
    "recording_method"
  ]
}