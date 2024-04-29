const utils = require("excel4node/distribution/lib/utils");
const { request, token } = require("../config/supertest");
const Utils = require('../helper/utils');
// jest.setTimeout(10000)
describe("User apis", () => {
  try {
    // beforeEach(function () {
    //   console.log("GET all users details ")
    // });

    // afterEach(function () {
    //   console.log("All users' details are retrieved")
    // });

    let token1;
    test("Login to the application", function () {
      return request
        .post("api/v1/admin/login")
        .send({
          username: "admin",
          password: "admin",
        })
        .then((response) => {
          // console.log(response.body.data.token);
          // log.info(response)
          token1 = response.body.data.token; //to save the login token for further requests
        });
    });

    test("GET User list without token", (done) => {
      request
        .get("api/v1/user/list")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("GET User list with invalid token", (done) => {
      request
        .get("api/v1/user/list")
        .set(
          "x-auth-token",
          "fyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2MzcyMjE2ZDlhNzNjODM3OGFmYTQwMzQiLCJpYXQiOjE2NjkyODM4NzEsImV4cCI6MTY2OTQ1NjY3MX0.-koDzXhFGES_1Wc5Uiiox_odNIlgezdpnXnmGzPntxk"
        )
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("Get User list with token", (done) => {
      request
        .get("api/v1/user/list")
        .set("x-auth-token", token1)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("Get generate lottery", (done) => {
      request
        .get("api/v1/user/genrateRandom")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("Get generate csv", (done) => {
      request
        .get("api/v1/user/genrateCsv")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("Get snapshotData", (done) => {
      request
        .get("api/v1/user/snapshotData")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("Get user stake", (done) => {
      request
        .get("api/v1/user/getUserStake")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("Get Sfund balance", (done) => {
      request
        .get("api/v1/user/getSfund")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("Get generate nonce", (done) => {
      request
        .get("api/v1/user/genrateNonce/:address")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("Post user login", (done) => {
      request
        .get("api/v1/user/login")
        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
  } catch (err) {
    Utils.echoLog("Exception : ", err);
  }
});
