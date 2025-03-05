import { Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./components/home";
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/:filter" element={<Home />} />
          <Route path="/:filter/folder/:folderId" element={<Home />} />
        </Routes>
        <Toaster />
      </>
    </Suspense>
  );
}

export default App;
