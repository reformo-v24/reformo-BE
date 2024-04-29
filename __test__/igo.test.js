const { request } = require("../config/supertest");
const Utils = require('../helper/utils');
//jest.setTimeout(10000)
describe("Igo apis", () => {
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

    test("Get igo upcoming list test", (done) => {
      request
        .get("api/v1/IGOPools/upcoming-list?page=1")

        .expect(200)
        .expect((res) => {
          expect(res.body.message).toBe("IGO pools upcoming list");
          expect(res.body.data[0]._id).toBe("636e14a09a73c8378af88ae1");
        })

        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("Get igo completed list test", (done) => {
      request
        .get("api/v1/IGOPools/completed-list")

        .expect(200)
        .expect((res) => {
          // res.body.data.length = 0;
          expect(res.body.message).toBe("IGO pools completed list");
          res.body.status = true;
          expect(res.body.status).toBe(true);
          expect(res.body).toEqual({
            status: expect.any(Boolean),
            message: expect.any(String),
            data: [],
            pagination: {
              totalCount: 0,
              pageCount: 0,
              pageNo: 1,
              pageLimit: "10",
            },
          });
          //expect(res.header).toBe("Content-Type");
        })

        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("single_pool with valid id", (done) => {
      request
        .get("api/v1/IGOPools/get-igo/636e40a49a73c8378af88d08")

        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res) => {
          //res.body.data.length = 0;
          // console.log(res.body)
          //assert(res.body.status,"true");
          expect(res.body.message).toBe("IGO pools completed list");
          expect(res.body.status).toBe(true);
          expect(res.body).toEqual({
            status: expect.any(Boolean),
            message: expect.any(String),
            data: {
              content: expect.any(String),
              image: expect.any(String),
              min_swap_level: expect.any(String),
              token_address: expect.any(String),
              abi_name: expect.any(String),
              description: expect.any(String),
              network_type: expect.any(String),
              socialLinks: {
                telegram: expect.any(String),
                twitter: expect.any(String),
                facebook: expect.any(String),
              },
              _id: expect.any(String),
              title: expect.any(String),
              distribute_token: expect.any(Number),
              up_pool_raise: expect.any(String),
              poolType: expect.any(String),
              participants: expect.any(Number),
              symbol: expect.any(String),
              decimal: expect.any(Number),
              contractAddress: expect.any(String),
              total_supply: expect.any(String),
              paymentCypto: expect.any(String),
              token_distribution_date: expect.any(String),
              contract_type: expect.any(String),
              distribution_type: expect.any(String),
              Owner: expect.any(String),
              price: expect.any(String),
              phases: [
                {
                  tiers: expect.any(Array),
                  maxTierCap: expect.any(Array),
                  minUserCap: expect.any(Array),
                  maxUserCap: expect.any(Array),
                  tierUsers: expect.any(Array),
                  maxTierAllocation: expect.any(Array),
                  minTierAllocation: expect.any(Array),
                  _id: expect.any(String),
                  phaseName: expect.any(String),
                  poolStatus: expect.any(String),
                  address: expect.any(String),
                  minAllocation: expect.any(String),
                  maxAllocation: expect.any(String),
                  start_date: expect.any(String),
                  end_date: expect.any(String),
                  supply: expect.any(String),
                },
              ],
              poolStatus: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              id: expect.any(String),
            },
          });
        })

        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test("single_pool with invalid id", (done) => {
      request
        .get("api/v1/IGOPools/get-igo/636e40a49a73c8378af88d09")

        .expect(404)
        .expect("Content-Type", /json/)

        .expect((res) => {
          expect(res.body.message).toBe("Please provide valid igopool id");
          expect(res.body.status).toBe(true);
        })
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("IGO pool edit", (done) => {
      request
        .post("api/v1/IGOPools/igo-edit")
        .send({
          content: "Test content 7edit1",
          image:
            "https://tse2.mm.bing.net/th?id=OIP.Jrhwthmj2bxMZrTLg3p-LgHaHa&pid=Api&P=0",
          min_swap_level: "100",
          token_address: "0x0830847b60d3e7118b71838ba59e82b2d6e9fec3",
          abi_name: "test",
          description:
            "<p>AMAZY is a challenging fitness app with game-fi features. You wear trendy virtual sneakers and take a walk or jog to earn AMT tokens.</p>\n<p>GAMEPLAY</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>The earning system that AMAZY built using the Move-to-Earn model works based on a few simple steps:</p>\n<p>&nbsp;</p>\n<p><strong>1. Choose the right NFT sneaker for your abilities.</strong></p>\n<p>Users will be able to purchase sneakers or rent them from other players.</p>\n<p>&nbsp;</p>\n<p><strong>2. Access sneakers from the app marketplace </strong></p>\n<p>AMAZY allows its users to earn from a single pair of sneakers. Of course, you don't have to be limited to just one pair of shoes, the more NFT sneakers with different features you can access from the in-app marketplace, the higher your energy score and earning potential.</p>\n<p>&nbsp;</p>\n<p><strong>3.Wear your virtual sneakers, walk, run, and move! </strong></p>\n<p>When the simple platform prerequisites have been met, you're ready! All you have to do is move and earn. Users will be able to participate by themselves or with a group of friends. Spending energy in real life will earn rewards such as tokens and/or shoe boxes. Shoe boxes contain a pair of sneakers of random type and quality.</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p><strong>NFT COLLECTIONS:</strong></p>\n<p>In a retail world still driven by fast fashion, a pair of sneakers or clothes designed by a famous basketball player or owning the newest product of a popular brand continues to be a kind of social status indicator. Big sports brands, which are not indifferent to the developments in the world of technology, aim to establish a bond with Gen Z in line with their consumption habits by bringing their collections to the virtual world via NFTs.</p>\n<p>Currently, AMAZY has introduced four different types of sneakers:</p>\n<p><strong>Ranger, Hiker, Coacher, Sprinter</strong></p>\n<p>&nbsp;</p>\n<p>MARKETPLACE</p>\n<p>The in-app marketplace will enable users to purchase different NFT sneakers, as well as rent or sell them to other users. As a low barrier to entry, new participants will be able to begin using the platform by renting sneakers on the marketplace and taking advantage of flexible fee options.</p>",
          network_type: "BSC",
          socialLinks: {
            twitter: "www.twitter.com",
            git: "",
            telegram: "",
            reddit: "",
            medium: "",
            browser_web: "",
            youtube: "",
            instagram: "",
            discord: "",
            white_paper: "",
            facebook: "",
          },
          _id: "636e19ad9a73c8378af88b0c",
          title: "IGO launchpad 7edit",
          distribute_token: 0,
          up_pool_raise: "0",
          poolType: "public",
          participants: 0,
          symbol: "AMY",
          decimal: 0,
          contractAddress: "0xf2d56b2e6b6fd8ec87193ad1c7ce30d8ef0b0cf7",
          total_supply: "0",
          paymentCypto: "BSC",
          token_distribution_date: "1666860871",
          contract_type: "BSC",
          distribution_type: "BSC",
          Owner: "0xf2d56b2e6b6fD8Ec87193ad1C7ce30d8Ef0b0cF7",
          price: "100",
          phases: [
            {
              maxTierAllocation: [9, 1, 12, 3, 4, 5, 6, 7, 8],
              minTierAllocation: [1, 2, 3, 4, 5, 6, 7, 8, 9],
              _id: "636e19ad9a73c8378af88b0d",
              phaseName: "PHASE_ONE",
              poolStatus: "upcoming",
              address: "0xf2d56b2e6b6fd8ec87193ad1c7ce30d8ef0b0cf7",
              minAllocation: "10",
              maxAllocation: "100",
              start_date: "1666084023",
              end_date: "1667293623",
              supply: "10000",
            },
          ],
          poolStatus: "upcoming",
          createdAt: "2022-11-11T09:45:17.761Z",
          updatedAt: "2022-11-11T09:45:17.761Z",
          id: "636e19ad9a73c8378af88b0c",
        })

        .expect(200)
        .expect("Content-Type", /json/)

        .expect((res) => {
          expect(res.body.message).toBe("IGO updated successfully");
          expect(res.body.status).toBe(true);
        })
        .end((err, res) => {
          if (err) return done(err);
          return done();
        });
    });

    test.skip("create igo test", (done) => {
      request
        .post("api/v1/IGOPools/createIGO")
        .send({
          title: "IGO launchpad test12",
          distribute_token: 0,
          content: "Test content 8",
          up_pool_raise: "0",
          image:
            "https://tse2.mm.bing.net/th?id=OIP.Jrhwthmj2bxMZrTLg3p-LgHaHa&pid=Api&P=0",
          poolType: "public",
          participants: 0,
          min_swap_level: "100",
          symbol: "AMY",
          decimal: 0,
          token_address: "0x0830847b60d3e7118b71838ba59e82b2d6e9fec3",
          abi_name: "test",
          total_supply: "0",
          description:
            "<p>AMAZY is a challenging fitness app with game-fi features. You wear trendy virtual sneakers and take a walk or jog to earn AMT tokens.</p>\n<p>GAMEPLAY</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p>The earning system that AMAZY built using the Move-to-Earn model works based on a few simple steps:</p>\n<p>&nbsp;</p>\n<p><strong>1. Choose the right NFT sneaker for your abilities.</strong></p>\n<p>Users will be able to purchase sneakers or rent them from other players.</p>\n<p>&nbsp;</p>\n<p><strong>2. Access sneakers from the app marketplace </strong></p>\n<p>AMAZY allows its users to earn from a single pair of sneakers. Of course, you don't have to be limited to just one pair of shoes, the more NFT sneakers with different features you can access from the in-app marketplace, the higher your energy score and earning potential.</p>\n<p>&nbsp;</p>\n<p><strong>3.Wear your virtual sneakers, walk, run, and move! </strong></p>\n<p>When the simple platform prerequisites have been met, you're ready! All you have to do is move and earn. Users will be able to participate by themselves or with a group of friends. Spending energy in real life will earn rewards such as tokens and/or shoe boxes. Shoe boxes contain a pair of sneakers of random type and quality.</p>\n<p>&nbsp;</p>\n<p>&nbsp;</p>\n<p><strong>NFT COLLECTIONS:</strong></p>\n<p>In a retail world still driven by fast fashion, a pair of sneakers or clothes designed by a famous basketball player or owning the newest product of a popular brand continues to be a kind of social status indicator. Big sports brands, which are not indifferent to the developments in the world of technology, aim to establish a bond with Gen Z in line with their consumption habits by bringing their collections to the virtual world via NFTs.</p>\n<p>Currently, AMAZY has introduced four different types of sneakers:</p>\n<p><strong>Ranger, Hiker, Coacher, Sprinter</strong></p>\n<p>&nbsp;</p>\n<p>MARKETPLACE</p>\n<p>The in-app marketplace will enable users to purchase different NFT sneakers, as well as rent or sell them to other users. As a low barrier to entry, new participants will be able to begin using the platform by renting sneakers on the marketplace and taking advantage of flexible fee options.</p>",
          network_type: "BSC",
          paymentCypto: "BSC",
          token_distribution_date: "1666860871",
          socialLinks: {
            twitter: "www.twitter.com",
            git: "",
            telegram: "",
            reddit: "",
            medium: "",
            browser_web: "",
            youtube: "",
            instagram: "",
            discord: "",
            white_paper: "",
            facebook: "",
          },
          contract_type: "BSC",
          contractAddress: "0xf2d56b2e6b6fd8ec87193ad1c7ce30d8ef0b0cf7",
          poolStatus: "upcoming",
          distribution_type: "BSC",
          Owner: "0xf2d56b2e6b6fD8Ec87193ad1C7ce30d8Ef0b0cF7",
          price: "100",
          phases: [
            {
              phaseName: "PHASE_ONE",
              poolStatus: "upcoming",
              address: "0xf2d56b2e6b6fd8ec87193ad1c7ce30d8ef0b0cf7",
              minAllocation: "10",
              maxAllocation: "100",
              start_date: "1666084023",
              end_date: "1667293623",
              supply: "10000",
              maxTierAllocation: [9, 1, 12, 3, 4, 5, 6, 7, 8],
              minTierAllocation: [1, 2, 3, 4, 5, 6, 7, 8, 9],
            },
          ],
        })

        .expect(200)
        .expect("Content-Type", /json/)
        .expect((res) => {
          expect(res.body.Status).toEqual("OK");
          expect(res.body.Message).toEqual("IGOpools Created Successfully");
          expect(res.body).toEqual({
            Status: expect.any(String),
            Message: expect.any(String),
            Data: {
              content: expect.any(String),
              image: expect.any(String),
              min_swap_level: expect.any(String),
              token_address: expect.any(String),
              abi_name: expect.any(String),
              description: expect.any(String),
              network_type: expect.any(String),
              socialLinks: {
                twitter: expect.any(String),
                git: expect.any(String),
                telegram: expect.any(String),
                reddit: expect.any(String),
                medium: expect.any(String),
                browser_web: expect.any(String),
                youtube: expect.any(String),
                instagram: expect.any(String),
                discord: expect.any(String),
                white_paper: expect.any(String),
                facebook: expect.any(String),
              },
              _id: expect.any(String),
              title: expect.any(String),
              distribute_token: expect.any(Number),
              up_pool_raise: expect.any(String),
              poolType: expect.any(String),
              participants: expect.any(Number),
              symbol: expect.any(String),
              decimal: expect.any(Number),
              contractAddress: expect.any(String),
              total_supply: expect.any(String),
              paymentCypto: expect.any(String),
              token_distribution_date: expect.any(String),
              contract_type: expect.any(String),
              distribution_type: expect.any(String),
              Owner: expect.any(String),
              price: expect.any(String),
              phases: [
                {
                  tiers: expect.any(Array),
                  maxTierCap: expect.any(Array),
                  minUserCap: expect.any(Array),
                  maxUserCap: expect.any(Array),
                  tierUsers: expect.any(Array),
                  _id: expect.any(String),
                  phaseName: expect.any(String),
                  poolStatus: expect.any(String),
                  address: expect.any(String),
                  minAllocation: expect.any(String),
                  maxAllocation: expect.any(String),
                  start_date: expect.any(String),
                  end_date: expect.any(String),
                  supply: expect.any(String),
                },
              ],
              poolStatus: expect.any(String),
              createdAt: expect.any(String),
              updatedAt: expect.any(String),
              __v: expect.any(Number),
              id: expect.any(String),
            },
          });
        })
        .end((err, res) => {
          if (err) {
            // console.log(res);
            return done(err);
          }
          return done();
        });
    });
  } catch (err) {
   Utils.echoLog("Exception : ", err);
  }
});
