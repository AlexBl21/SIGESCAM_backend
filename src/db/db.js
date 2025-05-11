import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({
    path: "../.env"
});


const sequelize = new Sequelize(process.env.MYSQL_URL, {
    define: { timestamps: false }
});
/*
const sequelize = new Sequelize("sigescam", "root", "", {
    host: "localhost",
    dialect: "mysql"
  });
  */
 export default sequelize;