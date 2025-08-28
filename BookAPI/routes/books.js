import fs from "node:fs/promises";
import { v4 as uuidv4, validate as isUUID } from "uuid";
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
      let book;
         try {
        book = JSON.parse(fileText);
      } catch (parseError) {
        console.warn(`Skipping invalid JSON file: ${file}`);
        continue; // only correct files
      }

      // list format
      if (book?.title && book?.author) {
        booksList += "▸ " + book.title + ", " + book.author + "\n";
      } else {
        console.warn(`Skipping file with missing data: ${file}`);
      }
    }
    
    //return the list of books
    res.status(200).send(booksList);
  } catch (error) {
   console.error(error);
  return res
    .status(500)
    .send({ error: "Unexpected error. Please try again later." });
  }
}

export async function getBook(req, res) {
  const idBook = req.params.id?.trim();

  // Validate that the ID was provided
  if (!idBook) {
    return res.status(400).send({
      error: "Please enter the ID of the book to search.",
    });
  }

  // Validate that the ID has a valid UUID format
  if (!isUUID(idBook)) {
    return res.status(400).send({
      error:
        "The book ID you entered doesn't look right. Please check and try again.",
    });
  }

  try {
  const booksFiles = await fs.readdir(folderBooks);

  for (const file of booksFiles) {
    const fileText = await fs.readFile(folderBooks + "/" + file, "utf-8");

    let book;
    try {
      book = JSON.parse(fileText);
    } catch (parseError) {
      console.warn(`Skipping invalid JSON file: ${file}`);
      continue;
    }

    if (!book?.id || !book?.title || !book?.author) {
      console.warn(`Skipping file with missing data: ${file}`);
      continue;
    }

    if (book.id === idBook) {
      return res
        .status(200)
        .send("▸ " + book.title + ", " + book.author + "\n");
    }
  }

  return res.status(404).send({
    error:
      "We couldn't find a book with that ID. Please try with a different one.",
  });
} catch (error) {
  console.error(error);
  return res
    .status(500)
    .send({ error: "Unexpected error. Please try again later." });
}
}

export async function addBook(req, res) {
  try {
    //validate the body exists and its a object
    if (!req.body) {
      return res.status(400).send({
        error: "We didn’t receive the book information. Please try again.",
      });
    }

    if (typeof req.body !== "object" || Array.isArray(req.body)) {
      return res.status(400).send({
        error:
          "The book information seems incorrect. Please send the title and author.",
      });
    }
    const { title, author } = req.body;

    //validate the values exists and are strings
    const errors = [];

    if (!title || typeof title !== "string" || !title.trim()) {
      errors.push("Please enter the book’s title.");
    } else if (title.trim().length > 30) {
      errors.push("The book’s title must not exceed 30 characters.");
    }

    if (!author || typeof author !== "string" || !author.trim()) {
      errors.push("Please enter the author’s name.");
    } else if (author.trim().length > 30) {
      errors.push(
        "The author’s name must not exceed 30 characters."
      );
    }
    if (errors.length > 0) {
      return res.status(400).send({ errors });
    }

    const newTitle = title.trim();
    const newAuthor = author.trim();
    //id for the file name, and id in json
    const newId = uuidv4();
    const newBook = { id: newId, title: newTitle, author: newAuthor };
    //write a file in the new path and transform object newBook to json
    await fs.writeFile(
      folderBooks + "/" + newId + ".json",
      JSON.stringify(newBook, null, 2)
    );
    //return the newBook
    res
      .status(201)
      .send({ message: "Book created successfully.", data: newBook });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Unexpected error. Please try again later." });
  }
}

export async function deleteBook(req, res) {
  const idBook = req.params.id?.trim();
  //Validate that the id exists and its a UUID
  if (!idBook) {
    return res
      .status(400)
      .send({ error: "Please provide the ID of the book you want to delete." });
  }
  if (!isUUID(idBook)) {
    return res.status(400).send({
      error:
        "The book ID you entered doesn't look right. Please check and try again.",
    });
  }
  try {
  //all jsons inside data
  const booksFiles = await fs.readdir(folderBooks);

  for (const file of booksFiles) {
    //get path for each book file
    const filePath = folderBooks + "/" + file;
    //parse text to compare ids
    const fileText = await fs.readFile(filePath, "utf-8");

    let book;
    try {
      book = JSON.parse(fileText);
    } catch (parseError) {
      console.warn(`Skipping invalid JSON file: ${file}`);
      continue;
    }

    if (book.id === idBook) {
      //remove file
      await fs.unlink(filePath);
      return res
        .status(200)
        .send({ message: "The book was deleted successfully." });
    }
  }

  return res
    .status(404)
    .send({ error: "We couldn't find a book with the given information." });
} catch (error) {
  res
    .status(500)
    .send({ error: "Unexpected error. Please try again later." });
  console.error(error);
}
}
