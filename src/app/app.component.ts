import { Component, OnInit } from '@angular/core';
import { WeatherService } from './weather.service';
import { map, mergeMap } from 'rxjs/operators';
import { IWeatherData } from './interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public isCelsiusFormat: boolean = true;
  public isCitySearchActive: boolean = false;
  public currentWeatherData: IWeatherData;
  public currentCity: string = '';
  public isLoad: boolean = true;
  public citySearchQuery: string = '';
  title = 'ronas weather test';

  constructor(private weatherService: WeatherService) {
    this.citySearchQuery = 'Петропавловск Камчатский';
  }

  ngOnInit() {
    this.weatherService.unitsChanges$.next('metric');
    this.loadCurrentGeoWeather();
  }

  public setCelsius(isCelsuis: boolean) {
    this.isCelsiusFormat = isCelsuis;
    this.weatherService.unitsChanges$.next(isCelsuis ? 'metric' : 'imperial');
    this.currentCity ? this.loadCityWeather(this.currentCity) : this.loadCurrentGeoWeather();
  }
  
  private loadCityWeather(currentCity: string) {
    this.isLoad = true;
    this.currentCity = currentCity;
    this.weatherService.getDataByCityName(currentCity).subscribe(
      weatherData => {
        this.currentCity = weatherData.name;
        this.currentWeatherData = weatherData;
        this.isLoad = false;
      },
      errorData => {
        this.isLoad = false;
        if (errorData.error?.cod === '404') {
          alert('Город не найден');
          this.currentCity = '';
        } else {
          alert(errorData.error?.message)
        }          
      }
    );
  }

  public loadCurrentGeoWeather() {
    this.isLoad = true;
    this.currentCity = '';
    this.weatherService.getCurrentLocation().pipe(
      map(coords => {
        return coords;
      }),
      mergeMap(coords => this.weatherService.getDataByCoords(coords))
    ).subscribe(
      weatherData => {
        this.currentCity = weatherData.name;
        this.currentWeatherData = weatherData;
        this.isLoad = false;
      },
      errorData => {
        this.isLoad = false;
        alert(errorData.error?.message)          
      }
    );
  }

  public getWindLocaleByDeg(degress) {
    const directions = ['северный', 'северо-восточный', 'восточный', 'юго-восточный', 'южный', 'юго-западный', 'западный', 'северо-западный'];
    degress = degress < 0 ? 
        360 - Math.abs(degress) % 360 
      : degress % 360;
    return directions[degress / 45 | 0];
  }

  public onCitySearchSubmit() {
    this.isCitySearchActive = false;
    if (!!this.citySearchQuery) {
      this.loadCityWeather(this.citySearchQuery);
    }
  }
}
