import {ChangeDetectionStrategy, Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-navbar></app-navbar>
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
      <footer class="mt-auto border-t border-teal-900/10 bg-white/70 backdrop-blur p-4 text-center text-slate-700">
        <p>&copy; 2026 Restaurant Menu and Ordering System</p>
      </footer>
    </div>
  `,
  styles: [],
})
export class App {}
