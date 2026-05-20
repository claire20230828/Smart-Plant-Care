const API_BASE = "http://127.0.0.1:8000";

export type Plant = {
  id: number;
  nickname: string;
  scientific_name: string;
  pet_friendly: boolean;
  lighting: string;
  watering_frequency_days: number;
  harvest_frequency_days: number | null;
  notes?: string | null;
  /** ISO date YYYY-MM-DD — day the plant was added */
  created_at: string;
  /** ISO date YYYY-MM-DD — last time watering was confirmed */
  last_watered_at: string;
};

export type PlantCreateBody = {
  nickname: string;
  scientific_name: string;
  pet_friendly: boolean;
  lighting: string;
  watering_frequency_days: number;
  harvest_frequency_days: number | null;
  notes: string | null;
};

export async function fetchPlants(): Promise<Plant[]> {
  const response = await fetch(`${API_BASE}/plants`);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

export async function createPlant(body: PlantCreateBody): Promise<Plant> {
  const response = await fetch(`${API_BASE}/plants`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function updatePlant(
  id: number,
  body: PlantCreateBody,
): Promise<Plant> {
  const response = await fetch(`${API_BASE}/plants/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return response.json();
}

export async function deletePlant(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/plants/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
}

export async function recordWatering(plantId: number): Promise<Plant> {
  const response = await fetch(`${API_BASE}/plants/${plantId}/record-watering`, {
    method: "POST",
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `HTTP ${response.status}`);
  }
  return response.json();
}
