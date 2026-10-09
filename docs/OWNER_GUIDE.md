# Ajay Singla Website - Owner's Guide

## How to Access the Admin Panel
1. Go to `https://ajaysingla.com/admin/login`
2. Enter your credentials.
3. You will see a list of enquiries (submissions) from the contact form.
4. Click "View" to see details, change status to "Read" or "Replied", and leave private notes.
5. Click "Export CSV" to download all submissions as a spreadsheet.

## How the Chatbot Works
The chatbot at the bottom right uses a predefined list of Frequently Asked Questions.
To update its knowledge, edit the `modules/chatbot/faq.json` file. It matches user keywords and responds with the best matching answer.

## Analytics (GA4)
The website automatically tracks visitors and events like form submissions. 
A cookie consent banner ensures compliance.
To view data, log in to your Google Analytics dashboard.

## Backups
Run `node scripts/backup.js` or set up a daily cron job to back up your SQLite database. Backups are saved in `db/backups/`.
