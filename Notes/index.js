import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import { validate as isUUID } from "uuid";
import swaggerUi from "swagger-ui-express";
import {
  getAllNotes,
  addNote,
  getNote,
  getNoteTitle,
  deleteNote,
} from "./src/notesActions.js";
//import swaggerDocument from "./swagger.json" with { type: "json" };

const app = express();
//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
//transform json
app.use(bodyParser.json());
// Middleware to invalid JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).send({
      error:
        "The information you sent seems incorrect. Please review and resend.",
    });
  }
  next();
});

//GET /notes – Return all notes.
app.get("/notes", async (req, res) => {
  try {
    const notes = await getAllNotes();
    //send all notes
    res.status(200).send(notes);
  } catch (error) {
    res
      .status(500)
      .send({ error: "Unexpected error. Please try again later." });
    console.error(error);
  }
});

app.get("/notes/:value", async (req, res) => {
  const value = req.params.value?.trim();
    //validation to the param exist
    if (!value) {
      return res.status(400).send({
        error: "Please enter the title or ID of the note you want to view.",
      });
    }
   if (value.length > 80) {
  return res.status(400).send({
    error: "The search value must not exceed 80 characters.",
  });
}
    try {
    let note;
    //if is uuid get note by id
    if (isUUID(value)) {
      note = await getNote(value);
      if (!note) {
        return res
          .status(404)
          .send({ error: "No note was found matching your request." });
      }
    } else {
      //get note by title
      note = await getNoteTitle(value);
    }
    //send results
    res.status(200).send(note);
  } catch (error) {
    res
      .status(500)
      .send({ error: "Unexpected error. Please try again later." });
    console.error(error);
  }
});

// POST /notes
app.post("/notes", async (req, res) => {
  try {
    //validate the body exists and its a object
    if (!req.body) {
      return res
        .status(400)
        .send({ error: "Please provide the note details." });
    }

    if (typeof req.body !== "object" || Array.isArray(req.body)) {
      return res
        .status(400)
        .send({ error: "Please provide your note in the correct format." });
    }
    const { title, content } = req.body;
    //validate the values exists and are strings
   
const errors = [];

if (!title || typeof title !== "string" || !title.trim()) {
  errors.push("Please enter a valid title for your note.");
} else if (title.trim().length > 30) {
  errors.push("The title must not exceed 30 characters.");
}

if (!content || typeof content !== "string" || !content.trim()) {
  errors.push("Please enter valid content for your note.");
} else if (content.trim().length > 80) {
  errors.push("The content must not exceed 80 characters.");
}

if (errors.length > 0) {
  return res.status(400).send({ errors });
}
    const newTitle = title.trim();
    const newContent = content.trim();
    //create the new note
    const newNote = { id: uuidv4(), title: newTitle, content: newContent };
    await addNote(newNote);

     res
      .status(201)
      .send({ message: "Note created successfully.", data: newNote });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Unexpected error. Please try again later." });
  }
});

// DELETE /notes/:id
app.delete("/notes/:id", async (req, res) => {
  const idNote = req.params.id?.trim();
  //Validate that the id exists and its a UUID
  if (!idNote) {
    return res
      .status(400)
      .send({ error: "Please provide the ID of the note you want to delete." });
  }
  if (!isUUID(idNote)) {
    return res
      .status(400)
      .send({ error: "The ID you provided is not valid. Please try again." });
  }

  try {
    //get the note to delete
    const note = await getNote(idNote);
    //validation the note exists
    if (!note) {
      return res
        .status(404)
        .send({ error: "We couldn't find a note with the given information." });
    }
    //delete the note
    await deleteNote(idNote);
    res
      .status(200)
      .send({ message: "The note has been successfully deleted." });
  } catch (error) {
    res
      .status(500)
      .send({ error: "Unexpected error. Please try again later." });
    console.error(error);
  }
});

app.listen(3000, () => {
  console.log("Running on PORT:3000");
});
