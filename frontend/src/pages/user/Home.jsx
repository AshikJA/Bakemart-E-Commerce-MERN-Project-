import React, { useState, useEffect, useRef } from 'react';
import api from '../../api/client';
import ProductCard from '../../components/ProductCard';
import Loading from '../../components/Loading';
import { FiSearch, FiFilter, FiChevronRight } from 'react-icons/fi';
import { GiChocolateBar } from 'react-icons/gi';

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchingProducts, setFetchingProducts] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const searchInputRef = useRef(null);
  const gridRef = useRef(null);
  
  const activeCategories = categories.filter(c => !c.isBlocked);
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const paginatedProducts = products.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    if (gridRef.current) {
        gridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      setCurrentPage(1);
    }
  }, [selectedCategory, debouncedSearch, loading]);

  const fetchInitialData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/admin/categories'),
        api.get('/products', { params: { limit: 50 } })
      ]);
      setCategories(catRes.data);
      const productsData = prodRes.data.products || prodRes.data;
      setProducts(productsData || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setFetchingProducts(true);
    try {
      const params = { limit: 50 };
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (debouncedSearch) params.search = debouncedSearch;

      const res = await api.get('/products', { params });
      
      const productsData = res.data.products || res.data;
      setProducts(productsData || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setFetchingProducts(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EC]">
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
              <a href="#products-grid">
                <button className="px-8 py-4 bg-[#D4A96A] text-[#6B3F1F] font-bold rounded-2xl shadow-lg hover:bg-[#FDF6EC] transition-all flex items-center gap-2">
                  Explore Shop <FiChevronRight />
                </button>
              </a>
              
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

      {/* Product Grid */}
      <section ref={gridRef} className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-4xl font-black text-[#6B3F1F] tracking-tight">Our Sweet Finds</h2>
            <p className="text-[#A0522D] font-medium mt-1">Found {products.length} delicious items</p>
          </div>
        </div>

        {fetchingProducts ? (
           <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6B3F1F]"></div>
           </div>
        ) : products.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
          </div>
        )}
      </section>

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