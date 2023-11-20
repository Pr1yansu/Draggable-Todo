const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://localhost:27017/checklistDB");

const todoSchema = new mongoose.Schema({
  title: String,
  todos: [
    {
      text: String,
      checked: Boolean,
      order: Number,
    },
  ],
});

const Todo = mongoose.model("Todo", todoSchema);

app.get("/api/todos", async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
});

app.post("/api/todos", async (req, res) => {
  const { title, todos } = req.body;
  const newTodo = new Todo({ title, todos });
  await newTodo.save();
  res.json(newTodo);
});

app.put("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  const { todos } = req.body;
  const updatedTodo = await Todo.findByIdAndUpdate(
    id,
    { todos },
    { new: true }
  );
  res.json(updatedTodo);
});

app.delete("/api/todos/:id", async (req, res) => {
  const { id } = req.params;
  await Todo.findByIdAndDelete(id);
  res.json({ message: "Todo deleted successfully" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
