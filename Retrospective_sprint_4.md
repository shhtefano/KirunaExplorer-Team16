RETROSPECTIVE FOR TEAM 16 
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs done: 4/4
- Total points committed vs done: 23/23
- Nr of hours planned vs spent (as a team) 94/97

**Remember**  a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   |    14     |    -   |     67h     |     70h30m      |
| 10      |   4      |    8    |      13h      |     12h30m         |
| 20  |   3      |    5   |      7h      |     6h         |
| 14 |   2      |    5   |      3h      |     3h         |
| 11 |   3      |    5   |      4h      |     5h         |


   

> place technical tasks corresponding to story `#0` and leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)

|            | Mean | StDev |
|------------|------|-------|
| Estimation |  4.79h    |    1.15h   | 
| Actual     |   5.36h   |   1.34h    |

- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1 = 0.12 $$ 
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| = 0.19 $$

  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated 3h
  - Total hours spent 4h
  - Nr of automated unit test cases 145 in total (145 covered)
  - Coverage 90.75%
- E2E testing:
  - Total hours estimated 6h
  - Total hours spent 5h 30m
  - Nr of test cases 26 in total (covered 25) (1 failed)
- Code review 
  - Total hours estimated 4h
  - Total hours spent 4h
- Technical Debt management:
  - Strategy adopted explained it in TD_strategy.md
  - Total hours estimated estimated 2h
  - Total hours spent 2h


## ASSESSMENT

- What caused your errors in estimation (if any)?
> We improved our estimation this time, but we still underestimated the time required for some task fixes. Specifically leading to longer debugging and testing than anticipated.
- What lessons did you learn (both positive and negative) in this sprint?
> On the positive side, we improved our coding approach by using shared components, saving time, and enhancing team collaboration. On the negative side, we conducted fewer end-to-end tests than planned.
- Which improvement goals set in the previous retrospective were you able to achieve? 
>  We did use the sonarcloud quality gate to maintain our quality conditions on new code uploaded to github.
- Which ones you were not able to achieve? Why?
> We spent less overall time on debt reduction, in part due to the amount of fixes and new requests we had this sprint.
- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

> There is no new sprint, but we will try to implement the fixes of the feedback and polish the website for the final video.

- One thing you are proud of as a Team!!
> We worked really hard and supported each other as a team!