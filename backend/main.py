from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Smart Plant Care API is running"}

@app.get("/health")
def health_check():
    return {"status": "ok"}