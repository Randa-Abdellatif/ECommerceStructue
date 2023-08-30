export class ApiFeatures{
    constructor(mongooseQuery,queryData){
        this.mongooseQuery = mongooseQuery;
        this.queryData = queryData;
    }
    pagination = (model) => {
        let page = this.queryData.page
        let size = this.queryData.size
    if(page <= 0 || !page ) page = 1 
    if(size <= 0 || !size ) size = 5
    const skip = size * (page - 1)
    
    this.mongooseQuery.skip(skip).limit(size)
    model.countDocuments().then((value)=>{
        this.queryData.totalPages = Math.ceil(value/size)
        if (this.queryData.totalPages > page) {
            this.queryData.next = Number(page) + 1
        }
        if (page > 1) {
            this.queryData.previous = page - 1
        }
        this.queryData.count = value
    })
    return this
}

filter = () => {
    const excluded = ['sort', 'page','size','fields','searchKey']
let queryFields = {...this.queryData}
excluded.forEach(ele => {
    delete queryFields[ele]
})
queryFields = JSON.stringify(queryFields).replace(/lte|lt|gte|gt/g,(match)=>{
    return `$${match}`
})
queryFields = JSON.parse(queryFields)
this.mongooseQuery.find(queryFields)
return this
}

sort = () => {
    if(this.queryData.sort){
        this.mongooseQuery.sort(this.queryData.sort.replace(/,/g,' '))
    }
     return this
}

search = () => {
    if(this.queryData.searchKey){
        this.mongooseQuery.find({$or:[
            {name:{$regex:this.queryData.searchKey}}, {description:{$regex:this.queryData.searchKey}}
        ]}
            )
    }
          return this
}

select = () => {
        this.mongooseQuery.select(this.queryData.fields?.replace(/,/g,' '))
        return this
}
}