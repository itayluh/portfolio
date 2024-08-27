import './App.css';
import Home from './pages/Home.js';
import Contact from './pages/Contact';
import About from './pages/About';
import Portfolio from './pages/Portfolio';
import Buttons from './pages/Buttons';

export default function App() {
  return (
    <body>
      <Buttons />
      <Home />
      <Portfolio />
      <About />
      <Contact />
    </body>
  );
}

(function () {
  [...document.querySelectorAll(".control")].forEach(button => {
      button.addEventListener("click", function() {
          document.querySelector(".active-btn").classList.remove("active-btn");
          this.classList.add("active-btn");
          document.querySelector(".active").classList.remove("active");
          document.getElementById(button.dataset.id).classList.add("active");
      })
  });
  // document.querySelector(".theme-btn").addEventListener("click", () => {
  //     document.body.classList.toggle("light-mode");
  // })
})();
