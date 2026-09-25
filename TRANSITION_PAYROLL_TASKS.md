# Transition Payroll — Things To Figure Out

A transition payroll is the extra paycheck run that covers the days between an old pay schedule and a new one, so no one misses a day of pay.

This is a list of open questions and tasks about it. Each one is written so anyone can pick it up, even without background.

---

## Task 1: Do we still need the "Create transition payroll" screen?

**What we see:**
There is a screen that lets you create a transition payroll by hand. It asks for a check date, deduction choices, and tax settings. In the code it is a component called `TransitionCreation`.

**How it works today:**
When you open transition payroll, the app first looks for a transition payroll that already exists. If it finds one, it takes you to the edit screen to review and run it. If it does not find one, it shows the `TransitionCreation` screen instead so you can make one.

Right now that "look for an existing one" step only checks payrolls whose pay period ends within the next 28 days. So if the transition period ends more than 28 days out, the app does not find the payroll that already exists, and it falls back to showing the create screen.

**Why we are asking:**
The system seems to build the transition payroll for you automatically as soon as you change the pay schedule. If it is always built for us, then a screen to build it by hand may never be needed.

**What to find out:**
1. Does the system always create the transition payroll on its own when the pay schedule changes? Or are there times it does not?
2. If it is always created for us: we probably do not need this screen. Confirm that, then plan to remove it.
3. If it is sometimes not created: we do need this screen. We then need to determine when it should show up and under what conditions a transition payroll isn't created.
4. Once we know when it should show, test that path start to finish and make sure it works.

