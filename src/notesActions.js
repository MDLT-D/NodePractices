import fs from "node:fs/promises";
import { fileURLToPath } from "url";
const DB_Path = fileURLToPath(new URL("../dbNotes.json", import.meta.url));

    //GET /notes – Return all notes.
export async function getAllNotes() {
  const dbInfo = await fs.readFile(DB_Path, "utf-8");
  const dbObject = JSON.parse(dbInfo);
  return dbObject.notes;
}
//GET /notes/:id – Return note by id.
export async function getNote(idNote) {
      const dbInfo= await getAllNotes();
    return dbInfo.find(note=>note.id === idNote);
}
//GET /notes/:title – Return note by title.
export async function getNoteTitle(titleNote) {
    const dbInfo= await getAllNotes();
return dbInfo.filter(note =>note.title.toLowerCase().includes(titleNote.toLowerCase()));
}
//POST /notes – Accept { title, content } and save the new note to notes.json.
export async function addNote(info) {
  const dbInfo = await getAllNotes();
  dbInfo.push(info);
  await updateDB(dbInfo);
  return info;
}
//DELETE /notes/:id – Remove a note by its id.
export async function deleteNote(idNote) { 
   const dbInfo = await getAllNotes();
   const newInfo= dbInfo.filter(note=>note.id != idNote);
   await updateDB(newInfo);
    
}

//Take the newInfo and applies it to the json file 
export async function updateDB(DBinfo) {
  await fs.writeFile(DB_Path, JSON.stringify({ notes: DBinfo }, null, 2));
  return DBinfo;
}
