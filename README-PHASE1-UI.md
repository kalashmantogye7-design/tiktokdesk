# TikTokDesk Phase 1 — Original UI + Real Chrome Profiles

Ye wohi original Google AI Studio UI hai (v1.1, ErrorBoundary fix ke saath),
sirf is mein Phase 1 ka asal Chrome-profile kaam jora gaya hai.
Koi plain page nahi hai, koi style change nahi hai.

## Kya naya hai

- Accounts screen mein har account ke saath 2 naye buttons hain:
  - "Profile banayein" — is account ka alag Chrome profile folder banata hai
    (profiles/<accountId>). Ek dafa ban gaya to dobara nahi banega.
  - "Profile kholein" — sirf is account ki Chrome window kholta hai, usi
    folder ke saath. Agar window pehle se khuli hai to dobara nahi kholta.
- Usool: ek account, ek profile. Hamesha. Ek profile mein doosra account
  kabhi mat kholein.
- Password kabhi nahi manga jata, kabhi save nahi hota, kabhi type nahi
  hota. Login pehli dafa us profile ki window mein apne haath se karein.

## Chalane ka tareeqa (Windows)

1. Is folder mein `start-phase1-ui.bat` par double-click karein.
   (Pehli dafa ye `npm install --legacy-peer-deps` chalaye ga, phir server.)
2. Browser mein kholein: http://localhost:3000
3. Accounts mein jayein, account add karein, phir us account ke
   "Profile banayein" aur "Profile kholein" buttons dabayein.

## Agar Chrome nahi khulta

Dashboard saaf batayega: "Chrome nahi mila."
Phir Google Chrome install karein, phir dobara "Profile kholein" dabayein.
Profile folder pehle se ban gaya hoga.

## Test ki hui baat (VM, 2026-10-28)

- Account add, duplicate block, profile create, dobara create
  (alreadyExisted), open-profile par Chrome-missing error — sab check kiya gaya.
- Asal Chrome window VM mein test NAHI ho saki (VM mein Chrome nahi hai).
  Asal window wala test Windows PC par karna hai, jahan Chrome hai.
