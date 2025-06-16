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
        preBtn: null,
        nextBtn: null,
        autoPlay: false,
        autoPlayTimeOut: 3000,
        autoPlayPauseOnHover: true,
        slideBy: 1,
        controls: true,
        controlsValues: ["<", ">"]
    }, options)

    this.slides = Array.from(this.container.children)

    this._cloneMock = this.opt.items + this.opt.slideBy;
    
    this.cloneItems = this._cloneMock > this.slides.length 
                    ? this.slides.length 
                    : this._cloneMock;

    this.currentIndex = this.opt.loop ? this.cloneItems : 0;

    this.init()
    this._updatePosition(true);
}

Slidezy.prototype.init = function () {
    this.container.className = "slidezy-wrapper";

    this._createContent()
    this._createTrack()
    if(this.opt.controls) {
        this._createControls()
    }
    if(this.opt.navigation) {
        this._createNavigation()
    }
    if(this.opt.autoPlay) {
        this._autoPlay();

        if(this.opt.autoPlayPauseOnHover) {
            this.container.onmouseover = () => this._stopAutoPlay();
            this.container.onmouseleave = () => this._autoPlay();
        }
    }
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
        .slice(-this.cloneItems)
        .map(slide=> slide.cloneNode(true));

        const slideTail = this.slides
            .slice(0,this.cloneItems)
            .map(slide=> slide.cloneNode(true));

        this.slides = slideHead.concat(this.slides.concat(slideTail));
        console.log(`Slides length: ${this.slides.length}`);
    }

    this.slides.forEach(slide => {
        slide.classList.add("slidezy-slide") 
        slide.style.flexBasis = `calc(100% / ${this.opt.items})`;
        this.track.appendChild(slide);
    })
    this.content.append(this.track);
}

Slidezy.prototype._createControls = function () {
    this.preBtn = this.opt.preBtn
    ? document.querySelector(`.${this.opt.preBtn}`)
    :document.createElement("button");
    this.nextBtn = this.opt.nextBtn
    ? document.querySelector(`.${this.opt.nextBtn}`)
    :document.createElement("button");

    if(!this.opt.preBtn) {
    this.preBtn.className = "slidezy-pre"
    this.preBtn.innerHTML = this.opt.controlsValues[0];
    this.content.appendChild(this.preBtn);
    }

    if(!this.opt.nextBtn) {
    this.nextBtn.className = "slidezy-next"
    this.nextBtn.innerHTML = this.opt.controlsValues[1];
    this.content.appendChild(this.nextBtn);
    }


    this.preBtn.onclick = () => this.moveSlide(-this.opt.slideBy);
    this.nextBtn.onclick = () => this.moveSlide(this.opt.slideBy);
}
Slidezy.prototype._autoPlay = function () {
    if(this.autoPlayTimer) return;

    this.autoPlayTimer = setInterval(() => {
        this.moveSlide(this.opt.slideBy);
    }, this.opt.autoPlayTimeOut);
}
Slidezy.prototype._stopAutoPlay = function () {
    clearInterval(this.autoPlayTimer);
    this.autoPlayTimer = null;
}
Slidezy.prototype.moveSlide = function (step) {
    if(this._isAnimating) return;
    this._isAnimating = true;

    const maxIndex = this.slides.length - this.opt.items;
    console.log('maxIndex :>> ', maxIndex);
    console.log('Math.max(this.currentIndex + step,0) :>> ', step);
    this.currentIndex = Math.min(Math.max(this.currentIndex + step,0),maxIndex);
    console.log(`Current index: ${this.currentIndex}`);
    setTimeout(() => {                
            if(this.opt.loop) {
                const slideCount = this._getSlideCount();
            if(this.currentIndex < this.opt.items +  this.opt.slideBy ) {
                this.currentIndex += slideCount
                console.log(`Current index after loop: ${this.currentIndex}`);
                this._updatePosition(true);

            }
            else if(this.currentIndex >= slideCount + this.opt.slideBy) {
                this.currentIndex -= slideCount
                console.log(`Current index after loop2: ${this.currentIndex}`);
                this._updatePosition(true);
            }
        }

        this._isAnimating = false;
    }, this.opt.speed)

    this._updatePosition();
}
Slidezy.prototype._getSlideCount = function () {
     return this.slides.length - (this.opt.loop ? this.cloneItems * 2 : 0);
}
Slidezy.prototype._updateNav = function () {
    let realIndex = this.currentIndex;
    console.log(`currentIndex: ${this.currentIndex}`);
    if(this.opt.loop) {
        const slideCount = this._getSlideCount()
        realIndex = (this.currentIndex - this.opt.items - this.opt.slideBy + slideCount) % slideCount;
        console.log('currentIndex after loop: ', this.currentIndex);
        console.log(`realIndex: ${realIndex}`);
    }
    const pageIndex = Math.floor(realIndex / this.opt.items);
    console.log(`Page index: ${pageIndex}`);
    Array.from(this._dotsWrapper.children).forEach((dot, index) => {
        dot.classList.toggle("active", index === pageIndex);
        ;
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
    const countSlides = this._getSlideCount()
    const page = Math.ceil(countSlides / this.opt.items);

    for (let i = 0; i < page; i++ ) {
        const dot = document.createElement("button")
        dot.className = "slidezy-dot";
        if(i === 0) dot.classList.add("active");

        dot.onclick = () => {
            this.currentIndex = i * this.opt.items + (this.opt.loop ? this.opt.items : 0) + this.opt.slideBy;

            this._updatePosition();
        }
        this._dotsWrapper.appendChild(dot);
    }
    this.container.appendChild(this._dotsWrapper);
}