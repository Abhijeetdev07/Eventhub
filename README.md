# Mini Event Platform (MERN Stack)

Welcome to the **Mini Event Platform**! This is a full-stack web application I built to help users discover, create, and join events seamlessly. It's designed to be robust, responsive, and easy to use.

## 🚀 Live Demo
**[https://eventhub-gold.vercel.app/]**

## ✨ Features
I implemented all the mandatory requirements plus several advanced enhancements to make the experience better.

### Core Features
*   **Secure Authentication**: Sign up and login using JWT (JSON Web Tokens) to keep sessions secure.
*   **Create & Manage Events**: Users can host events by providing a title, description, date, location, and capacity.
*   **Image Uploads**: Integrated with Cloudinary so users can upload real cover photos for their events.
*   **RSVP System**: Users can join (or leave) events. The system ensures you can't join if the event is full.
*   **Responsive Design**: Works perfectly on mobile, tablet, and desktop.

### 🌟 Extra Enhancements (Bonus)
I went the extra mile to add these features:
1.  AI-Powered Assistant: Integrated **Groq AI (Llama 3)** to help users write professional event descriptions with one click.
2.   Smart Search & Filters: Find events quickly by searching for keywords, filtering by category, or selecting a date range.
3.   Dedicated User Dashboard: A personalized dashboard that separates "Events I'm Attending" from "Events I Created" for better organization.
4.   Modern UI/UX: Used Tailwind CSS for a clean look, interactive modals, and smooth transitions.
6.   User : created a demo user 3 user
5.   Demo Events :created a demo events

---

## 🛠️ Technology Stack
*   **Frontend**: React.js, Tailwind CSS, React Router, Axios
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Atlas)
*   **Image Storage**: Cloudinary
*   **AI Service**: Groq API (Llama 3.1)

---

## ⚙️ How to Run Locally

given below

### 1. clone the repository
```bash
git clone https://github.com/Abhijeetdev07/eventhub.git
cd event-management-mern
```

### 2. Setup Backend
```bash
cd server
npm install
```
Create a `.env` file in the `server` folder with the following credentials:
```env
PORT=5000
MONGO_URI=your_mongodb
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d
# Cloudinary for Images
CLOUDINARY_CLOUD_NAME=your cloud name
CLOUDINARY_API_KEY=your api key
CLOUDINARY_API_SECRET=your api secret
# Groq AI for Descriptions
GROQ_API_KEY=your ai key
```
Start the server:
```bash
npm run dev
```

### 3. Setup Frontend
Open a new terminal and go to the client folder:
```bash
cd client
npm install
```
Start the React app:
```bash
npm run dev
```

app run on : localhost:5173

---

## 🧠 Technical Explanation: Handling RSVP Concurrency

One of the robust features of this application is how it handles **Race Conditions** when multiple users try to join an event at the exact same time (e.g., only 1 spot left).

### The Challenge
If 2 users try to grab the last spot simultaneously, a simple "read-then-update" approach could fail, allowing both to join and exceeding the capacity.

### My Solution: Atomic Updates & Transactions
I used **MongoDB Transactions** combined with **Atomic Updates** to ensure strict data integrity.

**How it works in code:**
1.  **Transaction Start**: When a user clicks "Book Event", a MongoDB session starts.
2.  **Atomic Condition**: I verify the capacity *during* the update instruction itself using a query filter:
    ```javascript
    Event.findOneAndUpdate(
      { _id: eventId, rsvpCount: { $lt: event.capacity } }, // Condition: Must be less than capacity
      { $inc: { rsvpCount: 1 } } // Atomic Action: Increment count
    )
    ```
3.  **Result**:
    *   If the spot was available, MongoDB locks the document, performs the check and increment together, and the user successfully joins.
    *   If the spot was taken milliseconds ago, the condition `{ $lt: event.capacity }` fails, no document is updated, and the transaction is aborted.
4.  **Error Handling**: The backend catches this specific failure and returns a "Event is full" message to the user effectively preventing overbooking.


*Built by me*
