// MATCHING ALGORITHM DOCUMENTATION
// ====================================
// This file explains the AI matching algorithm used in MatchMajor

/*
ALGORITHM OVERVIEW:
===================
The matching algorithm compares user profiles to find study partners with high compatibility.
It uses a weighted scoring system where different factors contribute different points (0-100 total).

SCORING BREAKDOWN:
==================

1. MAJOR MATCH (0-30 points)
   - Exact match: +30 points
   - Different major: +5 points (networking benefit)
   - Purpose: Students in same major likely share course work and challenges

2. ACADEMIC YEAR PROXIMITY (0-20 points)
   - Same year: +20 points
   - Adjacent years (1 year apart): +15 points
   - Two years apart: +10 points
   - More than 2 years: +5 points
   - Purpose: Close year levels facilitate better study partnerships

3. SHARED INTERESTS (0-30 points)
   - Uses Jaccard Similarity: |A ∩ B| / |A ∪ B|
   - Multiplied by 30 for a 0-30 point range
   - Purpose: Shared tech interests are key for collaboration

   Example:
   User A interests: ['Web Development', 'React', 'Node.js']
   User B interests: ['Web Development', 'Python', 'Node.js']
   
   Intersection (both have): ['Web Development', 'Node.js'] = 2 items
   Union (unique items): ['Web Development', 'React', 'Node.js', 'Python'] = 4 items
   Score: 2/4 = 0.5 × 30 = 15 points

4. EXPERIENCE LEVEL SIMILARITY (0-10 points)
   - Same level: +10 points
   - Adjacent levels (e.g., Beginner→Intermediate): +7 points
   - Different levels (e.g., Beginner→Advanced): +3 points
   - Purpose: Similar skill levels promote better learning dynamics

5. GOALS ALIGNMENT (0-10 points)
   - Uses text similarity through word overlap
   - Filters out small words (< 3 characters)
   - Multiplied by 10 for a 0-10 point range
   - Purpose: Aligned career goals create stronger partnerships

MATHEMATICAL FORMULAS:
======================

Jaccard Similarity:
  J(A, B) = |A ∩ B| / |A ∪ B|
  
Text Similarity:
  Unique common words / Total unique words (with filters applied)
  
Final Score:
  score = major_score + year_score + interests_score + experience_score + goals_score
  final = MIN(100, score)  // Cap at 100


HOW IT WORKS:
=============

1. User completes survey with: major, year, interests, experience, goals
2. Profile is saved to database
3. When user navigates to /matches, algorithm:
   - Gets current user's profile
   - Fetches all other users
   - Calculates compatibility score with each
   - Returns top 10 matches sorted by score

4. Matches displayed showing:
   - User profile photo or initials
   - Username
   - Major and year
   - Experience level
   - Sample interests
   - Compatibility percentage


FILES INVOLVED:
===============

Backend:
- server/models/User.js: Updated to store survey data
- server/utils/matchingAlgorithm.js: Core matching logic
- server/controllers/matchController.js: API endpoints
- server/routes/matchRoutes.js: Route definitions

Frontend:
- src/api/matches.js: API client
- src/pages/Survey.js: Collection survey from users
- src/pages/Matches.js: Display matched results
- src/pages/Matches.css: Styling

API ENDPOINTS:
==============

GET /api/matches
- Get recommendations for current user
- Returns: Array of top 10 matches with scores

GET /api/matches/:userId
- Get specific user's profile
- Returns: User data

PUT /api/matches/profile
- Update current user's profile
- Body: { major, year, interests, experience, goals }
- Returns: Updated user data


USAGE EXAMPLE:
==============

Frontend flow:
1. User logs in
2. If no profile data, redirect to /survey
3. User fills survey form
4. Form submitted to PUT /api/matches/profile
5. User navigated to /matches
6. GET /api/matches fetches recommendations
7. Matches displayed with compatibility scores

How matching happens:
User A (Major: CS, Year: Junior, Interests: [Web Dev, React, AI/ML], Exp: Advanced)
User B (Major: CS, Year: Senior, Interests: [Web Dev, Node.js, AI/ML], Exp: Advanced)

Major: CS == CS → 30 points
Year: Junior (index 2) vs Senior (index 3) → 1 apart → 15 points
Interests: {Web Dev, React, AI/ML} ∩ {Web Dev, Node.js, AI/ML} = {Web Dev, AI/ML}
         Union = {Web Dev, React, AI/ML, Node.js} 
         Similarity = 2/4 = 0.5 × 30 = 15 points
Experience: Advanced == Advanced → 10 points
Goals: (not provided in this example)

TOTAL SCORE: 30 + 15 + 15 + 10 = 70% Match


IMPROVEMENTS & EXTENSIONS:
==========================

Possible enhancements:
1. Add learning style matching
2. Add timezone/location matching
3. Add GPA/academic level matching
4. Implement feedback system (rate matches)
5. Add AI learning to improve algorithm
6. Time-based matching (study time availability)
7. Project-based matching for collaborative work
8. Add blocklist/previous match history
9. Real-time match notifications
10. Match persistence (previous matches)
*/

module.exports = `
Matching Algorithm Documentation
This file explains the scoring system and formula used
`;
