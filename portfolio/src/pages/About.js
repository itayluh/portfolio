export default function About() {
    return (
        <section class="section about" id="about">
            <div class="main-title">
                <h2>About <span>me</span></h2>
            </div>
            <div class="about-container">
                <div class="left-about">
                    <h4>Information</h4>
                    <p>
                        I am software engineer born and raised in Indiana.
                        I highly enjoy having new experiences and learning new things.
                        I have learned during my time in the field that software, especially personal projects, can be as much of an artistic exercise as a scientific one.
                        <br /><br />
                        In my free time I play volleyball, exercise, explore, read, spend time with friends and family, and otherwise try to have many rich experiences.
                    </p>
                    <div class="btn-con">
                        <a href="#" class="main-btn">
                            <span class="btn-text">Resumé</span>
                            <span class="btn-icon"><i class="fas fa-square-poll-horizontal"></i></span>
                        </a>
                    </div>
                </div>
                <div class="right-about">
                    <div class="about-item">
                        <div class="abt-text">
                            <p class="large-text">#</p>
                            <p class="small-text">Projects<br />Completed</p>
                        </div>
                    </div>
                    <div class="about-item">
                        <div class="abt-text">
                            <p class="large-text">2+</p>
                            <p class="small-text">Years<br />Experience</p>
                        </div>
                    </div>
                    <div class="about-item">
                        <div class="abt-text">
                            <p class="large-text">#</p>
                            <p class="small-text">Item<br />Here</p>
                        </div>
                    </div>
                    <div class="about-item">
                        <div class="abt-text">
                            <p class="large-text">#</p>
                            <p class="small-text">Item<br />Here</p>
                        </div>
                    </div>
                </div>
            </div>
            <h4 class="stat-title">My Timeline</h4>
            <div class="timeline">
                <div class="timeline-item">
                    <div class="tl-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <p class="tl-duration">January 2020 - June 2020</p>
                    <h5>Engineering Coop<span> - Nidec Drive Systems</span></h5>
                    <p>
                        Responsible for designing and performing software tests over efficiency of Pentair Poseidon
                        water pump, primarily for weighted energy factor (WEF). Root cause analysis of water ingress on
                        control section of pump, leading to deployment of water relief solution.
                    </p>
                </div>
                <div class="timeline-item">
                    <div class="tl-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <p class="tl-duration">June 2020 - October 2021</p>
                    <h5>Embedded Engineer (Software & Hardware)<span> - Carrier</span></h5>
                    <p>
                        During my time at Carrier, I was primarily responsible for the designing and testing of HVAC controls. This included both hardware (Circuit Schematic Design, Design Failure Mode and Effects Analysis) and software (Software Quality Assurance).
                    </p>
                </div>
                <div class="timeline-item">
                    <div class="tl-icon">
                        <i class="fas fa-briefcase"></i>
                    </div>
                    <p class="tl-duration">October 2021 - Present</p>
                    <h5>Software Engineer<span> - Do it Best Corp.</span></h5>
                    <p>
                        ###INSERT TEXT HERE
                    </p>
                </div>
            </div>
        </section>
    );
}