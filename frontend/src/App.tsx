import "./App.css";

const plants = [
  {
    id: 1,
    nickname: "Kitchen Basil",
    common_name: "Basil",
    scientific_name: "Ocimum basilicum",
    pet_friendly: true,
    lighting: "Full Sun",
    watering_frequency_days: 2,
    harvest_frequency_days: 7,
    waterStatus: "Water today",
    status: "warning",
    notes: "Growing well near the kitchen window.",
    created_at: "2026-05-01",
    updated_at: "2026-05-05",
  },
  {
    id: 2,
    nickname: "Living Room Lily",
    common_name: "Peace Lily",
    scientific_name: "Spathiphyllum wallisii",
    pet_friendly: false,
    lighting: "Bright Indirect Light",
    watering_frequency_days: 3,
    harvest_frequency_days: null,
    waterStatus: "3 days overdue",
    status: "danger",
    notes: "Lower leaves recently started turning yellow.",
    created_at: "2026-04-20",
    updated_at: "2026-05-05",
  },
  {
    id: 3,
    nickname: "Bedroom Snake Plant",
    common_name: "Snake Plant",
    scientific_name: "Dracaena trifasciata",
    pet_friendly: false,
    lighting: "Low to Bright Indirect Light",
    watering_frequency_days: 14,
    harvest_frequency_days: null,
    waterStatus: "In 11 days",
    status: "good",
    notes: "Very drought tolerant and low maintenance.",
    created_at: "2026-03-15",
    updated_at: "2026-05-05",
  },
];

function App() {
  return (
    <main className="app">
      <header className="header">
        <div>
          <p className="eyebrow">Smart Plant Care</p>
          <h1>PlantMind Dashboard</h1>
          <p className="subtitle">
            Track watering, harvesting, and plant health observations.
          </p>
        </div>

        <button className="add-button">+ Add Plant</button>
      </header>

      <section className="summary-grid">
        <div className="summary-card">
          <h2>5</h2>
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
              <div className="plant-row" key={plant.nickname}>
                <div>
                  <h3>{plant.nickname}</h3>
                  <p>{plant.scientific_name}</p>
                </div>

                <span className={`status-pill ${plant.status}`}>
                  {plant.waterStatus}
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
  );
}

export default App;