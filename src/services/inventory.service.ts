//1. Parse the CSV --> create a store array
//TODO: There could be an out of memory problem but I'll ignore it for this MVP.
//2. BulkInsert to Store and make sure it's idempotent when the CSV doesn't change!
//3. Start parsing the book data and handle it in a similar fashion! + Managed Transaction and error message
//4. Figure out how to increment repeated books -> Sequelize should be able to handle this by default!
