const demoAccounts = [
  ["Aanya Sharma", "aanya@demo.in"],
  ["Rohan Mehta", "rohan@demo.in"],
  ["Priya Mehta", "priya@demo.in"],
  ["Nikhil Iyer", "nikhil@demo.in"],
  ["Sunita Verma", "sunita@demo.in"],
  ["Kabir Patel", "kabir@demo.in"]
];

console.log("AI Money Mentor demo data is already seeded in the local in-memory store.");
console.log("Use password: demo123");
console.log("");
demoAccounts.forEach(([name, email]) => {
  console.log(`- ${name}: ${email}`);
});
console.log("");
console.log("Optional SQL assets are available in supabase/schema.sql and supabase/seed.sql.");
