import { Component, NgModule, ViewChild, enableProdMode} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { map, observeOn } from 'rxjs';
import { Observable } from 'rxjs';

if (typeof window !== 'undefined') {
  enableProdMode();
}

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
  Aired: any[] = [];
  // selectsearchby_value: any;
  

  facetAuthor: facetDisplay[] = [];
  facetPublisher: facetDisplay[] = [];
  facetAired: facetDisplay[] = [];
  facetGenre: facetDisplay[] = [];
  constructor(private http: HttpClient) {}

  form: FormGroup = new FormGroup({
    keyword: new FormControl('', Validators.required),
    genre: new FormControl(''),
    aired : new FormControl(''),
    // selectsearchby : new FormControl('keyword'),
  });






  ngOnInit() {
    this.search('*');
    this.getDataFacetAired();
  }

  getDataFacetAired() {
    this.Aired = [];
    this.getFacetAired().subscribe((response: RootResponse) => {
      this.Aired = response.facet_counts.facet_fields.aired;
      // ไม่เอาค่า count 
      for (let i = 0; i < this.Aired.length; i++) {
        if (typeof(this.Aired[i]) == 'number') {
          this.Aired.splice(i, 1);
        }
      }
      console.log(this.Aired.sort());
      //convert to number
      for (let i = 0; i < this.Aired.length; i++) {
        this.Aired[i] = Number(this.Aired[i]);
      }
      console.log(this.Aired.sort());
    });

    // return this.getFacetAired().pipe(map((response: RootResponse) => {
    //   this.Aired = response.facet_counts.facet_fields.aired;
    //   // ไม่เอาค่า count 
    //   for (let i = 0; i < this.Aired.length; i++) {
    //     if (typeof(this.Aired[i]) == 'number') {
    //       this.Aired.splice(i, 1);
    //     }
    //   }
    //   console.log(this.Aired.sort());
    //   //convert to number
    //   for (let i = 0; i < this.Aired.length; i++) {
    //     this.Aired[i] = Number(this.Aired[i]);
    //   }
    //   console.log(this.Aired.sort());
    // }));



  }

  // selectsearchby() {
  //   this.selectsearchby_value = this.form.controls['selectsearchby'].value;
  //   console.log(this.selectsearchby_value);
  // }

 
  submit() {

    if (this.form.controls['aired'].value != '' && this.form.controls['genre'].value != '' && this.form.controls['keyword'].value != '') {
      this.searchByAiredAndGenreAndKeyword(this.form.controls['aired'].value, this.form.controls['genre'].value, this.form.controls['keyword'].value);
    }

    else if (this.form.controls['genre'].value != '' && this.form.controls['keyword'].value != '') {
      this.searchByGenreAndKeyword(this.form.controls['genre'].value, this.form.controls['keyword'].value);
    }
    
    else if (this.form.controls['aired'].value != '' && this.form.controls['keyword'].value != '') {
      this.searchByAiredAndKeyword(this.form.controls['aired'].value, this.form.controls['keyword'].value);
    }
    else if (this.form.controls['aired'].value != '' && this.form.controls['genre'].value != '') {
      this.searchByAiredAndGenre(this.form.controls['aired'].value, this.form.controls['genre'].value);
    }
    

    else if (this.form.controls['keyword'].value != '') {
      this.search(this.form.controls['keyword'].value);
    }
    else if (this.form.controls['genre'].value != '') {
      this.searchByGenreOr(this.form.controls['genre'].value);
    }

    else if (this.form.controls['aired'].value != '') {
      this.searchByAired(this.form.controls['aired'].value);
    }
    else if (this.form.invalid) {
      this.search('*');
    }

  }

  resetAdvancedSearch() {
    this.form.controls['keyword'].setValue('');
    this.form.controls['genre'].setValue('');
    this.form.controls['aired'].setValue('');
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
    this.getData(keyword).subscribe((response: any) => {
      this.book = response.response.docs;
      this.numfound= response.response.numFound;
      try {
        this.addGenreFacet(response.facet_counts.facet_fields.genre);
      } catch (error) {
        console.log(error);
      }
    });

    // return this.getData(keyword).pipe(
    //   map((response: RootResponse) => {
    //     this.book = response.response.docs;
    //     this.numfound= response.response.numFound;
        
    //     try {
    //       this.addGenreFacet(response.facet_counts.facet_fields.genre);
    //     } catch (error) {
    //       console.log(error);
    //     }
    //   })
    // );
    


      

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

  searchByTitle(title: string) {
    console.log(title);
    this.book = [];
    this.getDataByTitle(title).subscribe((response: RootResponse) => {
      this.book = response.response.docs;
      this.numfound= response.response.numFound;
    });

  }


  searchByGenreOr(genre: string) {
    console.log(genre);
    this.book = [];
    this.getDataByGenreOr(genre).subscribe((response: RootResponse) => {
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

  searchByAiredAndKeyword(aired: string, keyword: string) {
    console.log(aired);
    this.book = [];
    this.getDataByAiredAndKeyword(aired, keyword).subscribe((response: RootResponse) => {
      this.book = response.response.docs;
      this.numfound= response.response.numFound;
    });

  }

  searchByAiredAndGenre(aired: string, genre: string) {
    console.log(aired);
    this.book = [];
    this.getDataByAiredAndGenre(aired, genre).subscribe((response: RootResponse) => {
      this.book = response.response.docs;
      this.numfound= response.response.numFound;
    });

  }

  searchByAiredAndGenreAndKeyword(aired: string, genre: string, keyword: string) {
    console.log(aired);
    this.book = [];
    this.getDataByAiredAndGenreAndKeyword(aired, genre, keyword).subscribe((response: RootResponse) => {
      this.book = response.response.docs;
      this.numfound= response.response.numFound;
    });

  }

  searchByAired(aired: string) {
    // console.log(aired);
    // this.book = [];
    // this.getDataByAired(aired).subscribe((response: RootResponse) => {
    //   this.book = response.response.docs;
    //   this.numfound= response.response.numFound;
    // });

    return this.getDataByAired(aired).pipe(
      map((response: RootResponse) => {
        this.book = response.response.docs;
        this.numfound= response.response.numFound;
      }
    ));

    

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

  

  //host = 'http://localhost:8080';
  host = 'https://526a-171-6-234-177.ngrok-free.app'; 

  

  getData(keyword: string) {
    let baseUrl = this.host+`/getsolr/` + keyword;
    
    console.log(baseUrl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByGenre(genre: string) {
    console.log(genre);
    let baseUrl = this.host+`/getsolrbygenre/` + genre;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByTitle(title: string) {
    console.log(title);
    let baseUrl = this.host+`/getsolrbytitle/` + title;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }


  getDataByGenreOr(genre: string) {
    console.log(genre);
    let baseUrl = this.host+`/getsolrbygenreor/` + genre;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataById(id: string) {
    let baseUrl = this.host+`/getsolrbyid/` + id;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByGenreAndKeyword(genre: string, keyword: string) {
    let baseUrl = this.host+`/getsolrbygenreandkeyword/` + genre + '/' + keyword;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByAiredAndKeyword(aired: string, keyword: string) {
    let baseUrl = this.host+`/getsolrbyairedandkeyword/` + aired + '/' + keyword;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByAiredAndGenre(aired: string, genre: string) {
    let baseUrl = this.host+`/getsolrbyairedandgenre/` + aired + '/' + genre;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByAiredAndGenreAndKeyword(aired: string, genre: string, keyword: string) {
    let baseUrl = this.host+`/getsolrbyairedandgenreandkeyword/` + aired + '/' + genre + '/' + keyword;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getDataByAired(aired: string) {
    let baseUrl = this.host+`/getsolrbyaired/` + aired;
    //console.log(environment.apiurl);
    return this.http.get<RootResponse>(baseUrl, this.httpOptions);
  }

  getFacetAired() {
    let baseUrl = this.host+`/getfacetaired`;
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
