import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Landing from './pages/Landing';
import GameSelect from './pages/GameSelect';
import Leaderboard from './pages/Leaderboard';
import Profile from './pages/Profile';
import GasDash from './games/GasDash';
import BlockMemory from './games/BlockMemory';
import PrecisionTap from './games/PrecisionTap';
import { ToastProvider } from './components/ToastContext';

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Header />
        <div className="page-wrapper">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/games" element={<GameSelect />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            
            <Route path="/games/gas-dash" element={<GasDash />} />
            <Route path="/games/block-memory" element={<BlockMemory />} />
            <Route path="/games/precision-tap" element={<PrecisionTap />} />
          </Routes>
        </div>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
