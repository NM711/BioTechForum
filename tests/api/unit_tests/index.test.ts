import UserEndpointTests from "./user.endpoint.test";
import SeedTest from "./db.seed.test";

/**
  Attempts to seed the database if, it has not been seeded yet.
*/

async function start() {
  try {
    const seedTest = new SeedTest();
    await seedTest.execute();
    const userEndpointTest = new UserEndpointTests();
    await userEndpointTest.execute();
  } catch (e) {
    process.exit(1);
  };
};

start();
