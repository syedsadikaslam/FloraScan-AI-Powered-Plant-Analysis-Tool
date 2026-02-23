# 🌿 FloraScan: AI-Powered Plant Analysis Tool

FloraScan is a modern, intelligent web application designed to help plant enthusiasts identify plant species, assess their health, and get expert care recommendations. Powered by Google's Gemini AI, it provides instant insights from a simple photo.

## ✨ Key Features

-   **AI Identification**: Instantly recognize thousands of plant species from uploaded images.
-   **Health Diagnosis**: Detect signs of disease or stress and understand how to fix them.
-   **Care Recommendations**: Get detailed instructions on watering, sunlight, and soil requirements.
-   **PDF Reports**: Generate and download comprehensive analysis reports for your plants.
-   **Responsive Design**: A premium, mobile-friendly interface built with modern web technologies.

## 🛠️ Technology Stack

### Frontend
-   **React (Vite)**: For a fast, interactive user interface.
-   **Vanilla CSS**: Custom, high-performance styling with a premium aesthetic.
-   **FontAwesome**: Rich iconography for an enhanced UI.

### Backend
-   **Node.js & Express**: Scalable server-side logic and API management.
-   **Google Gemini AI**: Leveraging state-of-the-art Generative AI for plant analysis.
-   **Multer**: Efficient handling of image uploads.
-   **PDFKit**: Dynamic generation of plant analysis reports.

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18 or higher)
-   A Google Gemini API Key

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/syedsadikaslam/FloraScan-AI-Powered-Plant-Analysis-Tool.git
    cd Florascan
    ```

2.  **Backend Setup**
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in the `server` directory and add your API key:
    ```env
    PORT=5000
    GEMINI_API_KEY=your_gemini_api_key_here
    ```

3.  **Frontend Setup**
    ```bash
    cd ../client
    npm install
    ```

### Running the Application

-   **Start Backend**: In the `server` directory, run `npm run dev`.
-   **Start Frontend**: In the `client` directory, run `npm run dev`.

The application will be available at `http://localhost:5173` (or your Vite default port).

## 📂 Project Structure

```text
Florascan/
├── client/          # Vite + React frontend
│   ├── src/         # UI components and logic
│   └── public/      # Static assets
├── server/          # Node.js + Express backend
│   ├── upload/      # Temporary storage for uploads
│   └── app.js       # Main server logic and AI integration
└── README.md        # Project documentation
```

## 📜 License

This project is licensed under the MIT License.

---
Developed with ❤️ by [Md Sadik](https://github.com/syedsadikaslam)
