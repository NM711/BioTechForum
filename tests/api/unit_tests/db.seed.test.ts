import Client from "../client";
import Test from "node:test"
import TestUtils from "../test_utils";
import assert from "node:assert";
/**
  Tests that seed the database.
*/

class SeedTest {

  private async checkIfUserExists() {
    return await Client
      .selectFrom("User")
      .select("username")
      .where("username", "=", "SuperUser321")
      .executeTakeFirstOrThrow();
  };

  /**
    Seeds a test user in the database
  */

  private async seedUser() {
    try {
      const { username } = await this.checkIfUserExists();
      console.log(`Seed user "${username}" already exists in database, will not execute user seed!`);
    } catch (e) {
      Test.it("Seed Test #1 Valid User Creation - Expected to provide a 200 status", async () => {
        const { status } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/user`,
          method: "POST",
          request_body: {
            username: "SuperUser321",
            password: "helloWorld781!"
          },
        });

        assert.strictEqual(status, 200);
      });
    };
  };

  /**
    Seeds database
  */

  public async execute() {
    await this.seedUser();
    await Client.destroy()
  };
};

export default SeedTest;
