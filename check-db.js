const { Database } = require('sqlite3');
const db = new Database('./dev.db');

db.all("PRAGMA table_info(Prompt);", (err, rows) => {
    if (err) {
        console.error(err);
        return;
    }
    console.log("Columns in Prompt table:");
    rows.forEach(row => {
        console.log(`- ${row.name} (${row.type})`);
    });
    db.close();
});
