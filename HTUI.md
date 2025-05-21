# How tu use it

[Main page](./README.md)

---
# db

```ts
import { SwoshDb, Document } from 'swosh';

export interface Note extends Document {
  title: string;
  content: string;
  createdAt?: Date;
}

const db = new SwoshDb({
  path: './swosh_database', // dir where data files will be stored
  // encryptionKey: process.env.SWOSH_ENCRYPTION_KEY || 'default_base_32_password',
});

console.log('[SwoshDB] initialized at:', db.config.path);

export const notesCollection = db.collection<Note>('notes');
export default db;
```

---
# server

```ts
import express, { Request, Response } from 'express';
import { notesCollection, Note } from './db'; // import yown collection

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json()); // json bodies

app.get('/notes', async (req: Request, res: Response) => {
  try {
    const allNotes = await notesCollection.find();
    res.status(200).json(allNotes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Failed to fetch notes' });
  }
});

app.post('/notes', async (req: Request, res: Response) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const newNoteData: Partial<Omit<Note, '_id'>> = { 
        title, 
        content, 
        createdAt: new Date() 
    };
    const createdNote = await notesCollection.insert(newNoteData);
    res.status(201).json(createdNote);
  } catch (error) {
    console.error('Error creating note:', error);
    res.status(500).json({ message: 'Failed to create note' });
  }
});

app.get('/notes/:id', async (req: Request, res: Response) => {
  try {
    const noteId = req.params.id;
    const note = await notesCollection.findOne({ _id: noteId });
    if (note) {
      res.status(200).json(note);
    } else {
      res.status(404).json({ message: 'Note not found' });
    }
  } catch (error) {
    console.error('Error fetching note by ID:', error);
    res.status(500).json({ message: 'Failed to fetch note' });
  }
});

export const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is rockin' and rollin' on http://localhost:${PORT}`);
  });
};

export default app;
```

---
# main.ts

```ts
import { startServer } from './server';
// import db from './db'; 

async function main() {
  console.log('Application starting...');
  
  // you could perform any pre-server start-up tasks here,
  // like seeding the database, checking connections, etc.

  // Example: Add a default note if the collection is empty (just for demo)
  // This is a simplistic example; in a real app, migrations or seed scripts are better.
  /*
  try {
    const { notesCollection } = await import('./db'); // Dynamic import if preferred for clarity
    const count = await notesCollection.count();
    if (count === 0) {
      console.log('No notes found, adding a default note...');
      await notesCollection.insert({
        title: 'Welcome to SwoshDB Notes!',
        content: 'This is your first note, powered by SwoshDB. Enjoy!',
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error during initial data check:', error);
  }
  */

  startServer();
}

main().catch(error => {
  console.error('Unhandled error in main application:', error);
  process.exit(1); // Exit with an error code
});
```
