import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class TwillioService {
  
  constructor(private http: HttpClient) {}
  
  getToken(username: any, roomName: any) : Observable<any>{
    return this.http
      .post('https://twillio-token.herokuapp.com/token/', {
        identity: username,
        room: roomName,
      }).pipe(
        tap((res)=>{
          return res;
        })
      )
  }
  
}