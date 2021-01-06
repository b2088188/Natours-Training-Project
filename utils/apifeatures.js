class APIFeatures {
    constructor(query/* find return a query */, queryString /* query from Client */) {
        this.query = query;
        this.queryString = queryString;        
    }
    filter() {
    const queryObj = {...this.queryString};
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
   excludedFields.forEach(el => delete queryObj[el])
   let queryStr = JSON.stringify(queryObj)
   queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`); //return the $ + matched string
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
    }
    sort() {
    if(this.queryString.sort)
      this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
   else
      this.query = this.query.sort('-createdAt'); //Default: Sort by Created Time
     return this;
    }
    limitFields() {
        if(this.queryString.fields)
         this.query = this.query.select(req.query.fields.split(',').join(' ')); //Include only properties we want
       else     
         this.query = this.query.select('-__v');   //Default: Exclude __v
     return this;
    }
    paginate() {
    const page = +this.queryString.page || 1;
    const limit = +this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
    }
}

export default APIFeatures;