import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { Observable } from 'rxjs/internal/Observable';
import { ICoords, IWeatherData } from './interfaces';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  public units: string;
  public unitsChanges$: Subject<string> = new BehaviorSubject('');
  private _apiUrl: string;
  private _currentGeo: ICoords;

  constructor(private http: HttpClient) {
    this.units = 'metric';
    this._apiUrl = `http://api.openweathermap.org/data/2.5/weather?appid=ed924207c360aa5d7180657019064863&lang=ru&&units=${this.units}`;
    this.unitsChanges$.subscribe(units => {
      this.units = units;
      this._apiUrl = `http://api.openweathermap.org/data/2.5/weather?appid=ed924207c360aa5d7180657019064863&lang=ru&&units=${this.units}`;
    });
  }

  public getDataByCityName(cityName: string): Observable<IWeatherData> {
    return this.http.get<IWeatherData>(`${this._apiUrl}&q=${cityName}`);
  }

  public getDataByCoords(coords: ICoords): Observable<IWeatherData> {
    return this.http.get<IWeatherData>(`${this._apiUrl}&lat=${coords.lat}&lon=${coords.lon}`);
  }

  public getCurrentLocation(): Observable<ICoords> {
    return new Observable(subscriber => {
      if (!!this._currentGeo) {
        subscriber.next(this._currentGeo);
        subscriber.complete();
      } else {
        navigator.geolocation.watchPosition(geo => {
          this._currentGeo = {
            lat: geo.coords.latitude,
            lon: geo.coords.longitude
          }
          subscriber.next(this._currentGeo);
          subscriber.complete();
        })
      }
      
    })
  }
  
}
