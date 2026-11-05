import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Libro {
  id?: number;
  title: string;
  author: string;
  year?: number | null;
  gender?: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './app.html',
})
export class App implements OnInit {
  libros: Libro[] = [];
  libro: Libro = { title: '', author: '', year: null, gender: '' };
  mensaje = '';
  error = false;

  // Ruta relativa: Nginx la redirige a http://api:8000
  private apiUrl = '/api/books';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.http.get<Libro[]>(this.apiUrl).subscribe({
      next: (data) => (this.libros = data),
      error: () => this.mostrar('No se pudo cargar la lista', true),
    });
  }

  guardar() {
    this.http.post<Libro>(this.apiUrl, this.libro).subscribe({
      next: () => {
        this.mostrar('Libro registrado ✅', false);
        this.libro = { title: '', author: '', year: null, gender: '' };
        this.cargar();
      },
      error: () => this.mostrar('Error al guardar el libro', true),
    });
  }

  private mostrar(msg: string, esError: boolean) {
    this.mensaje = msg;
    this.error = esError;
  }
}
