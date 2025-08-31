import express from "express";
import {getAllBooks,getBook,addBook,deleteBook} from "./routes/books.js"
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "./swagger.json" with { type: "json" };

const app = express();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json());
//Middleware to invalid json
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({
      error:
        "The information you sent seems incorrect. Please review and resend.",
    });
  }
  next();
});

app.get ("/books",getAllBooks);

app.get("/books/:id",getBook);

app.post("/books",addBook);

app.delete("/books/:id",deleteBook);

app.listen(3000,()=>{
    console.log("Running on PORT:3000");
})