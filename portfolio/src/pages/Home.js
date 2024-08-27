export default function Home() {
  return (
    <header class="section home active" id="home">
      <div class="header-content">
        <div class="left-header">
          <div class="h-shape"></div>
          <div class="image"><img src="img/main.png" alt="" /></div>
        </div>
        <div class="right-header">
          <h1 class="name">Hello, I'm <span>Taylor!</span></h1>
          <p>
            My name is <span>Taylor Dicks.</span><br />
            I am a software engineer.<br />
            Learning is one of my passions.<br />
            Please have a look around!
          </p>
          <a href="#" class="main-btn">
            <span class="btn-text">Resumé</span>
            <span class="btn-icon"><i class="fas fa-square-poll-horizontal"></i></span>
          </a>
        </div>
      </div>
    </header>
  );
}