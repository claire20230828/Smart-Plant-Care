from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class PlantCreate(BaseModel):
    nickname: str
    common_name: str
    scientific_name: str
    pet_friendly: bool
    lighting: str
    watering_frequency_days: int
    harvest_frequency_days: int | None = None
    notes: str | None = None


plants = [
    {
        "id": 1,
        "nickname": "Sweet Basil",
        "common_name": "Basil",
        "scientific_name": "Ocimum basilicum",
        "pet_friendly": True,
        "lighting": "Full sun",
        "watering_frequency_days": 2,
        "harvest_frequency_days": 7,
        "notes": "Keep soil slightly moist and harvest leaves regularly.",
    },
    {
        "id": 2,
        "nickname": "Peace Lily",
        "common_name": "Peace Lily",
        "scientific_name": "Spathiphyllum wallisii",
        "pet_friendly": False,
        "lighting": "Medium indirect light",
        "watering_frequency_days": 5,
        "harvest_frequency_days": None,
        "notes": "Leaves may droop when thirsty.",
    },
]


@router.get("/plants")
def get_plants():
    return plants


@router.post("/plants")
def create_plant(plant: PlantCreate):
    new_plant = plant.model_dump()
    new_plant["id"] = len(plants) + 1

    plants.append(new_plant)

    return new_plant