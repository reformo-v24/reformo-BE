const utils = require("excel4node/distribution/lib/utils");
const { request, token } = require("../config/supertest");
//jest.setTimeout(10000)

const Utils = require('../helper/utils');

describe("Claim apis", () => {
  try {
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

    test("Get claim list", (done) => {
      request
        .get("api/v1/claim/list")
        .set(
          "api-key",
          `da3f89789b06fa0c5c3be65e5e18a7fafdda6bcdb51db9fe2b821c634c042405`
        )

        .expect(200)

        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("Get claim list test with invalid api key", (done) => {
      request
        .get("api/v1/claim/list")
        .set(
          "api-key",
          `db3f89789b06fa0c5c3be65e5e18a7fafdda6bcdb51db9fe2b821c634c042405`
        )

        .expect(401)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("Single claim test", (done) => {
      request
        .get("api/v1/claim/single/63739459b42a4152e5de12f0")
        .set(
          "api-key",
          `da3f89789b06fa0c5c3be65e5e18a7fafdda6bcdb51db9fe2b821c634c042405`
        )

        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("Single claim test with invalid api key", (done) => {
      request
        .get("api/v1/claim/single/63739459b42a4152e5de12f0")
        .set(
          "api-key",
          `db3f89789b06fa0c5c3be65e5e18a7fafdda6bcdb51db9fe2b821c634c042405`
        )

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
