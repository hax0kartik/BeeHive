// App.js
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/landing';
import Classic from './pages/classic';
import Common from './pages/common';
import DiffLanding from './pages/diff_landing';
import Diff from './pages/diff';
import './global.css'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/classic" element={<Classic />} />
        <Route path="/common" element={<Common />} />
        <Route path="/diff_landing" element={<DiffLanding />} />
        <Route path="/diff" element={<Diff />} />
      </Routes>
    </Router>
  );
}

export default App;
