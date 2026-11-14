# When Sunday Comes Around — Game Plan

**Working concept:** A Day of Healthy Habits  
**Audience assumption:** Elementary-age children, roughly 6–12. Confirm the grade level before finalizing the reading difficulty and controls.  
**Setting:** An ordinary weekend day at home and around the neighborhood. This makes room for breakfast, chores, a trip to the basketball court, and an evening at home.

## Project context

**Current phase:** Morning prototype implementation is authorized. Final character art is awaiting approval.

**Approved:** The Morning scene sequence in this document. Start with the dedicated game page when implementation is authorized.

**Frontend stack:** React, TypeScript (`.tsx`), and Tailwind CSS.

Use this brief as the current project context. Follow approved decisions and keep proposed mechanics open for review.`r`n`r`n### Reference images

- [Horizontal chapter wireframe](https://chatgpt.com/library?file_id=libfile_7b36e8242f508191872df0eb01097df9&account_id=personal)
- [Boy and girl illustration style reference](https://chatgpt.com/library?file_id=libfile_6294ce797ce0819197a4225401e85474&account_id=personal)

The prototype uses temporary emoji character portraits. It implements the proposed three-heart and chapter scoring rules for review.

## Game page — current planning scope

Open directly on the dedicated game page. The landing page is deferred. The reading and quiz ideas below remain part of the broader website plan.

### Player setup

1. Choose **Boy** or **Girl** from two illustrated character cards.
2. Enter the name you want shown in the game. Accept a nickname and retain **Play as Guest** as a draft privacy option.
3. Select **Start** to open the chapter strip with Morning in view. Use the selected character in all chapter previews and scenes. Both characters follow the same routine.

### Horizontal chapter strip

Use the [Spyker Heritage timeline](https://spykercars.com/heritage) as a reference for moving through a timeline horizontally. Follow the supplied wireframe for the actual composition. One horizontal strip has three groups in order: **Morning → Afternoon → Evening**. Each group pairs a wider text panel on the left with a narrower character illustration on the right. The illustration shows the chosen character at that time of day.

| Chapter | Initial state | Button and preview |
| --- | --- | --- |
| Morning | Available | **Play Morning** opens the approved scene sequence. |
| Afternoon | Visible and locked | Show the illustration and chapter description. Disable Play and show “Coming soon.” |
| Evening | Visible and locked | Show the illustration and chapter description. Disable Play and show “Coming soon.” |

Children can browse all three groups by swiping or using Previous and Next buttons. Support keyboard navigation and keep the lock explanation visible. Browsing a chapter leaves its lock in place. In the Morning-only release, show Morning results after completion and keep both later Play buttons disabled, including after a replay. Once the later chapters are playable, the planned unlock order is Morning, then Afternoon, then Evening.

### Three lives per scene and chapter results — proposed rules

- Start each scored interactive scene with three hearts. A wrong learning choice costs one heart and gives a short hint. If all three hearts are used, restart that scene with three hearts and keep completed scenes intact.
- Skippable cutscenes, navigation, accessibility controls, and optional practice are outside scoring. For motor-skill scenes, use the scene’s defined challenge attempts or checkpoints rather than treating every tap or missed basket as a wrong answer.
- At the end of each chapter, show the correct and incorrect counts and percentages. Divide each count by all scored attempts in that chapter, including attempts made before a scene restart. For example, 8 correct and 2 incorrect out of 10 attempts gives 80% correct and 20% incorrect. If there were zero scored attempts, show “No scored answers yet.”
- Once later chapters are playable, unlock the next chapter when its predecessor is completed. A low percentage can prompt “Want to try that again?” Offer hints and a guided retry so children can continue learning.

### Character art direction — for the design phase

Use the second supplied screenshot as the close style reference for future ImageGen work. Match the hand-drawn, pencil-textured linework, simple facial features, soft flat colors, and full-body proportions. Create boy and girl variants with small differences in face, hair, and clothing details. Keep their silhouettes easy to distinguish and use the same illustration treatment in both cards. Prepare neutral selection portraits first, then matching Morning, Afternoon, and Evening illustrations of each character. Final art, fonts, animation, and visual details will be discussed in the design phase.

## Website pages

| Page | What kids can do |
| --- | --- |
| Home (deferred) | A later entry point for reading, playing, and taking the quiz. |
| Read | Open illustrated cards about Personal Hygiene, Healthy Habits, and Everyday Safety. Offer optional read-aloud and a short practice question on each card. |
| Play | Start or resume the morning, afternoon, and evening story. |
| Quiz | Answer short questions based on the reading cards, get an explanation after each answer, and retry. |
| Certificate | Preview and print a certificate after finishing the story. |
| For Parents and Teachers | See the learning objectives, sources, privacy details, and a printable routine checklist. |

## Game rules and start screen

After choosing Boy or Girl, ask **“What should we call you?”** The nickname can appear on the completion certificate. Start with Morning unlocked. In the full game, finishing Morning unlocks Afternoon, and finishing Afternoon unlocks Evening. Finishing Evening unlocks the certificate and Replay. The quiz and reading pages are available from the start.

The character gives a short thought hint before each activity. Give a useful clue after a wrong choice and let the player try again. Allow replay of finished chapters. Offer pause, skip for cutscenes, reduced motion, captions, and sound controls. Provide buttons or keyboard alternatives for swipes, dragging, and timed interactions. Keep story progress tied to practicing the habit, with a guided mode for motor-skill challenges.

## Morning — Go foods

**Approved for the draft.** The Morning scene sequence below is approved and is the first chapter to develop after brainstorming. Afternoon and Evening remain planning drafts.

| Scene | Mode | What happens |
| --- | --- | --- |
| Alarm and bed | Skippable cutscene | The alarm rings. The child gets up and makes the bed. |
| Daylight and movement | Interactive | “How can I make my room brighter?” Tap to open the curtains. Pick a gentle shoulder roll or overhead reach from illustrated choices. The child stretches on a clear floor or follows a seated version. Avoid having the character lean out a window, look directly at the sun, or climb onto a balcony. Treat daylight as a scene cue, with shaded outdoor play covered in the safety reading. |
| Face wash | Interactive | “My face feels sleepy. What could help?” Choose **Wash my face**, **Put on my shoes**, or **Turn on the TV**. Tap or swipe to wet the face, gently wash and rinse, then pat dry with a clean towel. |
| Breakfast | Interactive, then cutscene | Wash hands. From cards such as pandesal, kamote, egg, banana, and candy, select pandesal and kamote as Go examples. The child eats a balanced plate with a Go, Grow, and Glow food, and drinks water. |
| Toothbrushing | Interactive | Zoom in at the sink. Show the complete routine below, then ask the player to choose one of three routines. |
| Bath and fresh clothes | Interactive | Put the bath cards in order using the steps below. Show the child dressed after the scene. |
| Quiet time | Skippable cutscene | The child journals or finishes a short assignment, then watches a little TV. Show **“TV time is finished. Time for a break!”** when the family-set timer ends. Show the Morning results. |

### Toothbrushing routine used in the game

1. Use a soft-bristled brush and a pea-sized amount of fluoride toothpaste in the game demonstration. A grown-up can help with the amount and check the brushing.
2. Angle the brush toward the gum line at about 45 degrees. Use gentle, short strokes.
3. Brush the outside and inside surfaces of the upper and lower teeth. Hold the brush upright for the inside of the front teeth and make small up-and-down strokes.
4. Brush the chewing surfaces of the back teeth. Aim for about two minutes for the whole brushing routine. The game can show a sped-up timer and label it clearly.
5. Gently brush the tongue if comfortable. Spit out the toothpaste and skip rinsing with water immediately afterward.

**Three game choices:** A. Add toothpaste → brush the front only → spit. B. Add toothpaste → gently clean the outside, inside, and chewing surfaces → spit. C. Add toothpaste → brush the chewing surfaces only → spit. **Answer B.** If a child misses a surface, highlight it and let them try again. The order of the tooth surfaces is a memory aid. Accept other orders if all surfaces get cleaned. Teach brushing twice daily as the baseline, including before bed. Keep the after-lunch scene as a quick optional review of the same steps. [ADA technique](https://www.mouthhealthy.org/all-topics-a-z/brushing-your-teeth) · [ADA toothbrush guidance](https://www.ada.org/resources/ada-library/oral-health-topics/toothbrushes) · [NHS children’s teeth](https://www.nhs.uk/live-well/healthy-teeth-and-gums/taking-care-of-childrens-teeth/)

### Bath routine used in the game

1. Get a clean towel, fresh clothes, soap, and shampoo ready.
2. Ask a grown-up to help check that the water is comfortably warm and help as needed. Step in carefully.
3. Wet your body. Wet your hair if you are washing it that day.
4. Wash your body gently. If you wash your hair, gently work shampoo into the scalp with your fingertips and rinse. Keep soap and shampoo away from your eyes.
5. Rinse off the soap. Step carefully onto a nonslip mat.
6. Pat dry, put on clean clothes, and hang up your towel.

Use an illustrated sequence, objects, bubbles, or a shower curtain for the bath scene. For younger visitors, the adult guide should emphasize direct supervision in the bath. [AAP bathroom safety](https://www.healthychildren.org/English/safety-prevention/at-home/Pages/Bathroom-Safety.aspx)

## Afternoon — Grow foods

| Scene | Mode | What happens |
| --- | --- | --- |
| Lunch | Interactive, then cutscene | Wash hands. Pick Grow foods such as fish, egg, or monggo from a mix of Go, Grow, Glow, and occasional snack cards. Show rice, fish, and pechay on the meal plate, with water. |
| Toothbrushing review | Optional interaction | Use the same brushing steps in a quick surface-matching activity. |
| Chores | Interactive | Choose a task like putting away toys or wiping the table with a damp cloth. Show the child finishing the chore before asking to go out. |
| Bike to the court | Interactive | First buckle a properly fitted helmet. Ride on a quiet practice route with a trusted grown-up nearby. Use **Slow**, **Brake**, and **Steer**. Slow for a small rock and pass it when clear, and stop to let a pedestrian cross. A missed hazard pauses the game for a tip and a retry from a nearby checkpoint. |
| Basketball practice | Interactive | Aim and release for five baskets in ten tries, guide the player through three layups in five tries, then tap to dribble around three cones. Offer a slower practice mode and a guided finish. Give the character a water break. |
| Bike home | Interactive | A cue tells the child it is getting late. Head home while there is still daylight. Repeat the helmet and safe-crossing checks with a different obstacle. Reaching home unlocks Evening. |

## Evening — Glow foods

| Scene | Mode | What happens |
| --- | --- | --- |
| Get ready for dinner | Interactive | “I’m back from playing. How should I get ready to eat?” Options include **Eat right away**, **Change into clean clothes and wash hands**, and **Play on the tablet**. Confirm the combined choice and explain that handwashing is the important step before eating. |
| Handwashing | Interactive | Wet, soap, scrub palms, backs of hands, between fingers and under nails for at least 20 seconds, rinse, and dry. |
| Dinner | Interactive, then cutscene | Pick Glow foods such as papaya, carrots, or pechay. Show a balanced dinner with Go, Grow, and Glow foods, and water. |
| Tablet break | Optional interaction | Switch to the character’s tablet view. Pick one short game. When time is up, show the tablet being put away. Then skip ahead to a screen-free bedtime routine. |
| Bedtime brushing | Interactive | Repeat the complete brushing routine before bed. Offer a short version that still covers all tooth surfaces and spitting. |
| Lights out | Cutscene | The child goes to bed. A clock shows an example of 10 hours of sleep. The reading card explains that children ages 6–12 generally need 9–12 hours in 24 hours. |
| Certificate | Interactive | Show the nickname or “Healthy Habits Explorer.” Offer **Print certificate** and **Replay**. |

### Tablet games

| Game | How it plays |
| --- | --- |
| Memory Match | Briefly show six cards, flip them face down, and let the child find three matching pairs. Offer a slower reveal or an untimed mode. |
| Spot the Difference | Show two pictures of a familiar room. Find three changes, such as a missing towel or an extra plant. Use visible shapes and positions as clues alongside color. |
| Odd One Out | Show four picture cards. Ask which one belongs to a different group, then explain the answer. Example: an apple, banana, car, and grape. |

## Reading cards for kids

### Personal hygiene

**Clean hands.** Wash your hands before eating, after using the toilet, and after playing outside. Wet them with clean running water, add soap, and scrub for at least 20 seconds. Rinse, then dry. [CDC handwashing](https://www.cdc.gov/clean-hands/faq/)

**A clean smile.** Brush with fluoride toothpaste twice a day, including before bed. Spend about two minutes on the outside, inside, and chewing parts of your teeth. Spit out the toothpaste when you finish. [NHS children’s teeth](https://www.nhs.uk/live-well/healthy-teeth-and-gums/taking-care-of-childrens-teeth/) · [ADA brushing](https://www.mouthhealthy.org/all-topics-a-z/brushing-your-teeth)

**Wash, dry, and dress.** Wash your face gently and pat it dry with a clean towel. During a bath, rinse away the soap, step out carefully, dry off, and put on clean clothes. Ask a grown-up for help with the water if you need it. [AAP bathroom safety](https://www.healthychildren.org/English/safety-prevention/at-home/Pages/Bathroom-Safety.aspx)

### Healthy habits and everyday safety

**Go, Grow, and Glow.** Go foods such as rice, pandesal, and kamote give you energy. Grow foods such as eggs, fish, and monggo help your body grow. Glow foods are fruits and vegetables, such as papaya and pechay. The game practices one group at a time. Try to eat from all three groups at meals and choose water to drink. [DOST-FNRI Pinggang Pinoy](https://www.fnri.dost.gov.ph/images/sources/PS/PS13.pdf)

**Move and play safely.** Ride a bike, play basketball, dance, or choose another way to get moving. Kids ages 6–17 need at least 60 minutes of moderate-to-vigorous activity each day. You can spread active play across the day. Buckle your bike helmet, slow down near obstacles, and give people walking room to pass. Take water breaks and use shade or sun protection outdoors. [CDC physical activity](https://www.cdc.gov/physical-activity-basics/guidelines/children.html) · [NHTSA bike safety](https://www.nhtsa.gov/road-safety/bicycle-safety) · [CDC sun safety](https://www.cdc.gov/skin-cancer/sun-safety/)

**Take a screen break and get enough sleep.** Agree with a grown-up on when screen time ends. Put your device away before bed and try a quiet activity like reading. If you are 6–12 years old, aim for 9–12 hours of sleep. [AAP sleep and screen guidance](https://www.healthychildren.org/English/healthy-living/sleep/Pages/Sleep-and-Mental-Health.aspx) · [CDC sleep guidance](https://www.cdc.gov/healthy-schools/sleep/)

## Quiz draft

| Question | Choices | Answer and feedback |
| --- | --- | --- |
| How long should you scrub your hands with soap? | 5 seconds / At least 20 seconds / 2 seconds | At least 20 seconds. Remember the backs of your hands and between your fingers. |
| Which parts of your teeth should you brush? | The front only / The chewing parts only / The outside, inside, and chewing parts | All three surfaces. Give each part a gentle brush. |
| What do you do after brushing? | Spit out the toothpaste / Swallow it / Rinse right away | Spit it out. Leaving the fluoride on your teeth helps protect them. |
| Which set has one Go, one Grow, and one Glow food? | Rice, egg, pechay / Rice, bread, kamote / Egg, fish, monggo | Rice, egg, and pechay. Each comes from a different group. |
| How should you get out of the bath? | Jump out / Step carefully onto a nonslip mat / Run across the wet floor | Step carefully onto a nonslip mat. Wet floors can be slippery. |
| Someone is crossing your bike path. What should you do? | Speed up / Stop and wait / Squeeze past | Stop and wait until the person has crossed and the path is clear. |
| What should you do when screen time ends before bed? | Start a new game / Take the tablet to bed / Put it away and do something quiet | Put it away and try a quiet activity such as reading. |
| How much sleep do most children ages 6–12 need in 24 hours? | 5–6 hours / 9–12 hours / 13–15 hours | 9–12 hours. The story shows one example of 10 hours. |

## Accountless play and privacy

Cookies are optional. Keep the nickname in memory during play and allow a child to enter it again when printing. If resume is useful, offer **Save progress on this device** using browser local storage for chapter completion and preferences only. Include **Clear saved progress** for shared devices. The first version can generate the certificate on the device and work without accounts, analytics, trackers, or public leaderboards. Keep the nickname optional and avoid requesting full names, email addresses, birthdays, or schools.

## Suggested build order after draft review

1. Confirm the target grades, language, and lesson objectives. Consider English with Filipino labels or a Filipino version if it matches the class.
2. Start with the dedicated game page, character selection, horizontal chapter strip, and one end-to-end Morning chapter. Keep the reading and quiz in the wider website plan.
3. Add Afternoon and Evening, then verify the unlock order, guided controls, and certificate.
4. Add the bike and basketball challenges and one tablet game first. The other tablet games can follow.
5. Decide on art style, fonts, visual references, animation, and sound in the design discussion.


