// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/landing';
import NewPage from './pages/secondPage';
import Common from './pages/common';
import './global.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/secondPage" element={<NewPage />} />
        <Route path="/common" element={<Common />} />
      </Routes>
    </Router>
  );
}

export default App;
