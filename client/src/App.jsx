import { Route, Routes } from 'react-router-dom';
import Header from './components/shared/Header.jsx';
import Sidebar from './components/shared/Sidebar.jsx';
import Templates from './pages/Templates.jsx';
import Editor from './pages/Editor.jsx';
import Renders from './pages/Renders.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Header />
      <div className="app-content">
        <Sidebar />
        <main className="page-container">
          <Routes>
            <Route path="/" element={<Templates />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/editor/:id" element={<Editor />} />
            <Route path="/renders" element={<Renders />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
