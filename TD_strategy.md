# Technical Debt Reduction Strategy
## SE2 Project Team 16
### Version 1.0 - November 2024

## Overview
This document outlines our strategy for reducing technical debt in our Kiruna Explorer project, utilizing SonarCloud as the main monitoring tool.

## Current State Assessment
Our project currently faces technical debt for:
- Code duplication across multiple services
- Inconsistent code styling and documentation
- Legacy dependencies requiring updates
- Test coverage below target threshold
- Code smells and other bugs

## Goals and Metrics
### Primary Goals
1. Reduce technical debt identified with SonarCloud
2. Maintain "A" maintainability rating
3. Increase test coverage to 70%-80%
4. Zero critical security hotspots

### Phase 1: Analysis and Prioritization
1. Review all SonarCloud issues
2. Categorize debt items by:
   - Impact on system stability
   - Implementation effort
   - Business value

### Phase 2: Adressing the issues
1. Address code smells with "Major" severity
2. Implement automated code formatting (perhaps Trunks?)
3. Update outdated dependencies automatically, by using the "Dependabot" github action.

### Phase 3: Systematic Reduction
1. Refactor duplicated code into shared utilities
2. Increase unit test coverage for both backend and frontend
3. Implement missing integration tests
4. Address complex code segments (high cognitive complexity)

### Phase 4: Prevention 
1. Establish new quality gates in SonarCloud
2. Implement pre-commit hooks
3. Create documentation standards
4. Set up automated dependency updates

## Quality Gates

### Required Quality Gate Conditions
```
- Coverage on New Code > 70%
- Duplicated Lines on New Code < 5%
- Maintainability Rating = A
- Reliability Rating = B
- Security Rating = A
- Technical Debt Ratio on New Code < 5%
```

## Team Responsibilities

### Team Members
- Monitor SonarCloud metrics
- Maintain test coverage
- Follow new coding standards
- Document changes properly

### Mitigation Strategies
1. Allocate 20% of sprint capacity to debt reduction
2. Comprehensive test coverage for refactored code
3. Regular team feedback sessions
4. Better communication of long-term benefits

## Success Criteria
1. All quality gates passing
2. Technical debt ratio below 5%
3. Test coverage at or above 70%
4. Zero critical or blocker issues
5. Automated checks implemented and running

## Conclusion
This concludes our approach to reducing technical debt while maintaining project momentum. Regular reviews and adjustments will ensure we meet our debt reduction goals while delivering value to stakeholders.
