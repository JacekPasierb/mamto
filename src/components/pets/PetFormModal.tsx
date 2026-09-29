"use client";

import {useEffect, useState} from "react";

import FormModalShell from "@/components/FormModalShell";
import {toDateInputValue} from "@/lib/calculateCurrentStock";
import {
  PET_SPECIES,
  PET_SPECIES_LABELS,
  type PetSpecies,
} from "@/lib/petTypes";
import VetCombobox from "./VetCombobox";

export type PetFormValues = {
  _id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  birthDate: string | null;
  microchipId: string;
  vetName: string;
  vetId?: string | null;
  notes: string;
};

type PetFormModalProps = {
  isOpen: boolean;
  pet?: PetFormValues | null;
  onClose: () => void;
  onSaved: (pet?: PetFormValues) => Promise<void> | void;
};

const PetFormModal = ({
  isOpen,
  pet = null,
  onClose,
  onSaved,
}: PetFormModalProps) => {
  const isEditing = Boolean(pet);

  const [name, setName] = useState("");
  const [species, setSpecies] = useState<PetSpecies>("dog");
  const [breed, setBreed] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [microchipId, setMicrochipId] = useState("");
  const [vetName, setVetName] = useState("");
  const [vetId, setVetId] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (pet) {
      setName(pet.name);
      setSpecies(pet.species || "dog");
      setBreed(pet.breed || "");
      setBirthDate(toDateInputValue(pet.birthDate) || "");
      setMicrochipId(pet.microchipId || "");
      setVetName(pet.vetName || "");
      setVetId(pet.vetId ? String(pet.vetId) : null);
      setNotes(pet.notes || "");
    } else {
      setName("");
      setSpecies("dog");
      setBreed("");
      setBirthDate("");
      setMicrochipId("");
      setVetName("");
      setVetId(null);
      setNotes("");
    }

    setError("");
  }, [isOpen, pet]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const payload = {
        name,
        species,
        breed,
        birthDate: birthDate || null,
        microchipId,
        vetName,
        vetId,
        notes,
      };

      const response = await fetch(
        isEditing ? `/api/pets/${pet!._id}` : "/api/pets",
        {
          method: isEditing ? "PUT" : "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(
          data?.message ||
            (isEditing
              ? "Nie udało się zaktualizować zwierzęcia"
              : "Nie udało się dodać zwierzęcia")
        );
      }

      const saved = await response.json();
      await onSaved({
        _id: String(saved._id),
        name: saved.name,
        species: saved.species || "dog",
        breed: saved.breed || "",
        birthDate: saved.birthDate
          ? toDateInputValue(saved.birthDate)
          : null,
        microchipId: saved.microchipId || "",
        vetName: saved.vetName || "",
        vetId: saved.vetId ? String(saved.vetId) : null,
        notes: saved.notes || "",
      });
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : isEditing
            ? "Nie udało się zaktualizować zwierzęcia."
            : "Nie udało się dodać zwierzęcia."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const fieldClass =
    "w-full min-w-0 border border-[var(--mt-line)] bg-[var(--mt-bg)] px-3 py-3 outline-none transition focus:border-[var(--mt-accent)] sm:px-4";

  return (
    <FormModalShell
      isOpen={isOpen}
      eyebrow="Zwierzęta"
      title={isEditing ? "Edytuj zwierzę" : "Dodaj zwierzę"}
      onClose={onClose}
      onSubmit={handleSubmit}
      footer={
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 border border-[var(--mt-line)] px-4 py-3.5 text-sm font-semibold text-[var(--mt-ink)] transition hover:border-[var(--mt-ink)] disabled:opacity-50"
          >
            Anuluj
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 bg-[var(--mt-ink)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--mt-accent)] disabled:opacity-50"
          >
            {isSaving ? "Zapisuję…" : isEditing ? "Zapisz" : "Dodaj"}
          </button>
        </div>
      }
    >
          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Imię
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Np. Burek"
              required
              className={fieldClass}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Gatunek
            </label>
            <select
              value={species}
              onChange={(e) => setSpecies(e.target.value as PetSpecies)}
              className={fieldClass}
            >
              {PET_SPECIES.map((value) => (
                <option key={value} value={value}>
                  {PET_SPECIES_LABELS[value]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Rasa
            </label>
            <input
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Np. Labrador"
              className={fieldClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="min-w-0">
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Data urodzenia
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className={fieldClass}
              />
            </div>
            <div className="min-w-0">
              <label className="mb-2 block text-sm text-[var(--mt-muted)]">
                Chip
              </label>
              <input
                value={microchipId}
                onChange={(e) => setMicrochipId(e.target.value)}
                placeholder="Numer chipa"
                className={fieldClass}
              />
            </div>
          </div>

          <VetCombobox
            value={vetName}
            vetId={vetId}
            onChange={(nameValue, idValue) => {
              setVetName(nameValue);
              setVetId(idValue);
            }}
          />

          <div>
            <label className="mb-2 block text-sm text-[var(--mt-muted)]">
              Notatki
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={fieldClass}
            />
          </div>

      {error ? (
        <p className="text-sm text-[var(--mt-signal)]">{error}</p>
      ) : null}
    </FormModalShell>
  );
};

export default PetFormModal;
