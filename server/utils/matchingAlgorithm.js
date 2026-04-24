// server/utils/matchingAlgorithm.js

const YEAR_ORDER = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];
const GROUP_SIZE_ORDER = ['1-on-1', '2-3 people', '4-5 people', '6+ people'];

/*
const BASIC_FIELDS = [
  { field: 'major', weight: 14, type: 'text' },
  { field: 'year', weight: 10, type: 'ordered', order: YEAR_ORDER },
  { field: 'gender', weight: 4, type: 'exact' },
];
*/

const ROOMMATE_FIELDS = [
  { field: 'major', weight: 7, type: 'text' },
  { field: 'year', weight: 12, type: 'ordered', order: YEAR_ORDER },
  { field: 'gender', weight: 14, type: 'exact' },
  { field: 'campusSelection', weight: 14, type: 'text' },
  { field: 'sleepSchedule', weight: 8, type: 'exact' },
  { field: 'cleanliness', weight: 9, type: 'exact' },
  { field: 'visitorPolicy', weight: 8, type: 'text' },
  { field: 'items', weight: 9, type: 'text' },
  { field: 'pets', weight: 10, type: 'text' },
  { field: 'socialBattery', weight: 9, type: 'text' },
];

const STUDY_FIELDS = [
  { field: 'major', weight: 15, type: 'text' },
  { field: 'year', weight: 14, type: 'ordered', order: YEAR_ORDER },
  { field: 'gender', weight: 5, type: 'exact' },
  { field: 'currentClasses', weight: 10, type: 'category', flexibleValues: ['other'] },
  { field: 'studyGoals', weight: 7, type: 'category' },
  { field: 'honors', weight: 5, type: 'category', flexibleValues: ['other'] },
  { field: 'studyLocation', weight: 6, type: 'category', flexibleValues: ['flexible'] },
  { field: 'studyTimes', weight: 9, type: 'category', flexibleValues: ['flexible'] },
  { field: 'idealGroupSize', weight: 6, type: 'ordered', order: GROUP_SIZE_ORDER },
  { field: 'virtualOrInPerson', weight: 9, type: 'format' },
  { field: 'studyHabits', weight: 7, type: 'category', flexibleValues: ['mixed'] },
  { field: 'studyStyle', weight: 7, type: 'category', flexibleValues: ['mixed'] }
];

const CONTEXT_WEIGHTS = {
  //display on recommended matches
  comprehensive: [
    ...ROOMMATE_FIELDS,
    ...STUDY_FIELDS,
  ],
  //only on roommate page
  roommate: [
    ...ROOMMATE_FIELDS,
  ],
  //only on study group page
  study: [
    ...STUDY_FIELDS,
  ]
};

const normalizeContext = (context = 'comprehensive') => {
  return CONTEXT_WEIGHTS[context] ? context : 'comprehensive';
};

const normalizeValue = (value) => String(value || '').trim().toLowerCase();

const getValue = (user, field) => user?.[field] ?? user?.survey?.[field];

const calculateTextSimilarity = (text1, text2) => {
  if (!text1 || !text2) return 0;

  const words1 = normalizeValue(text1).split(/\s+/).filter(word => word.length > 3);
  const words2 = normalizeValue(text2).split(/\s+/).filter(word => word.length > 3);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(word => set2.has(word)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};

const scoreExact = (left, right) => {
  return normalizeValue(left) === normalizeValue(right) ? 1 : 0;
};

const scoreText = (left, right) => {
  const normalizedLeft = normalizeValue(left);
  const normalizedRight = normalizeValue(right);

  if (!normalizedLeft || !normalizedRight) return 0;
  if (normalizedLeft === normalizedRight) return 1;
  if (normalizedLeft.includes(normalizedRight) || normalizedRight.includes(normalizedLeft)) return 0.7;

  return calculateTextSimilarity(normalizedLeft, normalizedRight);
};

const scoreOrdered = (left, right, order) => {
  const leftIndex = order.indexOf(left);
  const rightIndex = order.indexOf(right);

  if (leftIndex === -1 || rightIndex === -1) return scoreExact(left, right);

  const diff = Math.abs(leftIndex - rightIndex);
  if (diff === 0) return 1;
  if (diff === 1) return 0.72;
  if (diff === 2) return 0.4;
  return 0.2;
};

const scoreFormat = (left, right) => {
  if (scoreExact(left, right)) return 1;

  const leftValue = normalizeValue(left);
  const rightValue = normalizeValue(right);
  if (leftValue === 'both' || rightValue === 'both') return 0.75;
  return 0;
};

const scoreCategory = (left, right, flexibleValues = []) => {
  if (scoreExact(left, right)) return 1;

  const leftValue = normalizeValue(left);
  const rightValue = normalizeValue(right);
  const normalizedFlexibleValues = flexibleValues.map(normalizeValue);

  if (normalizedFlexibleValues.includes(leftValue) || normalizedFlexibleValues.includes(rightValue)) {
    return 0.65;
  }

  return 0;
};

const scoreField = (left, right, config) => {
  switch (config.type) {
    case 'ordered':
      return scoreOrdered(left, right, config.order || []);
    case 'text':
      return scoreText(left, right);
    case 'format':
      return scoreFormat(left, right);
    case 'category':
      return scoreCategory(left, right, config.flexibleValues);
    case 'exact':
    default:
      return scoreExact(left, right);
  }
};

const calculateCompatibility = (user1, user2, context = 'comprehensive') => {
  const normalizedContext = normalizeContext(context);
  const fields = CONTEXT_WEIGHTS[normalizedContext];
  let earnedWeight = 0;
  let availableWeight = 0;

  fields.forEach(config => {
    const left = getValue(user1, config.field);
    const right = getValue(user2, config.field);

    if (left === null || left === undefined || left === '' || right === null || right === undefined || right === '') {
      return;
    }

    availableWeight += config.weight;
    earnedWeight += scoreField(left, right, config) * config.weight;
  });

  if (availableWeight === 0) return 0;
  return Math.min(100, Math.round((earnedWeight / availableWeight) * 100));
};

const getMatchedUsers = async (targetUser, allUsers, context = 'comprehensive') => {
  const normalizedContext = normalizeContext(context);
  const matches = allUsers
    .filter(user => user._id.toString() !== targetUser._id.toString())
    .map(user => ({
      ...user._doc || user,
      compatibilityScore: calculateCompatibility(targetUser, user, normalizedContext),
      matchContext: normalizedContext
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
