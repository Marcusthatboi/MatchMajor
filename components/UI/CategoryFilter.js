import React from 'react';
import './CategoryFilter.css';

const CategoryFilter = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="category-filter">
      <div className="filter-label">Filter by Category:</div>
      <div className="filter-buttons">
        {categories.map((category, index) => (
          <button
            key={index}
            className={`filter-button ${activeCategory === category ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category === '' ? 'All' : category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;