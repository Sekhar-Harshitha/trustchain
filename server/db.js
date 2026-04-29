// Line 1
// Line 2
// Line 3
// Line 4
// Line 5
// Line 6
// Line 7
// Line 8
// Line 9
// Line 10
// Line 11
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  "https://crqkakdgxzmlhjwldryu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNycWtha2RneHptbGhqd2xkcnl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0ODcwNzIsImV4cCI6MjA5MzA2MzA3Mn0.wcMs4lOuR6jZffwFrKDx8O-Zq0WCjl8EjE1qzo446Ag"
);

module.exports = supabase;
