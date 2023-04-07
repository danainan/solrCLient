import { Component } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { __param } from 'tslib';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],

})


export class DetailComponent {
  
  
  httpOptions = {
    
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      //authorization: ''
    }),
  };
  
  numfound: any;
  book: any[] = [];
  id : any;
  title : any;
  synopsis : any;
  genre : any;
  aired : any;
  episodes : any;
  score : any;
  img_url : any;
  constructor(private http: HttpClient ,private route: ActivatedRoute) {}
  


  ngOnInit() {
    this.id = this.route.snapshot.paramMap.get('id');
    this.search(this.id);
  }

  search(id : string) {
    this.book = [];
    this.getData(id).subscribe((response: any) => {
      console.log(response)
      this.book = response.response.docs;
      this.book.forEach(element => {
        this.title = element.title;
        this.synopsis = element.synopsis;
        this.genre = element.genre;
        this.aired = element.aired;
        this.episodes = element.episodes;
        this.score = element.score;
        this.img_url = element.img_url;
      }
      );
    })
  }
  


  getData(id: string) {
    let baseUrl = `http://localhost:8080/getsolrbyid/` + id;
    //console.log(environment.apiurl);
    return this.http.get<any>(baseUrl, this.httpOptions);
  }

  


}


export interface RootResponse {
  response: Response;
}






