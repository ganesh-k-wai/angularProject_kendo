import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { KENDO_CHARTS } from '@progress/kendo-angular-charts';
import { HomeComponent } from '../home/home.component';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';

import {
  DataBindingDirective,
  KENDO_GRID,
  KENDO_GRID_EXCEL_EXPORT,
  KENDO_GRID_PDF_EXPORT,
} from '@progress/kendo-angular-grid';
import { KENDO_INPUTS } from '@progress/kendo-angular-inputs';
import { process } from '@progress/kendo-data-query';
import { SVGIcon, fileExcelIcon, filePdfIcon } from '@progress/kendo-svg-icons';
import { employees } from './employees';
import { images } from './images';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../employee-service.service';

export interface Employee {
  id: string;
  full_name: string;
  job_title: string;
  country: string;
  is_online: boolean;
  rating: number;
  target: number;
  budget: number;
  phone: string;
  address: string;
  img_id: string;
  gender: string;
}
@Component({
  selector: 'app-lead-mgt',
  standalone: true,
  templateUrl: './lead-mgt.component.html',
  styleUrl: './lead-mgt.component.css',
  encapsulation: ViewEncapsulation.None,
  imports: [
    CommonModule,
    KENDO_GRID,
    KENDO_CHARTS,
    KENDO_INPUTS,
    KENDO_GRID_PDF_EXPORT,
    KENDO_GRID_EXCEL_EXPORT,
    HomeComponent,
    FormsModule,
    DropDownsModule,
  ],
})
export class LeadMgtComponent implements OnInit {
  @ViewChild(DataBindingDirective) dataBinding!: DataBindingDirective;
  public gridData: Employee[] = employees;
  public gridView: Employee[] = [];
  public mySelection: string[] = [];
  public pdfSVG: SVGIcon = filePdfIcon;
  public excelSVG: SVGIcon = fileExcelIcon;
  public large: string = 'large'; // Define the 'large' property

  public employees: any[] = [];
  constructor(private employeeService: EmployeeService) {}

  public ngOnInit(): void {
    this.gridView = this.gridData;
    this.loadEmployees();
  }
  // Load all employees
  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe((data) => {
      this.employees = data;
    });
  }

  // Add a new employee
  addEmployee(): void {
    console.log('Adding new employee...');
    const newEmployee = {
      full_name: 'New Employee',
      job_title: 'Developer',
      country: 'US',
      is_online: true,
      rating: 3,
      target: 50,
      budget: 40000,
      phone: '(555) 555-5555',
      address: '789 Pine St',
      img_id: '3',
      gender: 'M',
    };
    this.employeeService.addEmployee(newEmployee).subscribe(() => {
      this.loadEmployees();
    });
  }

  // Delete an employee
  deleteEmployee(id: string): void {
    this.employeeService.deleteEmployee(id).subscribe(() => {
      this.loadEmployees();
    });
  }

  public onFilter(value: Event): void {
    if (!this.gridData || this.gridData.length === 0) {
      return;
    }

    this.gridView = process(this.gridData, {
      filter: {
        logic: 'or',
        filters: [
          {
            field: 'full_name',
            operator: 'contains',
            value,
          },
          {
            field: 'job_title',
            operator: 'contains',
            value,
          },
          {
            field: 'budget',
            operator: 'contains',
            value,
          },
          {
            field: 'phone',
            operator: 'contains',
            value,
          },
          {
            field: 'address',
            operator: 'contains',
            value,
          },
        ],
      },
    }).data;

    this.dataBinding.skip = 0;
  }

  public photoURL(dataItem: { img_id: string; gender: string }): string {
    const code: string = dataItem.img_id + dataItem.gender;
    const image: { [Key: string]: string } = images;

    return image[code];
  }

  public flagURL(dataItem: { country: string }): string {
    const code: string = dataItem.country;
    const image: { [Key: string]: string } = images;

    return image[code];
  }

  // --------------
  // refreshGrid: any = []

  public onEdit(dataItem: Employee): void {
    console.log('Edit clicked for:', dataItem);
    // Add your edit logic here
    const updatedJobTitle = prompt('Enter new job title:', dataItem.job_title);
    if (updatedJobTitle) {
      const employeeIndex = this.gridData.findIndex(
        (emp) => emp.id === dataItem.id
      );
      if (employeeIndex !== -1) {
        this.gridData[employeeIndex].job_title = updatedJobTitle;
        this.refreshGrid();
        console.log('Employee updated:', this.gridData[employeeIndex]);
      }
    }
  }

  public onDelete(dataItem: Employee): void {
    console.log('Delete clicked for:', dataItem);
    // Add your delete logic here
    const confirmDelete = confirm(
      `Are you sure you want to delete ${dataItem.full_name}?`
    );
    if (confirmDelete) {
      this.gridData = this.gridData.filter((emp) => emp.id !== dataItem.id);
      this.refreshGrid();
      console.log('Employee deleted:', dataItem);
    }
  }
  private refreshGrid(): void {
    this.gridView = [...this.gridData]; // Update gridView with the latest data
  }

  // -------dropdown------
  public allLeads = [
    { id: 1, full_name: 'John Doe' },
    { id: 2, full_name: 'Jane Smith' },
    { id: 3, full_name: 'Michael Johnson' },
    // ...other leads
  ];

  public selectedLead: any = null;

  selectLead(lead: any): void {
    this.selectedLead = lead;
    console.log('Selected Lead:', lead);
    // Add logic to filter your grid if needed
  }

  public savedPreferences: Array<{ id: number; text: string }> = [
    { id: 1, text: 'Default View' },
    { id: 2, text: 'Custom View 1' },
    { id: 3, text: 'Custom View 2' },
  ];

  // Selected preference
  public selectedPreference: { id: number; text: string } | null = null;

  // Handle preference selection
  public onPreferenceSelect(preference: { id: number; text: string }): void {
    this.selectedPreference = preference;
    console.log('Selected Preference:', preference);
    // Add logic to apply the selected preference
    if (preference.id === 1) {
      console.log('Applying Default View...');
    } else if (preference.id === 2) {
      console.log('Applying Custom View 1...');
    } else if (preference.id === 3) {
      console.log('Applying Custom View 2...');
    }
  }
}
