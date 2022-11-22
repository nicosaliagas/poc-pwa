import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';

import { ConnectionStatusService } from '../../../services/connection-status.service';
import { DatasetsService } from '../../../services/datasets.service';
import { SynchroService } from '../../../services/synchro.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'page-readonly',
  templateUrl: './readonly.component.html',
  styleUrls: ['./readonly.component.scss'],
  providers: [SynchroService]
})
export class ReadonlyComponent implements OnInit {
  public $countries: Observable<any> = this.datasetsService.GetListCountries()
  public $countriesTwo: Observable<any> = this.datasetsService.GetListCountriesTwo()
  public contactForm!: FormGroup;
  public country_name = "";
  public country_name_two = "";
  public set_country = "";

  public countries = [
    { id: 1, name: "United States" },
    { id: 2, name: "Australia" },
    { id: 3, name: "Canada" },
    { id: 4, name: "Brazil" },
    { id: 5, name: "England" }
  ];

  constructor(
    private connectionStatusService: ConnectionStatusService,
    private datasetsService: DatasetsService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,) { }

  ngOnInit() {
    this.contactForm = this.fb.group({
      country: [null]
    });

    this.setDefaults();

    this.contactForm.get("country")?.valueChanges
      .subscribe(f => {
        this.onCountryChanged(f);
      })
  }

  testPerform() {
    this.$countries.subscribe((countries) => {
      console.log("countries | testPerform >> ", countries)
    })
  }

  testPerformTwo() {
    this.$countriesTwo.subscribe((countries) => {
      console.log("countries | testPerform >> ", countries)
    })
  }

  submit() {
    console.log("Form Submitted")
    console.log(this.contactForm.value)
  }

  setDefaults() {
    this.contactForm.get("country")?.patchValue(null);
  }

  onCountryChanged(value: any) {
    console.log('onCountryChanged')
    console.log(value)
  }

  addCountry() {
    this.datasetsService.PostCountry(this.country_name).subscribe(() => {
      this.country_name = "";
      this.cdr.detectChanges()
    })
  }

  addCountry2() {
    this.datasetsService.PostCountryTwo(this.country_name_two).subscribe(() => {
      this.country_name_two = "";
      this.cdr.detectChanges()
    })
  }

  setCountry() {
    const country = this.countries.find(el => el.name === this.set_country);
    if (country) {
      this.contactForm.get("country")?.patchValue(country.id);
    }
  }
}
