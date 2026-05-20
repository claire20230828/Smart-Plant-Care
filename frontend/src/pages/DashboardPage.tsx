import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import AddPlantModal from "../components/AddPlantModal";
import { fetchPlants, recordWatering, type Plant } from "../api/plants";
import {
  daysUntilWateringDue,
  isInUpcomingWateringWindow,
  wateringBadgeLabel,
} from "../lib/wateringSchedule";

function thumbPlaceholderStyle(plantId: number): CSSProperties {
  const hue = ((plantId * 47) % 360) + 80;
  return {
    background: `linear-gradient(145deg, hsl(${hue}, 28%, 88%) 0%, hsl(${hue}, 35%, 72%) 100%)`,
  };
}

function DashboardPage() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [addPlantModalOpen, setAddPlantModalOpen] = useState(false);
  const [editingPlant, setEditingPlant] = useState<Plant | null>(null);
  const [recordingWaterForId, setRecordingWaterForId] = useState<number | null>(null);

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

  const upcomingEntries = useMemo(() => {
    const rows = plants.map((plant) => {
      const last = plant.last_watered_at ?? plant.created_at;
      const daysUntil = daysUntilWateringDue(last, plant.watering_frequency_days);
      return { plant, daysUntil };
    });
    return rows
      .filter(({ daysUntil }) => isInUpcomingWateringWindow(daysUntil))
      .sort((a, b) => a.daysUntil - b.daysUntil);
  }, [plants]);

  const overdueCount = useMemo(
    () =>
      plants.filter((p) => {
        const last = p.last_watered_at ?? p.created_at;
        return daysUntilWateringDue(last, p.watering_frequency_days) < 0;
      }).length,
    [plants],
  );

  async function handleConfirmWatering(plant: Plant) {
    setRecordingWaterForId(plant.id);
    try {
      await recordWatering(plant.id);
      await refreshPlants();
    } catch (error) {
      console.error("Error recording watering:", error);
    } finally {
      setRecordingWaterForId(null);
    }
  }

  function statusPillClass(kind: "overdue" | "today" | "tomorrow"): string {
    if (kind === "overdue") return "dash-pill-status dash-pill-status--overdue";
    if (kind === "today") return "dash-pill-status dash-pill-status--today";
    return "dash-pill-status dash-pill-status--tomorrow";
  }

  return (
    <>
      <main className="app app-dashboard">
        <header className="header">
          <div>
            <p className="eyebrow">Smart Plant Care</p>
            <h1 className="dash-main-title">PlantMind Dashboard</h1>
            <p className="subtitle">
              Track watering, harvesting, and plant health observations.
            </p>
            <p className="dash-today-date">{todayLabel}</p>
          </div>

          <button className="add-button" onClick={showAddPlantModal} type="button">
            + Add Plant
          </button>
        </header>

        <section className="dash-stat-section" aria-label="Summary statistics">
          <div className="dash-stat-grid">
            <Link className="dash-stat-card dash-stat-card--link dash-stat-total" to="/plants">
              <div className="dash-stat-icon dash-stat-icon--green" aria-hidden>
                🌿
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-value">{plants.length}</span>
                <span className="dash-stat-label">Total Plants</span>
              </div>
            </Link>

            <div className="dash-stat-card dash-stat-overdue">
              <div className="dash-stat-icon dash-stat-icon--red" aria-hidden>
                💧
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-value">{overdueCount}</span>
                <span className="dash-stat-label">Overdue Water</span>
              </div>
            </div>

            <div className="dash-stat-card dash-stat-monitoring">
              <div className="dash-stat-icon dash-stat-icon--blue" aria-hidden>
                👁
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-value">2</span>
                <span className="dash-stat-label">Monitoring</span>
              </div>
            </div>

            <div className="dash-stat-card dash-stat-alerts">
              <div className="dash-stat-icon dash-stat-icon--amber" aria-hidden>
                ⚠️
              </div>
              <div className="dash-stat-body">
                <span className="dash-stat-value">1</span>
                <span className="dash-stat-label">Critical Alerts</span>
              </div>
            </div>
          </div>
        </section>

        <section className="content-grid dash-content-grid">
          <div className="panel panel-upcoming">
            <h2 className="panel-title-dash">
              <span className="panel-title-dash-icon" aria-hidden>
                💧
              </span>
              Upcoming Watering
            </h2>

            <div className="dash-plant-list">
              {upcomingEntries.length === 0 ? (
                <p className="dash-upcoming-empty">
                  Nothing due today, overdue, or within one day. You’re all caught up for now.
                </p>
              ) : null}
              {upcomingEntries.map(({ plant, daysUntil }) => {
                const badge = wateringBadgeLabel(daysUntil);
                if (!badge) return null;
                const busy = recordingWaterForId === plant.id;
                return (
                  <div className="dashboard-plant-row" key={plant.id}>
                    <div
                      className="dashboard-plant-thumb"
                      style={thumbPlaceholderStyle(plant.id)}
                      aria-hidden
                    />
                    <div className="dashboard-plant-text">
                      <h3 className="dashboard-plant-name">{plant.nickname}</h3>
                      <p className="dashboard-plant-sci">{plant.scientific_name}</p>
                    </div>
                    <div className="dashboard-plant-pills">
                      <span className={statusPillClass(badge.kind)}>
                        <span aria-hidden>💧</span> {badge.label}
                      </span>
                      <button
                        type="button"
                        className="dash-watering-log-btn"
                        disabled={busy}
                        onClick={() => void handleConfirmWatering(plant)}
                      >
                        {busy ? "Saving…" : "Log watering"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel observation observation-panel-dash">
            <h2 className="panel-title-dash panel-title-dash--obs">Active Observation</h2>

            <span className="severity">Moderate</span>

            <h3 className="observation-issue-title">Yellowing Leaves</h3>
            <p className="plant-name">Monstera Deliciosa</p>

            <p className="description">
              Lower leaves are turning yellow. Possible causes include overwatering, poor drainage,
              or lack of sunlight.
            </p>

            <div className="progress-text">
              <span className="progress-caption">Observation Progress</span>
              <span className="progress-caption">Day 5 / 14</span>
            </div>

            <div className="progress-bar">
              <div className="progress-fill"></div>
            </div>
          </div>
        </section>
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

export default DashboardPage;
