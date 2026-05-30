
'use client';

import { useState, useEffect } from 'react';
const BannerSlider = () => {

      const banners = [
        {
          src: "/images/banner-1.jpg",
          position: "bg-left", // Looks good centered
        },
        {
          src: "/images/banner-2.jpg",
          position: "bg-center", // Shifts the focal point to the left on mobile
        },
      ];
  const [currentIndex, setCurrentIndex] = useState(0);

  // 2. Automatically change slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer); // Cleanup timer on unmount
  }, [banners.length]);
     return (
       <div className="relative w-full aspect-4/3 md:aspect-17/5 overflow-hidden bg-gray-900 mb-9">
         {/* 3. Render both banners absolutely to allow smooth cross-fade transitions */}
         {banners.map((slide, index) => (
           <div
             key={index}
             style={{ backgroundImage: `url('${slide.src}')` }}
             className={`absolute inset-0 bg-cover transition-opacity duration-1000 ease-in-out ${
               // 1. Inject the mobile position class and lock it back to center on desktop screens
               slide.position
             } md:bg-center ${
               index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
             }`}
           />
         ))}

         {/* 5. Visual dot indicators */}
         <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30 flex space-x-2">
           {banners.map((_, index) => (
             <button
               key={index}
               onClick={() => setCurrentIndex(index)}
               aria-label={`Go to slide ${index + 1}`}
               className={`h-3 w-3 rounded-full transition-all ${
                 index === currentIndex ? "bg-white w-6" : "bg-white/50"
               }`}
             />
           ))}
         </div>
       </div>
     );
}
 
export default BannerSlider;