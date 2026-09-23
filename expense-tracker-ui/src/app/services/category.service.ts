import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, map, of, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly api = `${environment.apiUrl}/categories`;
  private readonly categoriesSubject = new BehaviorSubject<Category[]>([]);
  private loaded = false;
  private loading = false;
  private loadedUser = '';
  private loadingUser = '';

  readonly categories$ = this.categoriesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getCategories(forceRefresh = false): Observable<Category[]> {
    const currentUser = this.getAuthenticatedUser();

    if (this.loadedUser !== currentUser) {
      this.resetState(currentUser);
    }

    if (!currentUser) {
      return this.categories$;
    }

    if (!forceRefresh && this.loaded && this.loadedUser === currentUser) {
      return this.categories$;
    }

    if (!this.loading || this.loadingUser !== currentUser) {
      this.loading = true;
      this.loadingUser = currentUser;
      this.http.get<Category[]>(this.api).pipe(
        map(categories => this.withOther(categories || [])),
        tap(categories => {
          if (this.getAuthenticatedUser() !== currentUser) {
            return;
          }

          this.loaded = true;
          this.loading = false;
          this.loadedUser = currentUser;
          this.categoriesSubject.next(categories);
        })
      ).subscribe({
        error: () => {
          if (this.loadingUser === currentUser) {
            this.loading = false;
          }
        }
      });
    }

    return this.categories$;
  }

  createCategory(name: string): Observable<Category> {
    const trimmedName = name.trim();
    const currentUser = this.getAuthenticatedUser();

    if (!currentUser) {
      return of({ id: null, name: trimmedName });
    }

    if (this.loadedUser !== currentUser) {
      this.resetState(currentUser);
    }

    const existing = this.categoriesSubject.value.find(category =>
      category.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      return of(existing);
    }

    return this.http.post<Category>(this.api, { name: trimmedName }).pipe(
      tap(category => {
        if (this.getAuthenticatedUser() !== currentUser) {
          return;
        }

        this.categoriesSubject.next(this.withOther([
          ...this.categoriesSubject.value.filter(item => item.name !== 'Other'),
          category
        ]));
      })
    );
  }

  private withOther(categories: Category[]): Category[] {
    const unique = new Map<string, Category>();

    categories
      .filter(category => category.name.trim().toLowerCase() !== 'other')
      .forEach(category => unique.set(category.name.trim().toLowerCase(), {
        id: category.id,
        name: category.name.trim()
      }));

    return [...unique.values(), { id: null, name: 'Other' }];
  }

  clearCache(): void {
    this.resetState('');
  }

  private resetState(user: string): void {
    this.loaded = false;
    this.loading = false;
    this.loadedUser = user;
    this.loadingUser = '';
    this.categoriesSubject.next([]);
  }

  private getAuthenticatedUser(): string {
    if (typeof localStorage === 'undefined') {
      return '';
    }

    const token = localStorage.getItem('token');
    if (!token) {
      return '';
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return String(payload.sub || payload.username || '');
    } catch {
      return '';
    }
  }
}
