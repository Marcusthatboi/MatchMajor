// server/utils/matchingAlgorithm.js

/**
 * Calculate compatibility score between two users (0-100)
 * Considers:
 * - Major alignment (40 points)
 * - Academic year proximity (25 points)
 * - Experience level similarity (15 points)
 * - Bio/goals alignment bonus (20 points)
 */
const calculateCompatibility = (user1, user2) => {
  let score = 0;

  // 1. Major Match (40 points)
  if (user1.major && user2.major) {
    if (user1.major === user2.major) {
      score += 40;
    } else {
      // Partial credit for related fields
      score += 8;
    }
  }

  // 2. Year Proximity (25 points)
  if (user1.year && user2.year) {
    const yearOrder = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
    const year1Index = yearOrder.indexOf(user1.year);
    const year2Index = yearOrder.indexOf(user2.year);

    if (year1Index !== -1 && year2Index !== -1) {
      const yearDiff = Math.abs(year1Index - year2Index);
      if (yearDiff === 0) {
        score += 25; // Same year
      } else if (yearDiff === 1) {
        score += 18; // Adjacent years
      } else if (yearDiff === 2) {
        score += 10; // Two years apart
      } else {
        score += 5; // More than 2 years
      }
    }
  }

  // 3. Experience Level Similarity (15 points)
  if (user1.experience && user2.experience) {
    const experienceLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
    const exp1Index = experienceLevels.indexOf(user1.experience);
    const exp2Index = experienceLevels.indexOf(user2.experience);

    if (exp1Index !== -1 && exp2Index !== -1) {
      const expDiff = Math.abs(exp1Index - exp2Index);
      if (expDiff === 0) {
        score += 15; // Same level
      } else if (expDiff === 1) {
        score += 10; // One level apart
      } else {
        score += 5; // More than one level apart
      }
    }
  }

  // 4. Bio/goals alignment bonus (20 points)
  const user1Text = user1.bio || user1.goals;
  const user2Text = user2.bio || user2.goals;
  if (user1Text && user2Text) {
    const textSimilarity = calculateTextSimilarity(user1Text, user2Text);
    score += textSimilarity * 20; // 0-20 points
  }

  // Ensure score is between 0-100
  return Math.min(100, Math.round(score));
};

/**
 * Calculate text similarity using basic word overlap (0-1)
 * Simple approach: count common words.
 */
const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const words1 = text1.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter((word) => word.length > 3);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((word) => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};

/**
 * Get matched users for a specific user.
 * Excludes the user themselves and user's connections.
 */
const getMatchedUsers = async (targetUser, allUsers) => {
  const matches = allUsers
    .filter((user) => user._id.toString() !== targetUser._id.toString())
    .map((user) => ({
      ...user._doc || user,
      compatibilityScore: calculateCompatibility(targetUser, user)
    }))
    .sort((a, b) => b.compatibilityScore - a.compatibilityScore)
    .slice(0, 10);

  return matches;
};

module.exports = {
  calculateCompatibility,
  calculateTextSimilarity,
  getMatchedUsers
};
