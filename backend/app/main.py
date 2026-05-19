from fastapi import FastAPI
from app.routes import plants
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(plants.router)

@app.get("/")
def root():
    return {"message": "Smart Plant Care API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
