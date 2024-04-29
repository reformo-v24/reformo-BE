const utils = require("excel4node/distribution/lib/utils");
const { request } = require("../config/supertest");
//jest.setTimeout(10000)

describe("Admin apis", () => {
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

    test("POST admin login request", (done) => {
      request
        .post("api/v1/admin/login")
        .send({
          username: "admin",
          password: "admin",
        })

        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe(true);
          expect(res.body.message).toEqual("SUCCESS");
          expect(res.body).toEqual({
            status: expect.any(Boolean),
            message: expect.any(String),
            data: {
              token: expect.any(String),
            },
          });
        })
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("POST wrong admin username login request", (done) => {
      request
        .post("api/v1/admin/login")
        .send({
          username: "wrong",
          password: "admin",
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe("Invalid username or password");
          expect(res.body.status).toBe(false);
        })
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("POST wrong admin password login request", (done) => {
      request
        .post("api/v1/admin/login")
        .send({
          username: "admin",
          password: "password",
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe("Invalid username or password");
          expect(res.body.status).toBe(false);
        })

        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
    let time = new Date().getTime();

    test("POST add admin request", (done) => {
      request
        .post("api/v1/admin/add")
        .set("x-auth-token", token1)
        .send({
          email: `reforma_test_jest-${time}@reforma.com`,
          username: `admin1test_jest${time}`,
          password: "admin1",
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.message).toEqual("ADMIN_ADDED_SUCCESSFULLY");
          expect(res.body.status).toBe(true);
        })

        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("POST add admin request for existing admin", (done) => {
      request
        .post("api/v1/admin/add")
        .set("x-auth-token", token1)
        .send({
          email: "rohit@blocsys.com",
          username: "admin1",
          password: "admin1",
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toBe("Username or email already added");
          expect(res.body.status).toBe(true);
        })

        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });
  } catch (err) {
    Utils.echoLog("Exception : ", err);
  }
});
