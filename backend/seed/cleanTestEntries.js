import { connectDB } from '../config/db.js';
import AnalyticAccount from '../models/AnalyticAccount.js';
import Budget from '../models/Budget.js';

const clean = async () => {
  try {
    await connectDB();

    const regex = /\d{10,}/; // Matches timestamps

    const resAcc = await AnalyticAccount.deleteMany({
      $or: [
        { name: { $regex: regex } },
        { code: { $regex: regex } }
      ]
    });
    console.log(`Deleted ${resAcc.deletedCount} test analytic accounts`);

    const resBud = await Budget.deleteMany({
      name: { $regex: regex }
    });
    console.log(`Deleted ${resBud.deletedCount} test budgets`);

    const accs = await AnalyticAccount.find({});
    console.log(`Remaining clean accounts (${accs.length}):`);
    accs.forEach(a => console.log(`  - [${a.code}] ${a.name} (${a.type})`));

    const buds = await Budget.find({});
    console.log(`Remaining clean budgets (${buds.length}):`);
    buds.forEach(b => console.log(`  - ${b.name} (Planned: ₹${b.planned})`));

    process.exit(0);
  } catch (err) {
    console.error('Clean error:', err);
    process.exit(1);
  }
};

clean();
