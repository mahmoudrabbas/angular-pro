import { Component } from '@angular/core';
import { CarouselComponent } from '../carousel/carousel';
import { ServicesComponent } from '../services/services.component';
import { ProductListComponent } from '../product-list/product-list.component';
@Component({
  selector: 'app-home',
  imports: [CarouselComponent, ServicesComponent, ProductListComponent],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
