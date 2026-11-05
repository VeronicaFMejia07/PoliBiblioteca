import os
from typing import Optional

from fastapi import Depends, FastAPI
from pydantic import BaseModel, ConfigDict
from sqlalchemy import String, create_engine, select
from sqlalchemy.orm import (
    DeclarativeBase, Mapped, Session, mapped_column, sessionmaker,
)

DB_PATH = os.getenv("DB_PATH", "./books.db")
os.makedirs(os.path.dirname(os.path.abspath(DB_PATH)), exist_ok=True)

engine = create_engine(
    f"sqlite:///{DB_PATH}",
    connect_args={"check_same_thread": False},
)
SessionLocal = sessionmaker(bind=engine, autoflush=False)


class Base(DeclarativeBase):
    pass


class Book(Base):
    __tablename__ = "books"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    author: Mapped[str] = mapped_column(String, nullable=False)
    year: Mapped[Optional[int]] = mapped_column(nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String, nullable=True)


Base.metadata.create_all(engine)  # crea la tabla si no existe

app = FastAPI(title="API de libros")


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class BookIn(BaseModel):
    title: str
    author: str
    year: Optional[int] = None
    gender: Optional[str] = None


class BookOut(BookIn):
    model_config = ConfigDict(from_attributes=True)
    id: int


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/books", response_model=list[BookOut])
def list_books(db: Session = Depends(get_db)):
    return db.scalars(select(Book).order_by(Book.id.desc())).all()


@app.post("/api/books", response_model=BookOut, status_code=201)
def create_book(book: BookIn, db: Session = Depends(get_db)):
    nuevo = Book(**book.model_dump())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo