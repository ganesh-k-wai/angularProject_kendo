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
// import { employees } from './employees';
// import { images } from './images';
import { FormsModule } from '@angular/forms';
import { EmployeeService } from '../employee-service.service';
import { ChangeDetectorRef } from '@angular/core';

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
  public gridData: Employee[] = [];
  public gridView: Employee[] = [];
  public mySelection: string[] = [];
  public pdfSVG: SVGIcon = filePdfIcon;
  public excelSVG: SVGIcon = fileExcelIcon;
  public large: string = 'large'; // Define the 'large' property

  public employees: any[] = [];
  constructor(
    private employeeService: EmployeeService,
    private cdr: ChangeDetectorRef
  ) {}

  private editedRowIndex: number | null = null;

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe((data) => {
      this.employees = data; // Store the fetched data
      this.gridView = [...this.employees]; // Bind the data to the grid
    });
  }
  public ngOnInit(): void {
    this.gridView = this.gridData;
    this.loadEmployees();
  }

  public onFilter(value: Event): void {
    // console.log('Search Value:', value);
    // console.log(typeof value);

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

  // ........edit,delete row .............
  private newRowIndex: number | null = null;
  // Add a new employee
  addEmployee(): void {
    const newEmployee = {
      id: Date.now().toString(),
      full_name: '',
      job_title: '',
      country: '',
      is_online: true,
      rating: 3,
      target: 50,
      budget: 40000,
      phone: '',
      address: '',
      img_id: '',
      gender: '',
    };
    this.employeeService.addEmployee(newEmployee).subscribe(() => {
      // Add the new employee to the top of the grid
      this.gridView.unshift(newEmployee);
      // Update the grid data to reflect the new order
      this.gridData = [...this.gridView]; // Set the first row in edit mode
      this.newRowIndex = 0;
      this.editedRowIndex = 0;
      // Scroll to the newly created row

      // Trigger change detection to refresh the grid
      this.cdr.detectChanges();

      setTimeout(() => {
        const gridElement = document.querySelector('kendo-grid') as HTMLElement;
        if (gridElement) {
          const firstRow = gridElement.querySelector(
            'tr.k-grid-edit-row'
          ) as HTMLElement;
          if (firstRow) {
            firstRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }
      }, 100);

      // console.log('New Employee Added:', newEmployee);
    });
  }

  // Edit a row
  isRowInEditMode(rowIndex: number): boolean {
    return this.editedRowIndex === rowIndex || this.newRowIndex === rowIndex;
  }

  editRow(rowIndex: number): void {
    this.editedRowIndex = rowIndex; // Set the row index to edit
  }

  // Save the edited row
  saveRow(rowIndex: number): void {
    const updatedEmployee = this.gridView[rowIndex];

    // If the row is a new employee (ID is empty), add it to the backend
    if (!updatedEmployee.id) {
      updatedEmployee.id = Date.now().toString(); // Generate a unique ID
      this.employeeService.addEmployee(updatedEmployee).subscribe(() => {
        this.editedRowIndex = null;
        this.newRowIndex = null; // Reset the new row index
        this.loadEmployees(); // Refresh the grid
      });
    } else {
      // Otherwise, update the existing employee
      this.employeeService
        .updateEmployee(updatedEmployee.id, updatedEmployee)
        .subscribe(() => {
          this.editedRowIndex = null;
          this.newRowIndex = null; // Reset the new row index
          this.loadEmployees(); // Refresh the grid
        });
    }
  }

  // Cancel editing
  cancelEdit(): void {
    if (this.newRowIndex !== null) {
      // Remove the new row if editing is canceled
      this.gridView.splice(this.newRowIndex, 1);
      this.newRowIndex = null;
    }
    this.editedRowIndex = null;

    // No need to reload data from the backend since the row was not saved
    this.cdr.detectChanges();
  }

  // Delete an employee
  deleteEmployee(employee: any): void {
    const confirmDelete = confirm(
      `Are you sure you want to delete ${employee.full_name}?`
    );
    if (confirmDelete) {
      this.employeeService.deleteEmployee(employee.id).subscribe(() => {
        this.loadEmployees();
      });
    }
  }
}
