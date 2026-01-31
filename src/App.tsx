import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { SimulationEngine } from './components/SimulationEngine';
import { Dashboard } from './components/Dashboard';
import { EventTimers } from './pages/EventTimers';
import { InventoryManager } from './pages/InventoryManager';
import { DailiesGuides } from './pages/DailiesGuides';
import { LegendaryCrafting } from './pages/LegendaryCrafting';
import { Collections } from './pages/Collections';
import { CommunityStrategies } from './pages/CommunityStrategies';
import { MarketScouting } from './pages/MarketScouting';
import { InvestmentStrategy } from './pages/InvestmentStrategy';
import { SettingsPage } from './pages/Settings';
import { TradingPostPage } from './pages/TradingPostPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { useMarketStore } from './store/useMarketStore';
import { useEffect } from 'react';

function App() {
  const { loadFromDB, startBackgroundScan } = useMarketStore();

  useEffect(() => {
    loadFromDB().then(() => {
      startBackgroundScan();
    });
  }, []);

  return (
    <Router>
      <Layout>
        <SimulationEngine />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/strategies" element={<CommunityStrategies />} />
          <Route path="/timers" element={<EventTimers />} />
          <Route path="/inventory" element={<InventoryManager />} />
          <Route path="/guides" element={<DailiesGuides />} />
          <Route path="/legendary" element={<LegendaryCrafting />} />
          <Route path="/collections" element={<Collections />} />
          <Route path="/market" element={<MarketScouting />} />
          <Route path="/investment" element={<InvestmentStrategy />} />
          <Route path="/trading-post" element={<TradingPostPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </Layout>
      <ToastContainer position="bottom-right" theme="dark" />
    </Router>
  );
}

export default App;
