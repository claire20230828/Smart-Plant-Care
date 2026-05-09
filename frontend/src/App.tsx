import "./App.css";
import { useEffect, useState } from "react";

type Plant = {
  id: number;
  nickname: string;
  common_name: string;
  scientific_name: string;
  watering_frequency_days: number;
};

function App() {
  const [plants, setPlants] = useState<Plant[]>([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/plants")
      .then((response) => response.json())
      .then((data) => {
        setPlants(data);
      })
      .catch((error) => {
        console.error("Error fetching plants:", error);
      });
  }, []);

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
                {/* <span className={`status-pill ${plant.status}`}> */}
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
  );
}

export default App;