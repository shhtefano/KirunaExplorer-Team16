# RETROSPECTIVE 3 (Team 16)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done
  > 4 committed & 4 done
- Total points committed vs. done
  > 19 & 19
- Nr of hours planned vs. spent (as a team)
  > 97h & 91h

**Remember** a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing, coverage >=80%
- E2E passing, coverage >=70%
- Code review completed
- Code present on VCS
- End-to-End tests performed

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual     |     |
| ----- | ------- | ------ | ---------- | ---------------- | --- |
| _#0_  | 3       | -      | 20h30m     | 20h              | --- |
| 1 & 2 | 14      | -      | 17h30m        | 25h45m | FIX |
| 7     | 5       | 5      | 14h        | 11h45m           |     |
| 8     | 4       | 3      | 7h         | 7h30m            |     |
| 9     | 5       | 8      | 21h        | 14h30m           |     |
| 19    | 5       | 3      | 17h        | 11h       |     |

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task (average, standard deviation)
- Estimate: 3,37 ore hours per task,  1,83 hours per task
- Actual: 2,97 hours per task, 1,69 hours per task
- Total task estimation error ratio: sum of total hours estimation / sum of total hours spent -1: +7,18%
- Total estimation error ratio: −0.067

## QUALITY MEASURES

- Unit Testing
  - Total hours estimated : 7h
  - Total hours spent: 4h 30m
  - Nr of automated unit test cases: 75 in total (62 covered) (13 failed)
  - Coverage (if available): 82.6
- E2E testing
  - Total hours estimated: 5h
  - Total hours spent: 2h 15m
  - Nr of automated unit test cases: 23 in total (22 covered) (1 failed)
  - Coverage: 96%
- Code review
  - Total hours estimated: 7h
  - Total hours spent: 6h 30m
- Technical Debt management:
  - Strategy adopted : explained it in TD_strategy.md
  - Total hours estimated estimated at sprint planning: 4h 30m
  - Total hours spent: 3h 30m

## ASSESSMENT

- What caused your errors in estimation (if any)?
- This time we made a better estimation for the user stories, but we should have assigned more hours for technical debt reduction.

- What lessons did you learn (both positive and negative) in this sprint?

  > We understood that technical debt is something we have to incorporate into our work, and that using SonarCloud should be a part of our development process.

- Which improvement goals set in the previous retrospective were you able to achieve?

  > We achieved better estimation overall by splitting tasks more often. We also used the burndown chart to more effectively track our progress and momentum during the sprint.

- Which ones you were not able to achieve? Why?

  > We achieved our main goals

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > We have to allocate time in the sprint for reducing our technical debt. Use the SonarCloud analysis on the main branch to prevent "bad code"

- One thing you are proud of as a Team!!
  > We delivered a good project for the demo to the stakeholders and we worked hard this sprint.
