import TestUtils from "../test_utils";
import Test from "node:test";
import assert from "node:assert";

class UserEndpointTests {
  private async signup() {
    Test.describe("User Signup Test Suite", () => {
      Test.it("Test #1 User With Invalid Characters - Expected to provide a 400 response status", async () => {
        const { status } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/user`,
          method: "POST",
          request_body: {
            username: "User3287913--!",
            password: "0912387!!nhkjsad"
          }
        });

        assert.strictEqual(status, 400);
      });

      Test.it("Test #2 Generic User With Weak Credentials - Expected to provide a 400 response status", async () => {
        const { status } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/user`,
          method: "POST",
          request_body: {
            username: "FakeUser",
            password: "12345678"
          },
        });

        assert.strictEqual(status, 400);
      });

      Test.it("Test #3 Repeated User Creation - Expected to provide 409 status", async () => {
        const { status } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/user`,
          method: "POST",
          request_body: {
            username: "SuperUser321",
            password: "helloWorld781!"
          },
        });

        assert.strictEqual(status, 409);
      });
    });
  };

  private async login(): Promise<Headers | null> {
    let loginHeaders: null | Headers = null;

    Test.describe("User Login Test", () => {
      Test.it("Test #1 - Correct Credentials", async () => {
        const { status, headers } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/session`,
          method: "POST",
          request_body: {
            username: "SuperUser321",
            password: "helloWorld781!",
            sessionType: "STANDARD",
          }
        });

        assert.strictEqual(status, 200);
        loginHeaders = headers;
      });

      Test.it("Test #2 - Incorrect Credentials", async () => {
        const { status } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/session`,
          method: "POST",
          request_body: {
            username: "SomeFakeRandomAssUser321",
            password: "hello321",
            sessionType: "STANDARD"
          }
        });

        assert.strictEqual(status, 401)
      });

      Test.it("Test #3 - Invalid Session Type", async () => {
        const { status } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/session`,
          method: "POST",
          request_body: {
            username: "SuperUser321",
            password: "helloWorld781!",
            sessionType: undefined,
          }
        });

        assert.strictEqual(status, 400);
      });
    });

    return loginHeaders;
  };

  private async logout(sessionId: string | null) {
    Test.describe("User Logout Test", () => {
      Test.it("Test #1 - Successfuly User Logout", async () => {
        const { status } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/session?id=${sessionId}`,
          method: "DELETE"
        })
        assert.strictEqual(status, 200);
      });

      Test.it("Test #2 - User Session Id Not Provided", async () => {
        const { status } = await TestUtils.FetchJSON({
          url: `${process.env.HOST}/session`,
          method: "DELETE"
        })
        assert.strictEqual(status, 400);
      });

      Test.it("Test #3 - User Session Not Found", async () => {
        const { status } = await TestUtils.FetchJSON({
          // session will no longer exist after the first test passes.
          url: `${process.env.HOST}/session?id=${sessionId}`,
          method: "DELETE"
        })
        assert.strictEqual(status, 404);
      });
    });
  };

  public async execute() {
    await this.signup();
    const headers = await this.login();

    if (!headers) {
      console.error("Could not run rest of the test suites, this is because headers could not be retrieved at login...");
      process.exit(1);  
    };

    
    await this.logout(headers.get("session"));
  };
};

export default UserEndpointTests;
