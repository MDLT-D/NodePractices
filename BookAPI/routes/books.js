import fs from "node:fs/promises";
import { v4 as uuidv4 } from "uuid";
const folderBooks = "./data";

export async function getAllBooks(req, res) {
  try {
    //get all the files in data
    const booksFiles = await fs.readdir(folderBooks);
    let booksList = "";
    //for each file get the title and author to show a list
    for (const file of booksFiles) {
      const fileText = await fs.readFile(folderBooks + "/" + file, "utf-8");
      //console.log(fileText);
      //transform to object
      const book = JSON.parse(fileText);
      //list format
      booksList += "▸ " + book.title + ", " + book.author + "\n";
    }
    //return the list of books
    res.status(200).send(booksList);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

export async function getBook(req, res) {
  const idBook = req.params.id?.trim();
  //validation to the param exist
  if (!idBook) {
    return res.status(400).send({
      error: "Please enter the ID of the book you want to view.",
    });
  }
  try {
    //get all the files in data
    const booksFiles = await fs.readdir(folderBooks);
    //  console.log(booksFiles);
    let booksList = "";
    //look for the file with idBook
    for (const file of booksFiles) {
      const fileText = await fs.readFile(folderBooks + "/" + file, "utf-8");
      //transform json to object
      const book = JSON.parse(fileText);
      if (book.id === idBook) {
        //list format
        booksList += "▸ " + book.title + ", " + book.author + "\n";
        break;
      }
    }
    if (!booksList) {
      return res
        .status(404)
        .send({ error: "No book was found matching your request." });
    } else {
      //return the book info
      res.status(200).send(booksList);
    }
  } catch (error) {
    res
      .status(500)
      .send({ error: "Unexpected error. Please try again later." });
    console.error(error);
  }
}

export async function addBook(req, res) {
  try {
    //validate the body exists and its a object
    if (!req.body) {
      return res
        .status(400)
        .send({ error: "Please provide the book details." });
    }

    if (typeof req.body !== "object" || Array.isArray(req.body)) {
      return res
        .status(400)
        .send({ error: "Please provide the book in the correct format." });
    }
    const { title, author } = req.body;

    //validate the values exists and are strings
    if (!title || typeof title !== "string" || !title.trim()) {
      return res.status(400).send({
        error: "Please enter a valid title for the book.",
      });
    }

    if (!author || typeof author !== "string" || !author.trim()) {
      return res.status(400).send({
        error: "Please enter valid author for the book.",
      });
    }

    const newTitle = title.trim();
    const newAuthor = content.trim();
    //id for the file name, and id in json
    const newId = uuidv4();
    const newBook = { id: newId, newTitle, newAuthor };
    //write a file in the new path and transform object newBook to json
    await fs.writeFile(
      folderBooks + "/" + newId + ".json",
      JSON.stringify(newBook, null, 2)
    );
    //return the newBook
    res.status(201).send(newBook);
  } catch (error) {
    res
      .status(500)
      .send({ error: "Unexpected error. Please try again later." });
  }
}

export async function deleteBook(req, res) {
  const idBook = req.params.id;

  try {
    //all jsons inside data
    const booksFiles = await fs.readdir(folderBooks);

    for (const file of booksFiles) {
      //get path for each book file
      const filePath = folderBooks + "/" + file;
      //parse text to compare ids
      const fileText = await fs.readFile(filePath, "utf-8");
      const book = JSON.parse(fileText);

      if (book.id == idBook) {
        //remove file
        await fs.unlink(filePath);
        return res.status(200).send("Se elimino correctamente.");
      }
    }
    return res.status(404).send("No se encontró el libro.");
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}
