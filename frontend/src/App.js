import React from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import ChatAssistant from "./components/ChatAssistant";

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <ChatAssistant />
      </div>
    </ThemeProvider>
  );
}

export default App;
