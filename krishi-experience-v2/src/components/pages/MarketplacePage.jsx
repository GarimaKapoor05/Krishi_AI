import React, { useState } from "react";
import {
  Store,
  ArrowLeft,
  Tag,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  Truck
} from "lucide-react";

export function MarketplacePage({ onBackToDashboard }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const listings = [
    {
      id: 1,
      title: "Certified PBW 343 Wheat Foundation Seeds",
      category: "seeds",
      seller: "Punjab State Seeds Corporation (PUNSEED)",
      price: "₹ 1,450 / 40 kg Bag",
      rating: "4.9 (142 reviews)",
      verified: true
    },
    {
      id: 2,
      title: "Neem Coated Enriched Organic Compost",
      category: "fertilizers",
      seller: "IFFCO Kisan Bio-Products",
      price: "₹ 320 / 50 kg Bag",
      rating: "4.8 (98 reviews)",
      verified: true
    },
    {
      id: 3,
      title: "Solar Water Pumping System (5 HP DC)",
      category: "equipment",
      seller: "PM-KUSUM Approved Manufacturer",
      price: "Subsidized at ₹ 42,000 net",
      rating: "5.0 (65 reviews)",
      verified: true
    },
    {
      id: 4,
      title: "Happy Seeder & Super Seeder Machinery Rental",
      category: "rentals",
      seller: "Custom Hiring Centre, Khanna",
      price: "₹ 800 / Acre hire",
      rating: "4.7 (54 reviews)",
      verified: true
    }
  ];

  const filteredListings = activeCategory === "all"
    ? listings
    : listings.filter((l) => l.category === activeCategory);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3 pb-6 mb-6 border-b border-brand-border">
        <button
          type="button"
          onClick={onBackToDashboard}
          className="p-2 rounded-xl bg-brand-surface border border-brand-border hover:bg-brand-sand transition-colors text-stone-600"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-sans tracking-tight">
              Agricultural Marketplace
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-900">
              Kisan Bazar
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Verified agricultural inputs, machinery rentals, and farm-gate commodity buyers
          </p>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-1 text-xs">
        {["all", "seeds", "fertilizers", "equipment", "rentals"].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              activeCategory === cat
                ? "bg-brand-green text-white shadow-xs"
                : "bg-white text-stone-600 border border-brand-border hover:bg-stone-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product Listings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-brand-surface border border-brand-border shadow-card flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  {item.category}
                </span>
                {item.verified && (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center space-x-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Govt / Quality Verified</span>
                  </span>
                )}
              </div>

              <h4 className="font-bold text-sm text-stone-900 mb-1">
                {item.title}
              </h4>
              <p className="text-xs text-stone-500 mb-3">
                Seller: {item.seller}
              </p>
            </div>

            <div className="pt-3 border-t border-brand-border/60 flex items-center justify-between">
              <span className="font-extrabold text-sm text-brand-green">
                {item.price}
              </span>
              <button
                type="button"
                onClick={() => alert(`Inquiry initiated for ${item.title}. Contact details will be SMS-sent to your registered phone.`)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-sand hover:bg-brand-mint text-brand-green transition-colors"
              >
                Inquire / Order
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
