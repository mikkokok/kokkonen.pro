import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';
import NavigationBar from './components/NavigationBar';
import {Route, Routes} from 'react-router-dom';
import Electricity from './components/Electricity';

function App() {
  return (
    <>
      <Header />
      <NavigationBar />
      <Routes>
        <Route path="/electricity" element={<Electricity />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
