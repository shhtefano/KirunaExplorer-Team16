# RETROSPECTIVE SPRINT 1 (Team 16)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done: 9 vs 3
- Total points committed vs. done: 25 vs 4
- Nr of hours planned vs. spent (as a team): 96 vs 86

**Remember**a story is done ONLY if it fits the Definition of Done:

- Unit Tests passing: 13
- Code review completed: 3
- Code present on VCS: yes
- End-to-End tests performed: 1 test for client

### Detailed statistics

| Story                | # Tasks | Points | Hours est. | Hours actual |
| -------------------- | ------- | ------ | ---------- | ------------ |
| _#0_                 | 8       | /      | 36h 30m    | 44h 20m      |
| 1 - add description  | 5       | 1      | 13h        | 16h          |
| 2 - link documents   | 5       | 2      | 12h 30m    | 16h          |
| 3 - add georeference | 4       | 1      | 8h         | 8h40m        |

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

Estimate:

> Average: 2.92 hours - Standard Deviation: 0.98 hours

Actual:

> Average: 3.53 hours - Standard Deviation: 1.24 hours

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

  $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0.2143 $$

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0.2023$$

## QUALITY MEASURES

- Unit Testing & Integration:
  - Total hours estimated 6h
  - Total hours spent 8h
  - Nr of automated unit test cases 13
  - Coverage (if available) 80%
- E2E testing:
  - Total hours estimated 2h
  - Total hours spent 2h
- Code review
  - Total hours estimated 3h
  - Total hours spent 2h45m

## ASSESSMENT

- What caused your errors in estimation (if any)?

> We misjudged the complexity of certain tasks, and some unexpected tasks were introduced midway through the sprint.

- What lessons did you learn (both positive and negative) in this sprint?

  > We learned that it's more efficient to fully complete one user story before beginning another and to follow their planned order. We also realized the importance of better task organization, breaking tasks down more effectively, and prioritizing writing unit tests early on.

- Which improvement goals set in the previous retrospective were you able to achieve?

  > We were able to complete the stories with the correct definition of Done and we also managed to organize better the work and also organize better the team with frequent scrum meetings.

- Which ones you were not able to achieve? Why?

  > We were unable to handle some errors comprehensively and improve our organization on YouTrack because we once again underestimated the complexity and time required for certain tasks.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

> Reach 70% coverage FE & BE tests
>
> Improve documentation to have the same overview of the project
>
> Improve error handling

- One thing you are proud of as a Team!!
  > We managed to improve our work from developing code to team organization, delivering demo on time with completed stories.
