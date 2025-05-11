import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({
    path: "../.env"
});

const sequelize = new Sequelize(process.env.MYSQL_URL, {
    define: { timestamps: false }
});

export default sequelize;