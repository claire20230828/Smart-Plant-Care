from datetime import date, timedelta

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()


def _today_iso() -> str:
    return date.today().isoformat()


class PlantCreate(BaseModel):
    nickname: str
    scientific_name: str
    pet_friendly: bool
    lighting: str
    watering_frequency_days: int
    harvest_frequency_days: int | None = None
    notes: str | None = None


_today = date.today()

plants = [
    {
        "id": 1,
        "nickname": "Sweet Basil",
        "scientific_name": "Ocimum basilicum",
        "pet_friendly": True,
        "lighting": "Full sun",
        "watering_frequency_days": 2,
        "harvest_frequency_days": 7,
        "notes": "Keep soil slightly moist and harvest leaves regularly.",
        "created_at": (_today - timedelta(days=14)).isoformat(),
        # next due = last + 2 = today - 3 → 3d overdue
        "last_watered_at": (_today - timedelta(days=5)).isoformat(),
    },
    {
        "id": 2,
        "nickname": "Peace Lily",
        "scientific_name": "Spathiphyllum wallisii",
        "pet_friendly": False,
        "lighting": "Medium indirect light",
        "watering_frequency_days": 5,
        "harvest_frequency_days": None,
        "notes": "Leaves may droop when thirsty.",
        "created_at": (_today - timedelta(days=30)).isoformat(),
        # last + 5 = today → due today
        "last_watered_at": (_today - timedelta(days=5)).isoformat(),
    },
    {
        "id": ˇ,
        "nickname": "snake plant,
        "scientific_name": "Dracaena trifasciata",
        "pet_friendly": False,
        "lighting": "Bright indirect light",
        "watering_frequency_days": 14,
        "harvest_frequency_days": None,
        "notes": "",
        "created_at": (_today - timedelta(days=30)).isoformat(),
        "last_watered_at": (_today - timedelta(days=5)).isoformat(),
    },
]


@router.get("/plants")
def get_plants():
    return plants


def _next_plant_id() -> int:
    return max((p["id"] for p in plants), default=0) + 1


@router.post("/plants")
def create_plant(plant: PlantCreate):
    new_plant = plant.model_dump()
    new_plant["id"] = _next_plant_id()
    today = _today_iso()
    new_plant["created_at"] = today
    new_plant["last_watered_at"] = today

    plants.append(new_plant)

    return new_plant


@router.put("/plants/{plant_id}")
def update_plant(plant_id: int, plant: PlantCreate):
    for existing in plants:
        if existing["id"] == plant_id:
            created = existing.get("created_at") or _today_iso()
            last_w = existing.get("last_watered_at", created)
            updated = plant.model_dump()
            updated["id"] = plant_id
            updated["created_at"] = created
            updated["last_watered_at"] = last_w
            existing.clear()
            existing.update(updated)
            return existing
    raise HTTPException(status_code=404, detail="Plant not found")


@router.post("/plants/{plant_id}/record-watering")
def record_watering(plant_id: int):
    for p in plants:
        if p["id"] == plant_id:
            p["last_watered_at"] = _today_iso()
            return p
    raise HTTPException(status_code=404, detail="Plant not found")


@router.delete("/plants/{plant_id}")
def delete_plant(plant_id: int):
    for i, existing in enumerate(plants):
        if existing["id"] == plant_id:
            return plants.pop(i)
    raise HTTPException(status_code=404, detail="Plant not found")