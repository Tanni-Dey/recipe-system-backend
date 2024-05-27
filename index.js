const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.1tyqf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//all api
async function run() {
  try {
    await client.connect();
    const recipeCollection = client.db("recipeSystem").collection("recipes");
    const userCollection = client.db("recipeSystem").collection("users");

    // all recipes get api
    app.get("/recipes", async (req, res) => {
      const query = {};
      const recipes = recipeCollection.find(query);
      allRecipe = await recipes.toArray();
      res.send(allRecipe);
    });

    // create new user
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const user = await userCollection.findOne({ email: newUser.email });
      if (!user) {
        const addUser = await userCollection.insertOne(newUser);
        res.send({ status: "Successfully create user", user: addUser });
      } else {
        res.send({ status: "Already have this user" });
      }
    });

    // add new recipe
    app.post("/recipes", async (req, res) => {
      const newRecipe = req.body;
      const recipe = await recipeCollection.findOne({
        recipeName: newRecipe.recipeName,
      });
      if (!recipe) {
        const addRecipe = await recipeCollection.insertOne(newRecipe);
        if (addRecipe.insertedId) {
          const user = await userCollection.findOne({
            email: newRecipe.creatorEmail,
          });
          await userCollection.updateOne(
            { email: newRecipe.creatorEmail },
            {
              $set: { coin: Number(user.coin) + 1 },
            }
          );
        }
        res.send({ status: "Successfully Added Recipe", recipe: addRecipe });
      } else {
        res.send({ status: "Already have Recipe" });
      }
    });

    //get user by email
    app.get("/user", async (req, res) => {
      const userEmail = req.query.email;
      const user = await userCollection.findOne({ email: userEmail });
      res.send({ status: "success", user: user });
    });

    //get user by id
    app.get("/user/:id", async (req, res) => {
      const id = req.params.id;
      const user = await userCollection.findOne({ _id: new ObjectId(id) });
      res.send({ status: "success", user: user });
    });

    //get recipe by id
    app.get("/recipe/:id", async (req, res) => {
      const id = req.params.id;
      const recipe = await recipeCollection.findOne({ _id: new ObjectId(id) });
      res.send({ status: "success", recipe: recipe });
    });

    //update recipe and user by purchase recipe
    app.put("/recipe-details", async (req, res) => {
      const reqData = req.body;
      const creatorUser = await userCollection.findOne({
        email: reqData.recipeCreator,
      });
      const buyerUser = await userCollection.findOne({
        email: reqData.recipeBuyer,
      });

      const updateCreatorUser = await userCollection.updateOne(
        { email: reqData.recipeCreator },
        { $set: { coin: parseInt(creatorUser.coin) + 1 } }
      );
      const updateBuyerUser = await userCollection.updateOne(
        { email: reqData.recipeBuyer },
        { $set: { coin: parseInt(buyerUser.coin) - 10 } }
      );

      const recipe = await recipeCollection.updateOne(
        { _id: new ObjectId(reqData.recipeId) },
        { $push: { purchasedBy: reqData.recipeBuyer } }
      );
      res.send({
        status: "success",
        recipe: recipe,
        creatorUser: updateCreatorUser,
        buyerUser: updateBuyerUser,
      });
    });
  } finally {
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Recipe System");
});

app.listen(port, () => {
  console.log("Recipe System Connected", port);
});
