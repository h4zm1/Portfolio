import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { NgxChartsModule, Color, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-visitor-chart',
  imports: [NgxChartsModule],
  templateUrl: './visitor-chart.component.html',
  styleUrl: './visitor-chart.component.scss',
})
export class VisitorChartComponent implements OnInit {
  data: any[] = [];
  loading = true;
  isBrowser: boolean;

  colorScheme: Color = {
    name: 'custom',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454'],
  };

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    this.http.get<any[]>('/api/analytics?days=30').subscribe({
      next: (res) => {
        // console.log("ngoninit visitor2")
        this.data = res;
        this.loading = false;
      },
      error: (err) => {
        // console.log("ngoninit visitor3", err)
        this.loading = false;
      },
    });
  }
}
