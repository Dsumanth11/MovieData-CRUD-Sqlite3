const express=require('express');
const path = require("path");
const app=express();
app.use(express.json());
const {open}=require('sqlite');
const sqlite3=require('sqlite3');
let db=null;
const initializeDBandServer=async()=>{
    try{
        const dbpath=path.join(__dirname,"moviesData.db");
        // console.log(dbpath);
        db=await open({
            filename:dbpath,
            driver:sqlite3.Database
        });
        app.listen(3000,()=>{
            console.log("Server running at link: http://localhost:3000/");
        });
    }
    catch(e)
    {
        console.log(e);
        console.log("error Connecting To DB");
        process.exit(1);
    }
};

initializeDBandServer();

app.get('/movies/',async(request,response)=>{
    const query=`
    select movie_name from movie
    ;`;
    const result=await db.all(query);
    const res=[];
    for(let i=0;i<result.length;i++)
    {
        res.push({
            movieName:result[i].movie_name,
        });
    }
    response.send(res);
});
app.post("/movies/",async(request,response)=>{
    try {
        const {directorId,movieName,leadActor} = await request.body;
        const addQuery=`
            insert into movie(director_id,movie_name,lead_actor)
            values(${directorId},'${movieName}','${leadActor}')
        ;`;
        const result=await db.run(addQuery);
        response.send("Movie Successfully Added");
    } 
    catch (error) {
        console.log(error);
    }
});

app.get('/movies/:movieId',async(request,response)=>{
    try {
        const {movieId}=request.params;
        const query=`
        Select * 
        from movie
        where movie_id=${movieId};`;
        const result=await db.get(query);
        // console.log(result);
        response.send({
            movieId:result.movie_id,
            directorId:result.director_id,
            movieName:result.movie_name,
            leadActor:result.lead_actor
        });
    } 
    catch (error) {
        response.send({});
    }
});

app.put('/movies/:movieId/',async(request,response)=>
{
    const {directorId,movieName,leadActor}=request.body;
    const {movieId}=request.params;
    const updatequery=`
    UPDATE movie 
    set 
        director_id=${directorId},
        movie_name='${movieName}',
        lead_actor='${leadActor}'
    where movie_id=${movieId};
    `;
    const result=await db.run(updatequery);
    response.send("Movie Details Updated");
});

app.delete('/movies/:movieId',async(request,response)=>{
    const {movieId}=request.params;
    const querydelete=`
    Delete from movie
    where movie_id=${movieId};
    `;
    await db.run(querydelete);
    response.send("Movie Removed");
});

app.get('/directors/',async(request,response)=>
{
    const query=`
    select * 
    from Director
    ;`;
    const result=await db.all(query);
    // console.log(result);
    const re=[];
    for(let i=0;i<result.length;i++)
    {
        re.push({
            directorId:result[i].director_id,
            directorName:result[i].director_name
        });
    }
    response.send(re);
});

app.get('/directors/:directorId/movies/',async(request,response)=>{
    const {directorId}=request.params;
    const runQuery=`
    SELECT *
    FROM MOVIE
    WHERE director_id=${directorId};
    `;
    const result=await db.all(runQuery);
    // console.log(result);
    const re=[];
    for(let i=0;i<result.length;i++)
    {
        re.push({
            movieName:result[i].movie_name
        });
    }
    response.send(re);
});

module.exports=app;