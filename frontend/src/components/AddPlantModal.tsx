import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  createPlant,
  updatePlant,
  type Plant,
  type PlantCreateBody,
} from "../api/plants";

/** Must match backend / display strings for plant.lighting */
export const LIGHTING_OPTIONS = [
  "Low light",
  "Medium indirect light",
  "Bright indirect light",
  "Full sun",
] as const;

const DEFAULT_LIGHTING = "Medium indirect light";

/** Map legacy form values to current options when editing old data */
function coerceLighting(stored: string): string {
  if ((LIGHTING_OPTIONS as readonly string[]).includes(stored)) {
    return stored;
  }
  const legacy: Record<string, string> = {
    Low: "Low light",
    Medium: "Medium indirect light",
    "Bright indirect": "Bright indirect light",
  };
  return legacy[stored] ?? DEFAULT_LIGHTING;
}

export type AddPlantModalProps = {
  open: boolean;
  editingPlant: Plant | null;
  onClose: () => void;
  /** Called after a successful create or update so the parent can refresh data. */
  onSaved: () => void | Promise<void>;
};

function AddPlantModal({ open, editingPlant, onClose, onSaved }: AddPlantModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const [plantName, setPlantName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [wateringDays, setWateringDays] = useState(7);
  const [lightNeeds, setLightNeeds] = useState(DEFAULT_LIGHTING);
  const [harvestDaysRaw, setHarvestDaysRaw] = useState("");
  const [petFriendly, setPetFriendly] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function hideModal() {
    onClose();
  }

  useEffect(() => {
    if (!open) return;
    if (editingPlant) {
      setPlantName(editingPlant.nickname);
      setScientificName(editingPlant.scientific_name);
      setWateringDays(editingPlant.watering_frequency_days);
      setLightNeeds(coerceLighting(editingPlant.lighting));
      setHarvestDaysRaw(
        editingPlant.harvest_frequency_days == null
          ? ""
          : String(editingPlant.harvest_frequency_days),
      );
      setPetFriendly(editingPlant.pet_friendly);
      setNotes(editingPlant.notes ?? "");
    } else {
      setPlantName("");
      setScientificName("");
      setWateringDays(7);
      setLightNeeds(DEFAULT_LIGHTING);
      setHarvestDaysRaw("");
      setPetFriendly(false);
      setNotes("");
    }
    setSubmitError(null);
  }, [open, editingPlant]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    try {
      if (open && !dialog.open) dialog.showModal();
      else if (!open && dialog.open) dialog.close();
    } catch {
      /* showModal twice in Strict Mode — ignore */
    }
  }, [open]);

  function onDialogNativeClose() {
    onClose();
  }

  async function handlePlantFormSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError(null);

    const trimmedName = plantName.trim();
    const trimmedSci = scientificName.trim();
    if (!trimmedName || !trimmedSci) {
      setSubmitError("Please enter plant name and scientific name.");
      return;
    }

    const harvestParsed = harvestDaysRaw.trim();
    let harvest_frequency_days: number | null = null;
    if (harvestParsed !== "") {
      const n = Number(harvestParsed);
      if (!Number.isFinite(n) || n < 0) {
        setSubmitError("Harvest frequency must be a non-negative number or left blank.");
        return;
      }
      harvest_frequency_days = n;
    }

    const body: PlantCreateBody = {
      nickname: trimmedName,
      scientific_name: trimmedSci,
      pet_friendly: petFriendly,
      lighting: lightNeeds,
      watering_frequency_days: wateringDays,
      harvest_frequency_days,
      notes: notes.trim() === "" ? null : notes.trim(),
    };

    setSubmitting(true);
    try {
      if (editingPlant) {
        await updatePlant(editingPlant.id, body);
      } else {
        await createPlant(body);
      }
      hideModal();
      await onSaved();
    } catch (error) {
      console.error("Error saving plant:", error);
      const fallback =
        "Could not save plant. Check the backend is running and try again.";
      let message =
        error instanceof Error && error.message.trim() ? error.message : fallback;

      const isNetworkError =
        (error instanceof TypeError &&
          (error.message === "Failed to fetch" ||
            error.message.includes("fetch"))) ||
        (error instanceof Error && error.message === "Load failed");

      if (isNetworkError) {
        message =
          "Could not reach the API at http://127.0.0.1:8000. Start the FastAPI server, " +
          "or open the browser devtools Network tab and look for a CORS or connection error.";
      }

      setSubmitError(message.length > 500 ? `${message.slice(0, 500)}…` : message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="plant-dialog-shell"
      aria-labelledby="add-plant-title"
      onClose={onDialogNativeClose}
      onCancel={(e) => {
        e.preventDefault();
        hideModal();
      }}
    >
      <div
        className="modal-backdrop modal-backdrop-dialog"
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) hideModal();
        }}
      >
        <div className="plant-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header-title">
              <h2 id="add-plant-title">
                {editingPlant ? "Edit Plant" : "Enter Plant Details"}
              </h2>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={hideModal}
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>

          <form className="modal-form" onSubmit={handlePlantFormSubmit}>
            {submitError ? (
              <p className="modal-form-error" role="alert">
                {submitError}
              </p>
            ) : null}

            <label>
              Plant Name
              <input
                type="text"
                placeholder="e.g. Golden Pothos"
                value={plantName}
                onChange={(ev) => setPlantName(ev.target.value)}
              />
            </label>

            <label>
              Scientific Name
              <input
                type="text"
                placeholder="Scientific name"
                value={scientificName}
                onChange={(ev) => setScientificName(ev.target.value)}
              />
            </label>

            <div className="form-row">
              <label>
                Watering (days)
                <input
                  type="number"
                  min={1}
                  value={wateringDays}
                  onChange={(ev) => {
                    const raw = ev.target.valueAsNumber;
                    if (Number.isNaN(raw) || raw < 1) setWateringDays(1);
                    else setWateringDays(Math.floor(raw));
                  }}
                />
              </label>

              <label>
                Light Needs
                <select
                  value={lightNeeds}
                  onChange={(ev) => setLightNeeds(ev.target.value)}
                >
                  {LIGHTING_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label>
              Harvest Frequency (days, optional)
              <input
                type="number"
                min={0}
                placeholder="Leave blank if not applicable"
                value={harvestDaysRaw}
                onChange={(ev) => setHarvestDaysRaw(ev.target.value)}
              />
            </label>

            <div className="pet-card pet-card-compact">
              <strong>Pet Friendly</strong>
              <label className="switch">
                <input
                  type="checkbox"
                  aria-label="Pet friendly"
                  checked={petFriendly}
                  onChange={(ev) => setPetFriendly(ev.target.checked)}
                />
                <span></span>
              </label>
            </div>

            <label>
              Notes
              <textarea
                placeholder="Special care notes..."
                value={notes}
                onChange={(ev) => setNotes(ev.target.value)}
              />
            </label>

            <div className="modal-actions">
              <button
                type="button"
                className="secondary-button"
                disabled={submitting}
                onClick={hideModal}
              >
                Back
              </button>

              <button type="submit" className="save-button" disabled={submitting}>
                {submitting ? "Saving…" : editingPlant ? "Save Changes" : "Create Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  );
}

export default AddPlantModal;
