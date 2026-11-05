import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

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
  imports: [FormsModule],
  templateUrl: './app.html',
})
export class App implements OnInit {
  libros = signal<Libro[]>([]);
  mensaje = signal('');
  error = signal(false);

  libro: Libro = { title: '', author: '', year: null, gender: '' };

  private apiUrl = '/api/books';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.cargar();
  }

  cargar() {
    this.http.get<Libro[]>(this.apiUrl).subscribe({
      next: (data) => this.libros.set(data),
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
    this.mensaje.set(msg);
    this.error.set(esError);
  }
}
