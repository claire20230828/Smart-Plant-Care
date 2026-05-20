import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import AddPlantModal from "../components/AddPlantModal";
import { fetchPlants, deletePlant, type Plant } from "../api/plants";

function tagsForPlant(plant: Plant): string[] {
  const tags = [plant.lighting];
  if (plant.harvest_frequency_days != null) {
    tags.push("Harvest");
  }
  return tags;
}

/** Placeholder visuals until per-plant photos exist; stable color from id. */
function placeholderStyle(plantId: number): CSSProperties {
  const hue = ((plantId * 47) % 360) + 80;
  return {
    background: `linear-gradient(145deg, hsl(${hue}, 28%, 88%) 0%, hsl(${hue}, 35%, 72%) 100%)`,
  };
}

function MyPlantsPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);

  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [],
  );

  function showAddPlantModal() {
    setEditingPlant(null);
    setAddPlantModalOpen(true);
  }

  function hideAddPlantModal() {
    setAddPlantModalOpen(false);
    setEditingPlant(null);
  }

  const refreshPlants = useCallback(async () => {
    try {
      const data = await fetchPlants();
      setPlants(data);
    } catch (error) {
      console.error("Error fetching plants:", error);
    }
  }, []);

  useEffect(() => {
    void refreshPlants();
  }, [refreshPlants]);

  function showEditPlantModal(plant: Plant) {
    setEditingPlant(plant);
    setAddPlantModalOpen(true);
  }

  async function handleDeletePlant(plant: Plant) {
    if (!window.confirm(`Delete "${plant.nickname}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deletePlant(plant.id);
      await refreshPlants();
    } catch (error) {
      console.error("Error deleting plant:", error);
    }
  }

  return (
    <>
      <main className="my-plants-page">
        <p className="my-plants-back">
          <Link to="/">← Dashboard</Link>
        </p>

        <header className="my-plants-header">
          <div>
            <h1 className="my-plants-title">My Plants</h1>
            <p className="my-plants-date">{todayLabel}</p>
          </div>
          <button className="add-button my-plants-add" type="button" onClick={showAddPlantModal}>
            + Add Plant
          </button>
        </header>

        <div className="my-plants-grid">
          {plants.map((plant) => (
            <article className="plant-card" key={plant.id}>
              <div className="plant-card-media">
                <div
                  className="plant-card-image-placeholder"
                  style={placeholderStyle(plant.id)}
                  aria-hidden
                />
                <span
                  className={`plant-card-badge ${plant.pet_friendly ? "safe" : "toxic"}`}
                >
                  {plant.pet_friendly ? "Pet Safe" : "Toxic to Pets"}
                </span>
              </div>
              <div className="plant-card-body">
                <h2 className="plant-card-name">{plant.nickname}</h2>
                <p className="plant-card-sci">{plant.scientific_name}</p>
                <ul className="plant-card-tags">
                  {tagsForPlant(plant).map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <div className="plant-card-care">
                  <div className="care-row">
                    <span className="care-label" aria-hidden>
                      💧
                    </span>
                    <span className="care-label-text">Watering</span>
                    <span className="care-value">Every {plant.watering_frequency_days} days</span>
                  </div>
                  {plant.harvest_frequency_days != null ? (
                    <div className="care-row">
                      <span className="care-label" aria-hidden>
                        ✂
                      </span>
                      <span className="care-label-text">Harvest</span>
                      <span className="care-value">
                        Every {plant.harvest_frequency_days} days
                      </span>
                    </div>
                  ) : null}
                </div>
                <div className="plant-card-actions">
                  <button type="button" className="plant-card-report">
                    <span aria-hidden>👁</span> Report Issue
                  </button>
                  <button
                    type="button"
                    className="plant-card-side-btn"
                    onClick={() => showEditPlantModal(plant)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="plant-card-side-btn plant-card-side-btn-danger"
                    onClick={() => void handleDeletePlant(plant)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}

          <button
            type="button"
            className="plant-card plant-card-add"
            onClick={showAddPlantModal}
          >
            <span className="plant-card-add-inner">
              <span className="plant-card-add-icon" aria-hidden>
                +
              </span>
              <span>Add Plant</span>
            </span>
          </button>
        </div>
      </main>

      <AddPlantModal
        open={addPlantModalOpen}
        editingPlant={editingPlant}
        onClose={hideAddPlantModal}
        onSaved={refreshPlants}
      />
    </>
  );
}

export default MyPlantsPage;
