import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AdminDashboardComponent } from './components/dashboard/dashboard.component';
import { AdminLoginComponent } from './components/login/login.component';
import { AdminProductsComponent } from './components/products/products.component';
import { AdminOrdersComponent } from './components/orders/orders.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { 
    path: 'admin', 
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'login', component: AdminLoginComponent },
      { 
        path: 'dashboard', 
        component: AdminDashboardComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'products', 
        component: AdminProductsComponent, 
        canActivate: [AuthGuard] 
      },
      { 
        path: 'orders', 
        component: AdminOrdersComponent, 
        canActivate: [AuthGuard] 
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 