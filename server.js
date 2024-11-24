const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { join } = require("path");
const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/todoApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Define User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

// Define Task Schema
const taskSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  task: String,
});

// Create Models
const User = mongoose.model("User", userSchema);
const Task = mongoose.model("Task", taskSchema);

// Middleware
app.use(bodyParser.json());
app.use(express.static(join(__dirname, "public")));

// Endpoint to serve the configuration file
app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

// Serve the index page for all other requests
app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// User Signup Endpoint
app.post("/signup", async (req, res) => {
  const { username, password } = req.body;
  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.json({ success: false, message: "Username already exists" });
    } else {
      const user = new User({ username, password });
      await user.save();
      res.json({ success: true });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// User Login Endpoint
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ success: true, userId: user._id });
    } else {
      res.json({ success: false, message: "Invalid username or password" });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Add Task Endpoint
app.post("/users/:userId/tasks", async (req, res) => {
  const { task } = req.body;
  const { userId } = req.params;
  try {
    const newTask = new Task({ userId, task });
    await newTask.save();
    res.json({ success: true, task: newTask });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Get Tasks Endpoint
app.get("/users/:userId/tasks", async (req, res) => {
  const { userId } = req.params;
  try {
    const tasks = await Task.find({ userId });
    res.json({ success: true, tasks });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Update Task Endpoint
app.put("/users/:userId/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  const { task } = req.body;
  try {
    const updatedTask = await Task.findByIdAndUpdate(taskId, { task }, { new: true });
    res.json({ success: true, task: updatedTask });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Delete Task Endpoint
app.delete("/users/:userId/tasks/:taskId", async (req, res) => {
  const { taskId } = req.params;
  try {
    await Task.findByIdAndDelete(taskId);
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});