import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Reveal from '../../../components/Reveal';
import { Star, Utensils, Clock } from 'lucide-react';
import { fetchFoods } from '../../../utils/api';

const FoodItems = () => {

  const [foodCategories, setFoodCategories] = useState([]);

  useEffect(() => {
    const loadFoods = async () => {
      try {
        const foods = await fetchFoods();
        
        // Group foods by category
        const grouped = foods.reduce((acc, food) => {
          if (!acc[food.category]) {
            acc[food.category] = [];
          }
          acc[food.category].push({
            id: food._id,
            name: food.name,
            description: food.description,
            price: `Rs. ${(food.sellingPrice || food.price).toFixed(2)}`,
            numericPrice: food.sellingPrice || food.price,
            originalPrice: food.sellingPrice < food.price || food.discount > 0 ? `Rs. ${food.price.toFixed(2)}` : null,
            discount: food.discount,
            rating: food.rating || 5,
            prepTime: food.prepTime || '15-20 min',
            image: food.image
          });
          return acc;
        }, {});

        // Convert to array format
        const formattedCategories = Object.keys(grouped).map(catName => ({
          name: catName,
          items: grouped[catName]
        }));

        setFoodCategories(formattedCategories);
      } catch (err) {
        console.error("Failed to load foods", err);
      }
    };

    loadFoods();
  }, []);

  return (
    <div className="w-full bg-white pt-32 pb-24">
      {/* Header Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto mb-20">
        <Reveal width="100%">
          <div className="text-center">
            <span className="text-teal-600 font-bold text-sm tracking-[0.3em] uppercase block mb-4">
              Culinary Excellence
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-navy-950 mb-8 font-serif" style={{ fontFamily: 'var(--font-serif)' }}>
              Dining at <span className="text-sand-600 italic">Dutch Point</span>
            </h1>
            <div className="w-24 h-1 bg-teal-500 mx-auto mb-10"></div>
            <p className="text-lg text-navy-600 max-w-3xl mx-auto leading-relaxed">
              Experience a symphony of flavors where local Sri Lankan spices meet international culinary techniques. 
              Our chefs use only the finest, freshest ingredients to create unforgettable dining moments by the sea.
            </p>
          </div>
        </Reveal>
      </section>

      {/* Food Categories & Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {foodCategories.map((category, catIdx) => (
          <div key={catIdx} className="mb-20 last:mb-0">
            <Reveal>
              <h2 className="text-2xl md:text-3xl font-bold text-navy-900 mb-10 flex items-center gap-4">
                <span className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center">
                  <Utensils size={18} className="text-teal-600" />
                </span>
                {category.name}
              </h2>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {category.items.map((item, itemIdx) => (
                <Reveal key={item.id} delay={itemIdx * 0.1} width="100%">
                  <div className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-navy-50 flex flex-col h-full">
                    <div className="h-64 overflow-hidden relative bg-navy-50 flex items-center justify-center">
                      {item.image && (item.image.startsWith('http') || item.image.startsWith('/')) ? (
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                      ) : (
                        <div className="text-7xl group-hover:scale-110 transition-transform duration-700">
                          {item.image || '🍽️'}
                        </div>
                      )}
                      {item.discount > 0 && (
                        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                          {item.discount}% OFF
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-navy-950 flex items-center gap-1">
                        <Star size={12} className="text-gold-500 fill-gold-500" />
                        {item.rating}
                      </div>
                    </div>
                    <div className="p-8 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-4 gap-2">
                        <h3 className="text-xl font-bold text-navy-950 leading-tight">{item.name}</h3>
                        <div className="text-right">
                          <span className="text-teal-600 font-bold text-lg block whitespace-nowrap">{item.price}</span>
                          {item.originalPrice && (
                            <div className="flex items-center justify-end gap-2 mt-1">
                              <span className="text-navy-300 text-xs line-through font-medium">{item.originalPrice}</span>
                              <span className="bg-red-50 text-red-500 text-[9px] font-bold px-1.5 py-0.5 rounded border border-red-100 whitespace-nowrap">
                                {item.discount}% OFF
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-navy-500 text-sm leading-relaxed mb-6 flex-grow italic">
                        "{item.description}"
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Specialty Section */}
      <section className="mt-24 pt-24 border-t border-navy-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-navy-950 rounded-[3rem] overflow-hidden relative p-12 md:p-20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-sand-500/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <Reveal>
                  <span className="text-sand-400 font-bold text-xs tracking-[0.3em] uppercase block mb-4">
                    Beachfront Dining
                  </span>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-8 font-serif leading-tight">
                    Private Beach <span className="text-sand-400 italic">Dinner</span>
                  </h2>
                  <p className="text-white/70 text-lg mb-10 leading-relaxed">
                    Elevate your romantic evening with a private dinner on the golden sands of Negombo. 
                    Enjoy a customized menu under the stars with the soothing melody of the Indian Ocean as your backdrop.
                  </p>
                  <Link 
                    to="/contact-us"
                    className="inline-block px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white font-bold rounded-xl transition-all duration-300 uppercase tracking-widest text-xs"
                  >
                    Inquire Now
                  </Link>
                </Reveal>
              </div>
              <div className="relative">
                <Reveal delay={0.2}>
                  <div className="rounded-2xl overflow-hidden shadow-2xl rotate-2">
                    <img 
                      src="https://res.cloudinary.com/dztzaoo6r/image/upload/v1783194000/photo-1464366400600-7168b8af9bc3_z8z9hg.jpg" 
                      alt="Beach Dinner" 
                      className="w-full h-auto"
                    />
                  </div>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FoodItems;
