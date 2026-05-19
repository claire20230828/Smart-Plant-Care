import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import "../App.css";

const API_BASE = "http://127.0.0.1:8000";

type Plant = {
  id: number;
  nickname: string;
  common_name: string;
  scientific_name: string;
  pet_friendly: boolean;
  lighting: string;
  watering_frequency_days: number;
  harvest_frequency_days: number | null;
  notes?: string | null;
};

type PlantCreateBody = {
  nickname: string;
  common_name: string;
  scientific_name: string;
  pet_friendly: boolean;
  lighting: string;
  watering_frequency_days: number;
  harvest_frequency_days: number | null;
  notes: string | null;
};

function DashboardPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const addPlantDialogRef = useRef<HTMLDialogElement>(null);

  const [plantName, setPlantName] = useState("");
  const [scientificName, setScientificName] = useState("");
  const [wateringDays, setWateringDays] = useState(7);
  const [lightNeeds, setLightNeeds] = useState("Medium");
  const [harvestDaysRaw, setHarvestDaysRaw] = useState("");
  const [petFriendly, setPetFriendly] = useState(false);
  const [notes, setNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /** Opens the Add Plant overlay from the dashboard header. */
  function showAddPlantModal() {
    setAddPlantModalOpen(true);
  }

  /** Closes the overlay (backdrop, ×, Back, or after save later). */
  function hideAddPlantModal() {
    setAddPlantModalOpen(false);
  }

  const fetchPlants = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/plants`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data: Plant[] = await response.json();
      setPlants(data);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  }, []);

  useEffect(() => {
    void fetchPlants();
  }, [fetchPlants]);

  useEffect(() => {
    if (!addPlantModalOpen) return;
    setPlantName("");
    setScientificName("");
    setWateringDays(7);
    setLightNeeds("Medium");
    setHarvestDaysRaw("");
    setPetFriendly(false);
    setNotes("");
    setSubmitError(null);
  }, [addPlantModalOpen]);

  useEffect(() => {
    const dialog = addPlantDialogRef.current;
    if (!dialog) return;

    try {
      if (addPlantModalOpen && !dialog.open) dialog.showModal();
      else if (!addPlantModalOpen && dialog.open) dialog.close();
    } catch {
      /* showModal twice in Strict Mode — ignore */
    }
  }, [addPlantModalOpen]);

  function onAddPlantDialogClose() {
    setAddPlantModalOpen(false);
  }

  async function handleCreatePlantSubmit(e: FormEvent<HTMLFormElement>) {
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
      common_name: trimmedName,
      scientific_name: trimmedSci,
      pet_friendly: petFriendly,
      lighting: lightNeeds,
      watering_frequency_days: wateringDays,
      harvest_frequency_days,
      notes: notes.trim() === "" ? null : notes.trim(),
    };

    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/plants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const detail = await response.text();
        throw new Error(detail || `HTTP ${response.status}`);
      }
      hideAddPlantModal();
      await fetchPlants();
    } catch (error) {
      console.error("Error creating plant:", error);
      setSubmitError("Could not save plant. Check the backend is running and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Smart Plant Care</p>
          <h1>PlantMind Dashboard</h1>
          <p className="subtitle">
            Track watering, harvesting, and plant health observations.
          </p>
        </div>

        <button className="add-button" onClick={showAddPlantModal} type="button">
            + Add Plant
        </button>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <h2>{plants.length}</h2>
          <p>Total Plants</p>
        </div>

        <div className="summary-card warning">
          <h2>1</h2>
          <p>Water Today</p>
        </div>

        <div className="summary-card danger">
          <h2>1</h2>
          <p>Overdue</p>
        </div>

        <div className="summary-card">
          <h2>2</h2>
          <p>Monitoring</p>
        </div>
      </section>

      <section className="content-grid">
        <div className="panel">
          <h2>Upcoming Watering</h2>

          <div className="plant-list">
            {plants.map((plant) => (
              <div className="plant-row" key={plant.id}>
                <div>
                  <h3>{plant.nickname}</h3>
                  <p>{plant.scientific_name}</p>
                </div>

                <span className="status-pill">
                  Water every {plant.watering_frequency_days} days
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel observation">
          <h2>Active Observation</h2>

          <span className="severity">Moderate</span>

          <h3>Yellowing Leaves</h3>
          <p className="plant-name">Monstera Deliciosa</p>

          <p className="description">
            Lower leaves are turning yellow. Possible causes include
            overwatering, poor drainage, or lack of sunlight.
          </p>

          <div className="progress-text">
            <span>Observation Progress</span>
            <span>Day 5 / 14</span>
          </div>

          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
        </div>
      </section>
    </main>

    <dialog
      ref={addPlantDialogRef}
      className="plant-dialog-shell"
      aria-labelledby="add-plant-title"
      onClose={onAddPlantDialogClose}
      onCancel={(e) => {
        e.preventDefault();
        hideAddPlantModal();
      }}
    >
      <div
        className="modal-backdrop modal-backdrop-dialog"
        role="presentation"
        onClick={(event) => {
          if (event.target === event.currentTarget) hideAddPlantModal();
        }}
      >
        <div className="plant-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-header-title">
              <h2 id="add-plant-title">Enter Plant Details</h2>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={hideAddPlantModal}
              aria-label="Close dialog"
            >
              ×
            </button>
          </div>

          <form className="modal-form" onSubmit={handleCreatePlantSubmit}>
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
                  <option>Low</option>
                  <option>Medium</option>
                  <option>Bright indirect</option>
                  <option>Full sun</option>
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
                onClick={hideAddPlantModal}
              >
                Back
              </button>

              <button type="submit" className="save-button" disabled={submitting}>
                {submitting ? "Saving…" : "Create Profile"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </dialog>
  </>
  );
}

export default DashboardPage;