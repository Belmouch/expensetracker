import { Injectable } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly storageKey = 'expense-tracker-theme';

  private currentTheme: Theme = 'light';

  constructor() {
    this.loadTheme();
  }

  // ==========================================
  // LOAD SAVED THEME
  // ==========================================

  private loadTheme(): void {

    const savedTheme =
      localStorage.getItem(this.storageKey);

    if (
      savedTheme === 'dark' ||
      savedTheme === 'light'
    ) {

      this.currentTheme = savedTheme;

    } else {

      this.currentTheme = 'light';

    }

    this.applyTheme();
  }


  // ==========================================
  // APPLY THEME
  // ==========================================

  private applyTheme(): void {

    const body = document.body;

    body.classList.remove(
      'light-theme',
      'dark-theme'
    );

    body.classList.add(
      `${this.currentTheme}-theme`
    );
  }


  // ==========================================
  // TOGGLE THEME
  // ==========================================

  toggleTheme(): void {

    this.currentTheme =
      this.currentTheme === 'light'
        ? 'dark'
        : 'light';

    localStorage.setItem(
      this.storageKey,
      this.currentTheme
    );

    this.applyTheme();
  }


  // ==========================================
  // GET CURRENT THEME
  // ==========================================

  getTheme(): Theme {

    return this.currentTheme;
  }


  // ==========================================
  // CHECK DARK
  // ==========================================

  isDark(): boolean {

    return this.currentTheme === 'dark';
  }

}