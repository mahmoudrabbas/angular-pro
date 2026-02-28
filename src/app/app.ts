import { Component, signal } from '@angular/core';
import { NavbarComponent } from './components/navbar/navbar';
import { CarouselComponent } from './components/carousel/carousel';
import { ServicesComponent } from './components/services/services.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { FooterComponent } from './components/footer/footer';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    NavbarComponent,
    CarouselComponent,
    ProductListComponent,
    ServicesComponent,
    FooterComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('E-commerece-project');
}
