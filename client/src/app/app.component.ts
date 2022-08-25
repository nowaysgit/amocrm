import { Component, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { IGetLeadsResponse } from './interfaces/IGetLeadsResponse';
import { IUser } from './interfaces/IUser';
import { FormControl, Validators } from '@angular/forms';
import { ILead } from './interfaces/ILead';
import { IPipeline } from './interfaces/IPipeline';
import { IStatus } from './interfaces/IStatus';
import { IMessage } from './interfaces/IMessage';

@Component({
  selector: 'app-root',
  styleUrls: ['./app.component.scss'],
  templateUrl: './app.component.html',
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class AppComponent implements OnInit {
  constructor(private http: HttpClient) {}

  dataSource: MatTableDataSource<ILead> = new MatTableDataSource<ILead>();
  dataUsers: IUser[] = [];
  dataStatuses: IStatus[] = [];
  columnsToDisplay = [
    'name',
    'status_text',
    'responsible_user_text',
    'created_at_formatted',
    'price_formatted',
  ];
  columnToText: any = {
    name: 'Название',
    status_text: 'Статус',
    responsible_user_text: 'Ответственный',
    created_at_formatted: 'Дата создания',
    price_formatted: 'Бюджет',
  };
  columnsToDisplayWithExpand = [...this.columnsToDisplay, 'expand'];
  expandedElement: ILead | null = null;
  searchFormControl = new FormControl('', [Validators.minLength(3)]);
  isLoading = false;
  errorText = '';

  ngOnInit() {
    this.makeFetch();
    this.searchFormControl.valueChanges.subscribe((val) => {
      if (this.searchFormControl.errors) return;
      this.makeFetch(val!);
    });
  }

  findByTag(tag: string) {
    this.searchFormControl.setValue(tag);
  }

  //fix hex colors for dark theme
  hexDarken(col: string, amt: number) {
    let usePound = false;
    if (col[0] == '#') {
      col = col.slice(1);
      usePound = true;
    }
    const num = parseInt(col, 16);
    let r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if (r < 0) r = 0;
    let b = ((num >> 8) & 0x00ff) + amt;
    if (b > 255) b = 255;
    else if (b < 0) b = 0;
    let g = (num & 0x0000ff) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
    return (usePound ? '#' : '') + (g | (b << 8) | (r << 16)).toString(16);
  }

  makeFetch(query: string = '') {
    this.isLoading = true;
    this.http
      .get<IGetLeadsResponse | IMessage>(
        environment.api_uri + '/leads?query=' + query,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
      .subscribe((res: IGetLeadsResponse | IMessage) => {
        console.log(res);
        if ('type' in res && res.type === 'message') {
          this.errorText = res.message;
          this.dataSource = new MatTableDataSource<ILead>();
          this.isLoading = false;
          return;
        }
        res = res as IGetLeadsResponse;
        if ('type' in res.leads && res.leads.type === 'message') {
          this.errorText = res.leads.message;
        } else if ('type' in res.users && res.users.type === 'message') {
          this.errorText = res.users.message;
        } else if ('type' in res.pipeline && res.pipeline.type === 'message') {
          this.errorText = res.pipeline.message;
        }
        if (!Array.isArray(res.leads) || this.errorText) {
          this.dataSource = new MatTableDataSource<ILead>();
          this.isLoading = false;
          return;
        }
        this.dataUsers = res.users as IUser[];
        this.dataStatuses = (res.pipeline as IPipeline)._embedded.statuses;
        this.dataSource = new MatTableDataSource<ILead>(
          (res.leads as ILead[]).map((lead) => {
            const status = this.dataStatuses.find(
              (x) => x.id === lead.status_id
            );
            lead.status_text = status!.name;
            lead.color = status!.color;
            lead.responsible_user_text = this.dataUsers.find(
              (x) => x.id === lead.responsible_user_id
            )!.name!;
            lead.created_at_formatted = new Date(
              lead.created_at * 1000
            ).toLocaleDateString('ru-RU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            lead.price_formatted = lead.price.toLocaleString('ru-RU', {
              style: 'currency',
              currency: 'RUB',
            });
            return lead;
          })
        );
        this.errorText = '';
        this.isLoading = false;
      });
  }
}
