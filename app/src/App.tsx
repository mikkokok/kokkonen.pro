import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Electricity from './components/Electricity';
import NavigationBar from './components/NavigationBar';
import {Route, Routes} from 'react-router-dom';
import Login from './components/Login';

function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      <Header />
      <div className="app-container flex flex-1 overflow-hidden">
        <NavigationBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/electricity" element={<Electricity />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

export default App;
