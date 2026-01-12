import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Import hook
import { ArrowLeft, Upload, X, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { EventCategory, CreateEventInput } from "../types";
import { toast } from "sonner";

interface CreateEventFormProps {
  onSubmit: (eventData: CreateEventInput) => void;
}

const categories: { value: EventCategory; label: string }[] = [
  { value: "conference", label: "Conferință" },
  { value: "workshop", label: "Workshop" },
  { value: "student-activity", label: "Activitate Studențească" },
  { value: "seminar", label: "Seminar" },
  { value: "sports", label: "Sport" },
  { value: "cultural", label: "Cultural" },
];

export function CreateEventForm({ onSubmit }: CreateEventFormProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    category: "" as EventCategory | "",
    description: "",
    date: "",
    time: "",
    location: "",
    maxAttendees: "",
    imageUrl: "",
  });

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) {
        newErrors.title = "Titlul este obligatoriu";
      }
      if (!formData.category) {
        newErrors.category = "Categoria este obligatorie";
      }
      if (!formData.description.trim()) {
        newErrors.description = "Descrierea este obligatorie";
      } else if (formData.description.length < 50) {
        newErrors.description =
          "Descrierea trebuie să conțină cel puțin 50 de caractere";
      }
    }

    if (currentStep === 2) {
      if (!formData.date) {
        newErrors.date = "Data este obligatorie";
      }
      if (!formData.time) {
        newErrors.time = "Ora este obligatorie";
      }
      if (!formData.location.trim()) {
        newErrors.location = "Locația este obligatorie";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setErrors({});
  };

  const handleSubmit = () => {
    if (validateStep(step)) {
      onSubmit(formData as CreateEventInput);
      toast.success("Eveniment creat cu succes!");
      navigate('/organizer'); // 3. Redirect back to organizer panel after success
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleTimeInput = (type: 'start' | 'end', value: string) => {
    let newStart = startTime;
    let newEnd = endTime;

    if (type === 'start') {
        setStartTime(value);
        newStart = value;
    } else {
        setEndTime(value);
        newEnd = value;
    }

    // Clear specific time error if user interacts
    if (errors.time) setErrors((prev) => ({ ...prev, time: "" }));

    // Update the main formData string
    if (newStart && newEnd) {
        updateFormData("time", `${newStart} - ${newEnd}`);
    } else if (newStart) {
        updateFormData("time", newStart);
    } else {
        updateFormData("time", "");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)} // 4. Navigate back in history
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Înapoi
        </Button>

        <div className="bg-white rounded-lg p-6 md:p-8">
          <h1 className="mb-2">Creează un eveniment nou</h1>
          <p className="text-gray-600 mb-6">
            Completează informațiile despre evenimentul tău
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${s <= step
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-600"
                    }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${s < step ? "bg-blue-600" : "bg-gray-200"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="mb-4">Informații de bază</h2>

              <div className="space-y-2">
                <Label htmlFor="title">
                  Titlul evenimentului <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="ex: Workshop: Dezvoltare Web cu React"
                  value={formData.title}
                  onChange={(e) => updateFormData("title", e.target.value)}
                  className={errors.title ? "border-red-500" : ""}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Categoria <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => updateFormData("category", value)}
                >
                  <SelectTrigger
                    className={errors.category ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Selectează categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">
                  Descrierea evenimentului{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Descrie evenimentul tău în detaliu. Ce vor învăța participanții? Ce ar trebui să știe înainte să participe?"
                  rows={6}
                  value={formData.description}
                  onChange={(e) =>
                    updateFormData("description", e.target.value)
                  }
                  className={errors.description ? "border-red-500" : ""}
                />
                <div className="flex justify-between text-sm">
                  <span
                    className={
                      errors.description ? "text-red-500" : "text-gray-500"
                    }
                  >
                    {errors.description ||
                      `${formData.description.length}/50 caractere minime`}
                  </span>
                  <span className="text-gray-500">
                    {formData.description.length} caractere
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Date, Time & Location */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="mb-4">Dată, oră și locație</h2>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">
                    Data evenimentului <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => updateFormData("date", e.target.value)}
                    className={(errors.date ? "border-red-500" : "")}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {errors.date && (
                    <p className="text-sm text-red-500">{errors.date}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime">
                    Interval Orar <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center gap-2">
                    <div>
                        <Input
                            id="startTime"
                            type="time"
                            value={startTime}
                            onChange={(e) => handleTimeInput('start', e.target.value)}
                            className={errors.time ? "border-red-500" : ""}
                        />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div>
                        <Input
                            id="endTime"
                            type="time"
                            value={endTime}
                            onChange={(e) => handleTimeInput('end', e.target.value)}
                            className={errors.time ? "border-red-500" : ""}
                        />
                    </div>
                  </div>
                  {errors.time ? (
                    <p className="text-sm text-red-500">{errors.time}</p>
                  ) : (
                    <p className="text-xs text-gray-500">
                        Ora de început și ora de sfârșit (opțional)
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Locația <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  placeholder="ex: Aula Magna, Facultatea de Matematică și Informatică"
                  value={formData.location}
                  onChange={(e) => updateFormData("location", e.target.value)}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && (
                  <p className="text-sm text-red-500">{errors.location}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxAttendees">
                  Număr maxim de participanți (opțional)
                </Label>
                <Input
                  id="maxAttendees"
                  type="number"
                  placeholder="ex: 50"
                  value={formData.maxAttendees}
                  onChange={(e) =>
                    updateFormData("maxAttendees", e.target.value)
                  }
                  min="1"
                />
                <p className="text-sm text-gray-500">
                  Lasă câmpul gol pentru a permite un număr nelimitat de
                  participanți
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Image & Review */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="mb-4">Imagine și revizuire</h2>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Imagine eveniment (opțional)</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  {formData.imageUrl ? (
                    <div className="relative">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="max-h-64 mx-auto rounded"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 bg-white"
                        onClick={() => updateFormData("imageUrl", "")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                      <p className="text-gray-600 mb-2">
                        Încarcă o imagine reprezentativă
                      </p>
                      <Input
                        id="imageUrl"
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        value={formData.imageUrl}
                        onChange={(e) =>
                          updateFormData("imageUrl", e.target.value)
                        }
                        className="max-w-md mx-auto"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        Introdu URL-ul imaginii
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Review */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <h3>Revizuire detalii eveniment</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">Titlu:</span>{" "}
                    <span>{formData.title}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Categorie:</span>{" "}
                    <span>
                      {
                        categories.find((c) => c.value === formData.category)
                          ?.label
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Data:</span>{" "}
                    <span>{formData.date}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ora:</span>{" "}
                    <span className="flex items-center gap-1 inline-flex">
                        <Clock className="h-3 w-3" />
                        {formData.time}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Locație:</span>{" "}
                    <span>{formData.location}</span>
                  </div>
                  {formData.maxAttendees && (
                    <div>
                      <span className="text-gray-600">Max participanți:</span>{" "}
                      <span>{formData.maxAttendees}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Înapoi
              </Button>
            )}
            {step < 3 ? (
              <Button
                onClick={handleNext}
                className="ml-auto bg-blue-600 hover:bg-blue-700"
              >
                Continuă
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="ml-auto bg-blue-600 hover:bg-blue-700"
              >
                Creează eveniment
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}