from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import Base, Ad

# Create tables
Base.metadata.create_all(bind=engine)

# Create sample ads
def create_sample_ads():
    db = SessionLocal()
    
    # Check if ads already exist
    existing_ads = db.query(Ad).count()
    if existing_ads > 0:
        print("Sample ads already exist")
        db.close()
        return
    
    sample_ads = [
        {
            "title": "Новый iPhone 15 Pro",
            "description": "Посмотрите обзор нового iPhone 15 Pro с улучшенной камерой и процессором A17 Pro. Узнайте о всех новых функциях и возможностях.",
            "reward_amount": 10.0,
            "image_url": "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop"
        },
        {
            "title": "Курс по программированию",
            "description": "Изучите основы программирования на Python за 30 дней. Интерактивные уроки, практические задания и сертификат по окончании.",
            "reward_amount": 15.0,
            "image_url": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop"
        },
        {
            "title": "Фитнес-приложение",
            "description": "Следите за своим здоровьем с нашим новым фитнес-приложением. Трекинг тренировок, питание и мотивация каждый день.",
            "reward_amount": 8.0,
            "image_url": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop"
        },
        {
            "title": "Инвестиции в криптовалюты",
            "description": "Узнайте, как правильно инвестировать в криптовалюты. Анализ рынка, стратегии и управление рисками от экспертов.",
            "reward_amount": 20.0,
            "image_url": "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=300&fit=crop"
        },
        {
            "title": "Онлайн-магазин модной одежды",
            "description": "Новая коллекция весенней одежды уже в продаже! Скидки до 50% на все товары. Бесплатная доставка по всей стране.",
            "reward_amount": 12.0,
            "image_url": "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop"
        }
    ]
    
    for ad_data in sample_ads:
        ad = Ad(**ad_data)
        db.add(ad)
    
    db.commit()
    print(f"Created {len(sample_ads)} sample ads")
    db.close()

if __name__ == "__main__":
    create_sample_ads()
