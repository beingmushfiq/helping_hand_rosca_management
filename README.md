Helping Hand Trust Circle Manager
A modern, full-featured web application for managing Rotating Savings and Credit Associations (ROSCAs), commonly known as Trust Circles. Built with React, TypeScript, and Tailwind CSS, this project provides a robust and intuitive platform to digitize and streamline group savings, ensuring transparency and ease of use for both administrators and members.
This application simulates the complete lifecycle of a trust circle, from member onboarding to monthly contributions, payouts, and final cycle completion. It replaces manual bookkeeping with a reliable, interactive digital solution.
![alt text](https://via.placeholder.com/800x450.png?text=App+Screenshot+Here)
✨ Key Features
🔑 Dual-Role System: Separate, secure login portals and dashboards for Admins and Members.
👑 Comprehensive Admin Dashboard:
Manage multiple trust circles.
Add, edit, and remove members dynamically.
Track monthly contributions and mark payments.
Advance the cycle month-by-month, with automated payout recipient selection.
Configure circle rules (Strict vs. Flexible joining).
Set and manage joining fees for new members.
Full, editable payment history for the entire cycle.
👤 Intuitive Member Dashboard:
View personal contribution history and status (Paid, Pending, Overdue).
Check total amount contributed.
See payout month and status.
💰 Automated Financial Tracking:
Calculates monthly payouts based on contributions.
Maintains a collective Savings Fund by allocating a percentage from each payment.
Summarizes all financial activity upon cycle completion.
💅 Modern UI/UX:
Clean, responsive design that works on all screen sizes.
Includes both Light and Dark themes.
Interactive modals and components for a smooth user experience.
Data tables with sorting and searching capabilities.
🚀 Tech Stack
Frontend: React
Language: TypeScript
Styling: Tailwind CSS
State Management: React Hooks (useState, useMemo, useCallback)
Icons: Custom SVG components
🤔 How It Works
A "Helping Hand Trust Circle" is a collaborative savings scheme where a group of individuals contributes a fixed sum of money regularly into a common pool. Each period (in this case, monthly), the total amount collected is paid out to one member of the group.
This rotation continues until every member has received a payout. This application automates this entire process:
An Admin creates a circle and adds members.
Each month, members contribute their share. The admin marks these contributions as Paid.
A portion of the collected funds goes into a group Savings Fund.
The remaining pool is the Payout Amount.
The Admin finalizes the month, randomly assigning the payout to an eligible member who has not yet received one.
The process repeats until the cycle length (equal to the number of members) is complete.
The app can handle new members joining mid-cycle, automatically extending its duration.
