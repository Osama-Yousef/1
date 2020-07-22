// requrement 
require('dotenv').config();

// dependencies 

const pg= require('pg');
const methodOverride=require('method-override')
const cors=require('cors');
const superagent=require('superagent');
const express=require('express');

// main variables
const app=express();
const client= new pg.Client(process.env.DATABASE_URL);
const PORT=process.env.PORT || 3030 ;

// uses 
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('./public')); 
app.set('view engine', 'ejs');
// app.use('*',notFoundHandler);
// app.use(errorHandler);

// .catch((err)=>{
//     errorHandler(err,req,res);
// }
// )

// listen to port 
client.connect().then(()=>{

app.listen(PORT, ()=>{

    console.log(`listening on port ${PORT}`)
})

}
)

//////////////////////////
// check
// app.get('/',homeHandler);
// function homeHandler(req,res){
//     res.status(200).send('it works');
// }
///////////////////////////////////

// route definition
app.get('/',homeHandler);
app.get('/addToDb',addToDbHandler);
app.get('/selectData',selectDataHandler)
app.get('/details/:digi_id',detailsHandler);
app.put('/update/:update_id',updateHandler)
app.delete('/delete/:delete_id',deleteHandler)












// route handlers 
function homeHandler(req,res){

let url=`https://digimon-api.herokuapp.com/api/digimon`;
superagent.get(url).then(data=>{

    let digiArray=data.body.map(val=>{
        return new Digimons(val);
    })
    res.render('index',{data:digiArray})
})

}

/////// constructor function

function Digimons(val){

this.name=val.name || 'no name';
this.image=val.img || 'no image';
this.level=val.level || 'no level';

}


/// go to index page 

/////////////////
function addToDbHandler(req,res){

//collect the data
let {name,image,level}=req.query;
//insert all data
let sql=`INSERT INTO pokemon (name,image,level) VALUES ($1,$2,$3);`;
// safe values 
let safeValues=[name,image,level];



client.query(sql,safeValues).then(()=>{

    res.redirect('/selectData');

})

}
////////////////////

function selectDataHandler(req,res){

let sql=`SELECT * FROM pokemon;`;

client.query(sql).then(result=>{
    res.render('pages/favorite',{ data : result.rows});

})
}


/////////////////
function detailsHandler(req,res){

let param = req.params.digi_id;

let sql=`SELECT * FROM pokemon WHERE id=$1;`;

let safeValues=[param];

client.query(sql,safeValues).then(result=>{

res.render('pages/details',{data:result.rows[0]})

}
)

}

///////////////
function updateHandler(req,res){

    let param=req.params.update_id;
    // collect updated data
    
    let {name,image,level}=req.body;

    let sql=`UPDATE pokemon SET name=$1 , image=$2 , level=$3 WHERE id=$4;`;
    let safeValues=[name,image,level,param];

    client.query(sql,safeValues).then(()=>{

 res.redirect(`/details/${param}`);

    } )

}


//////////// delete 
 function deleteHandler(req,res){

    let param=req.params.delete_id;
    
    let sql=`DELETE FROM pokemon WHERE id=$1;`;
    let safeValues=[param];

    client.query(sql,safeValues).then(()=>{

res.redirect('/selectData');

    } )

}


///////////////////////////////
// error handler 
// function errorHandler (err,req,res){
//     res.status(500).send(err);
// }

// function notFoundHandler(req,res){
//     res.status(404).send('page not found');
// 