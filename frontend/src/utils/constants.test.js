import { describe, it, expect } from 'vitest'
import { PREBUILT_CASES, createBasePayload, SESSION_STATUS } from './constants'

/**
 * Validation rules derived from backend validators.py
 * These must be satisfied for all payloads
 */
const VALIDATION_RULES = {
  // Question constraints
  correctPlusWrongEqualsAttempted: (payload) => {
    const { correct_answers, wrong_answers, questions_attempted } = payload
    return correct_answers + wrong_answers === questions_attempted
  },

  attemptedNotExceedsTotal: (payload) => {
    return payload.questions_attempted <= payload.total_questions
  },

  retryNotExceedsAttempted: (payload) => {
    return payload.retry_count <= payload.questions_attempted
  },

  hintsNotExceedsTotal: (payload) => {
    return payload.hints_used <= payload.total_hints_embedded
  },

  completedRequiresFullAttempt: (payload) => {
    if (payload.session_status !== SESSION_STATUS.COMPLETED) {
      return true // Rule only applies to completed sessions
    }
    return payload.questions_attempted === payload.total_questions
  },

  allFieldsPresent: (payload) => {
    const requiredFields = [
      'correct_answers',
      'wrong_answers',
      'questions_attempted',
      'total_questions',
      'retry_count',
      'hints_used',
      'total_hints_embedded',
      'time_spent_seconds',
      'topic_completion_ratio',
      'session_status',
    ]
    return requiredFields.every((field) => field in payload)
  },
}

describe('Validation: Base Payload', () => {
  const basePayload = createBasePayload('test_chapter', 'test_student')

  Object.entries(VALIDATION_RULES).forEach(([ruleName, ruleFunc]) => {
    it(`should satisfy: ${ruleName}`, () => {
      expect(ruleFunc(basePayload)).toBe(true)
    })
  })
})

describe('Validation: Prebuilt Cases', () => {
  PREBUILT_CASES.forEach((testCase) => {
    describe(`Case: ${testCase.key} (${testCase.label})`, () => {
      const payload = testCase.values

      it('should be valid payload structure', () => {
        expect(VALIDATION_RULES.allFieldsPresent(payload)).toBe(true)
      })

      Object.entries(VALIDATION_RULES).forEach(([ruleName, ruleFunc]) => {
        it(`should satisfy: ${ruleName}`, () => {
          const result = ruleFunc(payload)
          if (!result) {
            console.error(`FAILED: ${testCase.key}`)
            console.error(`Rule: ${ruleName}`)
            console.error('Payload:', payload)
          }
          expect(result).toBe(true)
        })
      })

      // Additional consistency checks
      it('should have valid question counts (all >= 0)', () => {
        expect(payload.correct_answers).toBeGreaterThanOrEqual(0)
        expect(payload.wrong_answers).toBeGreaterThanOrEqual(0)
        expect(payload.questions_attempted).toBeGreaterThanOrEqual(0)
        expect(payload.total_questions).toBeGreaterThanOrEqual(0)
      })

      it('should have valid retry count (>= 0, logic: typically >= attempted)', () => {
        expect(payload.retry_count).toBeGreaterThanOrEqual(0)
        // Note: retry_count being >= attempted is common but not strictly required
        // If retries are typically counted as additional attempts beyond first try
      })

      it('should have hints <= total hints embedded', () => {
        expect(payload.hints_used).toBeLessThanOrEqual(
          payload.total_hints_embedded
        )
      })

      it('should have valid time spent (>= 0)', () => {
        expect(payload.time_spent_seconds).toBeGreaterThanOrEqual(0)
      })

      it('should have valid topic completion ratio (0-1)', () => {
        expect(payload.topic_completion_ratio).toBeGreaterThanOrEqual(0)
        expect(payload.topic_completion_ratio).toBeLessThanOrEqual(1)
      })

      it('should have valid session status', () => {
        expect([SESSION_STATUS.COMPLETED, SESSION_STATUS.EXITED_MIDWAY]).toContain(
          payload.session_status
        )
      })
    })
  })
})

describe('Edge Cases and Constraints', () => {
  it('should allow partial attempts with EXITED_MIDWAY status', () => {
    const partialPayload = {
      correct_answers: 3,
      wrong_answers: 2,
      questions_attempted: 5,
      total_questions: 10,
      retry_count: 2,
      hints_used: 1,
      total_hints_embedded: 5,
      time_spent_seconds: 500,
      topic_completion_ratio: 0.5,
      session_status: SESSION_STATUS.EXITED_MIDWAY,
    }

    expect(VALIDATION_RULES.completedRequiresFullAttempt(partialPayload)).toBe(
      true
    )
    expect(VALIDATION_RULES.attemptedNotExceedsTotal(partialPayload)).toBe(true)
  })

  it('should reject partial attempts with COMPLETED status', () => {
    const invalidPayload = {
      correct_answers: 3,
      wrong_answers: 2,
      questions_attempted: 5,
      total_questions: 10,
      retry_count: 2,
      hints_used: 1,
      total_hints_embedded: 5,
      time_spent_seconds: 500,
      topic_completion_ratio: 0.5,
      session_status: SESSION_STATUS.COMPLETED,
    }

    expect(VALIDATION_RULES.completedRequiresFullAttempt(invalidPayload)).toBe(
      false
    )
  })

  it('should allow zero hints used', () => {
    const noHintsPayload = {
      correct_answers: 5,
      wrong_answers: 5,
      questions_attempted: 10,
      total_questions: 10,
      retry_count: 0,
      hints_used: 0,
      total_hints_embedded: 5,
      time_spent_seconds: 600,
      topic_completion_ratio: 0.5,
      session_status: SESSION_STATUS.COMPLETED,
    }

    expect(VALIDATION_RULES.hintsNotExceedsTotal(noHintsPayload)).toBe(true)
    expect(VALIDATION_RULES.correctPlusWrongEqualsAttempted(noHintsPayload)).toBe(
      true
    )
  })
})
