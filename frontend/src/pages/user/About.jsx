import React from 'react'

function About() {
  return (
    <div>
      <section className="py-20 bg-[#FDF6EC]">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4A96A] rounded-3xl transform translate-x-4 translate-y-4"></div>
              <div className="relative bg-white rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1511916383969-cbf7986e0192?auto=format&fit=crop&w=800&q=80"
                  alt="Artisanal Chocolate"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-[#3D2B1F] mb-6">
                Crafted with <span className="text-[#D4A96A]">Passion</span>
              </h2>
              <p className="text-lg text-[#5D4037] mb-6 leading-relaxed">
                Welcome to The Chocolate Room, where every bite tells a story. 
                Founded in 2013, we've been dedicated to creating moments of 
                pure indulgence for chocolate lovers across the region.
              </p>
              <p className="text-lg text-[#5D4037] mb-8 leading-relaxed">
                Our journey began with a simple recipe and a big dream: to share 
                the magic of handcrafted chocolate with the world. Today, we 
                continue to honor that dream with every product we create.
              </p>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#D4A96A] mb-1">50+</div>
                  <div className="text-[#5D4037] font-medium">Products</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#D4A96A] mb-1">10+</div>
                  <div className="text-[#5D4037] font-medium">Flavors</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#D4A96A] mb-1">2013</div>
                  <div className="text-[#5D4037] font-medium">Since</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default About