// import { useState } from "react";
import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Signup } from "./pages/Signup";
import { Singin } from "./pages/Signin";
import { Blog } from "./pages/Blog";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/signup" element={<Signup></Signup>}></Route>
          <Route path="/signin" element={<Singin></Singin>}></Route>
          <Route path="/blogs/:id" element={<Blog></Blog>}></Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
