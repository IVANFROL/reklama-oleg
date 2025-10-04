from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from datetime import timedelta, datetime
from typing import List
from pydantic import BaseModel
from typing import Optional
import json
import os
import uuid

from database import SessionLocal, engine, get_db
from models import Base, User, Ad, AdView, Application
from auth import (
    authenticate_user, create_access_token, get_current_user,
    get_password_hash, get_user
)
from config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

# Custom JSON encoder for datetime
class DateTimeEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.isoformat()
        return super().default(obj)

app = FastAPI(title="Corporate Website API", version="1.0.0")

# Create uploads directory
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://frontend:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple schemas
class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    balance: float
    is_active: bool
    created_at: str
    
    class Config:
        from_attributes = True

class AdResponse(BaseModel):
    id: int
    title: str
    description: str
    reward_amount: float
    image_url: Optional[str] = None
    is_active: bool
    created_at: str
    
    class Config:
        from_attributes = True

class AdViewCreate(BaseModel):
    ad_id: int

class AdViewResponse(BaseModel):
    id: int
    user_id: int
    ad_id: int
    viewed_at: str
    reward_earned: float
    
    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    title: str
    description: str
    photo_url: Optional[str] = None
    video_url: Optional[str] = None

class ApplicationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str
    status: str
    cost: float
    photo_url: Optional[str] = None
    video_url: Optional[str] = None
    created_at: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

# Auth endpoints
@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = get_user(db, username=user.username)
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Username already registered"
        )
    
    # Check if email already exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Create new user
    hashed_password = get_password_hash(user.password)
    db_user = User(
        email=user.email,
        username=user.username,
        hashed_password=hashed_password,
        balance=0.0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "username": current_user.username,
        "balance": current_user.balance,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else None
    }

@app.get("/balance")
def get_user_balance(current_user: User = Depends(get_current_user)):
    return {"balance": current_user.balance}

# Ad endpoints
@app.get("/ads", response_model=List[AdResponse])
def get_ads(db: Session = Depends(get_db)):
    ads = db.query(Ad).filter(Ad.is_active == True).all()
    # Convert datetime to string for each ad
    result = []
    for ad in ads:
        ad_dict = {
            "id": ad.id,
            "title": ad.title,
            "description": ad.description,
            "reward_amount": ad.reward_amount,
            "image_url": ad.image_url,
            "is_active": ad.is_active,
            "created_at": ad.created_at.isoformat() if ad.created_at else None
        }
        result.append(ad_dict)
    return result

@app.post("/ads/view", response_model=AdViewResponse)
def view_ad(ad_view: AdViewCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Get the ad
    ad = db.query(Ad).filter(Ad.id == ad_view.ad_id, Ad.is_active == True).first()
    if not ad:
        raise HTTPException(status_code=404, detail="Ad not found")
    
    # Check if user already viewed this ad today
    from datetime import date
    today = date.today()
    existing_view = db.query(AdView).filter(
        AdView.user_id == current_user.id,
        AdView.ad_id == ad_view.ad_id,
        AdView.viewed_at >= today
    ).first()
    
    if existing_view:
        raise HTTPException(status_code=400, detail="Ad already viewed today")
    
    # Create ad view record
    db_ad_view = AdView(
        user_id=current_user.id,
        ad_id=ad_view.ad_id,
        reward_earned=ad.reward_amount
    )
    db.add(db_ad_view)
    
    # Update user balance
    current_user.balance += ad.reward_amount
    db.commit()
    db.refresh(db_ad_view)
    
    return {
        "id": db_ad_view.id,
        "user_id": db_ad_view.user_id,
        "ad_id": db_ad_view.ad_id,
        "viewed_at": db_ad_view.viewed_at.isoformat() if db_ad_view.viewed_at else None,
        "reward_earned": db_ad_view.reward_earned
    }

# File upload endpoint
@app.post("/upload")
async def upload_file(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    # Check file type
    allowed_types = {
        'image': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'video': ['video/mp4', 'video/avi', 'video/mov', 'video/wmv', 'video/flv', 'video/webm']
    }
    
    file_type = None
    for type_name, mime_types in allowed_types.items():
        if file.content_type in mime_types:
            file_type = type_name
            break
    
    if not file_type:
        raise HTTPException(status_code=400, detail="Неподдерживаемый тип файла")
    
    # Generate unique filename
    file_extension = file.filename.split('.')[-1] if '.' in file.filename else ''
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    # Return file URL
    file_url = f"/uploads/{unique_filename}"
    return {
        "filename": unique_filename,
        "url": file_url,
        "type": file_type,
        "size": len(content)
    }

# Application endpoints
@app.get("/applications/cost")
def get_application_cost():
    return {"cost": 50.0, "message": "Стоимость отправки заявки: 50 монет"}
@app.post("/applications", response_model=ApplicationResponse)
def create_application(application: ApplicationCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Стоимость заявки
    application_cost = 50.0
    
    # Проверяем баланс пользователя
    if current_user.balance < application_cost:
        raise HTTPException(
            status_code=400, 
            detail=f"Недостаточно средств. Нужно {application_cost} монет, у вас {current_user.balance}"
        )
    
    # Создаем заявку
    db_application = Application(
        user_id=current_user.id,
        cost=application_cost,
        **application.dict()
    )
    
    # Списываем средства с баланса
    current_user.balance -= application_cost
    
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    
    return {
        "id": db_application.id,
        "user_id": db_application.user_id,
        "title": db_application.title,
        "description": db_application.description,
        "status": db_application.status,
        "cost": db_application.cost,
        "photo_url": db_application.photo_url,
        "video_url": db_application.video_url,
        "created_at": db_application.created_at.isoformat() if db_application.created_at else None
    }

@app.get("/applications", response_model=List[ApplicationResponse])
def get_user_applications(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    applications = db.query(Application).filter(Application.user_id == current_user.id).all()
    result = []
    for app in applications:
        result.append({
            "id": app.id,
            "user_id": app.user_id,
            "title": app.title,
            "description": app.description,
            "status": app.status,
            "cost": app.cost,
            "photo_url": app.photo_url,
            "video_url": app.video_url,
            "created_at": app.created_at.isoformat() if app.created_at else None
        })
    return result

@app.get("/admin/applications", response_model=List[ApplicationResponse])
def get_all_applications(db: Session = Depends(get_db)):
    applications = db.query(Application).all()
    result = []
    for app in applications:
        result.append({
            "id": app.id,
            "user_id": app.user_id,
            "title": app.title,
            "description": app.description,
            "status": app.status,
            "cost": app.cost if hasattr(app, 'cost') and app.cost is not None else 50.0,
            "photo_url": app.photo_url if hasattr(app, 'photo_url') else None,
            "video_url": app.video_url if hasattr(app, 'video_url') else None,
            "created_at": app.created_at.isoformat() if app.created_at else None
        })
    return result

@app.put("/admin/applications/{application_id}", response_model=ApplicationResponse)
def update_application_status(application_id: int, status_update: dict, db: Session = Depends(get_db)):
    application = db.query(Application).filter(Application.id == application_id).first()
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    application.status = status_update.get("status", application.status)
    db.commit()
    db.refresh(application)
    
    return {
        "id": application.id,
        "user_id": application.user_id,
        "title": application.title,
        "description": application.description,
        "status": application.status,
        "cost": application.cost if hasattr(application, 'cost') and application.cost is not None else 50.0,
        "photo_url": application.photo_url if hasattr(application, 'photo_url') else None,
        "video_url": application.video_url if hasattr(application, 'video_url') else None,
        "created_at": application.created_at.isoformat() if application.created_at else None
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
