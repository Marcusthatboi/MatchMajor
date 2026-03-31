// server/utils/matchingAlgorithm.js

/**
 * Calculate compatibility score between two users (0-100)
 * Considers:
 * - Major alignment (30 points)
 * - Academic year proximity (20 points)
 * - Shared interests (30 points)
 * - Experience level similarity (10 points)
 * - Goals alignment bonus (10 points)
 */
const calculateCompatibility = (user1, user2) => {
  let score = 0;

  // 1. Major Match (30 points)
  if (user1.major && user2.major) {
    if (user1.major === user2.major) {
      score += 30;
    } else {
      // Partial credit for related fields
      score += 5;
    }
  }

  // 2. Year Proximity (20 points)
  if (user1.year && user2.year) {
    const yearOrder = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
    const year1Index = yearOrder.indexOf(user1.year);
    const year2Index = yearOrder.indexOf(user2.year);

    if (year1Index !== -1 && year2Index !== -1) {
      const yearDiff = Math.abs(year1Index - year2Index);
      if (yearDiff === 0) {
        score += 20; // Same year
      } else if (yearDiff === 1) {
        score += 15; // Adjacent years
      } else if (yearDiff === 2) {
        score += 10; // Two years apart
      } else {
        score += 5; // More than 2 years
      }
    }
  }

  // 3. Interests Overlap (30 points max)
  if (user1.interests && user2.interests && user1.interests.length > 0 && user2.interests.length > 0) {
    const interestSimilarity = calculateJaccardSimilarity(user1.interests, user2.interests);
    score += interestSimilarity * 30; // 0-30 points
  }

  // 4. Experience Level Similarity (10 points)
  if (user1.experience && user2.experience) {
    const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const exp1Index = experienceLevels.indexOf(user1.experience);
    const exp2Index = experienceLevels.indexOf(user2.experience);

    if (exp1Index !== -1 && exp2Index !== -1) {
      const expDiff = Math.abs(exp1Index - exp2Index);
      if (expDiff === 0) {
        score += 10; // Same level
      } else if (expDiff === 1) {
        score += 7; // One level apart
      } else {
        score += 3; // More than one level apart
      }
    }
  }

  // 5. Goals Alignment Bonus (10 points)
  if (user1.goals && user2.goals) {
    const goalsSimilarity = calculateTextSimilarity(user1.goals, user2.goals);
    score += goalsSimilarity * 10; // 0-10 points
  }

  // Ensure score is between 0-100
  return Math.min(100, Math.round(score));
};

/**
 * Calculate Jaccard Similarity between two arrays (0-1)
 * Formula: |A ∩ B| / |A ∪ B|
 */
const calculateJaccardSimilarity = (arr1, arr2) => {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

/**
 * Calculate text similarity using basic word overlap (0-1)
 * Simple approach: count common words
 */
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};

/**
 * Get matched users for a specific user
 * Excludes the user themselves and user's connections
 */
const getMatchedUsers = async (targetUser, allUsers) => {
  const matches = allUsers
    .filter(user => user._id.toString() !== targetUser._id.toString())
    .map(user => ({
      ...user._doc || user,
      compatibilityScore: calculateCompatibility(targetUser, user)
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 10); // Get top 10 matches

  return matches;
};

module.exports = {
  calculateCompatibility,
  calculateJaccardSimilarity,
  calculateTextSimilarity,
  getMatchedUsers
};
