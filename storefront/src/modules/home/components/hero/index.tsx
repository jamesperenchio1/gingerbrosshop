import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Main hero */}
      <div className="relative min-h-[85vh] flex items-center justify-center bg-gradient-to-br from-background via-light to-background">
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

        <div className="relative z-10 content-container text-center px-6 py-20">
          <p className="text-primary font-nunito font-semibold tracking-[0.3em] uppercase text-sm mb-6 animate-fade-in-top">
            Thai Craft Beverages
          </p>
          <h1 className="font-display text-5xl small:text-7xl font-bold text-dark leading-tight mb-6">
            Brewed with
            <span className="text-primary block mt-2">Ginger & Love</span>
          </h1>
          <p className="font-nunito text-lg small:text-xl text-dark/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            Handcrafted ginger beverages from the heart of Thailand.
            Bold flavors, natural ingredients, zero compromise.
          </p>
          <div className="flex flex-col small:flex-row gap-4 justify-center items-center">
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center px-8 py-4 bg-primary text-white font-nunito font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5"
            >
              Shop Now
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </LocalizedClientLink>
            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center px-8 py-4 border-2 border-dark/20 text-dark font-nunito font-semibold rounded-full hover:border-primary hover:text-primary transition-all duration-300"
            >
              Our Story
            </LocalizedClientLink>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="relative -mt-1">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60C240 120 480 0 720 60C960 120 1200 0 1440 60V120H0V60Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  )
}

export default Hero
