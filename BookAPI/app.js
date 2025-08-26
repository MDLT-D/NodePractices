import express from "express";
import {getAllBooks,getBook,addBook,deleteBook} from "./routes/books.js"
const app= express();
app.use(express.json());

app.get ("/books",getAllBooks);

app.get("/books/:id",getBook);

app.post("/books",addBook);

app.delete("/books/:id",deleteBook);

app.listen(3000,()=>{
    console.log("Running on PORT:3000");
})