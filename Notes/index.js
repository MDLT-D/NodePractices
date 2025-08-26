import express from "express";
import bodyParser from "body-parser";
import { v4 as uuidv4 } from "uuid";
import {
  getAllNotes,
  addNote,
  getNote,
  getNoteTitle,
  deleteNote,
} from "./src/notesActions.js";

const app = express();

//transform json
app.use(bodyParser.json());
//GET /notes – Return all notes.
app.get("/notes", async (req, res) => {
  try {
    const notes = await getAllNotes();

    res.status(200).send(notes);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
//GET /notes/:id – Return note by id.
app.get("/notes/:id", async (req, res) => {
  const idNote = req.params.id;
  try {
    const note = await getNote(idNote);

    if (!note) {
      return res.status(404).send({ error: "Nota no encontrada" });
    }

    res.status(200).send(note);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
//    GET /notes/:title – Return note by title.
app.get("/notes/title/:title", async (req, res) => {
  const titleNote = req.params.title;
  try {
    const note = await getNoteTitle(titleNote);
    if (!note || note.length === 0) {
      return res.status(404).send({ error: "Nota no encontrada" });
    }
    res.status(200).send(note);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

// POST /notes
app.post("/notes", async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).send({ error: "Title and content are required" });
    }
    const newNote = { id: uuidv4(), title, content };
    await addNote(newNote);
    res.status(201).send(newNote);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});
// DELETE /notes/:id
app.delete("/notes/:id", async (req, res) => {
  const idNote = req.params.id;
  try {
    const note = await getNote(idNote);
    if (!note) {
      return res.status(404).send({ error: "This note doesn't exist" });
    }
    await deleteNote(idNote);
    res.status(200).send({ message: "Nota eliminada" });
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("Running on PORT:3000");
});
