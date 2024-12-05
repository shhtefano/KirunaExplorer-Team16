# Retrospective Sprint 2 (Team 16)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done
  > 3 committed & 3 done
- Total points committed vs. done
  > 9 committed & 9 done
- Nr of hours planned vs. spent (as a team)
  > 97h & 103h50m

Definition of done:

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed
- 

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |     |
| ----- | ------- | ------ | ---------- | ------------ | --- |
| _#0_  | 4       | 0      | 28h        | 33h30m       | --- |
| 1     | 1       | 1      | 1h         | 30m          | FIX |
| 2     | 3       | 2      | 10h        | 10h40m       | FIX |
| 3     | 1       | 1      | 4h         | 3h           | FIX |
| 4     | 5       | 5      | 22h        | 20h10m       |     |
| 5     | 5       | 3      | 18h        | 15h          |     |
| 6     | 4       | 1      | 14h        | 16h          |     |

- Hours per task average, standard deviation (estimate and actual)

Estimate:

> Average: 3.83 hours - Standard Deviation: 1.64 hours

Actual:

> Average: 3.78 hours - Standard Deviation: 2.18 hours

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

  $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0.19 $$

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right|  = 0.2009 $$

## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated = 5h
  - Total hours spent = 6h
  - Nr of automated unit test cases = 45
  - Coverage (if available) = 83%
- E2E testing:
  - Total hours estimated = 3h
  - Total hours spent = 4h 10m
- Code review
  - Total hours estimated = 3h
  - Total hours spent = 3h

## ASSESSMENT

- What caused your errors in estimation (if any)?

  > We made some tasks too general, and should rather have split them up more for more accurate estimation.

- What lessons did you learn (both positive and negative) in this sprint?

  > We improved our planning and estimation processes, which allowed us to set more realistic goals. Also we improved our team organization and task distribution, ensuring that everyone contributed efficiently to the overall effort.

- Which improvement goals set in the previous retrospective were you able to achieve?

  > We wanted to hit a test coverage goal of <70%, which we hit for the backend. We also implemented more E2E tests. We wanted more comprehensive documentation within the team, so that we could more easily collaborate on different tasks. We improved the sharing of core information in our google document which led to us being more efficent.

- Which ones you were not able to achieve? Why?

  > The last goal was to improve the error handling within our application, which we did to an extent. Moving forward we want more comprehensive error handling.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > To utilize the burndown chart more efficiently to keep us on the right track.
  > Become better at splitting tasks more accurately, to then make the estimation more accurate.

- One thing you are proud of as a Team!!
  > We are proud of the amount of effort we put down for this project as a team, and that we support and take care of each other.
