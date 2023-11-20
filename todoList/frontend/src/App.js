import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import Modal from "react-modal";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

Modal.setAppElement("#root");

const App = () => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/todos");
      setTodos(response.data);
    } catch (error) {
      console.error("Error fetching todos:", error);
    }
  };

  const addTodo = async () => {
    try {
      const response = await axios.post("http://localhost:5000/api/todos", {
        title: newTodo,
        todos: [],
      });
      setTodos([...todos, response.data]);
      setNewTodo("");
    } catch (error) {
      console.error("Error adding todo:", error);
    }
  };

  const handleCheck = async (id, checked) => {
    try {
      await axios.put(`http://localhost:5000/api/todos/${id}`, {
        todos: { checked },
      });
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === id ? { ...todo, todos: { checked } } : todo
        )
      );
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/todos/${id}`);
      setTodos((prevTodos) => prevTodos.filter((todo) => todo._id !== id));
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  const openModal = (todo) => {
    setEditingTodo(todo);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setEditingTodo(null);
    setIsModalOpen(false);
  };

  const handleEditSubmit = async (updatedTitle) => {
    try {
      await axios.put(`http://localhost:5000/api/todos/${editingTodo._id}`, {
        title: updatedTitle,
      });
      // Update the state with the edited todo
      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo._id === editingTodo._id ? { ...todo, title: updatedTitle } : todo
        )
      );
      closeModal();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(todos);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setTodos(items);
  };

  return (
    <div style={{ textAlign: "center", maxWidth: "350px", margin: "auto" }}>
      <div
        style={{
          margin: "50px auto",
          display: "flex",
          gap: "4px",
        }}
      >
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new todo"
          style={{ width: "80%", padding: "10px", borderRadius: "5px" }}
        />
        <button
          onClick={addTodo}
          style={{
            width: "20%",
            padding: "10px",
            backgroundColor: "#FF1493",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          Add
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{
                listStyleType: "none",
                padding: 5,
                backgroundColor: "#eee",
                borderRadius: "5px",
              }}
            >
              {todos.map((todo, index) => (
                <Draggable key={todo._id} draggableId={todo._id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        border: "1px solid black",
                        padding: "10px",
                        borderRadius: "5px",
                        backgroundColor: "white",
                      }}
                    >
                      <div>
                        <input
                          type="checkbox"
                          checked={(todo.todos && todo.todos.checked) || false}
                          onChange={() =>
                            handleCheck(
                              todo._id,
                              !(todo.todos && todo.todos.checked)
                            )
                          }
                        />

                        <span
                          style={{
                            textDecoration:
                              todo.todos && todo.todos.checked
                                ? "line-through"
                                : "none",
                            marginLeft: "10px",
                          }}
                        >
                          {todo.title}
                        </span>
                      </div>
                      <div>
                        <FaEdit
                          style={{
                            marginLeft: "10px",
                            cursor: "pointer",
                            color: "blue",
                          }}
                          onClick={() => openModal(todo)}
                        />
                        <FaTrash
                          style={{
                            marginLeft: "10px",
                            cursor: "pointer",
                            color: "red",
                          }}
                          onClick={() => handleDelete(todo._id)}
                        />
                      </div>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        style={{
          overlay: { backgroundColor: "rgba(0, 0, 0, 0.5)" },
          content: {
            width: "300px",
            margin: "auto",
            padding: "20px",
            borderRadius: "8px",
          },
        }}
      >
        <h2>Edit Todo</h2>
        {editingTodo && (
          <>
            <input
              type="text"
              value={editingTodo ? editingTodo.title : ""}
              onChange={(e) =>
                setEditingTodo({ ...editingTodo, title: e.target.value })
              }
              style={{ marginBottom: "10px", width: "90%", padding: "10px" }}
            />

            <button onClick={() => handleEditSubmit(editingTodo.title)}>
              Update
            </button>
          </>
        )}
        <button
          onClick={closeModal}
          style={{ marginLeft: "10px", cursor: "pointer" }}
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

export default App;
