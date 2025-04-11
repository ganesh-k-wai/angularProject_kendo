import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LeadMgtComponent } from './lead-mgt/lead-mgt.component';

export const routes: Routes = [
  { path: '', component: LeadMgtComponent }, // Redirect to home component
];
