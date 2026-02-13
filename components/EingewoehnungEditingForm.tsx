import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import VoiceTranscriptionButton from "./VoiceTranscriptionButton";

export default function EingewoehnungEditingForm({ data, onChange }) {
  const [expandedTranscriptions, setExpandedTranscriptions] = React.useState({});

  const handleFieldChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const handleTranscriptionComplete = (field, result) => {
    const currentValue = data[field] || "";

    // Format bullet points with "• " prefix
    const formattedBulletPoints = result.bulletPoints && result.bulletPoints.length > 0
      ? result.bulletPoints.map(point => `• ${point}`).join('\n')
      : result.transcription;

    const newValue = currentValue 
      ? `${currentValue}\n\n${formattedBulletPoints}` 
      : formattedBulletPoints;

    onChange({
      ...data,
      [field]: newValue,
      [`${field}_transcription`]: result.transcription
    });
  };

  const toggleTranscription = (field) => {
    setExpandedTranscriptions({
      ...expandedTranscriptions,
      [field]: !expandedTranscriptions[field]
    });
  };

  const renderFieldWithDictation = (field, label) => (
    <div key={field} className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={field} className="font-medium">{label}</Label>
        <VoiceTranscriptionButton
          fieldLabel={label}
          onTranscriptionComplete={(result) => handleTranscriptionComplete(field, result)}
        />
      </div>
      <Textarea
        id={field}
        value={data[field] || ""}
        onChange={(e) => handleFieldChange(field, e.target.value)}
        placeholder={`${label} eingeben...`}
        className="min-h-[150px] border-slate-200 focus:border-blue-500 focus:ring-blue-500"
      />
      
      {data[`${field}_transcription`] && (
        <Card className="border-slate-200 bg-slate-50">
          <CardContent className="p-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => toggleTranscription(field)}
              className="w-full justify-between mb-2"
            >
              <span className="text-sm font-medium text-slate-700">
                Vollständige Transkription
              </span>
              {expandedTranscriptions[field] ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            
            {expandedTranscriptions[field] && (
              <Textarea
                value={data[`${field}_transcription`] || ""}
                onChange={(e) => handleFieldChange(`${field}_transcription`, e.target.value)}
                className="mt-2 min-h-[200px] bg-white"
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="gefuehrt_von" className="font-medium">Gespräch geführt von</Label>
        <Input
          id="gefuehrt_von"
          value={data.gefuehrt_von || ""}
          onChange={(e) => handleFieldChange('gefuehrt_von', e.target.value)}
          placeholder="Name der Fachkraft"
          className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="gefuehrt_mit" className="font-medium">Gespräch geführt mit</Label>
        <Input
          id="gefuehrt_mit"
          value={data.gefuehrt_mit || ""}
          onChange={(e) => handleFieldChange('gefuehrt_mit', e.target.value)}
          placeholder="Erziehungsberechtigte"
          className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {renderFieldWithDictation('themen', 'Besprochene Themen')}
      {renderFieldWithDictation('absprachen', 'Absprachen/Vereinbarungen')}

      <div className="space-y-2">
        <Label htmlFor="nachbesprechung" className="font-medium">Nachbesprechung der Absprachen</Label>
        <Input
          id="nachbesprechung"
          value={data.nachbesprechung || ""}
          onChange={(e) => handleFieldChange('nachbesprechung', e.target.value)}
          placeholder="z.B. Nach 4 Wochen"
          className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="folgetermin" className="font-medium">Folgetermin</Label>
        <Input
          id="folgetermin"
          type="date"
          value={data.folgetermin || ""}
          onChange={(e) => handleFieldChange('folgetermin', e.target.value)}
          className="border-slate-200 focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}