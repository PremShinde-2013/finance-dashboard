require('dotenv').config();

const { seedUsers } = require('./users.seed');
const { seedCategories } = require('./categories.seed');
const { seedTransactions } = require('./transactions.seed');

async function runSeed() {
	console.log('🌱 Seeding started...');

	const users = await seedUsers();
	const adminUser = users.find((user) => user.role === 'admin') || users[0];

	const categories = await seedCategories(adminUser?.id);
	const transactionResult = await seedTransactions(users, categories);

	console.log('✅ Users seeded:', users.length);
	console.log('✅ Categories seeded:', categories.length);
	console.log('✅ Transactions inserted:', transactionResult.inserted);
	console.log('🎉 Seeding completed');

	return {
		users,
		categories,
		transactionResult,
	};
}

if (require.main === module) {
	runSeed().catch((error) => {
		console.error('❌ Seed failed:', error.message || error);
		process.exitCode = 1;
	});
}

module.exports = {
	runSeed,
};
