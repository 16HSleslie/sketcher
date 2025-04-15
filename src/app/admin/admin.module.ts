import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AdminRoutingModule } from './admin-routing.module';
import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AdminLoginComponent } from './components/login/login.component';
import { AdminProductsComponent } from './components/products/products.component';
import { AdminOrdersComponent } from './components/orders/orders.component';

@NgModule({
  declarations: [
    AdminDashboardComponent,
    AdminLoginComponent,
    AdminProductsComponent,
    AdminOrdersComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AdminRoutingModule
  ]
})
export class AdminModule { } 