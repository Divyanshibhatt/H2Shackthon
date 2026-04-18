# 📦 AI-Powered Warehouse Management System

Welcome to the Warehouse Management System! 

If you are a beginner or a first-year student, don't worry! This project is designed to be very easy to understand. Here is a simple guide to what this project is and how it works.

## 🌟 What is this project?
This is a full-stack web application that helps a business manage its products and stock across multiple warehouses. 

It features:
- **📊 A Dashboard** with beautiful charts showing your total items, categories, and low-stock alerts.
- **📝 An Inventory Table** where you can Add, Edit, or Delete items.
- **🚚 A Suppliers Page** to manage the companies that provide your items.
- **🤖 An AI Chatbot** built right into the dashboard! It knows everything about your live stock and can answer business questions like *"Which items are low on stock?"* or *"What is our total inventory value?"*

## 📁 Simple Folder Structure
To keep things professional and organized, the code is divided into three main folders (just like real-world tech companies do):

1. **`frontend/` (The Face of the App)**
   - Built with **React**. 
   - This directory contains everything the user sees on the screen (the buttons, colors, forms, and charts).
2. **`backend/` (The Brain of the App)**
   - Built with **Python (FastAPI)**. 
   - This acts as a middle-man. When you click "Save Item" on the frontend, the frontend sends that data to the backend to be processed.
3. **`database/` (The Memory)**
   - Built with **SQLite**. 
   - This folder securely stores all your items, activity logs, and suppliers in a file called `warehouse.db` so no data is lost when you close the app.

## 🚀 How to Run the Project
We have set it up so you only need a few commands to get everything running!

### 1. Start the App
Open your terminal and navigate to the `frontend` directory:
```bash
cd frontend

# Install the necessary packages (you only need to do this the first time)
npm install

# Start the application!
npm run dev
```

*🔥 Magic Trick: The `npm run dev` command is specially configured to automatically start **both** the React Frontend and the Python Backend at the exact same time!*

### 2. View the App
Once the terminal says it is running, open your web browser and click this link:
**[http://localhost:5173](http://localhost:5173)**

---
*Note: For the AI Chatbot to work locally, make sure you have the [Ollama](https://ollama.com/) app installed and running on your Mac.*
