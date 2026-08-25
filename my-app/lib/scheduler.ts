import { Subject, Topic, StudyTask, UserPreferences, TimeSlot, TaskType } from '../types/study';

interface TopicWithPriority {
  topic: Topic;
  subject: Subject;
  priorityScore: number;
  urgencyFactor: number;
  reason: string;
  daysUntilExam: number;
}

export const getDaysDifference = (targetDateStr: string, fromDate: Date = new Date()): number => {
  const target = new Date(targetDateStr);
  const from = new Date(fromDate);
  // Reset times to midnight for clean day differences
  target.setHours(0, 0, 0, 0);
  from.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - from.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const calculateUrgencyFactor = (daysUntilExam: number): number => {
  if (daysUntilExam <= 2) return 1.0;
  if (daysUntilExam <= 4) return 0.92;
  if (daysUntilExam <= 7) return 0.82;
  if (daysUntilExam <= 14) return 0.65;
  if (daysUntilExam <= 21) return 0.48;
  return 0.30;
};

export const getDifficultyWeight = (diff: Topic['difficulty']): number => {
  switch (diff) {
    case 'easy': return 0.3;
    case 'medium': return 0.6;
    case 'hard': return 0.85;
    case 'very_hard': return 1.0;
    default: return 0.5;
  }
};

export const getWeightageWeight = (weight: Topic['weightage']): number => {
  switch (weight) {
    case 'low': return 0.3;
    case 'medium': return 0.6;
    case 'high': return 0.85;
    case 'critical': return 1.0;
    default: return 0.5;
  }
};

/**
 * Calculates priority score (0 to 100) and reason for a specific topic
 */
export const evaluateTopicPriority = (topic: Topic, subject: Subject): { priority: number; reason: string; urgency: number; daysUntilExam: number } => {
  const daysUntilExam = getDaysDifference(subject.examDate);
  const urgency = calculateUrgencyFactor(daysUntilExam);
  const difficulty = getDifficultyWeight(topic.difficulty);
  const weightage = getWeightageWeight(topic.weightage);
  
  // Weakness factor based on confidence (0 to 1)
  const confidenceWeakness = (100 - Math.min(100, Math.max(0, topic.currentConfidence))) / 100;
  
  // Quiz score calibration
  let quizModifier = 0;
  let quizNote = '';
  if (topic.quizScore !== undefined && topic.quizScore !== null) {
    if (topic.quizScore < 45) {
      quizModifier = 0.25;
      quizNote = `Low quiz score (${topic.quizScore}%)`;
    } else if (topic.quizScore < 70) {
      quizModifier = 0.12;
      quizNote = `Moderate quiz score (${topic.quizScore}%)`;
    } else if (topic.quizScore >= 85) {
      quizModifier = -0.15; // De-prioritize well-mastered topics
      quizNote = `High quiz score (${topic.quizScore}%)`;
    }
  }

  // Raw weighted score calculation
  const rawScore = 
    (urgency * 0.38) + 
    (difficulty * 0.22) + 
    (weightage * 0.20) + 
    (confidenceWeakness * 0.20) + 
    quizModifier;

  // Normalize to 15-99 scale
  const normalizedPriority = Math.min(99, Math.max(15, Math.round(rawScore * 100)));

  // Generate intelligent reason
  let reason = '';
  if (daysUntilExam <= 3) {
    reason = `🔥 Exam in ${daysUntilExam} ${daysUntilExam === 1 ? 'day' : 'days'}! Critical focus needed.`;
  } else if (quizNote && topic.quizScore! < 60) {
    reason = `⚠️ Diagnostic Alert: ${quizNote}. Extra practice recommended.`;
  } else if (topic.weightage === 'critical' && topic.currentConfidence < 50) {
    reason = `⭐ High exam weightage with low confidence (${topic.currentConfidence}%).`;
  } else if (topic.difficulty === 'hard' || topic.difficulty === 'very_hard') {
    reason = `🧠 High complexity chapter. Best tackled with spaced focus sessions.`;
  } else if (topic.completed) {
    reason = `🔄 Maintenance review to preserve retention.`;
  } else {
    reason = `📚 Standard syllabus progression for ${subject.code}.`;
  }

  return {
    priority: normalizedPriority,
    reason,
    urgency,
    daysUntilExam
  };
};

/**
 * Generate an adaptive 14-day study plan distributing topics logically
 */
export const generateAdaptiveSchedule = (
  subjects: Subject[],
  preferences: UserPreferences,
  existingTasks: StudyTask[] = [],
  startDate: Date = new Date()
): StudyTask[] => {
  if (subjects.length === 0) return [];

  // 1. Gather all topics and compute dynamic priorities
  const allPrioritizedTopics: TopicWithPriority[] = [];
  
  for (const subject of subjects) {
    for (const topic of subject.topics) {
      const evaluation = evaluateTopicPriority(topic, subject);
      allPrioritizedTopics.push({
        topic,
        subject,
        priorityScore: evaluation.priority,
        urgencyFactor: evaluation.urgency,
        reason: evaluation.reason,
        daysUntilExam: evaluation.daysUntilExam,
      });
    }
  }

  // Sort topics by priority descending (highest priority first)
  allPrioritizedTopics.sort((a, b) => b.priorityScore - a.priorityScore);

  const newSchedule: StudyTask[] = [];
  const totalPlanningDays = 14;
  const sessionMinutes = preferences.sessionDurationMinutes || 45;

  // Track how many sessions a topic has been assigned
  const topicSessionCounts = new Map<string, number>();

  for (let dayOffset = 0; dayOffset < totalPlanningDays; dayOffset++) {
    const targetDate = new Date(startDate);
    targetDate.setDate(targetDate.getDate() + dayOffset);
    const dateStr = targetDate.toISOString().split('T')[0];
    
    // Check if weekend (0 = Sunday, 6 = Saturday)
    const isWeekend = targetDate.getDay() === 0 || targetDate.getDay() === 6;
    const dailyAvailableHours = isWeekend ? preferences.dailyHoursWeekend : preferences.dailyHoursWeekday;
    
    // Calculate total sessions possible for this day
    const maxSessionsToday = Math.max(1, Math.min(8, Math.floor((dailyAvailableHours * 60) / (sessionMinutes + (preferences.breakDurationMinutes || 10)))));
    
    // Available time slots
    const activeSlots: TimeSlot[] = preferences.preferredSlots.length > 0 ? preferences.preferredSlots : ['morning', 'afternoon', 'evening', 'night'];
    
    let sessionsScheduledToday = 0;
    const subjectsScheduledToday = new Set<string>();

    // Select topics for today with intelligent interleaving (mix subjects)
    for (const item of allPrioritizedTopics) {
      if (sessionsScheduledToday >= maxSessionsToday) break;
      
      const { topic, subject, priorityScore, reason, daysUntilExam } = item;
      
      // Don't schedule a subject after its exam date!
      if (dayOffset > daysUntilExam) {
        continue;
      }

      // Check how many times this topic was scheduled already
      const previousAssignments = topicSessionCounts.get(topic.id) || 0;
      const estimatedSessionsRequired = Math.max(1, Math.ceil((topic.estimatedHours * 60) / sessionMinutes));

      if (previousAssignments >= estimatedSessionsRequired && topic.completed) {
        // If already completed and has enough sessions, skip unless spaced repetition applies
        continue;
      }

      // Interleaving check: avoid scheduling same subject 3 times in a row if other subjects need attention
      const alreadyInToday = subjectsScheduledToday.has(subject.id);
      if (alreadyInToday && subjectsScheduledToday.size < subjects.length && sessionsScheduledToday < maxSessionsToday - 1) {
        // Look for another subject first to interleave
        const otherSubjectItem = allPrioritizedTopics.find(
          other => !subjectsScheduledToday.has(other.subject.id) && 
                   dayOffset <= other.daysUntilExam && 
                   (topicSessionCounts.get(other.topic.id) || 0) < Math.max(1, Math.ceil((other.topic.estimatedHours * 60) / sessionMinutes))
        );
        if (otherSubjectItem) {
          continue; // Will pick the other subject next
        }
      }

      // Determine task type (learn, revision, practice_quiz)
      let taskType: TaskType = 'learn';
      if (topic.completed || previousAssignments >= 1) {
        taskType = dayOffset % 2 === 0 ? 'revision' : 'practice_quiz';
      } else if (topic.difficulty === 'very_hard') {
        taskType = 'learn';
      }

      // Assign time slot based on session index
      const slotIndex = sessionsScheduledToday % activeSlots.length;
      const timeSlot = activeSlots[slotIndex];

      // Check if existing task is already completed by user for this date/topic
      const existing = existingTasks.find(t => t.date === dateStr && t.topicId === topic.id);

      const task: StudyTask = {
        id: existing ? existing.id : `task-${dateStr}-${topic.id}-${sessionsScheduledToday}`,
        date: dateStr,
        subjectId: subject.id,
        topicId: topic.id,
        subjectCode: subject.code,
        subjectName: subject.name,
        subjectColor: subject.color,
        topicTitle: topic.title,
        chapter: topic.chapter,
        durationMinutes: sessionMinutes,
        timeSlot,
        type: taskType,
        priorityScore,
        completed: existing ? existing.completed : false,
        completedAt: existing?.completedAt,
        reason
      };

      newSchedule.push(task);
      topicSessionCounts.set(topic.id, previousAssignments + 1);
      subjectsScheduledToday.add(subject.id);
      sessionsScheduledToday++;
    }
  }

  return newSchedule;
};

/**
 * Calculates overall exam preparation readiness (0 - 100%)
 */
export const calculateOverallReadiness = (subjects: Subject[]): {
  overallPercentage: number;
  completedTopics: number;
  totalTopics: number;
  totalHoursNeeded: number;
  subjectBreakdown: { subjectId: string; code: string; name: string; color: string; readiness: number; weakCount: number }[];
} => {
  if (subjects.length === 0) {
    return {
      overallPercentage: 0,
      completedTopics: 0,
      totalTopics: 0,
      totalHoursNeeded: 0,
      subjectBreakdown: []
    };
  }

  let totalWeightedReadiness = 0;
  let totalCredits = 0;
  let totalTopics = 0;
  let completedTopics = 0;
  let totalHoursNeeded = 0;

  const subjectBreakdown = subjects.map(subject => {
    let subjectReadinessSum = 0;
    let weakCount = 0;
    const count = subject.topics.length;

    if (count === 0) {
      return {
        subjectId: subject.id,
        code: subject.code,
        name: subject.name,
        color: subject.color,
        readiness: 0,
        weakCount: 0
      };
    }

    subject.topics.forEach(topic => {
      totalTopics++;
      if (topic.completed) completedTopics++;
      totalHoursNeeded += topic.estimatedHours;

      // Base readiness from confidence
      let topicReadiness = topic.currentConfidence;
      if (topic.quizScore !== undefined) {
        // Blend confidence and quiz score
        topicReadiness = (topic.currentConfidence * 0.4) + (topic.quizScore * 0.6);
      }
      if (topic.completed) {
        topicReadiness = Math.max(topicReadiness, 85);
      }

      if (topicReadiness < 55) {
        weakCount++;
      }

      subjectReadinessSum += topicReadiness;
    });

    const subjectAvg = Math.round(subjectReadinessSum / count);
    const weight = Math.max(1, subject.creditHours || 3);
    totalWeightedReadiness += subjectAvg * weight;
    totalCredits += weight;

    return {
      subjectId: subject.id,
      code: subject.code,
      name: subject.name,
      color: subject.color,
      readiness: subjectAvg,
      weakCount
    };
  });

  const overallPercentage = totalCredits > 0 ? Math.round(totalWeightedReadiness / totalCredits) : 0;

  return {
    overallPercentage,
    completedTopics,
    totalTopics,
    totalHoursNeeded: Math.round(totalHoursNeeded * 10) / 10,
    subjectBreakdown
  };
};
