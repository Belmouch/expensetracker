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

  readonly categories$ = this.categoriesSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

  getCategories(forceRefresh = false): Observable<Category[]> {
    if (!forceRefresh && this.loaded) {
      return this.categories$;
    }

    if (!this.loading) {
      this.loading = true;
      this.http.get<Category[]>(this.api).pipe(
        map(categories => this.withOther(categories || [])),
        tap(categories => {
          this.loaded = true;
          this.loading = false;
          this.categoriesSubject.next(categories);
        })
      ).subscribe({ error: () => undefined });
    }

    return this.categories$;
  }

  createCategory(name: string): Observable<Category> {
    const trimmedName = name.trim();
    const existing = this.categoriesSubject.value.find(category =>
      category.name.toLowerCase() === trimmedName.toLowerCase()
    );

    if (existing) {
      return of(existing);
    }

    return this.http.post<Category>(this.api, { name: trimmedName }).pipe(
      tap(category => {
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
}
