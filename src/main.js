function Slidezy (selector, options ={}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error('Container not found');
    }

    this.opt = Object.assign({
        items: 1,
        loop: false,
        speed: 300
    }, options)

    this.slides = Array.from(this.container.children)
    this.currentIndex = this.opt.loop ? this.opt.items : 0;
    
    this.init()
    this._updatePosition()
}

Slidezy.prototype.init = function () {
    this.container.className = "slidezy-wrapper";

    this._createTrack()
    this._createNavigation()

}

Slidezy.prototype._createTrack = function () {
    this.track = document.createElement("div");
    this.track.className = "slidezy-track"

    if(this.opt.loop) {
        const slideHead = this.slides
        .slice(-this.opt.items)
        .map(slide=> slide.cloneNode(true));

        const slideTail = this.slides
            .slice(0,this.opt.items)
            .map(slide=> slide.cloneNode(true));

        this.slides = slideHead.concat(this.slides.concat(slideTail));
    }

    this.slides.forEach(slide => {
        slide.className = "slidezy-slide";
        slide.style.flexBasis = `calc(100% / ${this.opt.items})`;
        this.track.appendChild(slide);
    })
    this.container.append(this.track);
}

Slidezy.prototype._createNavigation = function () {
    this.preBtn = document.createElement("button");
    this.nextBtn = document.createElement("button");

    this.preBtn.className = "slidezy-pre"
    this.nextBtn.className = "slidezy-next"

    this.preBtn.innerText = "<";
    this.nextBtn.innerText = ">";

    this.container.append(this.preBtn, this.nextBtn);

    this.preBtn.onclick = () => this.moveSlide(-1);
    this.nextBtn.onclick = () => this.moveSlide(1);
}

Slidezy.prototype.moveSlide = function (step) {
    if(this._isAnimating) return;
    this._isAnimating = true;

    const maxIndex = this.slides.length - this.opt.items;
    this.currentIndex = Math.min(Math.max(this.currentIndex + step,0),maxIndex);

    setTimeout(() => {                
            if(this.opt.loop) {
            if(this.currentIndex <=0 ) {
                this.currentIndex = maxIndex - this.opt.items;
            }
            else if(this.currentIndex >= maxIndex) {
                this.currentIndex = this.opt.items;
            }

            this._updatePosition(true);
        }
        this._isAnimating = false;
    }, this.opt.speed)
    this._updatePosition();
}
Slidezy.prototype._updatePosition = function (instant = false) {
    this.track.style.transition = instant 
        ? "none" 
        : `transform ease ${this.opt.speed}ms`;

    this.offset = - (this.currentIndex * (100/ this.opt.items));
    this.track.style.transform = `translateX(${this.offset}%)`;
}