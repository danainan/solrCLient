import { Component, NgModule, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent {
  

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      //authorization: ''
    }),
  };

  page = 1;
  pageGenre = 1;
  mainGenre = ['Action', 'Comedy', 'Drama', 'Romance', 'Fantasy', 'Sports'];


  numfound: any;
  book: any[] = [];
  

  facetAuthor: facetDisplay[] = [];
  facetPublisher: facetDisplay[] = [];
  facetAired: facetDisplay[] = [];
  facetGenre: facetDisplay[] = [];
  constructor(private http: HttpClient) {}

  form: FormGroup = new FormGroup({
    keyword: new FormControl('', Validators.required),
    genre: new FormControl(''),
    year : new FormControl(''),
  });

  

  ngOnInit() {
    this.search('*');
  }

 
  submit() {

    if (this.form.controls['genre'].value != '' && this.form.controls['keyword'].value != '') {
      this.searchByGenreAndKeyword(this.form.controls['genre'].value, this.form.controls['keyword'].value);
    }
    else if (this.form.controls['keyword'].value != '') {
      this.search(this.form.controls['keyword'].value);
    }
    else if (this.form.controls['genre'].value != '') {
      this.searchByGenre(this.form.controls['genre'].value);
    }
    else if (this.form.invalid) {
      this.search('*');
    }

  }

  // onPageChange(event: any) {
  //   this.page = event.pageIndex + 1;

  // }

  // getButtonIndexes() {
  //   const pageCount = Math.ceil(this.numfound / 50); // calculate the total number of pages
  //   return Array(pageCount).fill(0).map((x, i) => i); // create an array of indexes for the buttons
  // }
  
  getButtonIndexes(): number[] {
    const pageIndexes: number[] = [];
    const totalPages = Math.ceil(this.numfound / 50);

    for (let i = 0; i < totalPages; i++) {
      pageIndexes.push(i);
    }
  
    return pageIndexes;
  }

  ButtonNext() {
    this.page = this.page + 1;
    this.search(this.form.controls['keyword'].value);
  }

  search(keyword: string) {
    
    this.book = [];
    this.getData(keyword).subscribe((response: RootResponse) => {
      this.book = response.response.docs;
      this.numfound= response.response.numFound;
      try {
        this.addGenreFacet(response.facet_counts.facet_fields.genre);
      } catch (error) {
        console.log(error);
      }
    });

  }

  searchById(id: string) {
    console.log(id);
  }



  searchByGenre(genre: string) {
    console.log(genre);
    this.book = [];
    this.getDataByGenre(genre).subscribe((response: RootResponse) => {
      this.book = response.response.docs;
      this.numfound= response.response.numFound;
    });

  }

  searchByGenreAndKeyword(genre: string, keyword: string) {
    console.log(genre);
    this.book = [];
    this.getDataByGenreAndKeyword(genre, keyword).subscribe((response: RootResponse) => {
      this.book = response.response.docs;
      this.numfound= response.response.numFound;
    });

  }


  UniqueGenre(genre: string) {
    if (this.mainGenre.indexOf(genre) === -1) {
      this.mainGenre.push(genre);
    }
  }

  

  addAuthorFacet(authorList: any) {
    this.facetAuthor=[];
    for (let i = 0; i < authorList.length; i++) {
      const element = authorList[i];
      if (i % 2 === 0) {
        this.facetAuthor.push({ data: element, count: authorList[i + 1] });
      }
    }
  }

  addPublisherFacet(publisherList: any) {
    this.facetPublisher=[];
    for (let i = 0; i < publisherList.length; i++) {
      const element = publisherList[i];
      if (i % 2 === 0) {
        this.facetPublisher.push({ data: element, count: publisherList[i + 1] });
      }
    }
  }

  addAiredFacet(airedList: any) {
    this.facetAired=[];
    for (let i = 0; i < airedList.length; i++) {
      const element = airedList[i];
      if (i % 2 === 0) {
        this.facetAired.push({ data: element, count: airedList[i + 1] });
      }
    }
  }
  addGenreFacet(genreList: any) {
    this.facetGenre=[];
    this.mainGenre = [];
    for (let i = 0; i < genreList.length; i++) {
      const element = genreList[i];
      if (i % 2 === 0) {
        this.facetGenre.push({ data: element, count: genreList[i + 1] });
      }
    }
  }

  

  getData(keyword: string) {
    let baseUrl = `http://localhost:8080/getsolr/` + keyword;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByGenre(genre: string) {
    console.log(genre);
    let baseUrl = `http://localhost:8080/getsolrbygenre/` + genre;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataById(id: string) {
    let baseUrl = `http://localhost:8080/getsolrbyid/` + id;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByGenreAndKeyword(genre: string, keyword: string) {
    let baseUrl = `http://localhost:8080/getsolrbygenreandkeyword/` + genre + '/' + keyword;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  

}

export interface facetDisplay {
  data: string;
  count: number;
}

export interface Params {
  q: string;
  facet: string;
  wt: string;
}

export interface ResponseHeader {
  status: number;
  QTime: number;
  params: Params;
}

export interface Doc {
  id: string;
  title: string;
  author: string;
  publisher: string;
  lang: string;
  pubyear: string;
  _version_: any;
  publisher_index: string;
  genre: string;
  img_url : string;
  uid : string;
}

export interface Response {
  numFound: number;
  start: number;
  numFoundExact: boolean;
  docs: Doc[];
}

export interface FacetQueries {}

export interface FacetFields {
  author: any[];
  publisher: any[];
  aired: any[];
  genre: any[];
}

export interface FacetRanges {}

export interface FacetIntervals {}

export interface FacetHeatmaps {}

export interface FacetCounts {
  facet_queries: FacetQueries;
  facet_fields: FacetFields;
  facet_ranges: FacetRanges;
  facet_intervals: FacetIntervals;
  facet_heatmaps: FacetHeatmaps;
}

export interface RootResponse {
  responseHeader: ResponseHeader;
  response: Response;
  facet_counts: FacetCounts;
}
