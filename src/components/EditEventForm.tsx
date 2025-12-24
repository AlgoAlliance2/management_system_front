import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
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
import type { EventCategory } from "../types";
import { toast } from "sonner";
import api from "../lib/api";
import { format } from "date-fns";

const categories: { value: EventCategory; label: string }[] = [
  { value: "conference", label: "Conferință" },
  { value: "workshop", label: "Workshop" },
  { value: "student-activity", label: "Activitate Studențească" },
  { value: "seminar", label: "Seminar" },
  { value: "sports", label: "Sport" },
  { value: "cultural", label: "Cultural" },
];

export function EditEventForm() {
  const { id: eventId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: "",
    category: "conference" as EventCategory,
    description: "",
    date: "",
    time: "",
    location: "",
    maxAttendees: "",
    imageUrl: "",
  });

  // Tipizare flexibilă pentru erori – permite orice cheie string
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Încarcă datele evenimentului la mount
  useEffect(() => {
    const fetchEvent = async () => {
      if (!eventId) return;

      try {
        setIsLoading(true);
        const response = await api.get(`/events/${eventId}`);
        const event = response.data.event; // backend-ul returnează { event: ... }

        setFormData({
          title: event.title || "",
          category: (event.category || "conference") as EventCategory,
          description: event.description || "",
          date: format(new Date(event.date), "yyyy-MM-dd"),
          time: event.time || "",
          location: event.location || "",
          maxAttendees: event.maxAttendees?.toString() || "",
          imageUrl: event.imageUrl || "",
        });
      } catch (err) {
        console.error("Eroare la încărcarea evenimentului:", err);
        setFetchError("Nu s-a putut încărca evenimentul pentru editare.");
        toast.error("Eroare la încărcarea datelor evenimentului");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  // Validare per pas
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.title.trim()) newErrors.title = "Titlul este obligatoriu";
      if (!formData.description.trim())
        newErrors.description = "Descrierea este obligatorie";
    }

    if (currentStep === 2) {
      if (!formData.date) newErrors.date = "Data este obligatorie";
      if (!formData.time) newErrors.time = "Ora este obligatorie";
      if (!formData.location.trim())
        newErrors.location = "Locația este obligatorie";
      if (
        formData.maxAttendees &&
        (isNaN(Number(formData.maxAttendees)) ||
          Number(formData.maxAttendees) < 0)
      ) {
        newErrors.maxAttendees = "Trebuie să fie un număr pozitiv valid";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler pentru input-uri obișnuite
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Șterge eroarea câmpului modificat
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  // Handler pentru Select (categorie)
  const handleCategoryChange = (value: EventCategory) => {
    setFormData((prev) => ({ ...prev, category: value }));

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.category;
      return newErrors;
    });
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(step)) return;

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        date: formData.date,
        time: formData.time,
        location: formData.location.trim(),
        category: formData.category,
        maxAttendees: formData.maxAttendees
          ? Number(formData.maxAttendees)
          : undefined,
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      await api.put(`/events/${eventId}`, payload);

      toast.success("Evenimentul a fost actualizat cu succes!");
      navigate("/organizer");
    } catch (err: any) {
      console.error("Eroare la salvarea modificărilor:", err);
      toast.error(
        err?.response?.data?.message ||
          "Eroare la actualizarea evenimentului. Verifică datele introduse."
      );
    }
  };

  // Stări de încărcare / eroare
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Se încarcă evenimentul...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 text-lg mb-4">{fetchError}</p>
          <Button onClick={() => navigate(-1)} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Înapoi la listă
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Editează Eveniment</h1>
            <Button
              variant="ghost"
              className="text-white hover:bg-blue-700"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Înapoi
            </Button>
          </div>
        </div>

        {/* Formular */}
        <div className="p-8">
          {/* Pasul 1: Informații de bază */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="title">Titlu eveniment</Label>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="ex: Conferință Națională de Informatică"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <Label htmlFor="category">Categorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Alege categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Descriere</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={6}
                  placeholder="Descrie detaliat despre ce este evenimentul, speakeri, agendă etc."
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.description}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pasul 2: Detalii logistice */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="date">Data evenimentului</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={formData.date}
                    onChange={handleChange}
                  />
                  {errors.date && (
                    <p className="text-red-500 text-sm mt-1">{errors.date}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="time">Ora de începere</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    value={formData.time}
                    onChange={handleChange}
                  />
                  {errors.time && (
                    <p className="text-red-500 text-sm mt-1">{errors.time}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Locație</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="ex: Amfiteatrul A1, Corpul Central"
                />
                {errors.location && (
                  <p className="text-red-500 text-sm mt-1">{errors.location}</p>
                )}
              </div>

              <div>
                <Label htmlFor="maxAttendees">
                  Număr maxim participanți (opțional)
                </Label>
                <Input
                  id="maxAttendees"
                  name="maxAttendees"
                  type="number"
                  min="1"
                  value={formData.maxAttendees}
                  onChange={handleChange}
                  placeholder="ex: 150"
                />
                {errors.maxAttendees && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maxAttendees}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Pasul 3: Imagine */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="imageUrl">
                  URL imagine eveniment (opțional)
                </Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/afis-eveniment.jpg"
                />
                {formData.imageUrl && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-2">
                      Previzualizare:
                    </p>
                    <img
                      src={formData.imageUrl}
                      alt="Previzualizare imagine eveniment"
                      className="rounded-lg max-h-96 w-full object-cover shadow-md"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        e.currentTarget.nextElementSibling?.classList.remove(
                          "hidden"
                        );
                      }}
                    />
                    <p className="hidden text-sm text-red-500 mt-2">
                      Imaginea nu poate fi încărcată (URL invalid)
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Navigație între pași */}
          <div className="flex justify-between items-center mt-12 pt-8 border-t border-gray-200">
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                Înapoi
              </Button>
            )}

            <div className="ml-auto flex gap-4">
              <div className="text-sm text-gray-500 self-center">
                Pasul {step} din 3
              </div>
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Continuă
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Salvează modificările
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
