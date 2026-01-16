import { Component, ViewEncapsulation } from '@angular/core';
import { DatabaseService } from './services/database.service';
import { AuthService } from './services/auth.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'SoLO Interactive Map';

  constructor(private db: DatabaseService, public auth: AuthService, private route: ActivatedRoute, private router: Router) {
    this.route.queryParamMap.subscribe(params => {
      if (params.has('token')) {
        const token = params.get('token');
        if (token) {
          this.auth.login(token);
          this.router.navigate(['/']);
        }
      }
      this.auth.checkLoggedIn().then(r => console.log(r));
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
