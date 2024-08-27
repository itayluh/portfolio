export default function Contact() {
    return (
        <section class="section contact" id="contact">
            <div class="contact-container">
                <div class="main-title">
                    <h2>Contact <span>Me</span></h2>
                </div>
                <div class="contact-content">
                    <div class="left-contact">
                        <h4>Contact me here</h4>
                        <p>
                            This is a sample paragraph. #########
                            #####################################
                            #####################################
                            #####################################
                            #####################################
                            #####################################
                            #####################################
                        </p>
                        <div class="contact-info">
                            <div class="contact-item">
                                <div class="icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Location
                                </div>
                                <p>
                                    Fort Wayne, Indiana
                                </p>
                            </div>
                            <div class="contact-item">
                                <div class="icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                    Email
                                </div>
                                <p>
                                    taylorgdicks@gmail.com
                                </p>
                            </div>
                        </div>
                        <div class="contact-icons">
                            <div class="contact-icon">
                                <a href="#" target="_blank">
                                    <i class="fab fa-github"></i>
                                </a>
                            </div>
                            <div class="contact-icon">
                                <a href="#" target="_blank">
                                    <i class="iconify" data-icon="simple-icons:leetcode"></i>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div class="right-contact">
                        <form action="" class="contact-form">
                            <div class="input-control input-control-add">
                                <input type="text" required placeholder="YOUR NAME" />
                                <input type="email" required placeholder="YOUR EMAIL" />
                            </div>
                            <div class="input-control">
                                <input type="text" required placeholder="ENTER SUBJECT" />
                            </div>
                            <div class="input-control">
                                <textarea name="" id="" cols="15" rows="8"></textarea>
                            </div>
                            <div class="submit-btn">
                                <a href="" class="main-btn">
                                    <span class="btn-text">Resumé</span>
                                    <span class="btn-icon"><i class="fas fa-download"></i></span>
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}