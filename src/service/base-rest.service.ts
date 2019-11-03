import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of} from 'rxjs';
import { tap } from 'rxjs/operators';
import { IIdentification } from '../interfaces/i-identification';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

export class BaseRestService {
  protected _cached: IIdentification[] = [];
  
  constructor(private http: HttpClient, protected rootApi: string) { }

  get cached(): IIdentification[] {
    return this._cached;
  }
  
  protected cacheData(data: any): void {
    this._cached = data;
  }

  getAll(page:number=1,pageSize:number=-1): Observable<any> {
    return this.http.get(`${this.rootApi}?page=${page}&pageSize=${pageSize}`)
                    .pipe(tap((data: any) => this.cacheData(data)));
  }
  
  get(id:string): Observable<any> {
    //check on cache
    let result = this._cached.filter(item => item.id == id);
    if (result && result.length>0) {
      return of<any>(result[0]);
    }
    else
      return this.http.get(`${this.rootApi}${id}`);
  }
  
  insert(item: any): Observable<any> {
    return this.http.post<any>(this.rootApi, JSON.stringify(item), httpOptions)
                    .pipe(tap((data: any) => this._cached.push(data)));
  }
  
  update(id, item: any): Observable<any> {
    return this.put(`${this.rootApi}${id}`, item)
               .pipe(tap((data: any) => {
                  //Update the current item
                  let updated = this._cached.filter(p => p.id == data.id);
                  if (updated && updated.length>0)
                    updated[0] = item;
                  else
                    this._cached.push(data);
                }));
  }
  
  delete(id): Observable<any> {
    return this.http.delete<any>(`${this.rootApi}${id}`)
                    .pipe(tap((data: any) => {
                      //delete current item
                      let updated = this._cached.filter(p => p.id == id);
                      if (updated && updated.length>0)
                        this._cached.splice(this._cached.indexOf(updated[0]), 1);
                    }));
  }
}
