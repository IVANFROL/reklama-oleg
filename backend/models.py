from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey, Float
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    balance = Column(Float, default=0.0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    applications = relationship("Application", back_populates="user")
    ad_views = relationship("AdView", back_populates="user")

class Ad(Base):
    __tablename__ = "ads"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    description = Column(Text)
    reward_amount = Column(Float)
    image_url = Column(String, nullable=True)  # URL картинки
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    ad_views = relationship("AdView", back_populates="ad")

class AdView(Base):
    __tablename__ = "ad_views"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    ad_id = Column(Integer, ForeignKey("ads.id"))
    viewed_at = Column(DateTime, default=datetime.utcnow)
    reward_earned = Column(Float)
    
    user = relationship("User", back_populates="ad_views")
    ad = relationship("Ad", back_populates="ad_views")

class Application(Base):
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String, index=True)
    description = Column(Text)
    status = Column(String, default="pending")  # pending, approved, rejected
    cost = Column(Float, default=50.0)  # стоимость заявки в монетах
    photo_url = Column(String, nullable=True)  # ссылка на фото
    video_url = Column(String, nullable=True)  # ссылка на видео
    created_at = Column(DateTime, default=datetime.utcnow)
    
    user = relationship("User", back_populates="applications")
