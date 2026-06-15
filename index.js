require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB Atlas'))
  .catch(err => console.error('Erro ao conectar:', err));

// Schemas (Modelos)
const AuthorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  bio: String
});

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Author' },
  genre: String
});

const Author = mongoose.model('Author', AuthorSchema);
const Book = mongoose.model('Book', BookSchema);

// --- ROTAS DE AUTORES ---
app.get('/api/authors', async (req, res) => {
  try {
    const authors = await Author.find();
    res.json(authors);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar autores' });
  }
});

app.post('/api/authors', async (req, res) => {
  try {
    const newAuthor = new Author(req.body);
    await newAuthor.save();
    res.status(201).json(newAuthor);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Erro ao criar autor' });
  }
});

app.put('/api/authors/:id', async (req, res) => {
  try {
    const updated = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Autor não encontrado' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Erro ao atualizar autor' });
  }
});

app.delete('/api/authors/:id', async (req, res) => {
  try {
    const deleted = await Author.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Autor não encontrado' });
    }
    // Deleta os livros associados a esse autor em cascata
    await Book.deleteMany({ authorId: req.params.id });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar autor' });
  }
});

// --- ROTAS DE LIVROS ---
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.find().populate('authorId');
    const formattedBooks = books.map(book => ({
      _id: book._id,
      title: book.title,
      genre: book.genre,
      authorId: book.authorId ? book.authorId._id : null,
      authorName: book.authorId ? book.authorId.name : null
    }));
    res.json(formattedBooks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar livros' });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const newBook = new Book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Erro ao criar livro' });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const updated = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message || 'Erro ao atualizar livro' });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const deleted = await Book.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Livro não encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar livro' });
  }
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));