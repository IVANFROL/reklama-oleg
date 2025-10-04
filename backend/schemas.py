from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(UserBase):
    id: int
    balance: float
    is_active: bool
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)

class UserBalance(BaseModel):
    balance: float

# Ad schemas
class AdBase(BaseModel):
    title: str
    description: str
    reward_amount: float
    image_url: Optional[str] = None

class AdCreate(AdBase):
    pass

class Ad(AdBase):
    id: int
    is_active: bool
    image_url: Optional[str] = None
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)

# AdView schemas
class AdViewCreate(BaseModel):
    ad_id: int

class AdView(BaseModel):
    id: int
    user_id: int
    ad_id: int
    viewed_at: str
    reward_earned: float
    
    model_config = ConfigDict(from_attributes=True)

# Application schemas
class ApplicationBase(BaseModel):
    title: str
    description: str
    photo_url: Optional[str] = None
    video_url: Optional[str] = None

class ApplicationCreate(ApplicationBase):
    pass

class Application(ApplicationBase):
    id: int
    user_id: int
    status: str
    cost: float
    photo_url: Optional[str] = None
    video_url: Optional[str] = None
    created_at: str
    
    model_config = ConfigDict(from_attributes=True)

class ApplicationUpdate(BaseModel):
    status: str

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
