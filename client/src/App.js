import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { NavBar } from "./components";
import { PostsList, PostsInsert, PostsUpdate } from "./pages";

import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<PostsList />} />
        <Route path="/posts/create" element={<PostsInsert />} />
        <Route path="/posts/update/:id" element={<PostsUpdate />} />
      </Routes>
    </Router>
  );
}

export default App;
