export default function Buttons() {
    return (
        <div class="controls">
            <div class="control active-btn" data-id="home">
                <i class="fas fa-house"></i>
            </div>
            <div class="control" data-id="portfolio">
                <i class="fas fa-code-branch"></i>
            </div>
            <div class="control" data-id="about">
                <i class="far fa-address-card"></i>
            </div>
            <div class="control" data-id="contact">
                <i class="far fa-address-book"></i>
            </div>
        </div>
    );
}

