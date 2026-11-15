/* LevelUp Reteach Plan: finds the misconception most students have and the standard most students struggle with from the
   class's real in-game results, and builds a ready-to-teach plan (goal, why, 3-part mini-lesson, exit ticket + key,
   small groups, matching intervention mission). Pure JS (node + browser). Every number in the lessons/tickets is
   re-computed by tools/verify_reteach.js (eqcheck + independent key in item.k). */
(function(root){
const DAY=864e5,WINDOW=60;
/* ---------- CCSS Grade 4 standards per skill ---------- */
const STD={
 placevalue:{code:"4.NBT.A.1–2",name:"Place value: read, write and compare multi-digit whole numbers",mission:"placeval"},
 groups:{code:"4.OA.A.1–2",name:"Multiplication as comparison (\"times as many\") and equal groups",mission:"addmult"},
 rounding:{code:"4.NBT.A.3",name:"Round multi-digit whole numbers to any place",mission:"rounding"},
 addsub:{code:"4.NBT.B.4",name:"Add and subtract multi-digit whole numbers with the standard algorithm",mission:"regroup"},
 mult:{code:"4.NBT.B.5",name:"Multiply up to 4 digits × 1 digit and 2 digits × 2 digits",mission:"partial"},
 divide:{code:"4.NBT.B.6",name:"Divide up to 4 digits ÷ 1 digit, with remainders",mission:"remainder"},
 factors:{code:"4.OA.B.4",name:"Factor pairs, multiples, prime and composite numbers (1–100)",mission:"factmult"},
 multistep:{code:"4.OA.A.3",name:"Multi-step word problems with the four operations (incl. remainders)",mission:"onestep"},
 fractions:{code:"4.NF.A.1–2",name:"Equivalent fractions and comparing fractions",mission:"fraction"}};
/* ---------- plan content: misconceptions (13) ---------- */
/* ticket item k: {e:"expr"} | {div:[a,b]} "Q R r" | {ceil|floor|rem:[a,b]} | {round:[n,place]} | {cmp:[x,y]} | {feq:[n,d,D]} numerator |
   {fcmp:[a,b,c,d]} | {fbig:[a,b,c,d]} | {fac:n} | {mults:[n,k]} | {isMult:[n,m]} | {prime:n} | {val:[n,digit]} | {std:"expanded"} */
const MIS={
 regroup:{name:"Regrouping errors",skill:"addsub",mission:"regroup",
  goal:"Add and subtract multi-digit numbers, trading (regrouping) correctly when a column makes 10 or more or the top digit is smaller.",
  why:"Students treat each column as a separate fact: they write 13 in the ones place, drop the traded ten, or subtract the smaller digit from the bigger one no matter which is on top (52 − 37 becomes 25).",
  model:"Base-ten blocks on a place-value mat: 247 + 186. Ones: 7 + 6 = 13, trade 10 ones for 1 ten and keep 3. Tens: 4 + 8 + 1 = 13, trade 10 tens for 1 hundred and keep 3. Hundreds: 2 + 1 + 1 = 4. So 247 + 186 = 433.",
  guided:"Together: 503 − 268. There are no tens to trade from, so trade 1 hundred for 10 tens, then 1 ten for 10 ones. Ones: 13 − 8 = 5. Tens: 9 − 6 = 3. Hundreds: 4 − 2 = 2. So 503 − 268 = 235. Check with the inverse: 235 + 268 = 503.",
  independent:"On whiteboards, no blocks: solve, then check every answer with the inverse operation before showing it.",
  ticket:[{q:"365 + 478 = ?",a:843,k:{e:"365+478"}},{q:"4,352 + 2,789 = ?",a:7141,k:{e:"4352+2789"}},{q:"802 − 357 = ?",a:445,k:{e:"802-357"}},{q:"7,006 − 3,458 = ?",a:3548,k:{e:"7006-3458"}},{q:"Mia says 52 − 37 = 25. What is the correct answer?",a:15,k:{e:"52-37"},errq:true}]},
 remainder:{name:"Interpreting remainders",skill:"divide",mission:"remainder",
  goal:"Decide what a remainder means in the story: round up, drop it, or report it as the answer.",
  why:"Students compute 29 ÷ 6 = 4 R5 correctly and stop. They never ask what happens to the 5 left over, so they answer \"4 vans\" when 5 are needed.",
  model:"29 students ride in vans that hold 6. Make 29 counters into groups of 6: 4 full groups and 5 left over, so 29 ÷ 6 = 4 R5. The 5 extra students still need a ride, so the class needs 5 vans.",
  guided:"Same division, three questions. 29 cookies, 6 per box: how many FULL boxes? 4 (drop the remainder). How many cookies are left? 5 (the remainder is the answer). How many boxes to hold ALL the cookies? 5 (round up). Check the remainder each time: 6 × 4 = 24 and 29 − 24 = 5.",
  independent:"Before dividing, students circle the question word and write \"round up\", \"drop\" or \"remainder\". Then they solve.",
  ticket:[{q:"45 students sit 8 to a table. How many tables so everyone has a seat?",a:6,k:{ceil:[45,8]}},{q:"50 stickers, 6 on each page. How many FULL pages?",a:8,k:{floor:[50,6]}},{q:"50 stickers, 6 on each page. How many stickers are left over?",a:2,k:{rem:[50,6]}},{q:"38 ÷ 5 = ?",a:"7 R3",k:{div:[38,5]}}]},
 fraction:{name:"Fraction size / equivalence",skill:"fractions",mission:"fraction",
  goal:"Explain that both numbers decide a fraction's size: equivalent fractions multiply the top and bottom by the same number, and more pieces means smaller pieces.",
  why:"Whole-number thinking: students say 1/8 > 1/4 because 8 > 4, or \"make\" equivalents by adding the same number to the top and bottom (2/3 becomes 4/5).",
  model:"Fraction strips: fold one strip into 4 parts and one into 8. One fourth covers two eighths, so 1/4 = 2/8. Shade 2/3 of a strip, then cut every third in half: 4 of 6 pieces are shaded, so 2/3 = 4/6 (2 × 2 = 4 and 3 × 2 = 6).",
  guided:"Compare 3/4 and 5/8: rename fourths as eighths, 3/4 = 6/8, and 6/8 > 5/8. Compare 2/5 and 1/2 using tenths: 2/5 = 4/10 and 1/2 = 5/10, so 2/5 < 1/2.",
  independent:"Students draw a quick model for each comparison, then write the equivalent fraction they used.",
  ticket:[{q:"1/3 = ?/12",a:4,k:{feq:[1,3,12]}},{q:"Which is greater, 1/6 or 1/4?",a:"1/4",k:{fbig:[1,6,1,4]}},{q:"Compare: 3/4 ☐ 5/8 (>, < or =)",a:">",k:{fcmp:[3,4,5,8]}},{q:"2/3 = ?/9",a:6,k:{feq:[2,3,9]}}]},
 partial:{name:"Missing partial product",skill:"mult",mission:"partial",
  goal:"Multiply with an area model or partial products and include every part.",
  why:"Students multiply ones by ones and tens by tens only (23 × 14 becomes 212), or leave out one partial product in 2-digit × 2-digit problems.",
  model:"Area model for 23 × 14: split 23 into 20 + 3 and 14 into 10 + 4. Four boxes: 20 × 10 = 200, 20 × 4 = 80, 3 × 10 = 30, 3 × 4 = 12. Add them: 200 + 80 + 30 + 12 = 322.",
  guided:"6 × 347 with partial products: 6 × 300 = 1800, 6 × 40 = 240, 6 × 7 = 42. Then 1800 + 240 + 42 = 2082. Count the parts: 3 digits means 3 partial products.",
  independent:"Draw and count the boxes first (2-digit × 2-digit always has 4), then solve.",
  ticket:[{q:"23 × 14 = ?",a:322,k:{e:"23×14"}},{q:"6 × 347 = ?",a:2082,k:{e:"6×347"}},{q:"34 × 26 = ?",a:884,k:{e:"34×26"}},{q:"45 × 12 = ?",a:540,k:{e:"45×12"}}]},
 rounding:{name:"Rounding rule",skill:"rounding",mission:"rounding",
  goal:"Round to any place by looking only at the digit to the right of that place and using the halfway point.",
  why:"Students look at the wrong digit, round every digit, round halfway numbers down, or change the digits to the left of the rounding place.",
  model:"Number line: 3,650 is exactly halfway between 3,600 and 3,700, and halfway rounds up (3,650 − 3,600 = 50 and 3,700 − 3,650 = 50), so 3,650 rounds to 3,700. 4,238 is between 4,200 and 4,300; it is below the halfway point 4,250, so it rounds to 4,200.",
  guided:"Underline the rounding place and circle the digit to its right. 67,482 to the nearest thousand: underline 7, circle 4. 4 is less than 5, so the answer is 67,000.",
  independent:"Students mark each number with underline + circle, then round.",
  ticket:[{q:"Round 3,650 to the nearest hundred.",a:3700,k:{round:[3650,100]}},{q:"Round 4,238 to the nearest hundred.",a:4200,k:{round:[4238,100]}},{q:"Round 67,482 to the nearest thousand.",a:67000,k:{round:[67482,1000]}},{q:"Round 15,962 to the nearest ten.",a:15960,k:{round:[15962,10]}},{q:"Round 849 to the nearest hundred.",a:800,k:{round:[849,100]}}]},
 factmult:{name:"Factors vs multiples",skill:"factors",mission:"factmult",
  goal:"Tell factors from multiples, list every factor pair of a number up to 100, and decide whether it is prime or composite.",
  why:"The words sound alike, so students list multiples when asked for factors, miss factor pairs, or call every odd number prime.",
  model:"Make every rectangle with 12 tiles: 1 × 12, 2 × 6 and 3 × 4. Those are the factor pairs, so the factors of 12 are 1, 2, 3, 4, 6, 12. Multiples of 4 come from skip-counting: 4, 8, 12, 16, 20.",
  guided:"Is 21 prime? 3 × 7 = 21, so 21 has more than two factors: composite. Is 13 prime? Only 1 × 13 = 13: prime. Sort cards into \"factor of 24\" and \"multiple of 4\".",
  independent:"Students make a T-chart of factor pairs, stopping when the pairs turn around.",
  ticket:[{q:"List all the factors of 18.",a:"1, 2, 3, 6, 9, 18",k:{fac:18}},{q:"Is 36 a multiple of 9? (yes/no)",a:"yes",k:{isMult:[36,9]}},{q:"Is 21 prime or composite?",a:"composite",k:{prime:21}},{q:"Is 29 prime or composite?",a:"prime",k:{prime:29}},{q:"List the first 5 multiples of 6.",a:"6, 12, 18, 24, 30",k:{mults:[6,5]}}]},
 placeval:{name:"Place-value slips",skill:"placevalue",mission:"placeval",
  goal:"Read, write and compare numbers by place value, knowing a digit is worth 10 times as much as the same digit one place to its right.",
  why:"Students read digits instead of values (the 4 in 4,520 is \"four\" instead of 4,000), drop placeholder zeros (six thousand forty-five written as 645), or compare by the first digit when the numbers have different lengths.",
  model:"Place-value chart with discs: 4,520 = 4000 + 500 + 20. The 5 in 500 is 10 times the 5 in 50: 50 × 10 = 500.",
  guided:"Write \"six thousand forty-five\" in the chart: 6 thousands, 0 hundreds, 4 tens, 5 ones, so 6,045. Compare 9,870 and 10,120: count the digits first. 5 digits beats 4 digits, so 10,120 > 9,870.",
  independent:"Students fill a place-value chart for each number before answering.",
  ticket:[{q:"What is the value of the 4 in 4,520?",a:4000,k:{val:[4520,4]}},{q:"Write six thousand forty-five as a number.",a:6045,k:{e:"6000+40+5",words:true}},{q:"Compare: 9,870 ☐ 10,120 (>, < or =)",a:"<",k:{cmp:[9870,10120]}},{q:"The 7 in 700 is how many times the 7 in 70?",a:10,k:{e:"700÷70"}}]},
 addmult:{name:"Adds instead of multiplying",skill:"groups",mission:"addmult",
  goal:"Recognize \"times as many\" and equal groups as multiplication, and \"more than\" as addition.",
  why:"Key-word habits: students read \"3 times as many as 8\" and add 3 + 8 instead of multiplying.",
  model:"Tape diagram: Leo has 8 cards. Ava has 3 times as many, so draw 3 bars of 8: 8 + 8 + 8 = 24, which is 3 × 8 = 24.",
  guided:"Contrast pairs: \"Ava has 3 MORE than 8\" is 8 + 3 = 11. \"Ava has 3 TIMES as many as 8\" is 3 × 8 = 24. Students sort story cards into + and × piles and explain one card.",
  independent:"Students draw a tape diagram for each story before writing the equation.",
  ticket:[{q:"A tree is 6 m tall. A building is 4 times as tall. How tall is the building?",a:24,k:{e:"6×4"}},{q:"Sam has 9 stickers. Jo has 2 more than Sam. How many stickers does Jo have?",a:11,k:{e:"9+2"}},{q:"5 bags hold 7 apples each. How many apples?",a:35,k:{e:"5×7"}},{q:"36 is 4 times as many as what number?",a:9,k:{e:"36÷4"}}]},
 onestep:{name:"Stops after one step",skill:"multistep",mission:"onestep",
  goal:"Plan every step of a word problem and answer the question that is actually asked.",
  why:"Students solve the first step and report that number. They don't reread the question or plan the steps with a model.",
  model:"Bar model: 4 packs of 12 markers, then 9 are given away. Step 1: 4 × 12 = 48. Step 2: 48 − 9 = 39. Reread the question (\"how many are left?\"): 39.",
  guided:"Use a Know / Need / Step 1 / Step 2 organizer: 3 tickets cost $8 each and a snack costs $5. Step 1: 3 × 8 = 24. Step 2: 24 + 5 = 29, so the total is $29.",
  independent:"Students write one equation with a letter for the unknown, then solve it in steps.",
  ticket:[{q:"4 packs of 12 markers. 9 are given away. How many are left?",a:39,k:{e:"4×12-9"}},{q:"3 tickets cost $8 each and a snack costs $5. What is the total cost in dollars?",a:29,k:{e:"3×8+5"}},{q:"6 boxes of 15 crayons. 20 are broken. How many crayons work?",a:70,k:{e:"6×15-20"}},{q:"Ana has $50. She buys 3 books for $12 each. How many dollars are left?",a:14,k:{e:"50-3×12"}}]},
 wrongop:{name:"Wrong operation in a step",skill:"multistep",mission:"wrongop",
  goal:"Choose each step's operation from what the situation means: join, separate, equal groups, share, or compare.",
  why:"Students pick an operation from key words or from the size of the numbers, so sharing problems get multiplied and \"left\" problems that are really sharing get subtracted.",
  model:"Act it out: 72 stickers are shared equally by 8 friends. Draw 8 circles and deal the stickers out: 72 ÷ 8 = 9 each.",
  guided:"Label every step with its action: join (+), separate (−), equal groups (×), share (÷). 5 friends each bring 6 cups and they use 18: 5 × 6 = 30 (equal groups), then 30 − 18 = 12 (separate).",
  independent:"Students write the action word above each step before calculating.",
  ticket:[{q:"72 stickers are shared equally by 8 friends. How many does each friend get?",a:9,k:{e:"72÷8"}},{q:"5 friends each bring 6 cups. They use 18 cups. How many are left?",a:12,k:{e:"5×6-18"}},{q:"28 students make teams of 4. How many teams?",a:7,k:{e:"28÷4"}},{q:"Maya read 45 pages on Monday and 38 on Tuesday. How many pages in all?",a:83,k:{e:"45+38"}}]},
 count:{name:"Counting groups / checking",skill:"groups",mission:"count",
  goal:"Count the groups and the items in each group carefully, then check that the answer makes sense.",
  why:"Students miscount the number of groups, count one group twice, or never check whether the answer is reasonable.",
  model:"Circle and count: 6 bags with 4 oranges each. Circle each bag as you count it: 6 groups of 4, so 6 × 4 = 24. Check: 24 ÷ 6 = 4 in each bag.",
  guided:"Estimate first: 7 groups of 9 is close to 7 groups of 10, which is 70, so 7 × 9 = 63 is reasonable.",
  independent:"Students estimate, solve, then check with division.",
  ticket:[{q:"6 bags with 4 oranges each. How many oranges?",a:24,k:{e:"6×4"}},{q:"7 × 9 = ?",a:63,k:{e:"7×9"}},{q:"8 rows of 6 chairs. How many chairs?",a:48,k:{e:"8×6"}},{q:"Check: 54 ÷ 6 = ?",a:9,k:{e:"54÷6"}}]},
 array:{name:"Array dimensions",skill:"groups",mission:"array",
  goal:"Build and read arrays as rows × columns that match the problem.",
  why:"Students swap rows and columns, build one row too many, or count only the outside edge instead of the whole array.",
  model:"Tiles: 3 rows of 5 make 3 × 5 = 15. Turn it to 5 rows of 3 and it is still 15, but the story decides which number is the rows.",
  guided:"A garden has 4 rows with 7 plants in each row. Build it, label the rows and columns, and write 4 × 7 = 28.",
  independent:"Students sketch each array on grid paper and label rows and columns.",
  ticket:[{q:"4 rows of 7 plants. How many plants?",a:28,k:{e:"4×7"}},{q:"6 rows with 8 seats in each row. How many seats?",a:48,k:{e:"6×8"}},{q:"An array has 24 tiles in 3 rows. How many columns?",a:8,k:{e:"24÷3"}},{q:"5 rows of 6 chairs. How many chairs?",a:30,k:{e:"5×6"}}]},
 other:{name:"Other / unclassified",skill:null,mission:null,
  goal:"Find out what each student was thinking with a short error-analysis conference.",
  why:"These wrong answers did not match a known pattern. They are often a misread or a slip, and sometimes a new misconception worth hearing about.",
  model:"Show the student their wrong answer and ask them to explain their steps out loud while you listen.",
  guided:"Solve the same problem together using a model the student chooses (blocks, a drawing or a number line).",
  independent:"The student solves a similar problem alone and compares it with the first one.",
  ticket:[{q:"6 × 7 = ?",a:42,k:{e:"6×7"}},{q:"125 + 38 = ?",a:163,k:{e:"125+38"}},{q:"90 ÷ 9 = ?",a:10,k:{e:"90÷9"}}]}};
/* ---------- plan content: standards (9 skills) ---------- */
const SKP={
 placevalue:{goal:"Read, write and compare multi-digit numbers in standard, word and expanded form.",why:"Students who struggle here see a number as a string of digits rather than a sum of place values, so expanded form, zeros and comparisons break down.",
  model:"Place-value chart: 52,308 = 50000 + 2000 + 300 + 8. Point at the empty tens place and say \"zero tens\".",guided:"Compare 52,308 and 52,380: same digits down to the hundreds, then 0 tens < 8 tens, so 52,308 < 52,380 (52,380 − 52,308 = 72).",independent:"Students write each number in expanded form before comparing.",
  ticket:[{q:"Write 30,000 + 4,000 + 60 + 7 as a number.",a:34067,k:{e:"30000+4000+60+7"}},{q:"Compare: 52,308 ☐ 52,380 (>, < or =)",a:"<",k:{cmp:[52308,52380]}},{q:"What is the value of the 8 in 81,250?",a:80000,k:{val:[81250,8]}},{q:"500 is how many times 50?",a:10,k:{e:"500÷50"}}]},
 groups:{goal:"Interpret and solve \"times as many\" comparisons and equal-groups problems with multiplication or division.",why:"Students who struggle here treat comparison as addition and have trouble telling which quantity is the bigger one.",
  model:"Tape diagram: a red ribbon is 5 cm. A blue ribbon is 3 times as long: 3 bars of 5, so 3 × 5 = 15 cm.",guided:"Turn it around: 42 is 6 times as many as what? Draw 6 equal bars totaling 42: 42 ÷ 6 = 7.",independent:"Students draw a tape diagram, then write a multiplication equation for each comparison.",
  ticket:[{q:"A blue ribbon is 3 times as long as a 5 cm red ribbon. How long is it in cm?",a:15,k:{e:"3×5"}},{q:"42 is 6 times as many as what number?",a:7,k:{e:"42÷6"}},{q:"A dog weighs 9 kg. A pony weighs 8 times as much. How many kg?",a:72,k:{e:"9×8"}}]},
 rounding:{goal:"Round multi-digit numbers to any place using place value and the halfway point.",why:"Students who struggle here lose track of which digit to look at, especially in 5- and 6-digit numbers.",
  model:"Number line from 28,000 to 29,000 with 28,500 marked as halfway. 28,617 is past halfway (28,617 − 28,000 = 617, more than 500), so it rounds to 29,000.",guided:"Underline the place, circle the digit to the right, decide up or stay: 54,349 to the nearest hundred is 54,300, because 54,349 − 54,300 = 49 is less than halfway (50).",independent:"Students round each number to two different places.",
  ticket:[{q:"Round 28,617 to the nearest thousand.",a:29000,k:{round:[28617,1000]}},{q:"Round 54,349 to the nearest hundred.",a:54300,k:{round:[54349,100]}},{q:"Round 7,995 to the nearest ten.",a:8000,k:{round:[7995,10]}},{q:"Round 123,456 to the nearest ten thousand.",a:120000,k:{round:[123456,10000]}}]},
 addsub:{goal:"Fluently add and subtract multi-digit whole numbers with the standard algorithm.",why:"Students who struggle here usually have regrouping errors, especially across zeros, and don't check with the inverse operation.",
  model:"Base-ten blocks for 1,000 − 456: trade 1 thousand down through hundreds and tens. 10 − 6 = 4, 9 − 5 = 4, 9 − 4 = 5, so 1,000 − 456 = 544.",guided:"Standard algorithm side by side with blocks: 3,678 + 1,456 = 5134. Check: 5134 − 1456 = 3678.",independent:"Students solve and check every problem with the inverse.",
  ticket:[{q:"1,000 − 456 = ?",a:544,k:{e:"1000-456"}},{q:"3,678 + 1,456 = ?",a:5134,k:{e:"3678+1456"}},{q:"6,203 − 2,875 = ?",a:3328,k:{e:"6203-2875"}},{q:"25,409 + 8,697 = ?",a:34106,k:{e:"25409+8697"}}]},
 mult:{goal:"Multiply up to 4-digit by 1-digit and 2-digit by 2-digit numbers with area models and partial products.",why:"Students who struggle here lose partial products or place value (they write 4 × 30 as 12).",
  model:"Area model for 4 × 1,236: 4 × 1000 = 4000, 4 × 200 = 800, 4 × 30 = 120, 4 × 6 = 24. Then 4000 + 800 + 120 + 24 = 4944.",guided:"Two-digit by two-digit: 37 × 21. 30 × 20 = 600, 30 × 1 = 30, 7 × 20 = 140, 7 × 1 = 7. Then 600 + 30 + 140 + 7 = 777.",independent:"Students draw the area model, then solve with partial products.",
  ticket:[{q:"4 × 1,236 = ?",a:4944,k:{e:"4×1236"}},{q:"37 × 21 = ?",a:777,k:{e:"37×21"}},{q:"8 × 405 = ?",a:3240,k:{e:"8×405"}},{q:"52 × 18 = ?",a:936,k:{e:"52×18"}}]},
 divide:{goal:"Divide up to 4-digit numbers by 1-digit numbers using place value, and explain the remainder.",why:"Students who struggle here try to divide digit by digit without place value, or don't connect division to multiplication.",
  model:"Partial quotients for 856 ÷ 4: 800 ÷ 4 = 200, 40 ÷ 4 = 10, 16 ÷ 4 = 4. Then 200 + 10 + 4 = 214. Check: 214 × 4 = 856.",guided:"47 ÷ 3: 3 × 10 = 30, 47 − 30 = 17, 3 × 5 = 15, 17 − 15 = 2. So 47 ÷ 3 = 15 R2.",independent:"Students solve with partial quotients and check with multiplication.",
  ticket:[{q:"856 ÷ 4 = ?",a:214,k:{e:"856÷4"}},{q:"96 ÷ 6 = ?",a:16,k:{e:"96÷6"}},{q:"1,250 ÷ 5 = ?",a:250,k:{e:"1250÷5"}},{q:"47 ÷ 3 = ?",a:"15 R2",k:{div:[47,3]}}]},
 factors:{goal:"Find all factor pairs for numbers 1–100, recognize multiples, and classify numbers as prime or composite.",why:"Students who struggle here stop listing factors too early or confuse factors with multiples.",
  model:"Arrays for 24: 1 × 24, 2 × 12, 3 × 8, 4 × 6, so the factors of 24 are 1, 2, 3, 4, 6, 8, 12, 24.",guided:"Is 51 prime? Try 3: 3 × 17 = 51, so 51 is composite. Is 37 prime? No pair except 1 × 37 = 37, so 37 is prime.",independent:"Students use a T-chart for factor pairs and stop when the pairs repeat.",
  ticket:[{q:"List all the factors of 24.",a:"1, 2, 3, 4, 6, 8, 12, 24",k:{fac:24}},{q:"Is 51 prime or composite?",a:"composite",k:{prime:51}},{q:"Is 37 prime or composite?",a:"prime",k:{prime:37}},{q:"Is 45 a multiple of 6? (yes/no)",a:"no",k:{isMult:[45,6]}}]},
 multistep:{goal:"Solve multi-step word problems with the four operations, write an equation with a letter for the unknown, and check reasonableness.",why:"Students who struggle here stop after one step or choose operations by key words.",
  model:"Bar model: a school orders 8 boxes of 24 pencils and gives out 75. Step 1: 8 × 24 = 192. Step 2: 192 − 75 = 117.",guided:"Equation with a letter: 3 × 15 + 20 = p, so 45 + 20 = 65 and p = 65. Estimate to check: 3 × 15 is about 3 × 20 = 60.",independent:"Students write the equation first, then solve and estimate.",
  ticket:[{q:"8 boxes of 24 pencils. 75 are given out. How many are left?",a:117,k:{e:"8×24-75"}},{q:"3 rows of 15 chairs plus 20 extra chairs. How many chairs?",a:65,k:{e:"3×15+20"}},{q:"98 students ride buses that hold 40. How many buses are needed?",a:3,k:{ceil:[98,40]}},{q:"$100 minus 4 games at $18 each. How many dollars are left?",a:28,k:{e:"100-4×18"}}]},
 fractions:{goal:"Generate equivalent fractions and compare fractions with different numerators and denominators.",why:"Students who struggle here apply whole-number rules to fractions and don't use benchmarks like 1/2.",
  model:"Area models: 3/5 shaded; split every fifth in half to get 6/10, so 3/5 = 6/10.",guided:"Compare 5/12 and 1/2 with the benchmark: 1/2 = 6/12 and 5/12 < 6/12, so 5/12 < 1/2. Compare 2/3 and 3/4 with twelfths: 8/12 < 9/12.",independent:"Students choose a strategy (benchmark or common denominator) and name it.",
  ticket:[{q:"3/5 = ?/10",a:6,k:{feq:[3,5,10]}},{q:"Compare: 5/12 ☐ 1/2 (>, < or =)",a:"<",k:{fcmp:[5,12,1,2]}},{q:"Compare: 2/3 ☐ 3/4 (>, < or =)",a:"<",k:{fcmp:[2,3,3,4]}},{q:"4/6 = ?/3",a:2,k:{feq:[4,6,3]}}]}};
const MISCODES=Object.keys(MIS),SKILLS=Object.keys(STD);
/* ---------- analysis ---------- */
const name=s=>s.name||"Student";
function hasData(s){const L=s.learn||{};return(L.log||[]).length>0||(L.history||[]).length>0}
function levelOf(s,sk){const m=((s.learn||{}).m||{})[sk];return m?(m.done?6:m.lv||1):null}
function skillEvidence(s,sk,since){const L=s.learn||{};const n=(L.log||[]).filter(e=>e.sk===sk&&e.t>=since).length;const placed=!!((L.diag&&L.diag.place&&L.diag.place[sk])||(L.base&&L.base[sk]));return n>0||placed}
const band=lv=>lv<=2?"below":lv===3?"approaching":"on";
function chunk(arr,n){const o=[];for(let i=0;i<arr.length;i+=n)o.push(arr.slice(i,i+n));return o}
function analyze(students,now,opt){now=now||Date.now();opt=opt||{};const since=now-(opt.days||WINDOW)*DAY;const withData=students.filter(hasData);const N=withData.length;
  if(!N)return{empty:true,n:students.length,withData:0};
  /* (a) misconceptions: distinct students with a tagged wrong answer in the window (diagnostic, Check-Up and practice all count) */
  const mis=MISCODES.filter(c=>c!=="other").map(code=>{const per=withData.map(s=>{const ev=((s.learn||{}).log||[]).filter(e=>!e.ok&&e.code===code&&e.t>=since);return{s,ev}}).filter(x=>x.ev.length);
    const errors=per.reduce((a,x)=>a+x.ev.length,0);const samples=[];const seen=new Set();
    per.flatMap(x=>x.ev.filter(e=>e.given!=null&&e.q).map(e=>({student:name(x.s),q:e.q,given:String(e.given),answer:e.ans!=null?String(e.ans):null,t:e.t}))).sort((a,b)=>b.t-a.t).forEach(x=>{const k=x.q+"|"+x.given;if(!seen.has(k)&&samples.length<4){seen.add(k);samples.push(x)}});
    return{code,name:MIS[code].name,students:per.length,pct:Math.round(per.length/N*100),errors,samples,affected:per.map(x=>({name:name(x.s),id:x.s.id,errors:x.ev.length,last:Math.max(...x.ev.map(e=>e.t))})).sort((a,b)=>b.errors-a.errors||a.name.localeCompare(b.name))}}).filter(x=>x.students>0)
   .sort((a,b)=>b.students-a.students||b.errors-a.errors||a.code.localeCompare(b.code));
  const unclassified=withData.reduce((a,s)=>a+((s.learn||{}).log||[]).filter(e=>!e.ok&&e.code==="other"&&e.t>=since).length,0);
  /* (b) standards: students with evidence on the skill; below grade level = L1–L2, approaching = L3, on/above = L4–L6 */
  const std=SKILLS.map(sk=>{const ss=withData.filter(s=>skillEvidence(s,sk,since));if(!ss.length)return null;const rows=ss.map(s=>{const lv=levelOf(s,sk)||1;const lg=((s.learn||{}).log||[]).filter(e=>e.sk===sk&&e.t>=since);return{name:name(s),id:s.id,lv,band:band(lv),acc:lg.length?Math.round(lg.filter(e=>e.ok).length/lg.length*100):null,n:lg.length}});
    const below=rows.filter(r=>r.band==="below").length,app=rows.filter(r=>r.band==="approaching").length;const tot=rows.reduce((a,r)=>a+r.n,0),ok=rows.reduce((a,r)=>a+(r.acc==null?0:r.acc*r.n/100),0);
    return{sk,code:STD[sk].code,name:STD[sk].name,assessed:rows.length,below,approaching:app,on:rows.length-below-app,pctBelow:Math.round(below/rows.length*100),meanLevel:+(rows.reduce((a,r)=>a+r.lv,0)/rows.length).toFixed(2),accuracy:tot?Math.round(ok/tot*100):null,rows}}).filter(Boolean)
   .sort((a,b)=>b.below-a.below||b.pctBelow-a.pctBelow||a.meanLevel-b.meanLevel||(a.accuracy??101)-(b.accuracy??101)||a.sk.localeCompare(b.sk));
  const tie=(arr,eq)=>arr.length>1&&eq(arr[0],arr[1]);
  return{empty:false,n:students.length,withData:N,days:opt.days||WINDOW,generated:new Date(now).toISOString().slice(0,10),
    mis:mis.slice(0,3),misAll:mis.length,misTie:tie(mis,(a,b)=>a.students===b.students&&a.errors===b.errors),misTiedWith:mis.filter(x=>mis[0]&&x.students===mis[0].students&&x.errors===mis[0].errors).map(x=>x.code),
    std:std.slice(0,3),stdTie:tie(std,(a,b)=>a.below===b.below&&a.meanLevel===b.meanLevel),stdTiedWith:std.filter(x=>std[0]&&x.below===std[0].below&&x.meanLevel===std[0].meanLevel).map(x=>x.sk),unclassified,
    noStruggle:!!(std.length&&std[0].below===0)}}
/* ---------- plans ---------- */
function planFor(kind,key,an){const isMis=kind==="mis";const C=isMis?MIS[key]:Object.assign({},SKP[key],{name:STD[key].name,mission:STD[key].mission,skill:key});if(!C)return null;
  let groups=[];if(an&&isMis){const r=(an.mis.find(x=>x.code===key)||{affected:[]}).affected;const hi=r.filter(x=>x.errors>=3),lo=r.filter(x=>x.errors<3);
    chunk(hi,6).forEach((g,i)=>groups.push({label:"Reteach now (3+ errors)"+(i?" · group "+(i+1):""),students:g.map(x=>x.name),ids:g.map(x=>x.id)}));chunk(lo,6).forEach((g,i)=>groups.push({label:"Quick review (1–2 errors)"+(i?" · group "+(i+1):""),students:g.map(x=>x.name),ids:g.map(x=>x.id)}))}
  if(an&&!isMis){const s=an.std.find(x=>x.sk===key);if(s){const by=b=>s.rows.filter(r=>r.band===b).sort((a,b2)=>a.lv-b2.lv||a.name.localeCompare(b2.name));
    chunk(by("below"),6).forEach((g,i)=>groups.push({label:"Reteach group · below grade level (L1–L2)"+(i?" · "+(i+1):""),students:g.map(x=>x.name+" (L"+x.lv+")"),ids:g.map(x=>x.id)}));
    chunk(by("approaching"),6).forEach((g,i)=>groups.push({label:"Guided practice · approaching (L3)"+(i?" · "+(i+1):""),students:g.map(x=>x.name+" (L"+x.lv+")"),ids:g.map(x=>x.id)}));
    if(by("on").length)groups.push({label:"On/above grade level (L4–L6): extension or peer helpers",students:by("on").map(x=>x.name+" (L"+x.lv+")"),ids:by("on").map(x=>x.id),extension:true})}}
  const std=isMis?(C.skill?STD[C.skill]:null):STD[key];
  return{kind,key,title:isMis?C.name:STD[key].code+" · "+STD[key].name,standard:std?std.code:null,standardName:std?std.name:null,goal:C.goal,why:C.why,lesson:[{part:"1. Concrete / visual model",text:C.model,min:8},{part:"2. Guided practice",text:C.guided,min:7},{part:"3. Independent check",text:C.independent,min:5}],
    ticket:C.ticket.map((t,i)=>({n:i+1,q:t.q,a:t.a})),mission:C.mission,groups}}
function csv(an,plans){const q=v=>`"${String(v==null?"":v).replace(/"/g,'""')}"`;const R=[["LevelUp Reteach Plan",an.generated,an.demo?"DEMO DATA — simulated class":"class results"],["students with results",an.withData,"of",an.n,"window (days)",an.days],[],["MISCONCEPTIONS (top 3)","code","students","% of class","errors","sample wrong answers"]];
  an.mis.forEach((m,i)=>R.push([`${i+1}. ${m.name}`,m.code,m.students,m.pct+"%",m.errors,m.samples.map(s=>`${s.q} → ${s.given}${s.answer?" (answer "+s.answer+")":""}`).join(" | ")]));
  R.push([],["STANDARDS (top 3)","code","below grade level","% below","approaching","on/above","mean level","first-try %"]);an.std.forEach((s,i)=>R.push([`${i+1}. ${s.name}`,s.code,s.below,s.pctBelow+"%",s.approaching,s.on,s.meanLevel,s.accuracy==null?"":s.accuracy+"%"]));
  for(const p of plans){if(!p)continue;R.push([],["PLAN",p.title,p.standard||""],["Goal",p.goal],["Why students make this error",p.why]);p.lesson.forEach(l=>R.push([l.part+` (${l.min} min)`,l.text]));R.push(["Exit ticket","question","answer"]);p.ticket.forEach(t=>R.push(["",`${t.n}. ${t.q}`,t.a]));R.push(["Small groups"]);p.groups.forEach(g=>R.push(["",g.label,g.students.join(", ")]));R.push(["In-game mission",p.mission||"—"])}
  return R.map(r=>r.map(q).join(",")).join("\n")}
/* ---------- simulated class (demo preview + verifier); uses real game items and their tagged distractors ---------- */
function simulateClass(LN,A,n,seed,now){now=now||Date.now();let s=seed||1;const rnd=()=>(s=(s*16807)%2147483647)/2147483647;const NAMES=["Ava","Ben","Cleo","Dev","Eli","Fay","Gus","Hana","Ivan","Jade","Kai","Lena","Milo","Nia","Omar","Pia","Quinn","Rosa","Sam","Tara","Uma","Vic","Wes","Xena","Yuri","Zoe"];
  const out=[];for(let i=0;i<n;i++){const ability=rnd();const weak=SKILLS[Math.floor(rnd()*SKILLS.length)];const m={},log=[];
    for(const sk of SKILLS){let lv=Math.max(1,Math.min(6,Math.round(1+ability*4+(rnd()-.5)*2-(sk===weak?2:0)-(sk==="fractions"?1:0))));m[sk]={lv,ev:[],checks:[]};
      for(let j=0;j<6;j++){const it=LN.item(sk,lv,LN.rng(i*1000+j*37+sk.length));const t=now-Math.floor(rnd()*40)*DAY-j*3600e3;const ok=rnd()<.6+ability*.35;let e={t,d:new Date(t).toISOString().slice(0,10),sk,lv,ok:ok?1:0,src:j<2?"diag":"path"};
        if(!ok){const wrong=Object.keys(it.why||{});const v=wrong.length?wrong[Math.floor(rnd()*wrong.length)]:null;const code=v!=null?A.misCode(it.why[v]):"other";Object.assign(e,{code,q:String(it.q).replace(/<[^>]+>/g,"").slice(0,140),given:v,ans:String(it.a)})}log.push(e)}}
    log.sort((a,b)=>a.t-b.t);const sc=400+Math.round(ability*120);out.push({id:"demo"+i,name:NAMES[i%NAMES.length]+(i>=NAMES.length?" "+Math.floor(i/NAMES.length+1):""),demo:true,learn:{m,log,history:[{t:now-30*DAY,d:"",scale:sc,kind:"full"}],diag:{scale:sc,place:Object.fromEntries(SKILLS.map(k=>[k,m[k].lv]))},base:{}}})}
  return out}
const API={STD,MIS,SKP,MISCODES,SKILLS,analyze,planFor,csv,simulateClass,band,WINDOW};
if(typeof module!=="undefined"&&module.exports)module.exports=API;else root.RETEACHPLAN=API})(typeof window!=="undefined"?window:globalThis);
