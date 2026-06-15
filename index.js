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
  year: Number
});

const Author = mongoose.model('Author', AuthorSchema);
const Book = mongoose.model('Book', BookSchema);

// --- ROTAS DE AUTORES ---
app.get('/api/authors', async (req, res) => {
  const authors = await Author.find();
  res.json(authors);
});

app.post('/api/authors', async (req, res) => {
  const newAuthor = new Author(req.body);
  await newAuthor.save();
  res.status(201).json(newAuthor);
});

app.put('/api/authors/:id', async (req, res) => {
  const updated = await Author.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/api/authors/:id', async (req, res) => {
  await Author.findByIdAndDelete(req.params.id);
  res.status(204).send();
});

// --- ROTAS DE LIVROS ---
app.get('/api/books', async (req, res) => {
  const books = await Book.find().populate('authorId');
  res.json(books);
});

app.post('/api/books', async (req, res) => {
  const newBook = new Book(req.body);
  await newBook.save();
  res.status(201).json(newBook);
});

// Iniciar servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));