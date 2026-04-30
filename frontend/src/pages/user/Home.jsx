import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';
import { FiSearch, FiFilter, FiChevronRight } from 'react-icons/fi';
import { GiChocolateBar } from 'react-icons/gi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [checked, setChecked] = useState([]);
  const [radio, setRadio] = useState([]);
  const [rating, setRating] = useState(0);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPagesFromApi, setTotalPagesFromApi] = useState(1);
  const searchInputRef = useRef(null);
  const gridRef = useRef(null);
  
  const activeCategories = useMemo(() => categories.filter(c => !c.isBlocked), [categories]);
  const totalPages = totalPagesFromApi;
  const paginatedProducts = products; // Backend now handles pagination

  const prices = [
    { name: "₹0 to ₹500", array: [0, 500] },
    { name: "₹500 to ₹1000", array: [500, 1000] },
    { name: "₹1000 to ₹2000", array: [1000, 2000] },
    { name: "₹2000 to ₹5000", array: [2000, 5000] },
    { name: "₹5000+", array: [5000, 100000] },
  ];

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    if (gridRef.current) {
        gridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchInitialData();

    const handleTriggerSearch = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => {
        if (searchInputRef.current) {
          searchInputRef.current.focus();
        }
      }, 300);
    };

    window.addEventListener('triggerSearchFocus', handleTriggerSearch);
    return () => window.removeEventListener('triggerSearchFocus', handleTriggerSearch);
  }, []);

  useEffect(() => {
    if (!loading) {
      fetchProducts();
    }
  }, [selectedCategory, debouncedSearch, checked, radio, rating, currentPage, loading]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    if (!loading) {
      setCurrentPage(1);
    }
  }, [selectedCategory, debouncedSearch, checked, radio, rating]);

  const handleFilter = (value, id) => {
    let all = [...checked];
    if (value) all.push(id);
    else all = all.filter(c => c !== id);
    setChecked(all);
  };

  const handleReset = () => {
    setChecked([]);
    setRadio([]);
    setRating(0);
    setSelectedCategory('All');
    setSearchQuery('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const fetchInitialData = async () => {
    try {
      const [catRes, prodRes, bannerRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/products', { params: { limit: 6 } }),
        api.get('/banners')
      ]);
      setCategories(catRes.data);
      const productsData = prodRes.data.products || prodRes.data;
      setProducts(productsData || []);
      setBanners(bannerRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const params = {
        page: currentPage,
        limit: 6,
        search: debouncedSearch,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
      };

      // If unified filters are present, we definitely use the filter endpoint
      const { data } = await api.post('/products/filter', 
        { checked, radio, rating },
        { params }
      );

      if (data?.success) {
        setProducts(data.products);
        setTotalItems(data.pagination.total);
        setTotalPagesFromApi(data.pagination.pages);
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setFetchingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
      {/* Banner Carousel */}
      {banners.length > 0 && (
        <section className="relative">
          <Swiper
            modules={[Navigation, Autoplay, Pagination]}
            navigation
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            loop={banners.length > 1}
            className="h-[500px] md:h-[600px] lg:h-[700px]"
          >
            {banners.map((banner) => (
              <SwiperSlide key={banner._id} >
                {banner.url ? (
                  <Link to={banner.url} className="block w-full h-full">
                    <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
                      <img 
                        src={banner.image} 
                        alt={banner.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-10" />
                      <div className="absolute bottom-12 left-6 md:left-12 max-w-2xl">
                        <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg">
                          {banner.title}
                        </h2>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px]">
                    <img 
                      src={banner.image} 
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    <div className="absolute bottom-12 left-6 md:left-12 max-w-2xl">
                      <h2 className="text-3xl md:text-5xl lg:text-6xl font-black text-white drop-shadow-lg">
                        {banner.title}
                      </h2>
                    </div>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative bg-[#6B3F1F] py-24 overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 pointer-events-none">
          <GiChocolateBar className="text-[400px] rotate-12 translate-x-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-2xl space-y-6">
            <span className="inline-block px-4 py-1 rounded-full bg-[#D4A96A] text-[#6B3F1F] text-sm font-black uppercase tracking-widest">
              Premium Collection 2026
            </span>
            <h1 className="text-4xl md:text-7xl font-black text-[#FDF6EC] leading-tight tracking-tighter">
              Indulge in <span className="text-[#D4A96A]">Pure</span> Chocolate Bliss.
            </h1>
            <p className="text-xl text-[#F5E6D3] opacity-80 max-w-lg leading-relaxed">
              Handcrafted artisanal chocolates and premium baking supplies delivered right to your doorstep.
            </p>
            <div className="pt-6 flex gap-4">
              {/* Category Dropdown in Hero */}
              <div className="relative group">
                <FiFilter className="absolute left-6 top-1/2 -translate-y-1/2 text-[#6B3F1F] z-10" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="pl-14 pr-10 py-4 bg-[#D4A96A] text-[#6B3F1F] font-bold rounded-2xl shadow-lg hover:bg-[#FDF6EC] transition-all appearance-none cursor-pointer outline-none border-none focus:ring-4 focus:ring-[#D4A96A]/30"
                >
                  <option value="All">All Categories</option>
                  {activeCategories.map((c) => (
                    <option key={c._id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                  <FiChevronRight className="rotate-90 text-[#6B3F1F]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white p-6 rounded-[35px] shadow-2xl border border-[#D4A96A]/20 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <FiSearch className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input 
              ref={searchInputRef}
              type="text"
              placeholder="Search for chocolates, cakes, hampers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-[#D4A96A]/20 transition-all outline-none text-[#6B3F1F] font-medium"
            />
          </div>
        </div>
      </div>

      {/* Reset/Filter Row */}
      <div className="max-w-7xl mx-auto px-6 mt-8 flex justify-end">
         {(checked.length > 0 || radio.length > 0 || rating > 0 || selectedCategory !== 'All' || searchQuery !== '') && (
           <button 
             onClick={handleReset}
             className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-all"
           >
             Reset All Filters
           </button>
         )}
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-72 flex-shrink-0 space-y-10">
          <div className="bg-white p-8 rounded-[35px] shadow-sm border border-[#D4A96A]/10">
            <h3 className="text-xl font-black text-[#6B3F1F] mb-6 flex items-center gap-2">
              <FiFilter className="text-[#D4A96A]" /> Filters
            </h3>
            
            {/* Category Filter */}
            <div className="space-y-4 mb-8">
              <h4 className="font-bold text-[#A0522D] uppercase tracking-wider text-xs">Categories</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {activeCategories.map(c => (
                  <label key={c._id} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={checked.includes(c.name)}
                      onChange={(e) => handleFilter(e.target.checked, c.name)}
                      className="w-5 h-5 rounded border-gray-300 text-[#6B3F1F] focus:ring-[#D4A96A]"
                    />
                    <span className="text-[#6B3F1F] font-medium group-hover:text-[#D4A96A] transition-colors">{c.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-4 mb-8">
              <h4 className="font-bold text-[#A0522D] uppercase tracking-wider text-xs">Price Range</h4>
              <div className="space-y-2">
                {prices.map(p => (
                  <label key={p.name} className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="radio" 
                      name="price"
                      checked={JSON.stringify(radio) === JSON.stringify(p.array)}
                      onChange={() => setRadio(p.array)}
                      className="w-5 h-5 text-[#6B3F1F] focus:ring-[#D4A96A]"
                    />
                    <span className="text-[#6B3F1F] font-medium group-hover:text-[#D4A96A] transition-colors">{p.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-4">
              <h4 className="font-bold text-[#A0522D] uppercase tracking-wider text-xs">Minimum Rating</h4>
              <div className="flex flex-wrap gap-2">
                {[5, 4, 3, 2, 1].map(r => (
                  <button 
                    key={r}
                    onClick={() => setRating(r)}
                    className={`px-3 py-2 rounded-xl text-sm font-bold flex items-center gap-1 transition-all ${
                      rating === r 
                      ? 'bg-[#6B3F1F] text-white shadow-md' 
                      : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-[#6B3F1F]'
                    }`}
                  >
                    {r} ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Section */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-black text-[#6B3F1F] tracking-tight">Our Sweet Finds</h2>
              <p className="text-[#A0522D] font-medium mt-1">Found {totalItems} delicious items</p>
            </div>
          </div>

          {fetchingProducts ? (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B3F1F]"></div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map(product => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center items-center gap-2">
                  <button 
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-4 rounded-2xl bg-white border border-[#D4A96A]/20 text-[#6B3F1F] hover:bg-[#FDF6EC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <FiChevronRight className="rotate-180" />
                  </button>

                  <div className="flex gap-2">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i + 1}
                        onClick={() => handlePageChange(i + 1)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all ${
                          currentPage === i + 1 
                          ? 'bg-[#6B3F1F] text-white shadow-lg' 
                          : 'bg-white text-gray-400 hover:text-[#6B3F1F] border border-[#D4A96A]/10'
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>

                  <button 
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-4 rounded-2xl bg-white border border-[#D4A96A]/20 text-[#6B3F1F] hover:bg-[#FDF6EC] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-32 bg-white/50 rounded-[50px] border-2 border-dashed border-[#D4A96A]/30">
              <GiChocolateBar className="text-8xl text-[#D4A96A] mx-auto mb-4 opacity-30" />
              <h3 className="text-2xl font-bold text-[#6B3F1F]">No chocolates found here!</h3>
              <p className="text-gray-500 mt-1 uppercase tracking-widest text-sm font-bold">Try adjusting your filters or search</p>
              <button onClick={handleReset} className="mt-6 px-6 py-3 bg-[#6B3F1F] text-white rounded-xl font-bold">Clear Filters</button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter FAB */}
      <div className="lg:hidden fixed bottom-15 left-6 z-60">
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="w-14 h-14 bg-[#6B3F1F] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <FiFilter className="text-xl" />
        </button>
      </div>

      {/* Mobile Filter Drawer (Overlay) */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-[#FDF6EC] rounded-t-[40px] p-8 max-h-[85vh] overflow-y-auto animate-slide-up">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-[#6B3F1F]">Filter Options</h3>
              <button 
                onClick={() => setIsFilterOpen(false)}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#6B3F1F] shadow-sm font-black"
              >
                ✕
              </button>
            </div>

            {/* Mobile Filters Content (Reusable or duplicated for simplicity here) */}
             <div className="space-y-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-[#A0522D] uppercase tracking-wider text-xs">Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {activeCategories.map(c => (
                      <button 
                        key={c._id}
                        onClick={() => handleFilter(!checked.includes(c.name), c.name)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          checked.includes(c.name) 
                          ? 'bg-[#6B3F1F] text-white' 
                          : 'bg-white text-[#6B3F1F] border border-[#D4A96A]/20'
                        }`}
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#A0522D] uppercase tracking-wider text-xs">Price Range</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {prices.map(p => (
                      <button 
                        key={p.name}
                        onClick={() => setRadio(p.array)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          JSON.stringify(radio) === JSON.stringify(p.array)
                          ? 'bg-[#6B3F1F] text-white' 
                          : 'bg-white text-[#6B3F1F] border border-[#D4A96A]/20'
                        }`}
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-bold text-[#A0522D] uppercase tracking-wider text-xs">Minimum Rating</h4>
                  <div className="flex gap-2">
                    {[5, 4, 3, 2, 1].map(r => (
                      <button 
                        key={r}
                        onClick={() => setRating(r)}
                        className={`w-12 h-12 rounded-xl font-bold flex items-center justify-center transition-all ${
                          rating === r 
                          ? 'bg-[#6B3F1F] text-white shadow-md' 
                          : 'bg-white text-gray-400 border border-[#D4A96A]/20'
                        }`}
                      >
                        {r}★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => { setIsFilterOpen(false); fetchProducts(); }}
                    className="flex-1 py-4 bg-[#6B3F1F] text-white font-bold rounded-2xl shadow-xl"
                  >
                    Show Results
                  </button>
                  <button 
                    onClick={handleReset}
                    className="px-6 py-4 bg-white text-red-600 font-bold rounded-2xl border border-red-100"
                  >
                    Reset
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Newsletter / Feature Section */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-[#A0522D] rounded-[50px] p-12 relative overflow-hidden flex flex-col items-center text-center">
             <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
             <h2 className="text-4xl font-black text-[#FDF6EC] mb-4">Sweet Deals in your Inbox!</h2>
             <p className="text-[#F5E6D3] opacity-80 mb-8 max-w-md">Subscribe to our newsletter to receive exclusive offers and chocolate tasting events!</p>
             <div className="w-full max-w-md flex flex-col sm:flex-row gap-4">
                <input type="email" placeholder="Enter your email" className="flex-1 px-6 py-4 rounded-2xl bg-[#FDF6EC] border-none outline-none focus:ring-4 focus:ring-white/20" />
                <button className="px-8 py-4 bg-[#6B3F1F] text-white font-bold rounded-2xl shadow-xl hover:bg-[#D4A96A] hover:text-[#6B3F1F] transition-all">
                    Subscribe
                </button>
             </div>
        </div>
      </section>
    </div>
  );
}

export default Home;