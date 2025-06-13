function Slidezy (selector, options ={}) {
    this.container = document.querySelector(selector);
    if (!this.container) {
        console.error('Container not found');
    }

    this.opt = Object.assign({
        items: 1,
        loop: false,
        speed: 300,
        navigation: false,
    }, options)

    this.slides = Array.from(this.container.children)
    this.currentIndex = this.opt.loop ? this.opt.items : 0;
    
    this.init()
    this._updatePosition()
}

Slidezy.prototype.init = function () {
    this.container.className = "slidezy-wrapper";

    this._createContent()
    this._createTrack()
    this._createControls()
    this._createNavigation()
}

Slidezy.prototype._createContent = function () {
    this.content = document.createElement("div");
    this.content.className = "slidezy-content";
    this.container.appendChild(this.content);
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
    this.content.append(this.track);
}

Slidezy.prototype._createControls = function () {
    this.preBtn = document.createElement("button");
    this.nextBtn = document.createElement("button");

    this.preBtn.className = "slidezy-pre"
    this.nextBtn.className = "slidezy-next"

    this.preBtn.innerText = "<";
    this.nextBtn.innerText = ">";

    this.content.append(this.preBtn, this.nextBtn);

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
                this._updatePosition(true);

            }
            else if(this.currentIndex >= maxIndex) {
                this.currentIndex = this.opt.items;
                this._updatePosition(true);
            }
        }

        this._isAnimating = false;
    }, this.opt.speed)

    this._updatePosition();
}

Slidezy.prototype._updateNav = function () {
    let realIndex = this.currentIndex;
    if(this.opt.loop) {
        const slideCount = this.slides.length - (this.opt.items * 2);
        realIndex = (this.currentIndex - this.opt.items + slideCount) % slideCount;
    }
    const pageIndex = Math.floor(realIndex / this.opt.items);
    
    Array.from(this._dotsWrapper.children).forEach((dot, index) => {
        dot.classList.toggle("active", index === pageIndex);
    })
    
}

Slidezy.prototype._updatePosition = function (instant = false) {
    this.track.style.transition = instant 
        ? "none" 
        : `transform ease ${this.opt.speed}ms`;

    this.offset = - (this.currentIndex * (100/ this.opt.items));
    this.track.style.transform = `translateX(${this.offset}%)`;

    if(this.opt.navigation && !instant) {
        this._updateNav()
    }
}

Slidezy.prototype._createNavigation = function () {
    this._dotsWrapper = document.createElement("div");
    this._dotsWrapper.className = "dots-wrapper";

    const countSlides = this.slides.length - (this.opt.loop ? this.opt.items * 2 : 0);
    const page = Math.ceil(countSlides / this.opt.items);

    for (let i = 0; i < page; i++ ) {
        const dot = document.createElement("button")
        dot.className = "slidezy-dot";
        if(i === 0) dot.classList.add("active");

        dot.onclick = () => {
            this.currentIndex = i * this.opt.items + (this.opt.loop ? this.opt.items : 0);
            this._updatePosition();
        }
        this._dotsWrapper.appendChild(dot);
    }
    this.container.appendChild(this._dotsWrapper);
}