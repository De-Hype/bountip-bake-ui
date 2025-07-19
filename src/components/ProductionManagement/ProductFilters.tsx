"use client";

import React, { useState, useRef } from "react";
import { ChevronDown } from "lucide-react";

const ProductFilters = () => {
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(130);
  const [category, setCategory] = useState("");
  const [availability, setAvailability] = useState("");
  const minRangeRef = useRef<HTMLInputElement>(null);
  const maxRangeRef = useRef<HTMLInputElement>(null);

  const MIN = 0;
  const MAX = 500;

  const handleSliderChange = () => {
    if (minRangeRef.current && maxRangeRef.current) {
      const minVal = parseInt(minRangeRef.current.value);
      const maxVal = parseInt(maxRangeRef.current.value);
      if (minVal <= maxVal) {
        setMinPrice(minVal);
        setMaxPrice(maxVal);
      }
    }
  };

  const resetPrice = () => {
    setMinPrice(0);
    setMaxPrice(130);
    if (minRangeRef.current && maxRangeRef.current) {
      minRangeRef.current.value = "0";
      maxRangeRef.current.value = "130";
    }
  };

  const resetCategory = () => setCategory("");
  const resetAvailability = () => setAvailability("");

  const applyFilters = () => {
    console.log({ minPrice, maxPrice, category, availability });
    // Send filters to backend or state
  };

  return (
    <div className="w-full  ">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-medium text-gray-800">Price</h2>
          <button onClick={resetPrice} className="text-green-600 text-sm">
            Reset
          </button>
        </div>
        <div className="relative h-10">
          <input
            type="range"
            ref={minRangeRef}
            defaultValue={minPrice}
            min={MIN}
            max={MAX}
            step="1"
            onChange={handleSliderChange}
            className="absolute w-full appearance-none h-1 bg-transparent z-10"
            style={{ zIndex: minPrice > MAX - 100 ? 5 : undefined }}
          />
          <input
            type="range"
            ref={maxRangeRef}
            defaultValue={maxPrice}
            min={MIN}
            max={MAX}
            step="1"
            onChange={handleSliderChange}
            className="absolute w-full  appearance-none h-1 bg-transparent z-20"
          />
          <div className="relative w-full h-1 bg-gray-200 rounded">
            <div
              className="absolute h-1 bg-green-500 rounded"
              style={{
                left: `${(minPrice / MAX) * 100}%`,
                width: `${((maxPrice - minPrice) / MAX) * 100}%`,
              }}
            ></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-600">
          <span>£{minPrice}</span>
          <span>£{maxPrice}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="category"
            className="text-sm font-medium text-gray-800"
          >
            Category
          </label>
          <button onClick={resetCategory} className="text-green-600 text-sm">
            Reset
          </button>
        </div>
        <div className="relative">
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none"
          >
            <option value="">Select Category</option>
            <option value="books">Books</option>
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <label
            htmlFor="availability"
            className="text-sm font-medium text-gray-800"
          >
            Availability
          </label>
          <button
            onClick={resetAvailability}
            className="text-green-600 text-sm"
          >
            Reset
          </button>
        </div>
        <div className="relative">
          <select
            id="availability"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm appearance-none"
          >
            <option value="">Select Availability</option>
            <option value="in_stock">In Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
          <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-500 pointer-events-none" />
        </div>
      </div>

      <button
        onClick={applyFilters}
        className=" mt-3.5 w-full bg-green-600 text-white rounded-md py-2 font-medium text-sm hover:bg-green-700 transition"
      >
        Apply Filters
      </button>
    </div>
  );
};

export default ProductFilters;
