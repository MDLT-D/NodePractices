import { error } from "node:console";
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
      booksList += "-" + book.title + "," + book.author + "\n";
    }
    //return the list of books
    res.status(200).send(booksList);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

export async function getBook(req, res) {
  const idBook = req.params.id;

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
        booksList += "-" + book.title + "," + book.author;
        break;
      }
    }
    if (!booksList) {
      return res.status(404).send({ error: "No se encontró el libro." });
    } else {
        //return the book info
      res.status(200).send(booksList);
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
}

export async function addBook(req, res) {
  try {
    const { title, author } = req.body;
    //validation
    if (!title || !author) {
      return res.status(400).send({ error: "Title and author are required." });
    }
    //id for the file name, and id in json
    const newId = uuidv4();
    const newBook = { id: newId, title, author };
    //write a file in the new path and transform object newBook to json 
    await fs.writeFile(
      folderBooks + "/" + newId + ".json", JSON.stringify(newBook, null, 2)
    );
//return the newBook
    res.status(201).send(newBook);
  } catch (error) {
    res.status(500).send({ error: error.message });
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
