import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private authService = inject(AuthService);

  async ngOnInit() {
    if (this.authService.isAuthenticated() && !this.authService.getUserData()) {
      await this.authService.loadUserData();
    }
  }
}
